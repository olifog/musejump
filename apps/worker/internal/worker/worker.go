package worker

import (
	"context"
	"log"
	"math"
	"sort"
	"sync"
	"time"

	"database/sql"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/olifog/musejump/apps/worker/internal/config"

	_ "github.com/lib/pq"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/zmb3/spotify/v2"
	"golang.org/x/oauth2"
)

type UserState string

const (
	// StateIdle indicates the user has no track playing
	StateIdle UserState = "idle"
	// StateActive indicates the user has a track playing
	StateActive UserState = "active"
)

// User represents a user in the system
type User struct {
	ID            string // Clerk user ID
	Email         string
	State         UserState // idle or active
	lastProgress  int
	lastTrackId   string
	heartbeat     *time.Ticker
	jumpTask      *time.Ticker
	cancel        context.CancelFunc
	SpotifyClient *spotify.Client
	mu            sync.RWMutex // Per-user mutex
}

// Worker handles the main worker functionality
type Worker struct {
	cfg      *config.Config
	ctx      context.Context
	cancel   context.CancelFunc
	db       *sql.DB
	users    map[string]*User // Map of Clerk user ID to User
	usersMux sync.RWMutex     // Mutex to protect the users map
}

// New creates a new worker
func New(cfg *config.Config) *Worker {
	ctx, cancel := context.WithCancel(context.Background())
	clerk.SetKey(cfg.ClerkAPIKey)

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		panic(err)
	}

	return &Worker{
		cfg:      cfg,
		ctx:      ctx,
		cancel:   cancel,
		db:       db,
		users:    make(map[string]*User),
		usersMux: sync.RWMutex{},
	}
}

// Start starts the worker
func (w *Worker) Start() error {
	log.Println("Starting worker...")

	// Initial user sync
	if err := w.syncUsers(); err != nil {
		return err
	}

	// Start user sync task
	go w.runUserSyncTask()

	// Start heartbeat tasks for all users
	go w.runHeartbeatTasks()

	log.Println("Worker started successfully")
	return nil
}

// Stop stops the worker
func (w *Worker) Stop() {
	log.Println("Stopping worker...")

	// Stop all user heartbeats
	w.usersMux.Lock()
	for _, u := range w.users {
		if u.heartbeat != nil {
			u.heartbeat.Stop()
		}
		if u.cancel != nil {
			u.cancel()
		}
	}
	w.usersMux.Unlock()

	w.cancel()
	if w.db != nil {
		w.db.Close()
	}
}

// syncUsers syncs users from Clerk
func (w *Worker) syncUsers() error {
	// Get all users from Clerk
	list, err := user.List(w.ctx, &user.ListParams{})
	if err != nil {
		return err
	}

	// Track current users for cleanup of removed users
	currentUsers := make(map[string]bool)
	for _, clerkUser := range list.Users {
		currentUsers[clerkUser.ID] = true
	}

	// Update local users map with data from Clerk
	w.usersMux.Lock()

	// Find and clean up removed users
	for id, u := range w.users {
		if !currentUsers[id] {
			log.Printf("Removing user: %s", id)
			if u.heartbeat != nil {
				u.heartbeat.Stop()
			}
			if u.cancel != nil {
				u.cancel()
			}
			delete(w.users, id)
		}
	}

	// Process current users
	for _, clerkUser := range list.Users {
		// Create or update user in our local map
		u, exists := w.users[clerkUser.ID]
		if !exists {
			u = &User{
				ID:    clerkUser.ID,
				State: StateIdle,
				mu:    sync.RWMutex{}, // Initialize the mutex
			}
			w.users[clerkUser.ID] = u
			log.Printf("Added new user: %s", clerkUser.ID)
		}

		// Lock the specific user for updates
		u.mu.Lock()

		// Update user metadata from Clerk
		if len(clerkUser.EmailAddresses) > 0 {
			u.Email = clerkUser.EmailAddresses[0].EmailAddress
		}

		// Skip Spotify client creation if already exists and isn't expired
		client := u.SpotifyClient
		if client != nil {
			token, err := client.Token()
			if err != nil && token != nil && token.Expiry.After(time.Now()) {
				u.mu.Unlock()
				continue
			}
		}

		accessTokens, err := user.ListOAuthAccessTokens(w.ctx, &user.ListOAuthAccessTokensParams{
			ID:       clerkUser.ID,
			Provider: "spotify",
		})
		if err != nil {
			log.Printf("Error listing OAuth access tokens for user %s: %v", clerkUser.ID, err)
			u.mu.Unlock()
			continue
		}

		if len(accessTokens.OAuthAccessTokens) != 1 {
			log.Printf("User %s has %d Spotify access tokens, expected 1", clerkUser.ID, len(accessTokens.OAuthAccessTokens))
		}

		// If the user has a Spotify token, set up their client
		if len(accessTokens.OAuthAccessTokens) > 0 {
			accessToken := accessTokens.OAuthAccessTokens[0].Token

			token := &oauth2.Token{
				AccessToken: accessToken,
			}

			// Create HTTP client with token
			httpClient := oauth2.NewClient(w.ctx, oauth2.StaticTokenSource(token))

			// Create Spotify client
			u.SpotifyClient = spotify.New(httpClient)

			log.Printf("Created Spotify client for user %s", clerkUser.ID)
		}

		u.mu.Unlock()
	}

	w.usersMux.Unlock()

	log.Printf("Synced %d users from Clerk", len(list.Users))
	return nil
}

