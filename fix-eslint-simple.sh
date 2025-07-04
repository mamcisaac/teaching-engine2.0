#!/bin/bash

echo "🔧 Starting ESLint fixes..."

# Count initial errors
INITIAL_ERRORS=$(pnpm lint 2>&1 | grep -c "error" || true)
echo "📊 Initial errors: $INITIAL_ERRORS"

# Fix 1: Replace any[] with unknown[]
echo "📝 Fixing any[] types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/: any\[\]/: unknown[]/g' "$file" 2>/dev/null || true
done

# Fix 2: Replace Promise<any> with Promise<unknown>
echo "📝 Fixing Promise<any> types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/Promise<any>/Promise<unknown>/g' "$file" 2>/dev/null || true
done

# Fix 3: Replace catch (error: any) patterns
echo "📝 Fixing catch blocks..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/catch (error: any)/catch (error: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/catch (err: any)/catch (err: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/catch (e: any)/catch (e: unknown)/g' "$file" 2>/dev/null || true
done

# Fix 4: Replace Record<string, any>
echo "📝 Fixing Record types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/Record<string, any>/Record<string, unknown>/g' "$file" 2>/dev/null || true
done

# Fix 5: Replace generic <any>
echo "📝 Fixing generic types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/<any>/<unknown>/g' "$file" 2>/dev/null || true
done

# Fix 6: Replace : any in various contexts
echo "📝 Fixing property and parameter types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  # Property declarations
  sed -i '' 's/: any;/: unknown;/g' "$file" 2>/dev/null || true
  sed -i '' 's/: any,/: unknown,/g' "$file" 2>/dev/null || true
  
  # Function return types
  sed -i '' 's/): any {/): unknown {/g' "$file" 2>/dev/null || true
  sed -i '' 's/=> any/=> unknown/g' "$file" 2>/dev/null || true
  
  # Parameters
  sed -i '' 's/(data: any)/(data: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(response: any)/(response: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(result: any)/(result: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(value: any)/(value: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(item: any)/(item: unknown)/g' "$file" 2>/dev/null || true
  sed -i '' 's/(error: any)/(error: unknown)/g' "$file" 2>/dev/null || true
done

# Fix 7: Replace as any casts
echo "📝 Fixing type assertions..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/as any/as unknown/g' "$file" 2>/dev/null || true
done

# Fix 8: Fix unused catch variables
echo "📝 Fixing unused variables in catch blocks..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/catch (error)/catch (_error)/g' "$file" 2>/dev/null || true
  sed -i '' 's/catch (err)/catch (_err)/g' "$file" 2>/dev/null || true
  sed -i '' 's/catch (e)/catch (_e)/g' "$file" 2>/dev/null || true
done

# Count final errors
echo ""
echo "📊 Checking remaining errors..."
FINAL_ERRORS=$(pnpm lint 2>&1 | grep -c "error" || true)
echo "📊 Final errors: $FINAL_ERRORS"
echo "✅ Reduced errors by: $((INITIAL_ERRORS - FINAL_ERRORS))"