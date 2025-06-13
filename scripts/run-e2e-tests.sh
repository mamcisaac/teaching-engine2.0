#!/bin/bash
set -e

# Set environment variables
export NODE_ENV=test

# Function to check if a port is in use
port_in_use() {
  lsof -i :$1 >/dev/null 2>&1
}

# Kill process on port 5173 if it's already in use
if port_in_use 5173; then
  echo "Port 5173 is in use. Attempting to free the port..."
  kill -9 $(lsof -t -i:5173) 2>/dev/null || true
  sleep 2
  
  # Check again if the port is still in use
  if port_in_use 5173; then
    echo "Failed to free port 5173. Please close any applications using this port and try again."
    exit 1
  fi
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Set up the database
echo "Setting up test database..."
pnpm db:generate
pnpm db:push --force-reset
pnpm db:seed

# Install Playwright browsers
echo "Installing Playwright browsers..."
pnpm exec playwright install --with-deps

# Run the tests
echo "Running e2e tests..."
# Add a small delay to ensure the server has time to start
sleep 5
pnpm test:e2e

echo "All tests completed successfully!"
