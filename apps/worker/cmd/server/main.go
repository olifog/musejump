package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/olifog/musejump/apps/worker/internal/config"
	"github.com/olifog/musejump/apps/worker/internal/worker"
)

func main() {
	log.Println("Starting musejump worker...")

	// Setup context with cancellation for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle shutdown signals
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		sig := <-signalChan
		log.Printf("Received shutdown signal: %v", sig)
		cancel()
	}()

	cfg := config.Load()
	worker := worker.New(cfg)
	if err := worker.Start(); err != nil {
		log.Fatalf("Failed to start worker: %v", err)
	}

	log.Println("Worker started. Press Ctrl+C to stop")

	<-ctx.Done()
	log.Println("Shutting down gracefully...")
}
