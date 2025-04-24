
This is the server worker that handles actual jumps

- on startup, all users should be fetched from Clerk. a datastructure should be made in memory mapping users to some tracking metadata
- a task should be scheduled to run every 10 seconds to see if any new users have been added/removed from Clerk, and sync the datastructure
- each user should have a heartbeat task that runs every 30 seconds if they're idle, and every 1 second if they're active. idle
  just means that their current playback state has no track. when idle, the heartbeat task should check if the user is still idle, and if so,
  it should update the tracking metadata to reflect that. if the heartbeat sees a new track, the user should be marked as active.
- when in active mode, the heartbeat should check if the currently playing song has changed since last heartbeat, or if the user has moved
- the time to do a different point than expected (2 seconds after the previous point).
