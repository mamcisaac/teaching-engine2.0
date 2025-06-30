#!/bin/bash

# E2E Test Runner Script
# Ensures proper setup and runs E2E tests with correct configuration

set -e

echo "🚀 Starting E2E Test Runner..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in CI
if [ -n "$CI" ]; then
  echo -e "${YELLOW}Running in CI environment${NC}"
  export NODE_ENV=test
  export DATABASE_URL="file:./packages/database/prisma/test.db"
else
  echo "Running in local environment"
fi

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}Port $port is already in use${NC}"
    return 1
  fi
  return 0
}

# Clean up function
cleanup() {
  echo -e "\n${YELLOW}Cleaning up...${NC}"
  
  # Kill any processes on our ports
  for port in 3000 5173 5555; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "Killing process on port $port"
      lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
  done
  
  # Remove test artifacts
  rm -rf test-results playwright-report
}

# Set up trap to clean up on exit
trap cleanup EXIT

# Check ports are available
echo "Checking port availability..."
if ! check_port 3000 || ! check_port 5173; then
  echo -e "${YELLOW}Ports in use, cleaning up...${NC}"
  cleanup
  sleep 2
fi

# Set up test database
echo -e "\n${GREEN}Setting up test database...${NC}"
npx tsx tests/e2e/setup-test-db.ts

# Create storage directory for auth state
mkdir -p tests/storage

# If not in CI, start the dev servers
if [ -z "$CI" ]; then
  echo -e "\n${GREEN}Starting development servers...${NC}"
  
  # Start servers in background
  NODE_ENV=test pnpm run dev > /tmp/e2e-servers.log 2>&1 &
  DEV_PID=$!
  
  # Wait for servers to be ready
  echo "Waiting for servers to start..."
  MAX_WAIT=60
  WAITED=0
  
  while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000/api/health > /dev/null && curl -s http://localhost:5173 > /dev/null; then
      echo -e "${GREEN}Servers are ready!${NC}"
      break
    fi
    
    sleep 1
    WAITED=$((WAITED + 1))
    
    if [ $((WAITED % 10)) -eq 0 ]; then
      echo "Still waiting... ($WAITED seconds)"
    fi
  done
  
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${RED}Servers failed to start within $MAX_WAIT seconds${NC}"
    cat /tmp/e2e-servers.log
    exit 1
  fi
fi

# Run the tests
echo -e "\n${GREEN}Running E2E tests...${NC}"

# Default to running all tests
TEST_PATTERN="${1:-}"

if [ -z "$TEST_PATTERN" ]; then
  echo "Running all E2E tests..."
  npx playwright test tests/e2e
else
  echo "Running tests matching pattern: $TEST_PATTERN"
  npx playwright test tests/e2e --grep "$TEST_PATTERN"
fi

TEST_EXIT_CODE=$?

# Show test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
else
  echo -e "\n${RED}❌ Some tests failed${NC}"
  
  # If we have a report, mention it
  if [ -d "playwright-report" ]; then
    echo -e "${YELLOW}View detailed report with: npx playwright show-report${NC}"
  fi
fi

exit $TEST_EXIT_CODE