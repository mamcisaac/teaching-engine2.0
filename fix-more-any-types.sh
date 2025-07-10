#\!/bin/bash

# Phase 3.1 continued: Fix specific any type patterns

echo "Continuing Phase 3.1: Fixing more any type patterns..."

# 1. Fix response.data patterns
echo "Fixing response.data patterns..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix response.data patterns
  sed -i '' 's/response\.data as any/response.data as unknown/g' "$file"
  sed -i '' 's/res\.data as any/res.data as unknown/g' "$file"
  
  # Fix response.json() patterns
  sed -i '' 's/\.json() as any/.json() as unknown/g' "$file"
done

# 2. Fix React component props with any
echo "Fixing React component props..."
find client/src -name "*.tsx" | while read file; do
  # Fix React.FC<any> to React.FC<unknown>
  sed -i '' 's/React\.FC<any>/React.FC<Record<string, unknown>>/g' "$file"
  sed -i '' 's/FC<any>/FC<Record<string, unknown>>/g' "$file"
  
  # Fix props: any to props: unknown
  sed -i '' 's/props: any/props: Record<string, unknown>/g' "$file"
done

# 3. Fix async function return types
echo "Fixing async function return types..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix Promise<any> to Promise<unknown>
  sed -i '' 's/Promise<any>/Promise<unknown>/g' "$file"
  sed -i '' 's/: any\[\] =>/: unknown[] =>/g' "$file"
done

# 4. Fix event handlers
echo "Fixing event handlers..."
find client/src -name "*.tsx" | while read file; do
  # Fix event: any patterns
  sed -i '' 's/(event: any)/(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)/g' "$file"
  sed -i '' 's/(e: any)/(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)/g' "$file"
done

# 5. Fix API response types
echo "Fixing API response types..."
find . -name "*.ts" -o -name "*.tsx" | grep -E "(client|server)/src" | while read file; do
  # Fix data: any in API responses
  sed -i '' 's/data: any/data: unknown/g' "$file"
  sed -i '' 's/result: any/result: unknown/g' "$file"
  sed -i '' 's/payload: any/payload: unknown/g' "$file"
done

# 6. Fix Express types in server
echo "Fixing Express types..."
find server/src -name "*.ts" | while read file; do
  # Fix req: any, res: any patterns
  sed -i '' 's/req: any/req: Request/g' "$file"
  sed -i '' 's/res: any/res: Response/g' "$file"
  sed -i '' 's/next: any/next: NextFunction/g' "$file"
done

echo "Phase 3.1 additional fixes complete. Running lint to check remaining errors..."
npm run lint:strict 2>&1 | grep -E "@typescript-eslint/no-explicit-any|@typescript-eslint/no-unsafe-" | wc -l
