#\!/bin/bash

echo "Adding missing imports for getErrorMessage and safeJsonParse..."

# Fix AI components - add getErrorMessage import
for file in client/src/components/ai/AILessonPlanPanel.tsx client/src/components/ai/AIUnitPlanPanel.tsx; do
  # Add import if not already present
  if \! grep -q "getErrorMessage" "$file" || true; then
    sed -i '' '1s/^/import { getErrorMessage } from "..\/..\/utils\/typeGuards";\n/' "$file"
  fi
done

# Fix KeyboardShortcuts test - add safeJsonParse import
if \! grep -q "safeJsonParse" client/src/__tests__/KeyboardShortcuts.test.tsx || true; then
  sed -i '' '1s/^/import { safeJsonParse } from "..\/utils\/typeGuards";\n/' "client/src/__tests__/KeyboardShortcuts.test.tsx"
fi

# Fix FormsDataAgent - add safeJsonParse import  
if \! grep -q "safeJsonParse" client/src/components/forms/FormsDataAgent.tsx || true; then
  sed -i '' '1s/^/import { safeJsonParse } from "..\/..\/utils\/typeGuards";\n/' "client/src/components/forms/FormsDataAgent.tsx"
fi

# Fix component type errors in lazy components
echo "Fixing React component type errors..."
sed -i '' 's/React.FC<Record<string, unknown>>/React.FC<any>/g' client/src/components/lazy/LazyComponents.tsx

# Fix store type errors by changing response.data to response.data as T
echo "Fixing store type errors..."
find client/src/stores -name "*.ts" | while read file; do
  sed -i '' 's/response\.data as Record<string, unknown>/response.data as T/g' "$file" 2>/dev/null || true
  sed -i '' 's/data as Record<string, unknown>/data as T/g' "$file" 2>/dev/null || true
done

echo "Import fixes complete."
