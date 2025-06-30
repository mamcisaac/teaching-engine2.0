# E2E Test Infrastructure Fixes Summary

## Overview

This document summarizes all the fixes applied to the E2E test infrastructure to resolve Playwright API compatibility issues, authentication flow problems, and test isolation concerns.

## Issues Fixed

### 1. ✅ Deprecated `page.waitForTimeout` API

**Problem**: Playwright deprecated `page.waitForTimeout` in favor of using native JavaScript timeouts.

**Solution**: Replaced all instances with:

```typescript
await new Promise((resolve) => setTimeout(resolve, milliseconds));
```

**Files Updated**:

- `planner-filters.spec.ts`
- `planning-data-integrity.spec.ts`
- `planning-performance.spec.ts`
- `quick-smoke-tests.spec.ts`
- `subject-management.spec.ts`
- `helpers/ci-stability.ts`

### 2. ✅ Authentication Flow Consolidation

**Problem**: Multiple authentication helpers with inconsistent implementations causing login failures.

**Solution**: Created unified authentication helper at `helpers/unified-auth.ts` that:

- Consolidates authentication logic from `helpers.ts`, `improved-helpers.ts`, and `auth-updated.ts`
- Handles both API and frontend service availability checks
- Supports degraded health status during server startup
- Provides consistent error handling and retry logic
- Maintains backward compatibility with existing tests

**Key Features**:

- Proper service health checking with retry logic
- Support for CI environment variables
- Handles localStorage setup via `addInitScript`
- Provides authenticated API context for direct API calls
- Test user creation and cleanup functionality

### 3. ✅ Test Import Standardization

**Problem**: Tests using different authentication helpers causing inconsistencies.

**Solution**: Updated all test imports to use the unified authentication helper:

```typescript
import { login, API_BASE, ... } from './helpers/unified-auth';
```

**Files Updated**: All `.spec.ts` files in the e2e directory

### 4. ✅ Keyboard API Compatibility

**Problem**: Potential keyboard API issues mentioned in requirements.

**Solution**: Verified keyboard API usage is correct:

- Found only one instance in `planning-workflow-qa.spec.ts`
- Usage `await page.keyboard.press('Tab')` is the current correct API
- No fixes needed

### 5. ✅ Test Database Setup and Teardown

**Problem**: Tests may interfere with each other due to shared database state.

**Solution**: Created comprehensive test infrastructure:

1. **Test Database Setup Script** (`setup-test-db.ts`):
   - Creates fresh test database before tests
   - Removes old database and journal files
   - Applies schema and seeds test data
   - Uses isolated SQLite database for tests

2. **Test Runner Script** (`run-e2e-tests.sh`):
   - Checks port availability before starting
   - Sets up test database
   - Starts development servers (local only)
   - Waits for services to be ready
   - Runs tests with proper environment
   - Provides cleanup on exit

## Environment Configuration

### API Base URL

The unified auth helper properly handles different environments:

```typescript
export const API_BASE =
  process.env.TEST_SERVER_URL || process.env.API_BASE || 'http://127.0.0.1:3000';
```

### CI-Specific Handling

- Additional wait times in CI for stability
- Proper handling of `process.env.CI` flag
- Support for degraded health status during startup

## Usage Instructions

### Running E2E Tests Locally

```bash
# Run all E2E tests with proper setup
./tests/e2e/run-e2e-tests.sh

# Run specific test pattern
./tests/e2e/run-e2e-tests.sh "auth flow"
```

### Running Individual Tests

```bash
# Tests will now use unified authentication
npx playwright test tests/e2e/auth-flow.spec.ts
```

### Manual Test Database Setup

```bash
# If needed, manually set up test database
npx tsx tests/e2e/setup-test-db.ts
```

## Best Practices

1. **Always use unified auth helper**: Import authentication functions from `helpers/unified-auth.ts`
2. **Use proper wait strategies**: Replace `waitForTimeout` with `setTimeout` wrapped in Promise
3. **Handle service startup**: Always wait for both API and frontend to be ready
4. **Clean up test data**: Use provided cleanup functions for test users
5. **Isolate tests**: Each test should create its own test data

## Migration Notes

### For Existing Tests

- Update imports to use `./helpers/unified-auth`
- Replace `page.waitForTimeout` with `new Promise(resolve => setTimeout(resolve, ms))`
- Use `initApiContext` in `beforeAll` hooks when using API context functions

### For New Tests

```typescript
import { test, expect } from '@playwright/test';
import { login, API_BASE, createTestUser } from './helpers/unified-auth';

test('my new test', async ({ page }) => {
  // Login with default test user
  const token = await login(page);

  // Or create a custom test user
  const testUser = await createTestUser(page, 'teacher', {
    name: 'Custom Test User',
  });

  // Make authenticated API calls
  const response = await page.request.get(`${API_BASE}/api/endpoint`, {
    headers: { Authorization: `Bearer ${token}` },
  });
});
```

## Troubleshooting

### Login Failures

- Check API_BASE environment variable
- Verify test database is seeded with default user
- Check server health endpoint responds correctly

### Port Conflicts

- Use the test runner script which handles cleanup
- Or manually kill processes: `lsof -ti:3000 | xargs kill -9`

### Database Issues

- Remove test.db and run setup script again
- Check DATABASE_URL environment variable
- Verify Prisma schema is up to date

## Next Steps

1. Monitor test stability with these fixes
2. Consider adding more retry logic for flaky network operations
3. Implement test data factories for common scenarios
4. Add performance benchmarks for critical user flows
