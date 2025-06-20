# Testing Guide for Assessment Features

This document outlines the comprehensive testing strategy for assessment features in Teaching Engine 2.0.

## Test Types Overview

| Test Type             | Purpose                           | Location                     | Command                                                        |
| --------------------- | --------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| **Unit Tests**        | Test component logic in isolation | `src/__tests__/`             | `npm run test:unit`                                            |
| **Integration Tests** | Test real API interactions        | `src/__tests__/integration/` | `npm run test:integration`                                     |
| **Contract Tests**    | Validate mock vs reality          | `src/__tests__/contract/`    | `npm run test:contract`                                        |
| **E2E Tests**         | Test complete user workflows      | `tests/e2e/`                 | `npx playwright test --config=playwright.assessment.config.ts` |

## Quick Start

```bash
# Run all assessment tests
./scripts/run-assessment-tests.sh

# Run specific test type
./scripts/run-assessment-tests.sh unit
./scripts/run-assessment-tests.sh integration
./scripts/run-assessment-tests.sh contract
./scripts/run-assessment-tests.sh e2e

# Run individual test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:contract          # Contract tests only
npm run test:all              # Unit + Integration tests
```

## Test Structure

### 1. Unit Tests (Mocked)

**Location**: `src/__tests__/*.test.tsx`

**Purpose**: Test component behavior in isolation with comprehensive mocking.

**What's Tested**:

- Component rendering and UI interactions
- Form validation logic
- State management within components
- Language switching functionality
- User interaction flows (clicking, typing, etc.)

**What's Mocked**:

- All API calls (`useOutcomes`, `useStudents`, etc.)
- External libraries (`sonner` toasts)
- Browser APIs (`navigator.mediaDevices`, `window.confirm`)
- Context providers (`LanguageContext`, `QueryClient`)

**Example**:

```typescript
// Mock API responses
vi.mock('../api', () => ({
  useOutcomes: () => ({
    data: [/* fake outcome data */],
  }),
  useStudents: () => ({
    data: [/* fake student data */],
  }),
}));

// Test component behavior
test('should select student and add evidence', () => {
  render(<EvidenceQuickEntry />);
  // Test interactions...
});
```

### 2. Integration Tests (Real APIs)

**Location**: `src/__tests__/integration/*.test.tsx`

**Purpose**: Test components against real API endpoints to verify full request/response cycles.

**What's Tested**:

- Real API endpoint functionality
- Network error handling
- Data fetching and mutations
- Performance under real conditions
- Concurrent API requests

**Setup Requirements**:

- API server running on localhost:3000
- Test database with seeded data
- Real authentication headers

**Example**:

```typescript
// Real API calls - no mocks
test('should fetch real outcomes from API', async () => {
  render(
    <QueryClientProvider client={realQueryClient}>
      <EvidenceQuickEntry />
    </QueryClientProvider>
  );

  // Wait for real API call to complete
  await waitFor(() => {
    expect(screen.getByText('Select Students')).toBeInTheDocument();
  }, { timeout: 10000 });
});
```

### 3. Contract Tests (Mock Validation)

**Location**: `src/__tests__/contract/*.test.tsx`

**Purpose**: Ensure mock data matches real API behavior to prevent mock drift.

**What's Tested**:

- Mock data structure validation
- API response format verification
- Data type consistency
- Required vs optional fields
- Error response formats

**Example**:

```typescript
// Validate mock matches reality
test('mock outcomes should match API contract', async () => {
  // Check mock data structure
  MOCK_OUTCOMES.forEach((outcome) => {
    expect(validateOutcomeContract(outcome)).toBe(true);
  });

  // Compare with real API response
  const realOutcomes = await fetchAPI('/outcomes');
  expect(realOutcomes[0]).toMatchStructure(MOCK_OUTCOMES[0]);
});
```

### 4. E2E Tests (User Workflows)

**Location**: `tests/e2e/assessment-workflows.spec.ts`

**Purpose**: Test complete user workflows across multiple components and pages.

**What's Tested**:

- Complete evidence entry workflow
- Reflection creation and editing
- Assessment template building
- Cross-component integration
- Browser compatibility
- Mobile responsiveness

**Example**:

```typescript
test('should complete full evidence entry workflow', async ({ page }) => {
  await page.goto('/dashboard');

  // Step 1: Select students
  await page.click('input[type="checkbox"]');

  // Step 2: Add evidence
  await page.fill('textarea', 'Student demonstrated excellent reading');

  // Step 3: Save
  await page.click('button:has-text("Save Evidence")');

  // Verify success
  await expect(page.locator('text=Evidence saved')).toBeVisible();
});
```

## Test Data Strategy

### Mock Data (Unit/Contract Tests)

```typescript
const MOCK_STUDENTS = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dubois',
    grade: 1,
    // ... other fields
  },
];
```

### Real Data (Integration/E2E Tests)

- Uses test database with seeded data
- Automatically created/cleaned up
- Isolated from production data

## Test Environment Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup test database (for integration/E2E)
cd server
npm run db:migrate
npm run db:seed
```

### Environment Variables

```bash
# Integration tests
VITE_API_URL=http://localhost:3000

# E2E tests
BASE_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

## Running Tests in CI

