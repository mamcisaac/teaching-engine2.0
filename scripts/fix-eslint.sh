#!/bin/bash

echo "🔧 Starting ESLint fixes..."

# Fix 1: Replace any[] with unknown[]
echo "📝 Replacing any[] with unknown[]..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: any\[\]/: unknown[]/g'

# Fix 2: Replace common any patterns with unknown
echo "📝 Replacing common 'any' patterns with 'unknown'..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error: any)/catch (error: unknown)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (e: any)/catch (e: unknown)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (err: any)/catch (err: unknown)/g'

# Fix 3: Replace Promise<any> with Promise<unknown>
echo "📝 Replacing Promise<any> with Promise<unknown>..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Promise<any>/Promise<unknown>/g'

# Fix 4: Replace Record<string, any> with Record<string, unknown>
echo "📝 Replacing Record<string, any> with Record<string, unknown>..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Record<string, any>/Record<string, unknown>/g'

# Fix 5: Replace common response/data patterns
echo "📝 Replacing common response/data patterns..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/response: any/response: unknown/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/data: any/data: unknown/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/result: any/result: unknown/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/payload: any/payload: unknown/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/body: any/body: unknown/g'

# Fix 6: Fix unused variables by prefixing with underscore
echo "📝 Fixing unused variables..."
# Common unused error variables
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (error)/catch (_error)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (e)/catch (_e)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/catch (err)/catch (_err)/g'

# Fix 7: Fix function parameter any types
echo "📝 Fixing function parameter types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(value: any)/(value: unknown)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(item: any)/(item: unknown)/g'
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/(obj: any)/(obj: unknown)/g'

# Fix 8: Fix generic any types
echo "📝 Fixing generic any types..."
find server/src client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/<any>/<unknown>/g'

echo "✅ ESLint fixes completed!"