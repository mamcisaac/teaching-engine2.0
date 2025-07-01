#!/bin/bash
# Analyze skipped tests in active test files

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Analyzing Skipped Tests in Active Files ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

cd "$(dirname "$0")/.." || exit 1

# Create results directory
RESULTS_DIR="skipped-tests-analysis-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"

# Find all test files with skipped tests
echo -e "${YELLOW}Searching for skipped tests...${NC}"

# Search for different skip patterns
SKIP_PATTERNS=(
  "describe\.skip"
  "it\.skip"
  "test\.skip"
  "xdescribe"
  "xit"
  "xtest"
)

# Combined pattern for grep
PATTERN=$(IFS='|'; echo "${SKIP_PATTERNS[*]}")

# Find files with skipped tests
echo "Files with skipped tests:" > "$RESULTS_DIR/skipped-tests-report.md"
echo "========================" >> "$RESULTS_DIR/skipped-tests-report.md"
echo "" >> "$RESULTS_DIR/skipped-tests-report.md"

# Counter
TOTAL_FILES=0
TOTAL_SKIPPED=0

# Find and analyze each file
while IFS= read -r file; do
  if [ -f "$file" ]; then
    # Count skipped tests in this file
    SKIPPED_COUNT=$(grep -E "$PATTERN" "$file" | wc -l)
    
    if [ $SKIPPED_COUNT -gt 0 ]; then
      TOTAL_FILES=$((TOTAL_FILES + 1))
      TOTAL_SKIPPED=$((TOTAL_SKIPPED + SKIPPED_COUNT))
      
      echo -e "${YELLOW}Found $SKIPPED_COUNT skipped test(s) in: ${NC}$(basename "$file")"
      
      # Add to report
      echo "## $file" >> "$RESULTS_DIR/skipped-tests-report.md"
      echo "Skipped tests: $SKIPPED_COUNT" >> "$RESULTS_DIR/skipped-tests-report.md"
      echo "" >> "$RESULTS_DIR/skipped-tests-report.md"
      
      # Extract skipped test descriptions
      echo "### Skipped Test Details:" >> "$RESULTS_DIR/skipped-tests-report.md"
      grep -n -E "$PATTERN" "$file" | while IFS= read -r line; do
        echo "- Line $line" >> "$RESULTS_DIR/skipped-tests-report.md"
      done
      echo "" >> "$RESULTS_DIR/skipped-tests-report.md"
      
      # Create individual file report
      grep -n -E "$PATTERN" "$file" > "$RESULTS_DIR/$(basename "$file").skipped"
    fi
  fi
done < <(find . -path ./node_modules -prune -o -path ./dist -prune -o -name "*.test.ts" -type f -print | grep -v disabled)

# Generate summary
echo "" >> "$RESULTS_DIR/skipped-tests-report.md"
echo "# Summary" >> "$RESULTS_DIR/skipped-tests-report.md"
echo "- Total files with skipped tests: $TOTAL_FILES" >> "$RESULTS_DIR/skipped-tests-report.md"
echo "- Total skipped tests: $TOTAL_SKIPPED" >> "$RESULTS_DIR/skipped-tests-report.md"

# Display summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Summary                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Files with skipped tests: ${YELLOW}$TOTAL_FILES${NC}"
echo -e "Total skipped tests:      ${YELLOW}$TOTAL_SKIPPED${NC}"
echo ""
echo -e "Detailed report saved to: ${BLUE}$RESULTS_DIR/skipped-tests-report.md${NC}"

# Generate fix script
cat > "$RESULTS_DIR/fix-skipped-tests.sh" << 'EOF'
#!/bin/bash
# Script to help fix skipped tests

echo "This script will help you systematically fix skipped tests"
echo "For each skipped test:"
echo "1. Remove the .skip or x prefix"
echo "2. Run the test"
echo "3. Fix any issues"
echo "4. Commit the fix"

# Add your fix logic here
EOF

chmod +x "$RESULTS_DIR/fix-skipped-tests.sh"

echo -e "\n${GREEN}Analysis complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the detailed report"
echo "2. Prioritize which skipped tests to re-enable"
echo "3. Use the fix script template in $RESULTS_DIR/"

exit 0