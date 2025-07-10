#\!/bin/bash

# Phase 3.1: Fix any types - Create proper interfaces
echo "Phase 3.1: Fixing any types..."

# First, let's identify the most common any patterns
echo "Analyzing any type patterns..."

# Count any errors by file
echo "Files with most any errors:"
npm run lint:strict 2>&1 | grep "@typescript-eslint/no-explicit-any\|@typescript-eslint/no-unsafe-" | cut -d':' -f1 | sort | uniq -c | sort -nr | head -20

# Let's focus on the most common patterns
echo -e "\nFixing common any patterns..."

# 1. Fix UseQueryResult and UseMutationResult with proper types
echo "Fixing React Query hook return types..."
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Fix UseQueryResult<any, Error> to UseQueryResult<unknown, Error>
  sed -i '' 's/UseQueryResult<any, Error>/UseQueryResult<unknown, Error>/g' "$file"
  
  # Fix UseMutationResult<any, Error, any, unknown> patterns
  sed -i '' 's/UseMutationResult<any, Error, any, unknown>/UseMutationResult<unknown, Error, unknown, unknown>/g' "$file"
done

# 2. Fix Record<string, any> to Record<string, unknown>
echo "Fixing Record types..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  sed -i '' 's/Record<string, any>/Record<string, unknown>/g' "$file"
done

# 3. Fix function parameters with any
echo "Fixing function parameter types..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Change (error: any) to (error: unknown)
  sed -i '' 's/(error: any)/(error: unknown)/g' "$file"
  sed -i '' 's/(_error: any)/(_error: unknown)/g' "$file"
  
  # Change catch (e: any) to catch (e: unknown)
  sed -i '' 's/catch (e: any)/catch (e: unknown)/g' "$file"
  sed -i '' 's/catch (error: any)/catch (error: unknown)/g' "$file"
done

# 4. Fix any[] arrays
echo "Fixing array types..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Change any[] to unknown[]
  sed -i '' 's/: any\[\]/: unknown[]/g' "$file"
  sed -i '' 's/<any\[\]>/<unknown[]>/g' "$file"
done

echo "Phase 3.1 complete. Running lint to check progress..."
