#\!/bin/bash

echo "Fixing parsing errors in AI components..."

# Fix AILessonPlanPanel.tsx - duplicate error handling
echo "Fixing AILessonPlanPanel.tsx..."
sed -i '' 's/(_error instanceof Error ? _(error instanceof Error ? error.message : String(error)) : String(_error))/getErrorMessage(_error)/g' client/src/components/ai/AILessonPlanPanel.tsx

# Fix AIUnitPlanPanel.tsx - duplicate error handling
echo "Fixing AIUnitPlanPanel.tsx..."
sed -i '' 's/(_error instanceof Error ? _(error instanceof Error ? error.message : String(error)) : String(_error))/getErrorMessage(_error)/g' client/src/components/ai/AIUnitPlanPanel.tsx

# Add import for getErrorMessage if not present
for file in client/src/components/ai/AILessonPlanPanel.tsx client/src/components/ai/AIUnitPlanPanel.tsx; do
  if \! grep -q "getErrorMessage" "$file"; then
    sed -i '' '1s/^/import { getErrorMessage } from "..\/..\/utils\/typeGuards";\n/' "$file"
  fi
done

echo "Parsing errors fixed."
