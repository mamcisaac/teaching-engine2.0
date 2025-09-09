#!/bin/bash

echo "Stopping existing server processes..."
pkill -f "node.*tsx.*index.ts" || true
pkill -f "node.*server" || true
sleep 2

echo "Setting test environment variables..."
export NODE_ENV=test
export TEST_SECRET=test-secret-token
export JWT_SECRET=test-jwt-secret
export API_BASE_URL=http://localhost:3000
export UI_BASE_URL=http://localhost:5173
export UI_ORIGIN=$UI_BASE_URL
export ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
export READYZ_REQUIRE_CACHE=false

echo "Starting server with test environment..."
cd /Users/michaelmcisaac/Github/teaching-engine2.0/server
NODE_ENV=test JWT_SECRET=test-jwt-secret TEST_SECRET=test-secret-token npm run dev &

echo "Waiting for server to be ready..."
sleep 5

# Wait for server to respond
for i in {1..30}; do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Server is ready!"
    break
  fi
  echo "Waiting for server... ($i/30)"
  sleep 1
done

echo ""
echo "Test environment ready. You can now run:"
echo "  cd tests/ui-validation"
echo "  ./verify-test-infra.sh"