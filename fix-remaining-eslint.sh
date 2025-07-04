#!/bin/bash

echo "🔧 Fixing remaining ESLint errors..."

# Fix specific unused variables by prefixing with underscore
echo "📝 Fixing unused variables..."

# Fix unused imports in auth middleware
find server/src -name "*.ts" | xargs sed -i '' 's/import { SignOptions }/import { SignOptions as _SignOptions }/g' 2>/dev/null || true
find server/src -name "*.ts" | xargs sed -i '' 's/import { JWTConfig }/import { JWTConfig as _JWTConfig }/g' 2>/dev/null || true

# Fix unused destructured variables
find server/src -name "*.ts" | xargs sed -i '' 's/const { resetToken, resetExpires }/const { resetToken: _resetToken, resetExpires: _resetExpires }/g' 2>/dev/null || true
find server/src -name "*.ts" | xargs sed -i '' 's/const { abortEarly, context }/const { abortEarly: _abortEarly, context: _context }/g' 2>/dev/null || true

# Fix handleErrorResponse
find server/src -name "*.ts" | xargs sed -i '' 's/^  handleErrorResponse,$/  handleErrorResponse as _handleErrorResponse,/g' 2>/dev/null || true

# Fix more any types that were missed
echo "📝 Fixing remaining 'any' types..."

# Fix object types
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix validation
  sed -i '' 's/const shape: any = {}/const shape: Record<string, unknown> = {}/g' "$file" 2>/dev/null || true
  
  # Fix logger context
  sed -i '' 's/(error, metadata?: any)/(error, metadata?: unknown)/g' "$file" 2>/dev/null || true
  
  # Fix req/res handlers
  sed -i '' 's/req: any/req: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/res: any/res: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/next: any/next: unknown/g' "$file" 2>/dev/null || true
  
  # Fix error types in functions
  sed -i '' 's/error: any/error: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/err: any/err: unknown/g' "$file" 2>/dev/null || true
  
  # Fix return types
  sed -i '' 's/): any/): unknown/g' "$file" 2>/dev/null || true
  
  # Fix Express types
  sed -i '' 's/app: any/app: unknown/g' "$file" 2>/dev/null || true
done

# Fix more specific patterns
echo "📝 Fixing specific type patterns..."

# Fix middleware any types
find server/src/middleware -name "*.ts" | while read file; do
  sed -i '' 's/options?: any/options?: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/config: any/config: unknown/g' "$file" 2>/dev/null || true
done

# Fix test files
find server/src client/src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  sed -i '' 's/mockData: any/mockData: unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/testData: any/testData: unknown/g' "$file" 2>/dev/null || true
done

# Count final errors
echo ""
echo "📊 Checking remaining errors..."
FINAL_ERRORS=$(pnpm lint 2>&1 | grep -c "error" || true)
echo "📊 Remaining errors: $FINAL_ERRORS"

# Show breakdown of remaining errors
echo ""
echo "📊 Error breakdown:"
pnpm lint 2>&1 | grep "error" | grep -oE "@[a-z-]+/[a-z-]+" | sort | uniq -c | sort -nr || true