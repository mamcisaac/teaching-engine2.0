# Test Recovery Action Plan - Immediate Steps

## Current Status

- **15 disabled test files** identified
- **All required mock files exist** ✓
- **Setup files present** ✓
- **Jest configuration properly set up** ✓

## Immediate Recovery Script

### Step 1: Create Recovery Script

```bash
#!/bin/bash
# test-recovery.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Teaching Engine 2.0 - Test Recovery Script${NC}"
echo "========================================"

# Array of disabled test files
DISABLED_TESTS=(
  "tests/unit/auth.refactored.test.ts.disabled"
  "tests/unit/connectors.test.ts.disabled"
  "tests/unit/curriculumImportService.test.ts.disabled"
  "tests/unit/curriculumImportService.coverage.test.ts.disabled"
  "tests/unit/discoveryServices.test.ts.disabled"
  "tests/unit/embeddingService.test.ts.disabled"
  "tests/unit/materialGenerator.unit.test.ts.disabled"
  "tests/unit/notificationService.test.ts.disabled"
  "tests/unit/plannerStateValidation.test.ts.disabled"
  "tests/unit/reportGeneratorService.coverage.test.ts.disabled"
  "tests/unit/scenarioTemplateExtractor.unit.test.ts.disabled"
  "tests/unit/templateService.test.ts.disabled"
  "tests/unit/weeklyPlanExtractor.coverage.test.ts.disabled"
  "tests/unit/workflowStateService.test.ts.disabled"
  "tests/integration/backupRoutes.test.ts.disabled"
)

# Function to test a single file
test_file() {
  local file=$1
  local enabled_file=${file%.disabled}

  echo -e "\n${YELLOW}Testing: ${enabled_file}${NC}"

  # Copy to enabled name
  cp "$file" "$enabled_file"

  # Run the test
  if pnpm test:unit -- "$(basename $enabled_file)" --verbose 2>&1; then
    echo -e "${GREEN}✓ Test passed!${NC}"
    echo "$enabled_file" >> recovered-tests.txt
    return 0
  else
    echo -e "${RED}✗ Test failed${NC}"
    # Keep the file for manual fixing
    echo "$enabled_file" >> failed-tests.txt
    return 1
  fi
}

# Create tracking files
> recovered-tests.txt
> failed-tests.txt

# Test each file
for test_file_path in "${DISABLED_TESTS[@]}"; do
  if [ -f "$test_file_path" ]; then
    test_file "$test_file_path"
  else
    echo -e "${RED}File not found: $test_file_path${NC}"
  fi
done

# Summary
echo -e "\n${YELLOW}Recovery Summary${NC}"
echo "========================================"
echo -e "${GREEN}Recovered: $(wc -l < recovered-tests.txt) tests${NC}"
echo -e "${RED}Failed: $(wc -l < failed-tests.txt) tests${NC}"
```

### Step 2: Quick Fix Patterns

#### Pattern 1: Import Path Fixes

```typescript
// Before (common in disabled tests):
import { prisma } from '../../src/prisma';
import { EmbeddingService } from '../../src/services/embeddingService';

// After (with proper mocking):
import { prisma } from '@/prisma';
import { EmbeddingService } from '@/services/embeddingService';
```

#### Pattern 2: Mock Setup

```typescript
// Add to top of test file:
import { jest } from '@jest/globals';

// Mock prisma if needed
jest.mock('@/prisma');

// Mock external services
jest.mock('openai');
```

#### Pattern 3: Async Test Fixes

```typescript
// Ensure proper async handling
describe('Service Test', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should handle async operations', async () => {
    const result = await service.asyncMethod();
    expect(result).toBeDefined();
  });
});
```

### Step 3: Priority Order Execution

```bash
# Phase 1: Core Infrastructure (Run first)
pnpm test:unit -- auth.refactored.test.ts
pnpm test:unit -- connectors.test.ts
pnpm test:unit -- workflowStateService.test.ts

# Phase 2: Independent Services (Run second)
pnpm test:unit -- notificationService.test.ts
pnpm test:unit -- templateService.test.ts
pnpm test:unit -- discoveryServices.test.ts

# Phase 3: AI Services (Run third)
pnpm test:unit -- embeddingService.test.ts
pnpm test:unit -- materialGenerator.unit.test.ts
pnpm test:unit -- scenarioTemplateExtractor.unit.test.ts

# Phase 4: Complex Services (Run fourth)
pnpm test:unit -- curriculumImportService.test.ts
pnpm test:unit -- plannerStateValidation.test.ts
pnpm test:unit -- weeklyPlanExtractor.coverage.test.ts

# Phase 5: Integration Tests (Run last)
pnpm test:integration -- backupRoutes.test.ts
```

### Step 4: Common Fixes Checklist

For each disabled test file:

1. **Update imports**
   - [ ] Change relative imports to use `@/` prefix
   - [ ] Ensure prisma import uses mock path
   - [ ] Update service imports to match moduleNameMapper

2. **Fix mock setup**
   - [ ] Add proper jest.mock() calls at top
   - [ ] Clear mocks in beforeEach
   - [ ] Restore mocks in afterEach

3. **Handle async operations**
   - [ ] Add async/await to all test functions
   - [ ] Ensure beforeEach/afterEach are async
   - [ ] Add proper timeouts for slow operations

4. **Update test patterns**
   - [ ] Use describe/it structure (not test())
   - [ ] Ensure test names are descriptive
   - [ ] Group related tests logically

5. **Fix TypeScript issues**
   - [ ] Add proper type imports
   - [ ] Fix any type errors
   - [ ] Ensure mock types match

### Step 5: Validation Commands

```bash
# After fixing each test, validate:

# 1. Run the specific test
pnpm test:unit -- [test-name].test.ts

# 2. Check coverage
pnpm test:coverage -- [test-name].test.ts

# 3. Run with debugging if needed
pnpm test:debug -- [test-name].test.ts

# 4. Run type checking
pnpm typecheck

# 5. Final validation - run all unit tests
pnpm test:unit
```

## Expected Timeline

- **Day 1**: Re-enable 3-5 core infrastructure tests
- **Day 2**: Re-enable 5-7 service tests
- **Day 3**: Re-enable AI-related tests
- **Day 4**: Re-enable coverage and integration tests
- **Day 5**: Final validation and cleanup

## Success Criteria

1. All 15 disabled tests are re-enabled
2. Test coverage returns to >90%
3. All tests pass in CI/CD pipeline
4. No performance regression in test execution time
5. Documentation updated with any new patterns discovered
