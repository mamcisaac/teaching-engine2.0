#!/bin/bash

# Convert default exports to named exports
echo "Converting default exports to named exports..."

# Find all files with default exports (excluding config, index, and test files)
files=$(find ./client/src ./server/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -name "index.ts" \
  -not -name "index.tsx" \
  -not -name "*.config.ts" \
  -not -name "*.config.js" \
  -not -name "*.test.ts" \
  -not -name "*.test.tsx" \
  -not -name "*.spec.ts" \
  -not -name "*.spec.tsx" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -exec grep -l "export default" {} \;)

count=0

for file in $files; do
  echo "Processing: $file"
  
  # Get the component/file name
  basename=$(basename "$file")
  name="${basename%.*}"
  
  # Convert export default function ComponentName
  sed -i '' 's/export default function \([A-Za-z0-9_]*\)/export function \1/g' "$file"
  
  # Convert export default class ComponentName
  sed -i '' 's/export default class \([A-Za-z0-9_]*\)/export class \1/g' "$file"
  
  # Convert export default ComponentName;
  sed -i '' 's/export default \([A-Za-z0-9_]*\);$/export { \1 };/g' "$file"
  
  # Handle arrow functions and anonymous functions
  if grep -q "export default (" "$file"; then
    # For arrow functions, use the filename as the export name
    sed -i '' "s/export default (/export const $name = (/g" "$file"
  fi
  
  # Handle React.FC and similar patterns
  if grep -q "export default.*React\." "$file"; then
    sed -i '' "s/export default \(.*\)$/export const $name = \1/g" "$file"
  fi
  
  ((count++))
done

echo "Converted $count files"

# Now update lazy imports
echo "Updating lazy imports..."

# Find all files with lazy imports
lazy_files=$(find ./client/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec grep -l "lazy(() => import(" {} \;)

for file in $lazy_files; do
  echo "Updating lazy imports in: $file"
  
  # Convert lazy imports to use named exports
  # This is complex and needs careful handling
  # For now, we'll mark files that need manual update
  if grep -q "lazy(() => import(" "$file"; then
    echo "TODO: Manually update lazy imports in $file"
  fi
done

echo "Done! Please run 'npm run lint' to check for remaining issues."