// GetUser returns a user by ID
func (w *Worker) GetUser(id string) (*User, bool) {
	w.usersMux.RLock()
	user, exists := w.users[id]
	w.usersMux.RUnlock()
	return user, exists
}

// runUserSyncTask runs the user sync task periodically
func (w *Worker) runUserSyncTask() {
	ticker := time.NewTicker(w.cfg.UserSyncInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			if err := w.syncUsers(); err != nil {
				log.Printf("Error syncing users: %v", err)
			}
		case <-w.ctx.Done():
			log.Println("User sync task stopped")
			return
		}
	}
}

// runHeartbeatTasks starts heartbeat tasks for all users
func (w *Worker) runHeartbeatTasks() {
	log.Println("Starting heartbeat tasks for all users")

	// Start a ticker to check for new users every second
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			w.startHeartbeatsForNewUsers()
		case <-w.ctx.Done():
			log.Println("Heartbeat tasks stopped")
			return
		}
	}
}

// startHeartbeatsForNewUsers starts heartbeat tasks for any new users without heartbeats
func (w *Worker) startHeartbeatsForNewUsers() {
	w.usersMux.Lock()
	defer w.usersMux.Unlock()

	for id, user := range w.users {
		if user.heartbeat == nil {
			log.Printf("Starting heartbeat for user: %s", id)
			w.startUserHeartbeat(user)
		}
	}
}

// startUserHeartbeat starts the heartbeat for a single user
func (w *Worker) startUserHeartbeat(u *User) {
	// Lock the specific user
	u.mu.Lock()
	defer u.mu.Unlock()

	// Create a context for this heartbeat that can be cancelled
	ctx, cancel := context.WithCancel(w.ctx)
	u.cancel = cancel

	// Set initial interval based on state
	var interval time.Duration
	if u.State == StateIdle {
		interval = w.cfg.IdleHeartbeat
	} else {
		interval = w.cfg.ActiveHeartbeat
	}

	u.heartbeat = time.NewTicker(interval)

	// Start the heartbeat goroutine
	go func() {
		for {
			select {
			case <-u.heartbeat.C:
				if err := w.checkUserStatus(u); err != nil {
					log.Printf("Error checking status for user %s: %v", u.ID, err)
				}
			case <-ctx.Done():
				u.heartbeat.Stop()
				return
			}
		}
	}()
}

