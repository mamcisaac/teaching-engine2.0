import { Page, expect, APIRequestContext } from '@playwright/test';

// API base URL configuration
export const API_BASE =
  process.env.TEST_SERVER_URL || process.env.API_BASE || 'http://127.0.0.1:3000';
export const FRONTEND_BASE = 'http://localhost:5173';

// Default test credentials
export const DEFAULT_TEST_USER = {
  email: 'teacher@example.com',
  password: 'Password123!',
  name: 'Test Teacher',
  role: 'teacher',
};

/**
 * Wait for both API and frontend services to be available
 */
async function waitForServices(page: Page, maxRetries = 60): Promise<void> {
  console.log(`Waiting for services. API_BASE: ${API_BASE}, FRONTEND_BASE: ${FRONTEND_BASE}`);

  let apiReady = false;
  let frontendReady = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check API health endpoint
      if (!apiReady) {
        const apiResponse = await page.request.get(`${API_BASE}/api/health`, { timeout: 5000 });
        if (apiResponse.ok()) {
          const healthData = await apiResponse.json().catch(() => ({}));
          // Check for degraded status during startup
          if (healthData.status === 'healthy' || healthData.status === 'degraded') {
            apiReady = true;
            console.log(`✅ API service is ready (status: ${healthData.status})`);
          }
        }
      }

      // Check frontend - just needs to respond
      if (!frontendReady) {
        try {
          await page.request.get(FRONTEND_BASE, { timeout: 5000 });
          frontendReady = true;
          console.log('✅ Frontend service is ready');
        } catch (frontendError) {
          // Frontend not ready yet
        }
      }

      if (apiReady && frontendReady) {
        console.log('✅ Both services are ready');
        return;
      }

      if (i % 10 === 0) {
        console.log(
          `Services status: API ${apiReady ? 'OK' : 'Failed'}, Frontend ${frontendReady ? 'OK' : 'Failed'}`,
        );
      }
    } catch (error) {
      if (i % 10 === 0) {
        console.log(
          `Service check attempt ${i + 1} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Services did not become available within timeout. API: ${apiReady}, Frontend: ${frontendReady}`,
  );
}

/**
 * Unified login function that handles authentication for all E2E tests
 */
export async function login(page: Page, credentials = DEFAULT_TEST_USER): Promise<string> {
  console.log('Starting authentication process...');

  // Wait for services
  await waitForServices(page);

  // Perform login via API
  const response = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  if (!response.ok()) {
    const errorBody = await response.text().catch(() => 'Unable to read response body');
    throw new Error(`Login failed with status ${response.status()}: ${errorBody}`);
  }

  const { token, user } = (await response.json()) as { token: string; user: any };

  // Set auth data before navigation
  await page.addInitScript(
    ({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('auth-token', t);
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('onboarded', 'true');
    },
    { t: token, u: user },
  );

  // Navigate to the app
  await page.goto('/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Wait for initial load
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    // If networkidle times out, just wait for load state
    await page.waitForLoadState('load', { timeout: 5000 });
  }

  // Additional wait for CI stability
  if (process.env.CI) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Verify authentication state
  const storedToken = await page.evaluate(() => localStorage.getItem('token'));
  if (!storedToken) {
    throw new Error('Token not found in localStorage after login');
  }

  console.log('Authentication completed successfully');
  return token;
}

/**
 * Login with custom test user
 */
export async function loginAsTestUser(
  page: Page,
  user: { email: string; password: string; name?: string; role?: string },
): Promise<string> {
  return login(page, user);
}

/**
 * Use default test user (for tests that depend on storage state)
 */
export async function useDefaultTestUser(page: Page): Promise<void> {
  // The storage state is already applied by Playwright config
  console.log('Using default E2E test user from storage state');

  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.startsWith(FRONTEND_BASE)) {
    await page.goto('/');
  }

  // Verify the token exists
  const token = await page.evaluate(() => localStorage.getItem('token'));
  if (!token) {
    console.warn('No token found in localStorage. Storage state might not be loaded properly.');
    // Fallback to login
    await login(page);
  }
}

/**
 * Verify user is authenticated
 */
export async function verifyAuthenticated(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Check that we're not on the login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error('User is on login page, not authenticated');
  }
}

