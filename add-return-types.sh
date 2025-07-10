#!/bin/bash

echo "Adding return types to common function patterns..."

# Pattern 1: React Query hooks that return UseQueryResult
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # useQuery hooks
  sed -i '' -E 's/export const (use[A-Za-z]+) = \(\): UseQueryResult =>/export const \1 = (): UseQueryResult<any, Error> =>/g' "$file"
  
  # useQuery hooks with parameters
  sed -i '' -E 's/export const (use[A-Za-z]+) = \(([^)]+)\) =>/export const \1 = (\2): UseQueryResult<any, Error> =>/g' "$file"
done

# Pattern 2: React Query mutation hooks
find client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # useMutation hooks
  sed -i '' -E 's/export const (use[A-Za-z]+) = \(\) => \{/export const \1 = (): UseMutationResult<any, Error, any, unknown> => {/g' "$file"
done

# Pattern 3: Simple arrow functions returning JSX
find client/src -name "*.tsx" | while read file; do
  # Component functions
  sed -i '' -E 's/export (default )?function ([A-Z][A-Za-z]+)\(/export \1function \2(): JSX.Element (/g' "$file"
  
  # Arrow function components
  sed -i '' -E 's/export const ([A-Z][A-Za-z]+) = \(\) => \{/export const \1 = (): JSX.Element => {/g' "$file"
  sed -i '' -E 's/const ([A-Z][A-Za-z]+) = \(\) => \{/const \1 = (): JSX.Element => {/g' "$file"
done

# Pattern 4: Event handlers
find client/src -name "*.tsx" | while read file; do
  # onClick handlers
  sed -i '' -E 's/const (handle[A-Za-z]+) = \(\) => \{/const \1 = (): void => {/g' "$file"
  
  # onChange handlers
  sed -i '' -E 's/const (handle[A-Za-z]+) = \(e\) => \{/const \1 = (e: React.ChangeEvent<HTMLInputElement>): void => {/g' "$file"
  
  # onSubmit handlers
  sed -i '' -E 's/const (handle[A-Za-z]+) = async \(e\) => \{/const \1 = async (e: React.FormEvent): Promise<void> => {/g' "$file"
done

# Pattern 5: Utility functions
find client/src server/src -name "*.ts" | while read file; do
  # Functions that return void
  sed -i '' -E 's/export function ([a-z][A-Za-z]+)\(/export function \1(/g' "$file"
  
  # Async functions
  sed -i '' -E 's/export async function ([a-z][A-Za-z]+)\(/export async function \1(/g' "$file"
done

echo "Return types added for common patterns!"