import { test, expect, type Page, type Response } from '@playwright/test';

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
        const response = await fetch('http://localhost:3001/auth/me', {
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

// Login helper function
async function login(page: Page): Promise<boolean> {
  console.log('\n=== Starting login process ===');

  try {
    // Take a screenshot before login attempt
    await page.screenshot({ path: 'before-login.png' });
    console.log('📸 Screenshot saved: before-login.png');

    // Navigate to login page with retry logic
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} of ${maxRetries}: Navigating to login page...`);
        await page.goto('http://localhost:5173/login', {
          waitUntil: 'networkidle',
          timeout: 30000, // 30 second timeout for initial page load
        });
        break; // If successful, exit the retry loop
      } catch (error) {
        retryCount++;
        console.error(`Navigation attempt ${retryCount} failed:`, error);
        if (retryCount >= maxRetries) {
          console.error('Max navigation retries reached');
          throw error;
        }
        console.log('Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Check if already logged in
    const authState = await checkAuthState(page, 'before-login');
    if (authState.isAuthenticated) {
      console.log('✅ Already logged in');
      return true;
    }

    // Fill login form
    console.log('Filling login form...');
    await page.fill('input[name="email"]', 'teacher@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Click the login button
    console.log('Submitting form...');
    const [response] = await Promise.all([
      // Wait for either a successful response or an error
      page.waitForResponse(
        (resp: Response) =>
          (resp.url().includes('/api/login') && resp.status() === 200) ||
          (resp.status() >= 400 && resp.status() < 500),
      ),
      // Click the login button
      page.click('button[type="submit"]'),
    ]);

    // Log the response status
    console.log(`Login response: ${response.status()} ${response.statusText()}`);

    // If login failed, log the response body
    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('Login failed with response:', errorBody);
      throw new Error(`Login failed with status ${response.status()}: ${errorBody}`);
    }

    console.log('✅ Login API call successful');

    // Wait for navigation to complete with a timeout
    console.log('Waiting for navigation to complete...');
    try {
      await Promise.race([
        page.waitForURL('**/dashboard', { timeout: 10000 }),
        page.waitForURL('**/subjects', { timeout: 10000 }),
        page.waitForURL('**/', { timeout: 10000 }),
        page.waitForSelector('button:has-text("Logout"), text=Dashboard, text=Subjects', {
          timeout: 10000,
          state: 'visible',
        }),
      ]);

      console.log(`✅ Navigation complete. Current URL: ${page.url()}`);
    } catch (navError) {
      console.warn('Navigation timeout or error, checking login state anyway:', navError);
    }

    // Take a screenshot after login attempt
    await page.screenshot({ path: 'after-login-attempt.png' });
    console.log('📸 Screenshot saved: after-login-attempt.png');

    // Check for any error messages on the page
    const errorMessages = await page.$$eval('*', (elements) =>
      elements
        .filter((el) => {
          const text = el.textContent?.trim() || '';
          return (
            text.length > 0 &&
            text.length < 200 &&
            (text.toLowerCase().includes('error') ||
              text.toLowerCase().includes('fail') ||
              text.toLowerCase().includes('invalid'))
          );
        })
        .map((el) => ({
          text: el.textContent?.trim(),
          tag: el.tagName,
          id: el.id || 'no-id',
          class: el.className || 'no-class',
        })),
    );

    if (errorMessages.length > 0) {
      console.error('Error messages found on page:', JSON.stringify(errorMessages, null, 2));
    }

    // Verify we're logged in by checking for UI elements
    const hasLogoutButton = await page
      .locator('button:has-text("Logout")')
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    const hasDashboardContent = await page
      .locator('text=Dashboard, text=Subjects')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    console.log(
      `Login verification - Has Logout Button: ${hasLogoutButton}, Has Dashboard Content: ${hasDashboardContent}`,
    );

    return hasLogoutButton || hasDashboardContent;
  } catch (error) {
    console.error('❌ Error during login:', error);

    // Take a screenshot of the error state
    try {
      await page.screenshot({ path: 'login-error.png' });
      console.log('📸 Screenshot saved: login-error.png');

      // Log the page content for debugging
      const pageContent = await page.content();
      console.log('Page content at time of error:', pageContent.substring(0, 1000) + '...');
    } catch (screenshotError) {
      console.error('Failed to capture screenshot:', screenshotError);
    }

    throw error;
  }
}

test('debug login network', async ({ page }) => {
  // Enable request/response logging
  page.on('request', (request) => console.log('>>', request.method(), request.url()));

  page.on('response', (response) => console.log('<<', response.status(), response.url()));

  // Use the login helper function
  console.log('Starting login test...');
  const isLoggedIn = await login(page);

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
