#!/bin/bash

# Stop any running Node.js processes
echo "Stopping any running Node.js processes..."
pkill -f "node|jest" || true

# Remove test database files
echo "Cleaning up test database files..."
rm -f ../packages/database/prisma/test-db.sqlite
rm -f ../packages/database/prisma/test.db
rm -f ../packages/database/prisma/dev-test.sqlite

# Clear Jest cache
echo "Clearing Jest cache..."
npx jest --clearCache || true

# Remove node_modules and reinstall
echo "Cleaning up node modules..."
rm -rf node_modules
rm -f pnpm-lock.yaml
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
cd ../packages/database
pnpm prisma generate
cd ../../server

echo "Test environment cleaned and ready!"
