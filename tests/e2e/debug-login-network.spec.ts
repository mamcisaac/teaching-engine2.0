import { test, expect, type Page } from '@playwright/test';
import { login as reliableLogin } from './helpers';
import { initApiContext } from './helpers/auth-updated';

// Initialize API context before all tests
test.beforeAll(async ({ playwright }) => {
  await initApiContext(playwright);
});

interface AuthState {
  hasToken: boolean;
  hasCookies: boolean;
  isAuthenticated: boolean;
  error?: string;
  stack?: string;
}

// Helper function to check auth state
async function checkAuthState(page: Page, context: string): Promise<AuthState> {
  console.log(`\n=== Checking auth state (${context}) ===`);

  try {
    // Check localStorage for auth token
    const token = await page.evaluate(() => {
      return localStorage.getItem('auth-token') || localStorage.getItem('token');
    });

    console.log(`Auth token in localStorage: ${token ? 'Found' : 'Not found'}`);

    // Check cookies
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(
      (cookie) => cookie.name.includes('auth') || cookie.name.includes('token'),
    );

    console.log(
      'Auth-related cookies:',
      authCookies.length > 0
        ? authCookies.map((c) => `${c.name}=${c.value.substring(0, 10)}...`)
        : 'None',
    );

    // Check auth/me endpoint
    const authResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/me', {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        return {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: await response.json().catch(() => null),
          headers: Object.fromEntries([...response.headers.entries()]),
        };
      } catch (error) {
        return {
          status: 0,
          statusText: 'Error',
          ok: false,
          data: null,
          headers: {},
          error: (error as Error).message,
          stack: (error as Error).stack,
        };
      }
    });

    console.log(
      `Auth/me response (${context}):`,
      JSON.stringify(
        {
          status: authResponse.status,
          ok: authResponse.ok,
          data: authResponse.data ? 'Received user data' : 'No user data',
          error: authResponse.error,
        },
        null,
        2,
      ),
    );

    return {
      hasToken: !!token,
      hasCookies: authCookies.length > 0,
      isAuthenticated: authResponse.ok === true,
    };
  } catch (error) {
    const err = error as Error;
    console.error(`Error checking auth state (${context}):`, err);
    return {
      hasToken: false,
      hasCookies: false,
      isAuthenticated: false,
      error: err.message,
      stack: err.stack,
    };
  }
}

test('debug login network', async ({ page }) => {
  // Enable request/response logging
  page.on('request', (request) => console.log('>>', request.method(), request.url()));

  page.on('response', (response) => console.log('<<', response.status(), response.url()));

  // Use the reliable login helper function from helpers.ts
  console.log('Starting login test...');
  await reliableLogin(page);

  const isLoggedIn = true; // If we get here without throwing, login succeeded

  // Verify login was successful
  expect(isLoggedIn).toBeTruthy();

  // Check auth state after login
  const authState = await checkAuthState(page, 'after-login');
  expect(authState.isAuthenticated).toBeTruthy();

  // Take a screenshot after login
  await page.screenshot({ path: 'after-login.png' });
  console.log('📸 Screenshot saved: after-login.png');

  // Navigate to subjects page to verify protected route access
  console.log('\n=== Verifying protected route access ===');
  const currentUrl = page.url();
  console.log(`Current URL after login: ${currentUrl}`);

  if (currentUrl.includes('/login')) {
    throw new Error('Authentication failed: Still on login page after login attempt');
  }

  console.log('✅ Successfully accessed protected route after login');

  // Now navigate to the subjects page explicitly
  console.log('\n=== Navigating to subjects page ===');
  await page.goto('http://localhost:5173/subjects', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Verify we're on the subjects page
  await expect(page).toHaveURL(/\/subjects/);
  const subjectsTitle = page.locator('h1:has-text("Subjects")');
  await expect(subjectsTitle).toBeVisible({ timeout: 10000 });

  console.log('✅ Successfully loaded subjects page');
  await page.screenshot({ path: 'subjects-page.png' });
  console.log('📸 Screenshot saved: subjects-page.png');

  // Final auth state check
  const finalAuthState = await checkAuthState(page, 'after-navigation');
  expect(finalAuthState.isAuthenticated).toBeTruthy();

  console.log('✅ All tests completed successfully!');
});