/**
 * Logout function
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarded');
  });

  console.log('Logged out');
}

/**
 * Create a test user via API
 */
export async function createTestUser(
  page: Page,
  role: 'teacher' | 'admin' = 'teacher',
  customData?: { name?: string; email?: string; password?: string },
): Promise<{ email: string; password: string; name: string; role: string; token?: string }> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  const user = {
    email: customData?.email || `e2e-${role}-${timestamp}-${random}@example.com`,
    password: customData?.password || `E2ePass@${timestamp}`,
    name: customData?.name || `E2E ${role} ${timestamp}`,
    role,
  };

  try {
    const response = await page.request.post(`${API_BASE}/api/register`, {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
      },
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Failed to create test user: ${error}`);
    }

    const responseData = await response.json();
    const userWithToken = { ...user, token: responseData.token };

    // Track for cleanup
    createdTestUsers.push(userWithToken);

    return userWithToken;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Retry helper for flaky operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    retryCondition?: (error: Error) => boolean;
  } = {},
): Promise<T> {
  const { maxRetries = 3, delay = 1000, retryCondition = () => true } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }

      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Create authenticated API context for direct API calls
 */
export function createAuthenticatedRequest(page: Page, token: string) {
  return {
    get: (url: string, options?: any) =>
      page.request.get(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
    post: (url: string, options?: any) =>
      page.request.post(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
    put: (url: string, options?: any) =>
      page.request.put(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
    delete: (url: string, options?: any) =>
      page.request.delete(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
    patch: (url: string, options?: any) =>
      page.request.patch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
      }),
  };
}

// Global API context for making direct API requests
let apiContext: APIRequestContext;

// Initialize API context
type PlaywrightType = typeof import('@playwright/test');
export async function initApiContext(playwright: PlaywrightType) {
  const baseURL = API_BASE;
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
export function getApiContext(): APIRequestContext {
  if (!apiContext) {
    throw new Error('API context not initialized. Call initApiContext first.');
  }
  return apiContext;
}

// Get authenticated API context
export function getAuthenticatedApiContext(token: string): APIRequestContext {
  const baseContext = getApiContext();

  return {
    ...baseContext,
    post: async (url: string, options?: { headers?: Record<string, string>; data?: unknown }) => {
      return baseContext.post(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    get: async (url: string, options?: { headers?: Record<string, string> }) => {
      return baseContext.get(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    put: async (url: string, options?: { headers?: Record<string, string>; data?: unknown }) => {
      return baseContext.put(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    delete: async (url: string, options?: { headers?: Record<string, string> }) => {
      return baseContext.delete(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    patch: async (url: string, options?: { headers?: Record<string, string>; data?: unknown }) => {
      return baseContext.patch(url, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
  } as APIRequestContext;
}

// Track created test users for cleanup
const createdTestUsers: any[] = [];

/**
 * Clean up test users created during test
 */
export async function cleanupTestUsers(): Promise<void> {
  for (const user of createdTestUsers) {
    try {
      const token = user.token || global.__E2E_TEST_USER__?.token;

      if (token) {
        const authApi = getAuthenticatedApiContext(token);
        await authApi.delete(`/api/test/users/${user.email}`);
        console.log(`Cleaned up test user: ${user.email}`);
      } else {
        console.warn(`No token available to clean up user: ${user.email}`);
      }
    } catch (error) {
      console.warn(`Failed to cleanup test user ${user.email}:`, error);
    }
  }

  createdTestUsers.length = 0;
}

// Export all functions from improved-helpers for compatibility
export * from '../improved-helpers';
