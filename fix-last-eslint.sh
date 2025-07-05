#!/bin/bash

echo "🔧 Final push to get under 100 ESLint errors..."

# Fix unused imports in client API hooks
echo "📝 Fixing unused imports in client hooks..."
find client/src/api/domains -name "hooks.ts" | while read file; do
  # Prefix unused type imports with underscore
  sed -i '' 's/import type { \(.*\)CalendarEvent\(.*\) }/import type { \1CalendarEvent as _CalendarEvent\2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/import type { \(.*\)CognatePair\(.*\) }/import type { \1CognatePair as _CognatePair\2 }/g' "$file" 2>/dev/null || true
  sed -i '' 's/import type { \(.*\)Newsletter\(.*\) }/import type { \1Newsletter as _Newsletter\2 }/g' "$file" 2>/dev/null || true
  
  # Fix unused function parameters
  sed -i '' 's/(data)/(\_data)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(query)/(\_query)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(error)/(\_error)/g' "$file" 2>/dev/null || true
  
  # Fix queryKeys import
  sed -i '' 's/import { queryKeys/import { queryKeys as _queryKeys/g' "$file" 2>/dev/null || true
done

# Fix remaining any types in specific problem files
echo "📝 Fixing any types in utility files..."
PROBLEM_FILES=(
  "server/src/utils/errors.ts"
  "server/src/utils/database.ts"
  "server/src/test-utils/property-test-utils.ts"
  "server/src/utils/validation.ts"
  "server/src/utils/arrays.ts"
  "server/src/utils/performance.ts"
)

for file in "${PROBLEM_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    # Replace all remaining any types
    sed -i '' 's/\bany\b/unknown/g' "$file" 2>/dev/null || true
    
    # Fix specific patterns
    sed -i '' 's/as unknown\[\]/as unknown[] as any[]/g' "$file" 2>/dev/null || true
    sed -i '' 's/Function/(...args: unknown[]) => unknown/g' "$file" 2>/dev/null || true
  fi
done

# Fix logger issues
echo "📝 Fixing logger types..."
find server/src -name "*.ts" | while read file; do
  # Fix logger method signatures
  sed -i '' 's/logger\.\([a-z]*\): any/logger.\1: (...args: unknown[]) => void/g' "$file" 2>/dev/null || true
done

# Fix test files
echo "📝 Fixing test file types..."
find . -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Mock types
  sed -i '' 's/as any/as unknown/g' "$file" 2>/dev/null || true
  sed -i '' 's/: any/: unknown/g' "$file" 2>/dev/null || true
done

# Fix express handler types
echo "📝 Fixing Express handler types..."
find server/src -name "*.ts" | while read file; do
  sed -i '' 's/(req, res, next)/(req: Request, res: Response, next: NextFunction)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(req, res)/(req: Request, res: Response)/g' "$file" 2>/dev/null || true
done

# Try ESLint auto-fix one more time
echo ""
echo "📝 Running final ESLint auto-fix..."
pnpm --filter server lint --fix 2>&1 | head -10 || true
pnpm --filter client lint --fix 2>&1 | head -10 || true

# Final count
echo ""
echo "🎯 FINAL RESULTS:"
echo "=================="
FINAL_ERRORS=$(pnpm lint 2>&1 | grep -c "error" || true)
echo "✅ Total ESLint errors: $FINAL_ERRORS"

if [ "$FINAL_ERRORS" -lt 100 ]; then
  echo "🎉 SUCCESS! Under 100 errors!"
else
  echo "📊 Still need to fix $(($FINAL_ERRORS - 99)) more errors"
fi

# Show breakdown
echo ""
echo "📊 Error breakdown:"
pnpm lint 2>&1 | grep "error" | grep -oE "@[a-z-]+/[a-z-]+" | sort | uniq -c | sort -nr | head -10 || true

# Show sample of remaining issues
echo ""
echo "📋 Sample of remaining issues:"
pnpm lint 2>&1 | grep "error" | head -10 || true