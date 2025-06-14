#!/bin/bash

# Set up test environment variables
export NODE_ENV=test
export DATABASE_URL="file:../packages/database/prisma/test-db.sqlite"
export JWT_SECRET="test-secret"
export JWT_EXPIRES_IN="1h"

echo "Test environment variables set:"
echo "NODE_ENV=$NODE_ENV"
echo "DATABASE_URL=$DATABASE_URL"
echo "JWT_SECRET=***"
echo "JWT_EXPIRES_IN=$JWT_EXPIRES_IN"

# Set up the test database
echo "\nSetting up test database..."
npx ts-node scripts/setup-test-db.ts

# Run the test script
echo "\nRunning test script..."
npx ts-node scripts/test-db-operations.ts
