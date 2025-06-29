#!/bin/bash
set -e

# Set environment variables
export NODE_ENV=test

echo "=== Starting e2e test setup ==="

# Function to check if a port is in use
port_in_use() {
  lsof -i :$1 >/dev/null 2>&1
}

# Function to cleanup on exit
cleanup() {
  echo "Cleaning up..."
  # Kill any remaining server processes
  pkill -f "vite" || true
  pkill -f "node.*server" || true
  # Remove test database
  rm -f packages/database/test.db || true
  echo "Cleanup complete."
}

# Set up trap to ensure cleanup runs on script exit
trap cleanup EXIT

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
rm -f packages/database/test.db  # Remove existing test DB
pnpm db:generate
pnpm db:push --force-reset
pnpm db:seed

# Install Playwright browsers
echo "Installing Playwright browsers..."
pnpm exec playwright install --with-deps

# Run the tests
echo "=== Starting e2e tests ==="

# Start the server in the background
echo "Starting development server..."
pnpm dev &
SERVER_PID=$!

# Function to check if the server is ready
wait_for_server() {
  echo "Waiting for server to be ready..."
  MAX_WAIT=60
  WAIT_COUNT=0
  
  while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s -o /dev/null http://localhost:5173; then
      echo "Server is ready!"
      return 0
    fi
    
    echo "Waiting for server to start... (${WAIT_COUNT}s / ${MAX_WAIT}s)"
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
  done
  
  echo "Timed out waiting for server to start"
  return 1
}

# Wait for the server to be ready
if ! wait_for_server; then
  echo "Error: Server failed to start"
  kill $SERVER_PID 2>/dev/null || true
  exit 1
fi

# Run tests with retries for flaky tests
MAX_RETRIES=2
RETRY_COUNT=0
TEST_EXIT_CODE=0

while [ $RETRY_COUNT -le $MAX_RETRIES ]; do
  echo "Running tests (attempt $((RETRY_COUNT + 1)) of $((MAX_RETRIES + 1)))..."
  
  # Run tests with the appropriate retry flag
  if [ $RETRY_COUNT -eq 0 ]; then
    # First run - no retry flag
    pnpm test:e2e
  else
    # Retry failed tests
    pnpm test:e2e --grep @retry
  fi
  
  TEST_EXIT_CODE=$?
  
  if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "All tests passed!"
    break
  elif [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "Some tests failed. Retrying..."
    RETRY_COUNT=$((RETRY_COUNT + 1))
  else
    echo "Tests failed after $((MAX_RETRIES + 1)) attempts."
    break
  fi
done

# Clean up server process
echo "Stopping development server..."
kill $SERVER_PID 2>/dev/null || true

echo "=== Test run completed with exit code: $TEST_EXIT_CODE ==="
exit $TEST_EXIT_CODE
