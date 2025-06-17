#!/bin/bash
# Script to run tests locally with CI-like environment

echo "Running tests with CI-like environment..."

# Set CI environment variables
export DATABASE_URL=file:./test.db
export JWT_SECRET=test-secret-key
export JWT_EXPIRES_IN=1h
export NODE_ENV=test

# Clean up old test databases
rm -f server/test*.db server/test*.db-journal

# Run lint
echo "Running lint..."
pnpm run lint

# Run build
echo "Running build..."
pnpm run build

# Run tests
echo "Running tests..."
pnpm run test

echo "Test run complete!"