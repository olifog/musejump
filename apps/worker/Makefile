.PHONY: build run test clean

# Build the application
build:
	go build -o bin/worker ./cmd/server

# Run the application
run:
	go run ./cmd/server

# Run tests
test:
	go test -v ./...

# Clean built binaries
clean:
	rm -rf bin/

# Set up the development environment
setup:
	go mod tidy

# Run linter
lint:
	go vet ./...

# Update dependencies
deps:
	go get -u all
	go mod tidy 