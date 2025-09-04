#!/bin/bash

# True TDD Test Runner
# This script runs the incremental TDD tests in order

echo "🧪 Running TRUE TDD Tests"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test file
run_test() {
    local test_file=$1
    local description=$2
    
    echo -e "${YELLOW}Running: ${description}${NC}"
    echo "File: ${test_file}"
    
    # Run the test with vitest
    npx vitest run "${test_file}" --no-coverage 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Tests passing (or not implemented yet)${NC}"
    else
        echo -e "${RED}✗ Test failed (expected in RED phase)${NC}"
    fi
    echo ""
}

echo "📚 LESSON COMPLETION FEATURE"
echo "----------------------------"
run_test "01-lesson-completion/step1.test.ts" "Step 1: Completion exists as concept"
run_test "01-lesson-completion/step2.test.ts" "Step 2: Function to track completion"
run_test "01-lesson-completion/step3.test.ts" "Step 3: User-specific completions"
run_test "01-lesson-completion/step4.test.ts" "Step 4: Checking completion status"
run_test "01-lesson-completion/step5.test.ts" "Step 5: Unmarking completed lessons"
run_test "01-lesson-completion/step6.test.ts" "Step 6: Tracking timestamps"
run_test "01-lesson-completion/step7.test.ts" "Step 7: Progress calculation"

echo "📅 WEEKLY SCHEDULE FEATURE"
echo "-------------------------"
run_test "02-weekly-schedule/step1.test.ts" "Step 1: Lessons exist in time"
run_test "02-weekly-schedule/step2.test.ts" "Step 2: Rescheduling lessons"
run_test "02-weekly-schedule/step3.test.ts" "Step 3: Conflict detection"

echo "📊 QUICK ASSESSMENT FEATURE"
echo "--------------------------"
run_test "03-quick-assessment/step1.test.ts" "Step 1: Achievement levels"
run_test "03-quick-assessment/step2.test.ts" "Step 2: Assessing a student"
run_test "03-quick-assessment/step3.test.ts" "Step 3: Multiple students"
run_test "03-quick-assessment/step4.test.ts" "Step 4: Differentiation groups"

echo ""
echo "========================================="
echo "📋 SUMMARY"
echo "========================================="
echo ""
echo "These tests demonstrate TRUE TDD:"
echo "1. Starting with the simplest possible test"
echo "2. Growing incrementally"
echo "3. No implementation assumptions"
echo "4. Testing behavior, not implementation"
echo ""
echo "🔴 RED Phase: Tests fail because code doesn't exist yet"
echo "🟢 GREEN Phase: Write minimal code to pass each test"
echo "🔄 REFACTOR Phase: Improve code while keeping tests green"
echo ""
echo "To implement a feature:"
echo "1. Run the first test - see it fail"
echo "2. Write minimal code to pass"
echo "3. Run the next test - see it fail"
echo "4. Add minimal code to pass"
echo "5. Continue incrementally"
echo ""
echo "✨ The design emerges from the tests!"