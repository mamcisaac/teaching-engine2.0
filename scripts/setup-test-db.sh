#!/bin/bash

# Setup test database by copying Emily's production database
# This ensures write tests start with real data but don't affect production

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_ROOT/packages/database/prisma/prisma"
PROD_DB="$DB_DIR/dev.db"
TEST_DB="$DB_DIR/test.db"

echo "Setting up test database..."

# Check if production database exists
if [ ! -f "$PROD_DB" ]; then
  echo "Error: Production database not found at $PROD_DB"
  exit 1
fi

# Create backup of test database if it exists
if [ -f "$TEST_DB" ]; then
  BACKUP_NAME="$TEST_DB.backup.$(date +%Y%m%d_%H%M%S)"
  echo "Backing up existing test database to $BACKUP_NAME"
  cp "$TEST_DB" "$BACKUP_NAME"
fi

# Copy production database to test database
echo "Copying production database to test database..."
cp "$PROD_DB" "$TEST_DB"

# Also copy the WAL and SHM files if they exist (for SQLite WAL mode)
if [ -f "$PROD_DB-wal" ]; then
  cp "$PROD_DB-wal" "$TEST_DB-wal"
fi

if [ -f "$PROD_DB-shm" ]; then
  cp "$PROD_DB-shm" "$TEST_DB-shm"
fi

echo "Test database setup complete at $TEST_DB"
echo ""
echo "Usage for write tests:"
echo "  DATABASE_URL=\"file:$TEST_DB\" npm test"
echo ""
echo "Note: Read-only tests should continue using the production database:"
echo "  DATABASE_URL=\"file:$PROD_DB\" npm test"