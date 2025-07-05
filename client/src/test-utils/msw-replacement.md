# MSW Replacement Strategy for Real Backend Testing

## Overview

This document outlines how we've replaced Mock Service Worker (MSW) with real backend API calls for testing. This approach provides more realistic testing while maintaining test reliability.

## Why Replace MSW?

1. **Real API Validation**: Tests actual API endpoints and responses
2. **True Integration Testing**: Validates complete request/response cycles
3. **Database Integration**: Tests with real database operations
4. **Error Handling**: Tests actual server error responses
5. **Performance Testing**: Measures real API performance

## Architecture

### Test Server Setup
- Dedicated test server running on port 3001
- Separate test database (SQLite for isolation)
- Real authentication and authorization
- All actual middleware and validation

### Test Utilities Structure
```
src/test-utils/
├── real-backend-setup.ts       # Server lifecycle management
├── real-test-providers.tsx     # React providers for real backend
├── real-api-helpers.ts         # API call utilities and assertions
├── auth-test-utils.ts          # Authentication helpers
└── global-real-backend-setup.ts # Global test configuration
```

## Key Components

### 1. Real Backend Setup (`real-backend-setup.ts`)
- Starts/stops test server
- Manages database state
- Configures test environment
- Health checks and waiting utilities

### 2. Real Test Providers (`real-test-providers.tsx`)
- React context providers with real backend
- Authentication setup
- Query client configuration
- Test cleanup utilities

### 3. API Helpers (`real-api-helpers.ts`)
- Factory functions for test data
- Real API call helpers
- Data validation assertions
- Performance testing utilities

### 4. Authentication Utils (`auth-test-utils.ts`)
- Real user creation and login
- Token management
- Authorization testing
- Multi-user scenarios

## Test Patterns

### Hook Testing
```typescript
// Before (with mocks)
vi.mock('../../api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: mockData }) }
}));

// After (with real backend)
const authContext = await createAuthenticatedTestUser();
const result = await realApiHelpers.createLongRangePlan(authContext, testData);
expect(result).toBeDefined();
realApiAssertions.assertValidLongRangePlan(result);
```

### Component Testing
```typescript
// Before (with mocked providers)
renderWithProviders(<Component />);

// After (with real backend)
const { cleanup } = await renderWithRealBackend(<Component />, {
  authenticated: true,
  withBackendSetup: true,
});
// ... test with real data
await cleanup();
```

### Workflow Testing
```typescript
// Complete user workflows with real backend
const { cleanup } = await renderWithRealBackend(<PlanningDashboard />, {
  authenticated: true,
});

// Real user interactions creating actual data
const createButton = await screen.findByRole('button', { name: /create/i });
await user.click(createButton);
// ... fill form and submit
// Verify data exists in backend
const plans = await realApiHelpers.getLongRangePlans(authContext);
expect(plans.length).toBe(1);

await cleanup();
```

## Test Configuration

### Unit Tests (Original)
- File: `vitest.config.ts`
- Pattern: `**/*.test.{ts,tsx}` (excluding `.real.test.{ts,tsx}`)
- Uses mocks for external dependencies

### Real Backend Tests
- File: `vitest.real-backend.config.ts`
- Pattern: `**/*.real.test.{ts,tsx}`, `**/workflows/*.test.{ts,tsx}`
- Sequential execution to avoid conflicts
- Longer timeouts for real API calls

## Running Tests

```bash
# Original unit tests (with mocks)
pnpm test:unit

# Real backend integration tests
pnpm test:real-backend

# Watch mode for real backend tests
pnpm test:real-backend:watch

# All tests
pnpm test:all
```

## Benefits Achieved

### 1. True Integration Coverage
- Tests actual API contracts
- Validates database operations
- Tests complete middleware stack
- Real error handling

### 2. Realistic Performance Testing
- Measures actual response times
- Tests with realistic data volumes
- Network latency simulation
- Database query performance

### 3. Better Bug Detection
- Catches integration issues early
- Validates serialization/deserialization
- Tests actual error responses
- Database constraint validation

### 4. Improved Confidence
- Tests run against production-like environment
- Real authentication flows
- Actual data persistence
- Complete user workflows

## Considerations

### Performance
- Real backend tests take longer
- Run sequentially to avoid conflicts
- Database reset between tests
- Server startup time

### Reliability
- Network dependency
- Database state management
- Server lifecycle management
- Test isolation

### Debugging
- Server logs available
- Database inspection tools
- Real error messages
- Network request tracing

## Migration Guide

### Converting Existing Tests

1. **Identify Mock Usage**
   ```typescript
   // Look for these patterns
   vi.mock('../../api')
   vi.fn().mockResolvedValue()
   mockResponses.get()
   ```

2. **Replace with Real Calls**
   ```typescript
   // Replace mocked API calls
   const result = await realApiHelpers.createLongRangePlan(authContext, data);
   ```

3. **Add Cleanup**
   ```typescript
   // Ensure proper cleanup
   const { cleanup } = await renderWithRealBackend(component);
   // ... test code
   await cleanup();
   ```

4. **Update Assertions**
   ```typescript
   // Use real data assertions
   realApiAssertions.assertValidLongRangePlan(result);
   ```

### When to Keep MSW

MSW should still be used for:
- External API calls (outside our control)
- Network error simulation
- Specific edge cases that are hard to reproduce
- Performance testing scenarios

## Best Practices

### 1. Test Data Management
- Use factory functions for consistent data
- Reset database between tests
- Clean up created resources
- Use unique identifiers

### 2. Authentication
- Create test users for each test suite
- Use real authentication tokens
- Test authorization scenarios
- Clean up users after tests

### 3. Error Testing
- Test real validation errors
- Test authorization failures
- Test database constraint violations
- Test network timeout scenarios

### 4. Performance
- Measure and assert on response times
- Test with realistic data volumes
- Monitor resource usage
- Optimize test data setup

## Troubleshooting

### Common Issues

1. **Test Server Won't Start**
   - Check port availability
   - Verify environment variables
   - Check database permissions

2. **Tests Timeout**
   - Increase test timeout
   - Check server health
   - Verify database connectivity

3. **Database Conflicts**
   - Ensure proper reset between tests
   - Use unique test data
   - Check for orphaned connections

4. **Authentication Failures**
   - Verify test user creation
   - Check token expiration
   - Validate server configuration

### Debug Commands

```bash
# Check server status
curl http://localhost:3001/health

# View test database
sqlite3 test-real-backend.db ".tables"

# Run single test with debug
pnpm test:real-backend --reporter=verbose src/path/to/test.real.test.tsx
```

## Future Improvements

1. **Parallel Test Execution**
   - Database isolation per test
   - Test-specific database instances
   - Better resource management

2. **Enhanced Debugging**
   - Request/response logging
   - Performance metrics
   - Test data visualization

3. **CI/CD Integration**
   - Docker-based test environment
   - Parallel test runners
   - Test result reporting

4. **Additional Patterns**
   - Real-time testing (WebSockets)
   - File upload testing
   - Email notification testing

This approach provides comprehensive testing coverage while maintaining development velocity and confidence in our application's reliability.