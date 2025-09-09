#!/bin/bash

# Schema drift guard for CI
# Ensures Prisma schema matches Emily's production database

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_ROOT/packages/database"
SCHEMA_FILE="$DB_DIR/prisma/schema.prisma"
PROD_DB="$DB_DIR/prisma/prisma/dev.db"

echo "🔍 Checking for schema drift..."

# Check if production database exists
if [ ! -f "$PROD_DB" ]; then
  echo "❌ Error: Production database not found at $PROD_DB"
  exit 1
fi

# Save current schema
cp "$SCHEMA_FILE" "$SCHEMA_FILE.current"

# Introspect the production database
echo "📊 Introspecting production database..."
cd "$DB_DIR"
npx prisma db pull --force

# Compare schemas
echo "🔬 Comparing schemas..."
if diff -q "$SCHEMA_FILE" "$SCHEMA_FILE.current" > /dev/null; then
  echo "✅ Schema is in sync with production database"
  rm "$SCHEMA_FILE.current"
  exit 0
else
  echo "❌ Schema drift detected!"
  echo ""
  echo "The Prisma schema does not match Emily's production database."
  echo "Differences found:"
  diff -u "$SCHEMA_FILE.current" "$SCHEMA_FILE" || true
  echo ""
  echo "To fix this:"
  echo "1. Run: cd packages/database && npx prisma db pull"
  echo "2. Commit the updated schema.prisma file"
  echo ""
  
  # Restore original schema for now
  mv "$SCHEMA_FILE.current" "$SCHEMA_FILE"
  
  exit 1
fi