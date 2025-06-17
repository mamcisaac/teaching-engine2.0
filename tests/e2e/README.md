# E2E Test Infrastructure

This directory contains end-to-end tests with integrated server management and dynamic test user creation.

## Architecture

### 1. Test Server Management
- **Automatic server startup**: Test server starts with dynamic port allocation
- **Health checks**: Waits for server to be ready before running tests
- **Graceful shutdown**: Proper cleanup after all tests complete
- **Test-only endpoints**: Special `/api/test/*` endpoints for test data management

### 2. Test User Management
- **Dynamic user creation**: Each test can create isolated test users
- **Automatic cleanup**: Test users are cleaned up after tests
- **Multiple roles**: Support for different user roles (teacher, admin)
- **Parallel test support**: Each test gets unique users to avoid conflicts

### 3. Authentication Helpers
- **Token management**: Automatic JWT token handling
- **LocalStorage setup**: Sets up authentication state for tests
- **API request helpers**: Authenticated API requests made easy

## Setup

### Prerequisites
1. Install dependencies: `pnpm install`
2. Build the client: `pnpm build:client`
3. Generate Prisma client: `pnpm db:generate`

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e auth-flow.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Run with specific browser
pnpm test:e2e --project=chromium

# Debug mode
pnpm test:e2e --debug
```

## Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { initApiContext, useDefaultTestUser } from './helpers/auth-updated';

test.beforeAll(async ({ playwright }) => {
  await initApiContext(playwright);
});

test('should perform authenticated action', async ({ page }) => {
  // Use the default test user from global setup
  await useDefaultTestUser(page);
  
  // Navigate to protected route
  await page.goto('/subjects');
  
  // Should be authenticated
  await expect(page).not.toHaveURL(/\/login/);
});
```

### Creating Test Users

```typescript
import { createTestUser, loginAsTestUser, cleanupTestUsers } from './helpers/auth-updated';

test.afterAll(async () => {
  await cleanupTestUsers();
});

test('should work with custom test user', async ({ page }) => {
  // Create a new test user
  const user = await createTestUser('teacher', {
    name: 'Custom Test Teacher',
  });
  
  // Login as the test user
  await loginAsTestUser(page, user);
  
  // Perform authenticated actions
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Making API Requests

```typescript
test('should create data via API', async ({ page }) => {
  await useDefaultTestUser(page);
  
  // Get auth token
  await page.goto('/');
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  // Make authenticated API request
  const response = await page.request.post(`${global.__TEST_SERVER_URL__}/api/subjects`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      name: 'Test Subject',
      color: '#FF0000',
    },
  });
  
  expect(response.ok()).toBeTruthy();
});
```

### Parallel Tests with Multiple Users

```typescript
test('should support multiple user sessions', async ({ browser }) => {
  const teacher = await createTestUser('teacher');
  const admin = await createTestUser('admin');
  
  const teacherContext = await browser.newContext();
  const adminContext = await browser.newContext();
  
  const teacherPage = await teacherContext.newPage();
  const adminPage = await adminContext.newPage();
  
  await loginAsTestUser(teacherPage, teacher);
  await loginAsTestUser(adminPage, admin);
  
  // Both users can work independently
  await teacherPage.goto('/dashboard');
  await adminPage.goto('/admin');
});
```

## Test Data Management

### Test-Only Endpoints

The server exposes special endpoints in test mode:

- `POST /api/test/users` - Create a test user
- `DELETE /api/test/users/:email` - Delete a test user
- `POST /api/test/cleanup` - Clean up all E2E test data
- `POST /api/test/seed` - Seed test data
- `POST /api/test/reset` - Reset database (requires confirmation)

### Automatic Cleanup

Test data is automatically cleaned up:
1. **After each test**: Via `cleanupTestUsers()` in test hooks
2. **After all tests**: Via global teardown
3. **On test failure**: Test users are tracked and cleaned up

### Test User Naming Convention

Test users follow the pattern: `e2e-{role}-{timestamp}-{random}@example.com`

This ensures:
- Easy identification of test users
- No conflicts between parallel tests
- Easy bulk cleanup of test data

## Best Practices

1. **Always use test helpers**: Don't manually create users or manage auth
2. **Clean up test data**: Use `cleanupTestUsers()` in `afterAll` hooks
3. **Use unique data**: Add timestamps or random values to avoid conflicts
4. **Check server health**: The infrastructure handles this automatically
5. **Use page objects**: Keep selectors organized and maintainable

## Troubleshooting

### Server not starting
- Check if port is already in use
- Verify DATABASE_URL is set correctly
- Check server logs in test output

### Authentication failures
- Ensure JWT_SECRET matches between server and tests
- Check if test user was created successfully
- Verify token is being set in localStorage

### Test data conflicts
- Use unique names/emails for test data
- Run cleanup between test runs
- Check for leftover data from failed tests

### Flaky tests
- Use proper wait conditions (`waitForSelector`, `waitForLoadState`)
- Avoid hardcoded timeouts
- Use retry logic for network requests
- Check race conditions in UI interactions

## Environment Variables

- `TEST_SERVER_URL` - Set by global setup, contains test server URL
- `CLIENT_URL` - Client app URL (default: http://localhost:5173)
- `NODE_ENV=test` - Enables test mode features
- `JWT_SECRET` - Secret for JWT tokens
- `DEBUG_TESTS=true` - Enable debug logging