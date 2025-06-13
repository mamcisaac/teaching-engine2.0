#!/bin/bash
set -e

# Set environment variables
export NODE_ENV=test

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Set up the database
echo "Setting up test database..."
pnpm db:reset --force
pnpm db:seed

# Install Playwright browsers
echo "Installing Playwright browsers..."
pnpm exec playwright install --with-deps

# Run the tests
echo "Running e2e tests..."
pnpm test:e2e

echo "All tests completed successfully!"
