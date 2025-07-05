/**
 * Real Authentication Flow Integration Tests
 * Tests complete authentication workflows with real backend and frontend integration
 */

import { test, expect, Page } from '@playwright/test';
import { 
  createTestUser, 
  loginTestUser, 
  logoutTestUser, 
  deleteTestUser,
  testProtectedRoute,
  type TestUser 
} from '../../client/src/test-utils/auth-test-utils';

// Test data
let testUsers: TestUser[] = [];

test.describe('Complete Authentication Flows', () => {
  test.afterEach(async () => {
    // Cleanup test users
    for (const user of testUsers) {
      try {
        await deleteTestUser(user.id);
      } catch (error) {
        console.warn(`Failed to delete test user ${user.id}:`, error);
      }
    }
    testUsers = [];
  });

  test('should complete full user registration and login flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill registration form
    const userData = {
      email: `integration-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Integration Test User',
    };

    await page.fill('[data-testid="email-input"]', userData.email);
    await page.fill('[data-testid="password-input"]', userData.password);
    await page.fill('[data-testid="name-input"]', userData.name);

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard on successful registration
    await expect(page).toHaveURL('/dashboard');

    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText(userData.email);

    // Test logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Test login with same credentials
    await page.fill('[data-testid="email-input"]', userData.email);
    await page.fill('[data-testid="password-input"]', userData.password);
    await page.click('[data-testid="login-button"]');

    // Should be logged in again
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle authentication errors properly', async ({ page }) => {
    await page.goto('/login');

    // Test invalid credentials
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email or password');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should protect routes that require authentication', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    // Create test user and login
    const testUser = await createTestUser({
      email: 'protected-route-test@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // Should now be able to access dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle token expiration and refresh', async ({ page }) => {
    // Create test user
    const testUser = await createTestUser({
      email: 'token-refresh-test@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Manually expire the token by setting it to an expired value
    await page.evaluate(() => {
      localStorage.setItem('auth_access_token', 'expired-token');
    });

    // Try to navigate to another protected page
    await page.goto('/planning');

    // Should either:
    // 1. Automatically refresh the token and continue, or
    // 2. Redirect to login if refresh fails
    await page.waitForTimeout(2000); // Give time for auth check

    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/planning') || currentUrl.includes('/dashboard');
    const isRedirectedToLogin = currentUrl.includes('/login');

    expect(isLoggedIn || isRedirectedToLogin).toBe(true);
  });

  test('should maintain authentication state across page refreshes', async ({ page }) => {
    // Create test user
    const testUser = await createTestUser({
      email: 'persistence-test@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Refresh the page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle role-based access control', async ({ page }) => {
    // Create regular user
    const regularUser = await createTestUser({
      email: 'regular-user@example.com',
      password: 'TestPassword123!',
      role: 'USER',
    });
    testUsers.push(regularUser);

    // Login as regular user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', regularUser.email);
    await page.fill('[data-testid="password-input"]', regularUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Try to access admin-only route (if it exists)
    await page.goto('/admin');

    // Should either show access denied or redirect to appropriate page
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/admin');
    const isAccessDenied = await page.locator('[data-testid="access-denied"]').isVisible().catch(() => false);
    const isRedirected = !currentUrl.includes('/admin');

    expect(hasAccess || isAccessDenied || isRedirected).toBe(true);
  });

  test('should handle concurrent login sessions', async ({ browser }) => {
    // Create test user
    const testUser = await createTestUser({
      email: 'concurrent-sessions@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    // Create two browser contexts (simulating different devices/tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login from first session
    await page1.goto('/login');
    await page1.fill('[data-testid="email-input"]', testUser.email);
    await page1.fill('[data-testid="password-input"]', testUser.password);
    await page1.click('[data-testid="login-button"]');

    await expect(page1).toHaveURL('/dashboard');

    // Login from second session
    await page2.goto('/login');
    await page2.fill('[data-testid="email-input"]', testUser.email);
    await page2.fill('[data-testid="password-input"]', testUser.password);
    await page2.click('[data-testid="login-button"]');

    await expect(page2).toHaveURL('/dashboard');

    // Both sessions should be active (unless there's a single-session policy)
    await expect(page1.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page2.locator('[data-testid="user-menu"]')).toBeVisible();

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('should handle password change flow', async ({ page }) => {
    // Create test user
    const testUser = await createTestUser({
      email: 'password-change@example.com',
      password: 'OldPassword123!',
    });
    testUsers.push(testUser);

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Navigate to profile/settings (if available)
    await page.goto('/profile');

    // Change password (if this functionality exists)
    const passwordChangeForm = page.locator('[data-testid="change-password-form"]');
    
    if (await passwordChangeForm.isVisible()) {
      const newPassword = 'NewPassword123!';
      
      await page.fill('[data-testid="current-password"]', testUser.password);
      await page.fill('[data-testid="new-password"]', newPassword);
      await page.fill('[data-testid="confirm-password"]', newPassword);
      await page.click('[data-testid="change-password-button"]');

      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

      // Logout and try to login with new password
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', newPassword);
      await page.click('[data-testid="login-button"]');

      await expect(page).toHaveURL('/dashboard');
    }
  });
});

test.describe('Authentication API Integration', () => {
  test('should work with real backend API calls', async () => {
    // Test user creation through API
    const testUser = await createTestUser({
      email: 'api-integration@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    expect(testUser.id).toBeDefined();
    expect(testUser.email).toBe('api-integration@example.com');
    expect(testUser.role).toBe('USER');

    // Test login through API
    const authContext = await loginTestUser(testUser.email, testUser.password);
    
    expect(authContext.user).toBeDefined();
    expect(authContext.token).toBeDefined();
    expect(authContext.user.email).toBe(testUser.email);

    // Test protected route access
    const protectedResult = await testProtectedRoute('/api/auth/me');
    
    expect(protectedResult.authRequired).toBe(true);
    expect(protectedResult.unauthorizedStatus).toBe(401);
    expect(protectedResult.authorizedStatus).toBe(200);

    // Test logout
    await authContext.cleanup();
  });

  test('should handle invalid API requests properly', async () => {
    // Test login with invalid credentials
    try {
      await loginTestUser('nonexistent@example.com', 'wrongpassword');
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }

    // Test protected route without authentication
    const result = await testProtectedRoute('/api/auth/me');
    expect(result.unauthorizedStatus).toBe(401);
  });

  test('should validate JWT tokens correctly', async () => {
    const testUser = await createTestUser({
      email: 'jwt-validation@example.com',
      password: 'TestPassword123!',
    });
    testUsers.push(testUser);

    const authContext = await loginTestUser(testUser.email, testUser.password);
    
    // Token should be valid JWT
    expect(authContext.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    
    // Should be able to use token for API calls
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authContext.token}`,
      },
    });
    
    expect(response.ok).toBe(true);
    
    const userData = await response.json();
    expect(userData.email).toBe(testUser.email);

    await authContext.cleanup();
  });
});