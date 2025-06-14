import { Page, expect, APIRequestContext } from '@playwright/test'; // PlaywrightTestArgs not used

// Global API context for making direct API requests
let apiContext: APIRequestContext;

// Initialize API context
type PlaywrightType = typeof import('@playwright/test');
export async function initApiContext(playwright: PlaywrightType) {
  const baseURL = process.env.API_BASE || 'http://localhost:3001';
  console.log(`Initializing API context with base URL: ${baseURL}`);

  apiContext = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  return apiContext;
}

// Get API context
export function getApiContext() {
  if (!apiContext) {
    throw new Error('API context not initialized. Call initApiContext first.');
  }

  // If we have a token stored globally, include it in the request
  const token = (globalThis as typeof globalThis & { __API_TOKEN__?: string }).__API_TOKEN__;
  if (token) {
    type HttpOptions = {
      headers?: Record<string, string>;
      data?: unknown;
      params?: Record<string, string>;
    };

    return {
      ...apiContext,
      post: async (url: string, options?: HttpOptions) => {
        const headers = {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        return apiContext.post(url, { ...options, headers });
      },
      get: async (url: string, options?: Omit<HttpOptions, 'data'>) => {
        const headers = {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        return apiContext.get(url, { ...options, headers });
      },
      delete: async (url: string, options?: Omit<HttpOptions, 'data'>) => {
        const headers = {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        return apiContext.delete(url, { ...options, headers });
      },
      put: async (url: string, options?: HttpOptions) => {
        const headers = {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        return apiContext.put(url, { ...options, headers });
      },
      patch: async (url: string, options?: HttpOptions) => {
        const headers = {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        return apiContext.patch(url, { ...options, headers });
      },
    };
  }

  return apiContext;
}

export async function login(page: Page) {
  try {
    console.log('Attempting to log in...');

    // First try to login via API
    try {
      console.log('Making API login request...');
      const api = getApiContext();
      const loginResponse = await api.post('/api/login', {
        data: {
          email: 'teacher@example.com',
          password: 'password123',
        },
      });

      console.log('Login response status:', loginResponse.status());
      const loginData = await loginResponse.json().catch(() => ({}));
      console.log('Login response data:', JSON.stringify(loginData, null, 2));

      if (loginResponse.status() !== 200) {
        throw new Error(`Login failed with status ${loginResponse.status()}`);
      }

      // Set the auth token in localStorage
      const token = loginData.token || loginData.accessToken;
      if (token) {
        console.log('Setting auth token in localStorage');
        // Set the token in the browser context
        await page.addInitScript((t) => {
          window.localStorage.setItem('token', t);
        }, token);

        // Also set it in the current page context
        await page.evaluate((t) => {
          window.localStorage.setItem('token', t);
        }, token);

        // Store the token in the global API context for future requests
        globalThis.__API_TOKEN__ = token;
      }
    } catch (apiError) {
      console.error('API login failed, falling back to UI login:', apiError);

      // Fall back to UI login if API login fails
      console.log('Navigating to login page...');
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

      console.log('Waiting for login form...');
      await page.waitForSelector('#email-address', {
        state: 'visible',
        timeout: 10000,
      });

      console.log('Filling login form...');
      await page.fill('#email-address', 'teacher@example.com');
      await page.fill('#password', 'password123');

      console.log('Submitting login form...');
      await page.screenshot({ path: 'test-results/before-login.png', fullPage: true });

      // Click the login button
      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes('/api/login') && response.request().method() === 'POST',
        ),
        page.click('button[type="submit"]'),
      ]);
    }

    // Verify login by checking for authenticated user
    console.log('Verifying login...');

    // First, verify the token is set in localStorage
    const tokenInLocalStorage = await page.evaluate(() => {
      return localStorage.getItem('token');
    });
    console.log('Token in localStorage:', tokenInLocalStorage ? 'Present' : 'Missing');

    // Navigate to a protected route
    console.log('Navigating to subjects page...');
    await page.goto('http://localhost:5173/subjects', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    try {
      // Wait for the subjects page to load
      await page.waitForSelector('h1', {
        state: 'visible',
        timeout: 10000,
      });

      const pageTitle = await page.title();
      console.log('Page title after login:', pageTitle);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

      // Check if we're still on the login page (indicating auth failure)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.error('Still on login page after login attempt');
        throw new Error('Login failed: Redirected back to login page');
      }

      // Check for error messages
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
            id: el.id,
            class: el.className,
          })),
      );

      if (errorMessages.length > 0) {
        console.error('Error messages on page:', JSON.stringify(errorMessages, null, 2));
      }

      // Take a screenshot after successful login
      await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

      console.log('Login verification successful!');
    } catch (error) {
      console.error('Failed to verify login. Current URL:', page.url());
      console.error('Page title:', await page.title());

      // Take a screenshot of the failed state
      await page.screenshot({ path: 'test-results/login-verification-failed.png', fullPage: true });

      // Dump the page content for debugging
      const pageContent = await page.content();
      console.log('Page content (first 2000 chars):', pageContent.substring(0, 2000));

      throw error;
    }
  } catch (error) {
    console.error('Login failed. Current page state:');
    console.error('URL:', await page.url());
    console.error('Title:', await page.title());

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/login-failure.png', fullPage: true });
    console.log('Screenshot saved to test-results/login-failure.png');

    throw error;
  }
}

export async function logout(page: Page) {
  try {
    console.log('Starting logout process...');

    // Click the user menu
    await page.click('[data-testid="user-menu-button"]');

    // Click the logout button
    await Promise.all([page.waitForURL('**/login', { timeout: 10000 }), page.click('text=Logout')]);

    // Verify we're on the login page
    await expect(page).toHaveURL(/\/login$/);
    console.log('Logout successful!');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}
