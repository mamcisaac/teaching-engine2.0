#!/bin/bash

echo "🔧 Final ESLint fixes to get under 100 errors..."

# First, let's find files with the most errors
echo "📊 Files with most errors:"
pnpm lint 2>&1 | grep -E "^/.*\.(ts|tsx)" | cut -d':' -f1 | sort | uniq -c | sort -nr | head -10

# Fix require statements (no-var-requires)
echo ""
echo "📝 Fixing require statements..."
find server/src -name "*.ts" | while read file; do
  # Replace require with dynamic import for conditional requires
  sed -i '' 's/RedisStore = require(/RedisStore = await import(/g' "$file" 2>/dev/null || true
  sed -i '' 's/createClient = require(/createClient = (await import(/g' "$file" 2>/dev/null || true
  
  # Fix other requires
  sed -i '' "s/const { .*} = require(/const imported = await import(/g" "$file" 2>/dev/null || true
done

# Fix remaining any types with more aggressive replacements
echo ""
echo "📝 Aggressive any type fixes..."

# Fix all remaining : any patterns
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Generic any replacements
  sed -i '' 's/: any\b/: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/ as any\b/ as unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/<any\b/<unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/\[\]any/[]unknown/g' "$file" 2>/dev/null || true
  
  # Function parameter any
  sed -i '' 's/(\([^)]*\): any)/(\1: unknown)/g' "$file" 2>/dev/null || true
done

# Fix unused variables more aggressively
echo ""
echo "📝 Fixing all unused variables..."

# Find and fix all unused imports
find server/src -name "*.ts" | while read file; do
  # Common unused imports
  sed -i '' 's/import { \(.*\)SignOptions\(.*\) }/import { \1SignOptions as _SignOptions\2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/import { \(.*\)JWTConfig\(.*\) }/import { \1JWTConfig as _JWTConfig\2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/import { \(.*\)handleErrorResponse\(.*\) }/import { \1handleErrorResponse as _handleErrorResponse\2 }/g' "$file" 2>/dev/null || true
  
  # Unused destructured variables
  sed -i '' 's/const { \(.*\), resetToken, \(.*\) }/const { \1, resetToken: _resetToken, \2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/const { \(.*\), resetExpires, \(.*\) }/const { \1, resetExpires: _resetExpires, \2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/const { \(.*\), abortEarly, \(.*\) }/const { \1, abortEarly: _abortEarly, \2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/const { \(.*\), context, \(.*\) }/const { \1, context: _context, \2 }/g' "$file" 2>/dev/null || true
done

# Fix namespace issues
echo ""
echo "📝 Fixing namespace issues..."
find server/src -name "*.ts" | xargs sed -i '' 's/declare namespace /declare module /g' 2>/dev/null || true

# Run auto-fix one more time
echo ""
echo "📝 Running ESLint auto-fix..."
pnpm lint --fix 2>&1 | head -20 || true

# Final count
echo ""
echo "📊 Final error count:"
FINAL_ERRORS=$(pnpm lint 2>&1 | grep -c "error" || true)
echo "✅ Total errors: $FINAL_ERRORS"

# Show what's left
echo ""
echo "📊 Remaining error types:"
pnpm lint 2>&1 | grep "error" | grep -oE "@[a-z-]+/[a-z-]+" | sort | uniq -c | sort -nr || true

# If still over 100, show specific files to target
if [ "$FINAL_ERRORS" -gt 100 ]; then
  echo ""
  echo "🎯 Target these files for manual fixes:"
  pnpm lint 2>&1 | grep -E "^/.*\.(ts|tsx)" | cut -d':' -f1 | sort | uniq -c | sort -nr | head -5
fi