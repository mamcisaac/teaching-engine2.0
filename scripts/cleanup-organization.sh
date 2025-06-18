#!/bin/bash

# Teaching Engine 2.0 - Organizational Cleanup Script
# This script removes temporary files and organizes the project structure

echo "🧹 Starting organizational cleanup..."

# Navigate to project root
cd "$(dirname "$0")/.."

# 1. Remove temporary and debug files
echo "Removing temporary files..."
rm -f "1_build (20).txt"
rm -f debug-after-navigation.json
rm -f debug-planner.png
rm -f dev.log
rm -f test-local.sh
rm -f test-1.db

# Remove empty calendar-considerations directory if it exists and is empty
if [ -d "calendar-considerations" ] && [ -z "$(ls -A calendar-considerations)" ]; then
    rmdir calendar-considerations
    echo "Removed empty calendar-considerations directory"
fi

# 2. Move screenshots to docs/images/
echo "Moving screenshots to docs/images/..."
mkdir -p docs/images
[ -f "after-login.png" ] && mv after-login.png docs/images/
[ -f "subjects-page.png" ] && mv subjects-page.png docs/images/

# 3. Move orphaned documentation files
echo "Moving orphaned documentation files..."
[ -f "docs/AGENTS-TODO-GAPS.md" ] && mv docs/AGENTS-TODO-GAPS.md docs/agents/
[ -f "docs/requirements-traceability-matrix.md" ] && mv docs/requirements-traceability-matrix.md docs/agents/

# 4. Move term-plans.md to docs/
[ -f "term-plans.md" ] && mv term-plans.md docs/

# 5. Remove empty documentation directories (we'll create them when needed)
echo "Removing empty documentation directories..."
for dir in api database decisions patterns specs; do
    if [ -d "docs/$dir" ] && [ -z "$(ls -A docs/$dir)" ]; then
        rmdir "docs/$dir"
        echo "Removed empty docs/$dir directory"
    fi
done

# 6. Clean up test artifacts (but preserve necessary test files)
echo "Cleaning up test artifacts..."
rm -rf test-results/ 2>/dev/null
rm -rf playwright-report/ 2>/dev/null

# 7. Update .gitignore to prevent future clutter
echo "Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Debug and temporary files
debug-*.json
debug-*.png
*.log
test-*.db
test-results/
playwright-report/

# Build artifacts
1_build*.txt
EOF

echo "✅ Organizational cleanup complete!"
echo ""
echo "📁 Current documentation structure:"
tree docs/ -I node_modules 2>/dev/null || find docs/ -type f -name "*.md" | sort

echo ""
echo "🎯 Recommended next steps:"
echo "1. Review the updated .gitignore file"
echo "2. Commit these organizational changes"
echo "3. Consider if any empty directories should be recreated for future use"