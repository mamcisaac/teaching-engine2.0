import { test, expect } from '@playwright/test';
import {
  initApiContext,
  createTestUser,
  loginAsTestUser,
  useDefaultTestUser,
  verifyAuthenticated,
  logout,
  cleanupTestUsers,
} from './helpers/auth-updated';

// Initialize API context before all tests
test.beforeAll(async ({ playwright }) => {
  await initApiContext(playwright);
});

// Clean up after all tests
test.afterAll(async () => {
  await cleanupTestUsers();
});

test.describe('Authentication Flow', () => {
  test('should use default test user from global setup', async ({ page }) => {
    // Storage state is automatically applied by Playwright

    // Navigate to protected route
    await page.goto('/subjects');

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);

    // Should see subjects page
    await expect(page.getByRole('heading', { name: 'Subjects' })).toBeVisible();
  });

  test('should create and login with a new test user', async ({ page }) => {
    // Create a new test user
    const testUser = await createTestUser('teacher', {
      name: 'Test Teacher for Auth Flow',
    });

    // Login as the new user
    await loginAsTestUser(page, testUser);

    // Navigate to dashboard
    await page.goto('/');

    // Verify authentication
    await verifyAuthenticated(page);

    // Should see dashboard content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    // Use default test user
    await useDefaultTestUser(page);

    // Navigate to app
    await page.goto('/');

    // Logout
    await logout(page);

    // Try to access protected route
    await page.goto('/subjects');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Use default test user
    await useDefaultTestUser(page);

    // Navigate to protected route
    await page.goto('/subjects');

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText(/subjects/i);
  });

  test('should handle API requests with authentication', async ({ page, request }) => {
    // Use default test user
    await useDefaultTestUser(page);

    // Get token from localStorage
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));

    expect(token).toBeTruthy();

    // Make authenticated API request
    const serverUrl = global.__TEST_SERVER_URL__ || 'http://localhost:3000';
    const response = await request.get(`${serverUrl}/api/subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    const subjects = await response.json();
    expect(Array.isArray(subjects)).toBeTruthy();
  });

  test('should create test data and verify it appears in UI', async ({ page }) => {
    // Use default test user
    await useDefaultTestUser(page);

    // Get token for API requests
    await page.goto('/');
    const token = await page.evaluate(() => localStorage.getItem('token'));

    // Create a subject via API
    const serverUrl = global.__TEST_SERVER_URL__ || 'http://localhost:3000';
    const createResponse = await page.request.post(`${serverUrl}/api/subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'E2E Test Subject',
        color: '#FF0000',
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const subject = await createResponse.json();

    // Navigate to subjects page
    await page.goto('/subjects');

    // Should see the created subject
    await expect(page.locator('text=E2E Test Subject')).toBeVisible();

    // Clean up - delete the subject
    const deleteResponse = await page.request.delete(`${serverUrl}/api/subjects/${subject.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(deleteResponse.ok()).toBeTruthy();
  });
});

test.describe('Multiple User Roles', () => {
  test('should handle multiple test users in same test', async ({ browser }) => {
    // Create two test users
    const teacher = await createTestUser('teacher');
    const admin = await createTestUser('admin');

    // Open two browser contexts
    const teacherContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const teacherPage = await teacherContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // Login as teacher in first context
      await loginAsTestUser(teacherPage, teacher);
      await teacherPage.goto('/');
      await verifyAuthenticated(teacherPage);

      // Login as admin in second context
      await loginAsTestUser(adminPage, admin);
      await adminPage.goto('/');
      await verifyAuthenticated(adminPage);

      // Both should be authenticated independently
      await expect(teacherPage).not.toHaveURL(/\/login/);
      await expect(adminPage).not.toHaveURL(/\/login/);
    } finally {
      await teacherContext.close();
      await adminContext.close();
    }
  });
});