// checkUserStatus checks the current status of a user and updates the state
func (w *Worker) checkUserStatus(u *User) error {
	// Get the current playing status before locking user
	playback := w.getCurrentPlayback(u.ID)
	isPlaying := playback != nil && playback.Playing

	// Lock only the specific user
	u.mu.Lock()
	defer u.mu.Unlock()

	if isPlaying && u.State == StateIdle {
		// User started playing music, switch to active
		u.State = StateActive
		log.Printf("User %s changed from idle to active", u.ID)

		// Update the heartbeat interval
		if u.heartbeat != nil {
			u.heartbeat.Stop()
		}
		u.heartbeat = time.NewTicker(w.cfg.ActiveHeartbeat)

	} else if !isPlaying && u.State == StateActive {
		// User stopped playing music, switch to idle
		u.State = StateIdle
		u.lastTrackId = ""
		u.lastProgress = 0
		log.Printf("User %s changed from active to idle", u.ID)

		// Update the heartbeat interval
		if u.heartbeat != nil {
			u.heartbeat.Stop()
		}
		u.heartbeat = time.NewTicker(w.cfg.IdleHeartbeat)
	}

	if isPlaying {
		progressDelta := (int)(playback.Progress) - u.lastProgress
		deltaDifference := math.Abs(float64(w.cfg.ActiveHeartbeat.Milliseconds()) - float64(progressDelta))

		// Add explicit nil check for playback.Item
		trackIdString := ""
		if playback.Item != nil {
			trackIdString = playback.Item.ID.String()
		} else {
			log.Printf("Warning: playback.Item is nil for user %s", u.ID)
			u.lastProgress = (int)(playback.Progress)
			return nil
		}

		if u.lastTrackId == trackIdString && deltaDifference < 100.0 {
			log.Printf("checkUserStatus: No change for user %s", u.ID)
			u.lastProgress = (int)(playback.Progress)
			u.lastTrackId = trackIdString
			return nil
		}

		// if something HAS changed, kill the current scheduled jump task
		if u.jumpTask != nil {
			u.jumpTask.Stop()
		}

		// fetch jump data from db. could be multiple rows, get the trigger times sorted
		rows, err := w.db.Query(
			`SELECT "trigger"
				FROM "user_song_jumps"
				WHERE "userId" = $1
				AND "songId" = $2
				ORDER BY "trigger" ASC`,
			u.ID,
			trackIdString,
		)
		if err != nil {
			log.Printf("Error fetching jump data for user %s: %v", u.ID, err)
			return err
		}

		var triggers []int
		for rows.Next() {
			var trigger int
			err = rows.Scan(&trigger)
			if err != nil {
				log.Printf("Error scanning jump data for user %s: %v", u.ID, err)
				return err
			}
			triggers = append(triggers, trigger)
		}

		if len(triggers) == 0 {
			log.Printf("No jump data found for user %s on track %s", u.ID, trackIdString)
			u.lastProgress = (int)(playback.Progress)
			u.lastTrackId = trackIdString
			return nil
		}

		sort.Ints(triggers)

		triggerIndex := 0
		for {
			nextTrigger := triggers[triggerIndex]
			if (int)(playback.Progress) < nextTrigger {
				break
			}
			triggerIndex++
			if triggerIndex >= len(triggers) {
				return nil
			}
		}

		// schedule a new jump task for trigger time minus 1 second
		delayTime := triggers[triggerIndex] - (int)(playback.Progress) - 1000
		if delayTime < 0 {
			delayTime = 100
		}
		u.jumpTask = time.NewTicker(time.Duration(delayTime) * time.Millisecond)
		u.lastProgress = (int)(playback.Progress)
		u.lastTrackId = trackIdString
		// Start the jump task handler
		w.startUserJumpTask(u, trackIdString, triggers[triggerIndex])
	}

	return nil
}

// startUserJumpTask starts a goroutine to handle jump tasks for a user
func (w *Worker) startUserJumpTask(u *User, trackID string, triggerTime int) {
	// Capture these values to use in the goroutine
	userID := u.ID
	jumpTask := u.jumpTask
	ctx := w.ctx

	// Start the jump task goroutine
	go func() {
		for {
			select {
			case <-jumpTask.C:
				// Here we would implement the logic to handle the jump
				// when the timer fires, approximately 1 second before the trigger time
				log.Printf("Jump task triggered for user %s on track %s at trigger time %d",
					userID, trackID, triggerTime)

				// TODO: Implement the actual jump handling logic
				// This is where you would put your implementation

				startTime := time.Now()

				rows, err := w.db.Query(
					`SELECT "target"
						FROM "user_song_jumps"
						WHERE "userId" = $1
						AND "songId" = $2
						AND "trigger" = $3`,
					userID,
					trackID,
					triggerTime,
				)
				if err != nil {
					log.Printf("Error fetching jump data for user %s: %v", userID, err)
					return
				}

				// there should be only one row
				if !rows.Next() {
					log.Printf("No jump data found for user %s on track %s at trigger time %d",
						userID, trackID, triggerTime)
					return
				}

				var target int
				err = rows.Scan(&target)
				if err != nil {
					log.Printf("Error scanning jump data for user %s: %v", userID, err)
					return
				}

				duration := time.Since(startTime)
				log.Printf("DB lookup took %s to complete", duration)

				// sleep for 1 second - duration
				time.Sleep(time.Second - duration)

				err = u.SpotifyClient.Seek(ctx, target)
				if err != nil {
					log.Printf("Error seeking to target %d for user %s: %v", target, userID, err)
				}
				// u.lastProgress = target

				// Stop the ticker after it's fired once
				jumpTask.Stop()
				return

			case <-ctx.Done():
				// Stop if the context is cancelled
				jumpTask.Stop()
				return
			}
		}
	}()
}

// isUserPlaying checks if a user is currently playing music via Spotify API
func (w *Worker) getCurrentPlayback(userID string) *spotify.CurrentlyPlaying {
	// Get the user with read lock
	w.usersMux.RLock()
	u, exists := w.users[userID]
	w.usersMux.RUnlock()

	if !exists || u.SpotifyClient == nil {
		log.Printf("User %s does not have a Spotify client", userID)
		return nil
	}

	// Use read lock for the specific user when accessing SpotifyClient
	u.mu.RLock()
	client := u.SpotifyClient
	u.mu.RUnlock()

	// Get the user's currently playing track
	playback, err := client.PlayerCurrentlyPlaying(w.ctx)
	if err != nil {
		log.Printf("Error getting currently playing track for user %s: %v", userID, err)
		return nil
	}

	log.Printf("User %s is playing: %v", userID, playback)

	// Check if playback is currently active
	return playback
}
