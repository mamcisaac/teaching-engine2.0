import { Page, expect, APIRequestContext } from '@playwright/test';

// Global API context for making direct API requests
let apiContext: APIRequestContext;

// Initialize API context
type PlaywrightType = typeof import('@playwright/test');
export async function initApiContext(playwright: PlaywrightType) {
  const baseURL = global.__TEST_SERVER_URL__ || process.env.API_BASE || 'http://localhost:3000';
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

// Get API context with authentication
export function getApiContext(): APIRequestContext {
  if (!apiContext) {
    throw new Error('API context not initialized. Call initApiContext first.');
  }
  return apiContext;
}

// Create authenticated API context
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

// Test user management
interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
  token?: string;
}

// Default test user
export const DEFAULT_TEST_USER: TestUser = {
  email: 'teacher@example.com',
  password: 'password123',
  name: 'Test Teacher',
  role: 'teacher',
};

// Track created test users for cleanup
const createdTestUsers: TestUser[] = [];

/**
 * Create a test user via API
 */
export async function createTestUser(
  role: 'teacher' | 'admin' = 'teacher',
  customData?: Partial<TestUser>,
): Promise<TestUser> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  const user: TestUser = {
    email: `e2e-${role}-${timestamp}-${random}@example.com`,
    password: `e2epass-${timestamp}`,
    name: `E2E ${role} ${timestamp}`,
    role,
    ...customData,
  };

  const api = getApiContext();

  try {
    // Create user via test endpoint
    const createResponse = await api.post('/api/test/users', {
      data: user,
    });

    if (!createResponse.ok()) {
      const error = await createResponse.text();
      throw new Error(`Failed to create test user: ${error}`);
    }

    const responseData = await createResponse.json();
    user.token = responseData.token;

    // Track for cleanup
    createdTestUsers.push(user);

    console.log(`Created test user: ${user.email}`);
    return user;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Login as a test user
 */
export async function loginAsTestUser(page: Page, user: TestUser): Promise<void> {
  console.log(`Logging in as ${user.email}...`);

  // If we already have a token, just set it
  if (user.token) {
    // Use addInitScript to set localStorage before any navigation
    await page.addInitScript((data) => {
      window.localStorage.setItem('token', data.token);
      window.localStorage.setItem('auth-token', data.token);
      window.localStorage.setItem('onboarded', 'true');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          email: data.email,
          name: data.name,
          role: data.role,
        }),
      );
    }, user);

    // Navigate to the app if not already there
    const currentUrl = page.url();
    if (!currentUrl.startsWith('http://localhost:5173')) {
      await page.goto('http://localhost:5173/');
    }

    console.log('Set authentication token in localStorage');
    return;
  }

  // Otherwise, login via API
  const api = getApiContext();
  const loginResponse = await api.post('/api/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!loginResponse.ok()) {
    throw new Error(`Login failed: ${loginResponse.status()}`);
  }

  const loginData = await loginResponse.json();
  user.token = loginData.token;

  // Set token in page context using addInitScript
  await page.addInitScript((data) => {
    window.localStorage.setItem('token', data.token);
    window.localStorage.setItem('auth-token', data.token);
    window.localStorage.setItem('user', JSON.stringify(data.user));
    window.localStorage.setItem('onboarded', 'true');
  }, loginData);

  // Navigate to ensure localStorage is set
  await page.goto('http://localhost:5173/');

  console.log('Login successful');
}

/**
 * Use the default E2E test user from global setup
 */
export async function useDefaultTestUser(page: Page): Promise<void> {
  // The storage state is already applied by Playwright config
  console.log('Using default E2E test user from storage state');

  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.startsWith('http://localhost:5173')) {
    await page.goto('http://localhost:5173/');
  }

  // Verify the token exists
  const token = await page.evaluate(() => localStorage.getItem('token'));
  if (!token) {
    console.warn('No token found in localStorage. Storage state might not be loaded properly.');
  }
}

/**
 * Verify authentication status
 */
export async function verifyAuthenticated(page: Page): Promise<void> {
  // Check if token exists
  const token = await page.evaluate(() => localStorage.getItem('token'));
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Navigate to a protected route
  await page.goto('/subjects');

  // Should not redirect to login
  await expect(page).not.toHaveURL(/\/login/);

  console.log('Authentication verified');
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to app if not already there
  const currentUrl = page.url();
  if (!currentUrl.startsWith('http://localhost:5173')) {
    await page.goto('http://localhost:5173/');
  }

  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarded');
  });

  console.log('Logged out');
}

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

/**
 * Clean up all E2E test data
 */
export async function cleanupAllE2EData(): Promise<void> {
  const api = getApiContext();

  try {
    const response = await api.post('/api/test/cleanup');
    if (response.ok()) {
      const data = await response.json();
      console.log(`Cleaned up ${data.deletedUsers} test users`);
    }
  } catch (error) {
    console.warn('Failed to cleanup E2E data:', error);
  }
}
