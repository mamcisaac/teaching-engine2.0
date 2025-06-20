# Activity Components Test Suite

This directory contains comprehensive test suites for the Activity Suggestion Engine components. The tests cover multiple aspects of quality assurance including unit tests, integration tests, contract tests, E2E tests, performance tests, accessibility tests, and visual regression tests.

## Test Files Overview

### Unit Tests
- **`ActivitySuggestions.test.tsx`** - Unit tests for the ActivitySuggestions component
- **`ActivityLibrary.test.tsx`** - Unit tests for the ActivityLibrary component  
- **`ActivityEditor.test.tsx`** - Unit tests for the ActivityEditor component
- **`PrintableDailyPlanView.test.tsx`** - Unit tests for the PrintableDailyPlanView component

### Integration Tests
- **`ActivitySuggestions.integration.test.tsx`** - Tests that hit real API endpoints
- **`ActivityLibrary.integration.test.tsx`** - Tests that validate real API behavior

### Contract Tests
- **`ActivitySuggestions.contract.test.tsx`** - Validates API response structure matches interfaces
- **`ActivityLibrary.contract.test.tsx`** - Validates API contracts and mock accuracy

### Performance Tests
- **`ActivityComponents.performance.test.tsx`** - Tests component performance with large datasets

### Accessibility Tests
- **`ActivityComponents.accessibility.test.tsx`** - WCAG compliance and keyboard navigation tests

## Test Types Explained

### 1. Unit Tests
These test individual components in isolation with mocked dependencies:
- Component rendering
- User interactions
- Props handling
- State management
- Error handling

### 2. Integration Tests
These test components against real API endpoints:
- Real network requests
- Authentication flows
- API error handling
- Data transformation

**Note**: Integration tests require the backend server to be running. They are skipped by default to avoid test failures in CI environments without a server.

### 3. Contract Tests
These validate that our test mocks match real API behavior:
- Response structure validation
- Query parameter verification
- Authentication requirements
- Error response formats

### 4. Performance Tests
These ensure components perform well under load:
- Large dataset rendering (100-200 items)
- Rapid state changes
- Memory leak detection
- Render time measurements

### 5. Accessibility Tests
These ensure components are accessible to all users:
- Screen reader compatibility
- Keyboard navigation
- WCAG 2.1 AA compliance
- Focus management
- ARIA attributes

### 6. Visual Regression Tests
Located in `/tests/e2e/activity-components-visual.spec.ts`:
- Component screenshots
- Visual change detection
- Cross-browser compatibility
- Dark mode testing

## Running Tests

### All Tests
```bash
pnpm test
```

### Specific Test Categories
```bash
# Unit tests only
pnpm test ActivitySuggestions.test.tsx ActivityLibrary.test.tsx ActivityEditor.test.tsx

# Performance tests
pnpm test ActivityComponents.performance.test.tsx

# Accessibility tests  
pnpm test ActivityComponents.accessibility.test.tsx

# Integration tests (requires server)
pnpm test ActivitySuggestions.integration.test.tsx

# Contract tests (requires server)
pnpm test ActivitySuggestions.contract.test.tsx
```

### E2E and Visual Tests
```bash
# All E2E tests
pnpm test:e2e

# Visual regression tests
npx playwright test activity-components-visual.spec.ts

# Update visual baselines
npx playwright test activity-components-visual.spec.ts --update-snapshots
```

## Test Configuration

### Test Environment Setup
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks for fetch, localStorage, etc.
- **Accessibility**: jest-axe for WCAG compliance testing
- **E2E**: Playwright for end-to-end testing

### Mock Configuration
All unit tests use comprehensive mocks for:
- `fetch` API calls
- `use-toast` hook
- `localStorage`
- React Query client

### Real API Testing
Integration and contract tests can be configured to hit real endpoints by:
1. Starting the backend server
2. Changing `it.skip` to `it` in integration test files
3. Setting appropriate environment variables

## Test Data

### Mock Data
Each test file includes comprehensive mock data that matches the actual API response structures:
- ActivityTemplate interfaces
- Theme data
- User data
- Error responses

### Test Scenarios
Tests cover multiple scenarios:
- Happy path (successful data loading)
- Empty states (no data returned)
- Error states (API failures, network errors)
- Loading states (async operations)
- Edge cases (invalid data, timeouts)

## Coverage Goals

The test suite aims for:
- **90%+ code coverage** for all components
- **100% path coverage** for critical user flows
- **Complete API contract validation**
- **Comprehensive accessibility coverage**
- **Performance benchmarks** for all components

## Best Practices

### Writing Tests
1. **Arrange, Act, Assert** pattern
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test error scenarios**

### Maintaining Tests
1. **Update tests when APIs change**
2. **Keep mock data synchronized**
3. **Review test failures carefully**
4. **Update visual baselines when UI changes**
5. **Performance thresholds should be realistic**

## Troubleshooting

### Common Issues

**Test timeouts**: 
- Integration tests may timeout if server isn't running
- Increase timeout values for slower environments

**Mock sync issues**:
- Contract tests will fail if mocks don't match real API
- Run contract tests against live API to verify accuracy

**Visual test failures**:
- Screenshots may differ between environments
- Update baselines with `--update-snapshots` flag

**Accessibility violations**:
- Use browser dev tools to debug ARIA issues
- Check keyboard navigation manually

### Performance Issues
If performance tests fail:
1. Check if the failure is consistent
2. Consider environment-specific factors
3. Adjust thresholds if necessary
4. Investigate memory leaks or inefficient renders

## Contributing

When adding new features:
1. **Write tests first** (TDD approach)
2. **Include all test types** (unit, integration, accessibility)
3. **Update documentation** as needed
4. **Ensure CI passes** before merging

When modifying existing features:
1. **Update relevant tests**
2. **Check visual baselines** if UI changed
3. **Run contract tests** to verify API compatibility
4. **Test accessibility** after changes

## Dependencies

### Production Dependencies
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `react` - UI framework

### Test Dependencies
- `vitest` - Test runner
- `@testing-library/react` - Component testing
- `@testing-library/user-event` - User interaction simulation
- `jest-axe` - Accessibility testing
- `axe-core` - Accessibility engine
- `playwright` - E2E testing

## Quality Gates

All tests must pass before code can be merged:
- ✅ Unit tests pass
- ✅ TypeScript compilation succeeds
- ✅ Linting passes
- ✅ Accessibility tests pass
- ✅ Performance benchmarks met
- ✅ Visual regression tests pass (if UI changed)

---

For questions about testing strategy or specific test implementations, refer to the individual test files or reach out to the development team.