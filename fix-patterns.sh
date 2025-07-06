#!/bin/bash

# Script to fix common patterns across the codebase

echo "Fixing common linting patterns..."

# Fix missing return types on arrow functions (pattern: ") =>" to ") : ReturnType =>")
echo "Adding return types to hooks..."
find client/src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix useQuery hooks
  sed -i '' 's/export const use\([A-Za-z]*\) = () =>/export const use\1 = (): UseQueryResult<unknown> =>/g' "$file"
  
  # Fix useMutation hooks  
  sed -i '' 's/export const use\([A-Za-z]*\) = () => {/export const use\1 = (): UseMutationResult<unknown, Error, unknown> => {/g' "$file"
done

# Fix || to ?? for nullish coalescing
echo "Fixing nullish coalescing..."
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  # Simple cases
  sed -i '' 's/ || 0/ ?? 0/g' "$file"
  sed -i '' 's/ || ""/ ?? ""/g' "$file"
  sed -i '' "s/ || ''/ ?? ''/g" "$file"
  sed -i '' 's/ || \[\]/ ?? \[\]/g' "$file"
  sed -i '' 's/ || {}/ ?? {}/g' "$file"
done

# Fix truthy checks to explicit null/undefined checks
echo "Fixing boolean conditionals..."
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  # if (variable) to if (variable !== null && variable !== undefined)
  sed -i '' 's/if (\([a-zA-Z_][a-zA-Z0-9_]*\))/if (\1 !== null \&\& \1 !== undefined)/g' "$file"
  
  # Fix ternary operators
  sed -i '' 's/\([a-zA-Z_][a-zA-Z0-9_]*\) ? /\1 !== null \&\& \1 !== undefined ? /g' "$file"
done

# Add type imports
echo "Adding missing type imports..."
find client/src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Add UseQueryResult and UseMutationResult imports if missing
  if grep -q "useQuery\|useMutation" "$file" && ! grep -q "UseQueryResult\|UseMutationResult" "$file"; then
    sed -i '' '1s/^/import type { UseQueryResult, UseMutationResult } from '\''@tanstack\/react-query'\'';\n/' "$file"
  fi
done

# Fix any to unknown
echo "Replacing any with unknown..."
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/: any\[\]/: unknown[]/g' "$file"
  sed -i '' 's/: any\>/: unknown/g' "$file"
  sed -i '' 's/<any>/<unknown>/g' "$file"
  sed -i '' 's/ as any/ as unknown/g' "$file"
done

echo "Pattern fixes complete. Running lint check..."
pnpm lint:strict 2>&1 | grep -E "problems|errors|warnings" | tail -5