# Client Test Suite - Real Backend Integration

This directory contains comprehensive test suites for the Teaching Engine 2.0 client application, with a focus on real backend integration testing.

## Test Architecture

### Test Types

1. **Unit Tests** (`*.test.tsx`)
   - Component behavior testing
   - Utility function testing
   - Uses mocks for external dependencies
   - Fast execution, isolated testing

2. **Real Backend Integration Tests** (`*.real.test.tsx`)
   - Tests with actual backend API calls
   - Real database operations
   - Complete authentication flows
   - Realistic data validation

3. **Workflow Integration Tests** (`workflows/*.test.tsx`)
   - End-to-end user scenarios
   - Complete application workflows
   - Multi-step user interactions
   - Cross-component integration

## Directory Structure

```
src/__tests__/
├── README.md                           # This file
├── components/                         # Component tests
│   └── ui/
│       ├── Button.test.tsx            # Unit tests with mocks
│       └── Button.real.test.tsx       # Real backend integration
├── hooks/                             # Hook tests
│   ├── useETFOPlanning.test.tsx       # Unit tests with mocks
│   └── useETFOPlanning.real.test.tsx  # Real backend integration
├── pages/                             # Page component tests
├── workflows/                         # Complete user workflow tests
│   └── etfo-planning-workflow.real.test.tsx
└── mocks/                             # Mock data and utilities
    └── api.ts                         # API mocking utilities
```

## Running Tests

### Quick Commands

```bash
# Run all unit tests (with mocks)
pnpm test:unit

# Run real backend integration tests
pnpm test:real-backend

# Run with server management (recommended)
pnpm test:real-backend:full

# Watch mode for development
pnpm test:real-backend:watch

# Run all test types
pnpm test:all
```

### Test Execution Details

#### Unit Tests

- **Speed**: Fast (< 5 seconds)
- **Dependencies**: None (uses mocks)
- **Purpose**: Component logic validation
- **Pattern**: `**/*.test.{ts,tsx}`

#### Real Backend Tests

- **Speed**: Moderate (30-60 seconds)
- **Dependencies**: Real backend server
- **Purpose**: Integration validation
- **Pattern**: `**/*.real.test.{ts,tsx}`

#### Workflow Tests

- **Speed**: Slow (1-5 minutes)
- **Dependencies**: Real backend + seeded data
- **Purpose**: User journey validation
- **Pattern**: `**/workflows/*.test.{ts,tsx}`

## Test Utilities

### Core Utilities

1. **`real-backend-setup.ts`**
   - Test server lifecycle management
   - Database reset utilities
   - Health check functions

2. **`real-test-providers.tsx`**
   - React providers for real backend
   - Authentication context setup
   - Query client configuration

3. **`real-api-helpers.ts`**
   - API call utilities
   - Test data factories
   - Validation assertions

4. **`auth-test-utils.ts`**
   - User creation and authentication
   - Token management
   - Multi-user scenarios

### Example Usage

#### Basic Real Backend Test

```typescript
import { renderWithRealBackend } from '../../test-utils/real-test-providers';
import { realApiHelpers } from '../../test-utils/real-api-helpers';

describe('Component Real Backend Tests', () => {
  let authContext: AuthTestContext;

  beforeAll(async () => {
    authContext = await createAuthenticatedTestUser();
  });

  afterAll(async () => {
    await authContext.cleanup();
  });

  it('creates data via real API', async () => {
    const { cleanup } = await renderWithRealBackend(<Component />, {
      authenticated: true,
      authContext,
    });

    // Test real interactions
    const result = await realApiHelpers.createLongRangePlan(authContext, {
      title: 'Test Plan',
    });

    expect(result).toBeDefined();
    expect(result.title).toBe('Test Plan');

    await cleanup();
  });
});
```

#### Hook Testing with Real Backend

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLongRangePlans } from '../../hooks/useETFOPlanning';

describe('Hook Real Backend Tests', () => {
  it('fetches real data from backend', async () => {
    // Seed test data
    await realApiHelpers.createLongRangePlan(authContext, {
      title: 'Real Plan',
    });

    const { result } = renderHook(() => useLongRangePlans(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data.length).toBe(1);
      expect(result.current.data[0].title).toBe('Real Plan');
    });
  });
});
```

## Test Data Management

### Data Factories

Use standardized factories for consistent test data:

```typescript
const planData = testDataFactory.longRangePlan({
  title: 'Custom Title',
  grade: 3,
});

const unitData = testDataFactory.unitPlan(longRangePlanId, {
  title: 'Custom Unit',
});
```

### Data Seeding

For complex scenarios, use seeding utilities:

```typescript
// Seed complete planning hierarchy
const seededData = await testDataSeeder.seedBasicPlanningData(authContext);

// Seed large dataset for performance testing
await testDataSeeder.seedLargePlanningData(authContext, 50);
```

### Data Cleanup

Always clean up test data:

```typescript
// Automatic cleanup with render utilities
const { cleanup } = await renderWithRealBackend(<Component />);
// ... test code
await cleanup();

