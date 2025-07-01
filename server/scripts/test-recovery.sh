#!/bin/bash
# Teaching Engine 2.0 - Test Recovery Script
# This script attempts to re-enable disabled test files and tracks success/failure

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Teaching Engine 2.0 - Test Recovery      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Change to server directory
cd "$(dirname "$0")/.." || exit 1

# Array of disabled test files in priority order
DISABLED_TESTS=(
  # Priority 1: Core Infrastructure
  "tests/unit/auth.refactored.test.ts.disabled"
  "tests/unit/connectors.test.ts.disabled"
  "tests/unit/workflowStateService.test.ts.disabled"
  
  # Priority 2: Business Critical Features
  "tests/unit/curriculumImportService.test.ts.disabled"
  "tests/unit/notificationService.test.ts.disabled"
  "tests/unit/plannerStateValidation.test.ts.disabled"
  
  # Priority 3: AI/Advanced Features
  "tests/unit/embeddingService.test.ts.disabled"
  "tests/unit/materialGenerator.unit.test.ts.disabled"
  "tests/unit/scenarioTemplateExtractor.unit.test.ts.disabled"
  
  # Priority 4: Additional Coverage
  "tests/unit/curriculumImportService.coverage.test.ts.disabled"
  "tests/unit/reportGeneratorService.coverage.test.ts.disabled"
  "tests/unit/weeklyPlanExtractor.coverage.test.ts.disabled"
  "tests/unit/templateService.test.ts.disabled"
  "tests/unit/discoveryServices.test.ts.disabled"
  
  # Priority 5: Integration Tests
  "tests/integration/backupRoutes.test.ts.disabled"
)

# Create results directory
RESULTS_DIR="test-recovery-results-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"

# Initialize counters
TOTAL=0
RECOVERED=0
FAILED=0
SKIPPED=0

# Function to test a single file
test_file() {
  local file=$1
  local enabled_file=${file%.disabled}
  local test_name=$(basename "$enabled_file")
  
  TOTAL=$((TOTAL + 1))
  
  echo -e "\n${YELLOW}[$TOTAL/${#DISABLED_TESTS[@]}] Testing: ${test_name}${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Check if disabled file exists
  if [ ! -f "$file" ]; then
    echo -e "${RED}✗ Disabled file not found${NC}"
    SKIPPED=$((SKIPPED + 1))
    echo "$file - NOT FOUND" >> "$RESULTS_DIR/skipped-tests.txt"
    return 1
  fi
  
  # Copy to enabled name
  cp "$file" "$enabled_file"
  
  # Determine test type
  if [[ "$file" == *"integration"* ]]; then
    TEST_CMD="pnpm test:integration"
  else
    TEST_CMD="pnpm test:unit"
  fi
  
  # Run the test and capture output
  echo -e "${BLUE}Running: $TEST_CMD -- $test_name${NC}"
  
  # Run test with timeout and capture output
  if timeout 60s $TEST_CMD -- "$test_name" > "$RESULTS_DIR/${test_name}.log" 2>&1; then
    echo -e "${GREEN}✓ Test passed!${NC}"
    RECOVERED=$((RECOVERED + 1))
    echo "$enabled_file" >> "$RESULTS_DIR/recovered-tests.txt"
    
    # Remove the .disabled version since it's working
    rm "$file"
    
    # Show test summary
    grep -E "(PASS|✓)" "$RESULTS_DIR/${test_name}.log" | tail -5
    
    return 0
  else
    echo -e "${RED}✗ Test failed${NC}"
    FAILED=$((FAILED + 1))
    echo "$enabled_file" >> "$RESULTS_DIR/failed-tests.txt"
    
    # Show error summary
    echo -e "${RED}Error Summary:${NC}"
    grep -E "(FAIL|Error|TypeError|ReferenceError)" "$RESULTS_DIR/${test_name}.log" | head -10
    
    # Keep the enabled file for manual fixing but also keep disabled version
    echo -e "${YELLOW}File kept as: $enabled_file (needs manual fixing)${NC}"
    
    return 1
  fi
}

# Function to show progress bar
show_progress() {
  local current=$1
  local total=$2
  local percent=$((current * 100 / total))
  local filled=$((percent / 2))
  
  printf "\rProgress: ["
  printf "%${filled}s" | tr ' ' '█'
  printf "%$((50 - filled))s" | tr ' ' '░'
  printf "] %d%%" "$percent"
}

# Main execution
echo -e "${BLUE}Starting test recovery process...${NC}"
echo -e "${YELLOW}Found ${#DISABLED_TESTS[@]} disabled test files${NC}"
echo ""

# Test each file
for i in "${!DISABLED_TESTS[@]}"; do
  test_file "${DISABLED_TESTS[$i]}"
  show_progress $((i + 1)) ${#DISABLED_TESTS[@]}
done

echo -e "\n\n${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Recovery Summary                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:     ${TOTAL}"
echo -e "${GREEN}Recovered:       ${RECOVERED}${NC}"
echo -e "${RED}Failed:          ${FAILED}${NC}"
echo -e "${YELLOW}Skipped:         ${SKIPPED}${NC}"
echo ""
echo -e "Success Rate:    $((RECOVERED * 100 / (TOTAL - SKIPPED)))%"
echo ""
echo -e "Results saved to: ${BLUE}${RESULTS_DIR}/${NC}"

# Generate detailed report
cat > "$RESULTS_DIR/recovery-report.md" << EOF
# Test Recovery Report
Generated: $(date)

## Summary
- Total Tests: ${TOTAL}
- Recovered: ${RECOVERED}
- Failed: ${FAILED}
- Skipped: ${SKIPPED}
- Success Rate: $((RECOVERED * 100 / (TOTAL - SKIPPED)))%

## Recovered Tests
$([ -f "$RESULTS_DIR/recovered-tests.txt" ] && cat "$RESULTS_DIR/recovered-tests.txt" || echo "None")

## Failed Tests (Need Manual Fixing)
$([ -f "$RESULTS_DIR/failed-tests.txt" ] && cat "$RESULTS_DIR/failed-tests.txt" || echo "None")

## Skipped Tests (File Not Found)
$([ -f "$RESULTS_DIR/skipped-tests.txt" ] && cat "$RESULTS_DIR/skipped-tests.txt" || echo "None")

## Next Steps
1. Review failed test logs in: ${RESULTS_DIR}/
2. Fix import paths and mock configurations
3. Re-run this script to test fixes
4. Once all tests pass, run: pnpm test:coverage
EOF

echo -e "\n${YELLOW}Detailed report: ${RESULTS_DIR}/recovery-report.md${NC}"

# If any tests were recovered, suggest running full test suite
if [ $RECOVERED -gt 0 ]; then
  echo -e "\n${GREEN}Success! Some tests were recovered.${NC}"
  echo -e "${YELLOW}Run 'pnpm test:unit' to verify all unit tests still pass.${NC}"
fi

# If any tests failed, provide guidance
if [ $FAILED -gt 0 ]; then
  echo -e "\n${YELLOW}Some tests need manual fixing. Common issues:${NC}"
  echo "1. Import paths need updating (use @/ prefix)"
  echo "2. Mock configuration needs adjustment"
  echo "3. Async operations need proper handling"
  echo "4. TypeScript types need updating"
  echo -e "\n${BLUE}Check the logs in ${RESULTS_DIR}/ for details${NC}"
fi

exit 0