The comprehensive test suite runs automatically in GitHub Actions:

- **Unit Tests**: Run on every commit
- **Integration Tests**: Run with real database
- **Contract Tests**: Validate mock accuracy
- **E2E Tests**: Full browser testing
- **Test Report**: Generated after all tests complete

### CI Configuration

```yaml
# .github/workflows/assessment-tests.yml
name: Assessment Tests
on:
  push:
    paths:
      - 'client/src/components/assessment/**'
      - 'client/src/components/evidence/**'
      # ... other assessment-related paths
```

## Test Coverage

### What IS Tested ✅

- **Component Logic**: Form validation, state management, UI interactions
- **API Integration**: Real endpoint calls, error handling, data flow
- **User Workflows**: Complete task completion across components
- **Cross-browser**: Chrome, Firefox, Safari, Mobile
- **Performance**: Load times, concurrent operations
- **Contracts**: Mock data accuracy, API format validation

### What is NOT Tested ❌

- **Authentication Flow**: Uses test tokens
- **Production Database**: Uses isolated test data
- **External Services**: Email, file storage, etc.
- **Load Testing**: High concurrent user scenarios
- **Security**: SQL injection, XSS (requires separate security tests)

## Debugging Test Failures

### Unit Test Failures

```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run specific test file
npm run test:unit src/__tests__/EvidenceQuickEntry.test.tsx

# Debug mode
npm run test:unit -- --inspect-brk
```

### Integration Test Failures

```bash
# Check API server status
curl http://localhost:3000/api/test

# Run with API logs
cd server && npm run dev

# Check database connection
cd server && npm run db:status
```

### E2E Test Failures

```bash
# Run with headed browser (see what's happening)
npx playwright test --headed

# Debug specific test
npx playwright test --debug assessment-workflows.spec.ts

# Generate trace
npx playwright test --trace on
```

### Contract Test Failures

```bash
# Run contract tests in isolation
npm run test:contract

# Check API response manually
curl -H "Authorization: Bearer test-token" http://localhost:3000/api/outcomes
```

## Test Best Practices

### Writing Unit Tests

```typescript
✅ DO: Mock external dependencies
✅ DO: Test component behavior, not implementation
✅ DO: Use descriptive test names
✅ DO: Test error states and edge cases

❌ DON'T: Test internal React state directly
❌ DON'T: Make real API calls in unit tests
❌ DON'T: Test third-party library behavior
```

### Writing Integration Tests

```typescript
✅ DO: Test real API interactions
✅ DO: Verify error handling
✅ DO: Test performance characteristics
✅ DO: Clean up test data

❌ DON'T: Depend on specific test data order
❌ DON'T: Test UI interactions (use E2E for that)
❌ DON'T: Mock API calls
```

### Writing E2E Tests

```typescript
✅ DO: Test complete user workflows
✅ DO: Use page object patterns for complex interactions
✅ DO: Test across different browsers
✅ DO: Include accessibility checks

❌ DON'T: Test individual component methods
❌ DON'T: Make direct API calls in E2E tests
❌ DON'T: Rely on hardcoded wait times
```

### Writing Contract Tests

```typescript
✅ DO: Validate all mock data structures
✅ DO: Compare mock vs real API responses
✅ DO: Test error response formats
✅ DO: Document contract changes

❌ DON'T: Test business logic in contract tests
❌ DON'T: Skip validation when API is down
❌ DON'T: Hardcode expected structures
```

## Maintenance

### Updating Mocks

When API changes, update mocks in three places:

1. Unit test mock data
2. Contract test validation functions
3. Integration test expectations

### Adding New Tests

1. **New Component**: Add unit + integration + E2E coverage
2. **New API Endpoint**: Add integration + contract tests
3. **New Workflow**: Add E2E test scenario
4. **Bug Fix**: Add regression test at appropriate level

### Performance Monitoring

- Unit tests should run in <30 seconds
- Integration tests should complete in <2 minutes
- E2E tests should finish in <5 minutes
- Contract tests should validate in <1 minute

## Troubleshooting Common Issues

### "API server not available"

```bash
# Start the server
cd server && npm run dev

# Check if running
curl http://localhost:3000/api/test
```

### "Database connection failed"

```bash
# Reset test database
cd server && npm run db:reset

# Check environment
cat .env.test
```

### "Playwright browser not found"

```bash
# Install browsers
npx playwright install

# Check installation
npx playwright --version
```

### "Tests are flaky"

- Increase timeouts for CI environment
- Add proper wait conditions
- Check for race conditions
- Verify test isolation

## Continuous Improvement

### Test Metrics to Track

- **Test Coverage**: Aim for >90% on assessment components
- **Test Speed**: Keep total test time under 10 minutes
- **Flakiness**: <1% failure rate due to timing issues
- **Mock Accuracy**: 100% contract test pass rate

### Regular Maintenance Tasks

- [ ] Update mock data when API changes
- [ ] Review and clean up obsolete tests
- [ ] Add tests for new edge cases discovered
- [ ] Optimize slow tests
- [ ] Update documentation with new patterns

---

This comprehensive testing strategy ensures the assessment features are robust, reliable, and ready for production use. The multi-layered approach catches issues at different levels and provides confidence in both individual components and complete user workflows.
