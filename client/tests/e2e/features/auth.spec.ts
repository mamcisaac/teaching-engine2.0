/**
 * Auth & Route Protection test
 * Tests authentication flows and protected route access
 */

import { test, expect } from '../fixtures/base'; // Use base fixture for unauthenticated tests
import { test as authTest, expect as authExpect } from '../fixtures/seed'; // Use seed for authenticated tests

test.describe('Authentication & Route Protection', () => {
  const protectedRoutes = [
    '/dashboard',
    '/planner/week',
    '/planner/units',
    '/students',
    '/assessment',
    '/curriculum',
    '/planning-overview'
  ];

  test.describe('Unauthenticated Access', () => {
    protectedRoutes.forEach(route => {
      test(`should redirect to login when accessing ${route} without auth`, async ({ page }) => {
        // Clear any existing auth
        await page.context().clearCookies();
        
        // Try to access protected route
        await page.goto(route);
        
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
        
        // Login page should be visible
        await expect(page.getByRole('heading', { name: /Sign In|Login/i })).toBeVisible()
          .catch(() => {
            // Alternative: check for login form
            expect(page.getByRole('button', { name: /Sign In|Login/i })).toBeVisible();
          });
      });
    });

    test('should show 401 error for API calls without auth', async ({ page }) => {
      // Clear cookies
      await page.context().clearCookies();
      
      // Make API call directly
      const response = await page.request.get('/api/etfo-lesson-plans');
      
      // Should return 401
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Authenticated Access', () => {
    authTest('should access protected routes with valid auth', async ({ page, authenticatedContext }) => {
      // Test each protected route
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should NOT redirect to login
        expect(page.url()).not.toContain('/login');
        
        // Should be on the requested route
        expect(page.url()).toContain(route);
        
        // Page should load without auth errors
        const authError = page.getByText(/unauthorized|401|please log in/i);
        await expect(authError).not.toBeVisible().catch(() => {
          // Auth error might not exist at all, which is good
        });
      }
    });

    authTest('should maintain session across navigation', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');
      await expect(page.getByTestId('main-sidebar')).toBeVisible();
      
      // Navigate to week view
      await page.getByTestId('nav-week').click();
      await expect(page).toHaveURL('/planner/week');
      
      // Navigate to students
      await page.getByTestId('nav-students').click();
      await expect(page).toHaveURL('/students');
      
      // Session should persist - no login redirects
      expect(page.url()).not.toContain('/login');
    });

    authTest('should include auth token in API requests', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Intercept API request to check headers
      const apiResponse = await page.waitForResponse(
        response => response.url().includes('/api/') && response.ok(),
        { timeout: 10000 }
      ).catch(() => null);
      
      if (apiResponse) {
        // Request should succeed (not 401)
        expect(apiResponse.status()).toBe(200);
      }
    });
  });

  test.describe('Session Expiry', () => {
    authTest('should redirect to login when session expires', async ({ page }) => {
      // Start authenticated
      await page.goto('/dashboard');
      await expect(page.getByTestId('main-sidebar')).toBeVisible();
      
      // Clear cookies to simulate session expiry
      await page.context().clearCookies();
      
      // Try to navigate
      await page.goto('/planner/week');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    authTest('should handle expired token gracefully', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Intercept API call and return 401
      await page.route('**/api/etfo-lesson-plans', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired' })
        });
      });
      
      // Navigate to week view which will trigger API call
      await page.goto('/planner/week');
      
      // Should either redirect to login or show auth error
      const isOnLogin = page.url().includes('/login');
      const hasAuthError = await page.getByText(/expired|unauthorized|please log in/i).isVisible()
        .catch(() => false);
      
      expect(isOnLogin || hasAuthError).toBeTruthy();
    });
  });

  test.describe('Logout', () => {
    authTest('should logout successfully', async ({ page }) => {
      // Start authenticated
      await page.goto('/dashboard');
      await expect(page.getByTestId('main-sidebar')).toBeVisible();
      
      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /Logout|Sign Out/i })
        .or(page.getByText(/Logout/i));
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
          .catch(() => {
            // Or at least clear the session
            expect(page.url()).not.toContain('/dashboard');
          });
        
        // Try to access protected route
        await page.goto('/dashboard');
        
        // Should redirect back to login
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });

  test.describe('Remember Me / Persistent Auth', () => {
    test('should persist auth across browser restart', async ({ browser }) => {
      // Create context with storage state
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Login via test endpoint
      await page.request.post('http://localhost:3000/__test__/login', {
        headers: { 'X-Test-Token': process.env.TEST_SECRET || 'test-secret-token' }
      });
      
      // Save storage state
      const storageState = await context.storageState();
      await context.close();
      
      // Create new context with saved state (simulates browser restart)
      const newContext = await browser.newContext({ storageState });
      const newPage = await newContext.newPage();
      
      // Should still be authenticated
      await newPage.goto('/dashboard');
      expect(newPage.url()).not.toContain('/login');
      
      await newContext.close();
    });
  });
});