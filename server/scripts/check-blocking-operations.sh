#!/bin/bash

# Script to check for blocking operations that can cause server hanging
# Usage: ./scripts/check-blocking-operations.sh

echo "🔍 Checking for blocking operations in codebase..."

FOUND_ISSUES=0

# Check for new PrismaClient instantiations at module scope
echo "Checking for PrismaClient instantiations..."
if rg -n "new\s+PrismaClient\s*\(" --type ts server packages 2>/dev/null | grep -v "// OK:" | grep -v "prisma.ts" | grep -v ".test.ts"; then
  echo "❌ Found PrismaClient instantiations outside of prisma.ts"
  FOUND_ISSUES=1
else
  echo "✅ No problematic PrismaClient instantiations found"
fi

# Check for new Redis client instantiations
echo "Checking for Redis client instantiations..."
if rg -n "new\s+Redis\s*\(|createClient\s*\(" --type ts server packages 2>/dev/null | grep -v "// OK:" | grep -v "RedisCache.ts" | grep -v ".test.ts"; then
  echo "❌ Found Redis client instantiations outside of RedisCache.ts"
  FOUND_ISSUES=1
else
  echo "✅ No problematic Redis instantiations found"
fi

# Check for synchronous file operations at module scope
echo "Checking for synchronous file operations..."
if rg -n "readFileSync|statSync|readdirSync|existsSync" --type ts server packages 2>/dev/null | grep -v "// OK:" | grep -v ".test.ts" | grep -v "scripts/"; then
  echo "⚠️  Found synchronous file operations - review these for module-scope usage"
  FOUND_ISSUES=1
else
  echo "✅ No synchronous file operations found"
fi

# Check for blocking database operations at module scope
echo "Checking for top-level await..."
if rg -n "^await\s+" --type ts server packages 2>/dev/null | grep -v "async" | grep -v ".test.ts"; then
  echo "⚠️  Found potential top-level await - review these"
  FOUND_ISSUES=1
else
  echo "✅ No top-level await found"
fi

if [ $FOUND_ISSUES -eq 0 ]; then
  echo "✅ All checks passed! No blocking operations detected."
  exit 0
else
  echo "❌ Found potential blocking operations. Please review and fix."
  exit 1
fi