// Manual cleanup for custom scenarios
beforeEach(async () => {
  await resetTestDatabase();
});
```

## Authentication Testing

### User Management

```typescript
// Create authenticated user
const authContext = await createAuthenticatedTestUser();

// Create user with specific data
const authContext = await createAuthenticatedTestUser({
  email: 'specific@example.com',
  role: 'ADMIN',
});

// Multi-user scenarios
const user1 = await createAuthenticatedTestUser();
const user2 = await createAuthenticatedTestUser();
```

### Authorization Testing

```typescript
// Test protected routes
await testProtectedRoute('/api/long-range-plans');

// Test authorization failures
await errorTestHelpers.testUnauthorizedAccess('/api/admin/users');
```

## Performance Testing

### Response Time Testing

```typescript
const { timeMs } = await performanceHelpers.measureApiCallTime(() =>
  realApiHelpers.getLongRangePlans(authContext),
);

expect(timeMs).toBeLessThan(2000); // 2 seconds
```

### Load Testing

```typescript
// Test with large datasets
await testDataSeeder.seedLargePlanningData(authContext, 100);

const startTime = performance.now();
// ... perform operations
const endTime = performance.now();

expect(endTime - startTime).toBeLessThan(5000);
```

## Error Handling Tests

### Validation Errors

```typescript
// Test backend validation
await errorTestHelpers.testValidationError(
  authContext,
  '/api/long-range-plans',
  {}, // Invalid empty data
);
```

### Network Errors

```typescript
// Test error recovery
try {
  await realApiHelpers.getLongRangePlan(authContext, 'non-existent-id');
} catch (error) {
  expect(error.response.status).toBe(404);
}
```

## Best Practices

### 1. Test Isolation

- Reset database between tests
- Create unique test data
- Clean up created resources
- Use separate test user accounts

### 2. Realistic Testing

- Use actual API endpoints
- Test with real data volumes
- Validate complete workflows
- Test error scenarios

### 3. Performance Awareness

- Monitor test execution time
- Use appropriate timeouts
- Optimize test data setup
- Parallelize when possible

### 4. Debugging

- Use meaningful test descriptions
- Log important test data
- Preserve failing test state
- Use debugging utilities

## Debugging Tests

### Common Issues

1. **Server Won't Start**

   ```bash
   # Check port availability
   lsof -ti:3001

   # View server logs
   pnpm test:real-backend:full
   ```

2. **Database Issues**

   ```bash
   # Reset test database
   rm server/test-real-backend.db

   # Check database contents
   sqlite3 server/test-real-backend.db ".tables"
   ```

3. **Authentication Failures**
   ```bash
   # Verify auth service
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPassword123!"}'
   ```

### Debug Utilities

```typescript
// Enable verbose logging
const result = await realApiHelpers.createLongRangePlan(authContext, data);
console.log('Created plan:', result);

// Check server health
const isHealthy = await isTestServerRunning();
console.log('Server healthy:', isHealthy);

// Inspect test database
await testAPI.get('/api/debug/database-state');
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Real Backend Tests
  run: |
    pnpm install
    pnpm test:real-backend:full
  env:
    NODE_ENV: test
    DATABASE_URL: file:./test-ci.db
```

### Test Coverage

Real backend tests contribute to overall coverage metrics:

```bash
# Generate coverage report including real backend tests
pnpm test:all --coverage
```

## Migration Guide

### Converting Mock Tests to Real Backend

1. **Identify Mock Usage**
   - Look for `vi.mock()` calls
   - Find mocked API responses
   - Identify test data setup

2. **Replace with Real Calls**
   - Use `realApiHelpers` instead of mocks
   - Add authentication context
   - Include cleanup procedures

3. **Update Assertions**
   - Use real data validation
   - Test actual API responses
   - Verify database state

4. **Add Error Handling**
   - Test real error responses
   - Handle network timeouts
   - Test validation failures

### Example Migration

```typescript
// Before (with mocks)
vi.mock('../../api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: mockPlans }) },
}));

const { result } = renderHook(() => useLongRangePlans(), { wrapper });
expect(result.current.data).toEqual(mockPlans);

// After (with real backend)
const createdPlan = await realApiHelpers.createLongRangePlan(authContext, testData);
const { result } = renderHook(() => useLongRangePlans(), { wrapper });

await waitFor(() => {
  expect(result.current.data).toBeDefined();
  expect(result.current.data[0]).toEqual(
    expect.objectContaining({
      id: createdPlan.id,
      title: testData.title,
    }),
  );
});
```

## Future Enhancements

1. **Parallel Execution**: Database isolation for parallel test runs
2. **Visual Testing**: Screenshot comparison for UI regression testing
3. **Performance Monitoring**: Automated performance regression detection
4. **Real-time Testing**: WebSocket and SSE integration testing
5. **Mobile Testing**: React Native integration testing

This comprehensive testing approach ensures our application works correctly with real backend systems while maintaining development velocity and confidence in our code quality.
