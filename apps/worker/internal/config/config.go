package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	// Spotify configuration
	SpotifyClientID     string
	SpotifyClientSecret string

	// Clerk configuration
	ClerkAPIKey string

	// Database configuration
	DatabaseURL string

	// Worker configuration
	UserSyncInterval time.Duration
	IdleHeartbeat    time.Duration
	ActiveHeartbeat  time.Duration
}

// Load returns a new Config instance with values loaded from environment variables
func Load() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	return &Config{
		// Spotify configuration
		SpotifyClientID:     getEnv("SPOTIFY_CLIENT_ID", ""),

		// Clerk configuration
		ClerkAPIKey: getEnv("CLERK_API_KEY", ""),

		// Database configuration
		DatabaseURL: getEnv("DATABASE_URL", ""),

		// Worker configuration
		UserSyncInterval: getEnvAsDuration("USER_SYNC_INTERVAL", 30*time.Second),
		IdleHeartbeat:    getEnvAsDuration("IDLE_HEARTBEAT", 30*time.Second),
		ActiveHeartbeat:  getEnvAsDuration("ACTIVE_HEARTBEAT", 1*time.Second),
	}
}

// Helper functions to get environment variables with default values
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value, exists := os.LookupEnv(key); exists {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
