#!/bin/bash

# UI Test Suite Environment Setup
# This script sets up the required environment variables for running the UI test suite

echo "Setting up test environment variables..."

# Core test configuration
export NODE_ENV=test
export TEST_SECRET=test-secret-token
export JWT_SECRET=test-jwt-secret

# Server and client URLs (adjust ports if needed)
export API_BASE_URL=http://localhost:3000
export UI_BASE_URL=http://localhost:5173
export UI_ORIGIN=$UI_BASE_URL

# Allow both client URLs for CORS
export ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Database configuration (for test mode)
export READYZ_REQUIRE_CACHE=false

# Test user configuration
export TEST_USER_ID=23  # Emily's user ID

echo "✓ Environment variables set:"
echo "  NODE_ENV=$NODE_ENV"
echo "  API_BASE_URL=$API_BASE_URL"
echo "  UI_BASE_URL=$UI_BASE_URL"
echo "  TEST_USER_ID=$TEST_USER_ID"
echo ""
echo "To run the test suite:"
echo "  1. Start the server: cd server && npm run dev"
echo "  2. Start the client: cd client && npm run dev"
echo "  3. Run tests: cd tests/ui-validation && npm test"