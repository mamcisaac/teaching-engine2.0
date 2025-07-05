#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting UI Test Suite${NC}"
echo "================================"

# Check if puppeteer is installed
if ! npm list puppeteer >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing Puppeteer...${NC}"
    npm install puppeteer
fi

# Kill any existing processes on our ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend server
echo -e "${YELLOW}Starting backend server...${NC}"
cd server && pnpm dev > ../server.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health >/dev/null; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Start frontend server
echo -e "${YELLOW}Starting frontend server...${NC}"
cd ../client && pnpm dev > ../client.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5173 >/dev/null; then
        echo -e "${GREEN}✅ Frontend is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Create test user if needed
echo -e "${YELLOW}Setting up test user...${NC}"
cd ..
node -e "
const fetch = require('node-fetch');
(async () => {
  try {
    // Try to register test user
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Teacher'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Test user created');
    } else if (data.error && data.error.includes('already exists')) {
      console.log('✅ Test user already exists');
    } else {
      console.log('⚠️  Could not create test user:', data);
    }
  } catch (err) {
    console.error('Error setting up test user:', err.message);
  }
})();
" 2>/dev/null || echo -e "${YELLOW}Note: Test user setup requires node-fetch${NC}"

# Run Puppeteer tests
echo -e "${YELLOW}Running UI tests...${NC}"
echo "================================"
node test-etfo-ui-comprehensive.js

# Capture exit code
TEST_EXIT_CODE=$?

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
kill $BACKEND_PID 2>/dev/null || true
kill $FRONTEND_PID 2>/dev/null || true

# Show logs if tests failed
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}Tests failed! Showing recent logs:${NC}"
    echo "=== Backend logs ==="
    tail -n 50 server.log
    echo "=== Frontend logs ==="
    tail -n 50 client.log
else
    echo -e "${GREEN}✅ All tests passed!${NC}"
fi

# Cleanup log files
rm -f server.log client.log

exit $TEST_EXIT_CODE