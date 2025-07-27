/**
 * Authentication test utilities for Playwright E2E tests
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  token?: string;
}

export interface AuthContext {
  user: TestUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Test user data
export const TEST_USERS = {
  teacher: {
    id: 'test-teacher-1',
    email: 'teacher@test.com',
    name: 'Test Teacher',
    password: 'TestPass123!',
  },
  admin: {
    id: 'test-admin-1',
    email: 'admin@test.com',
    name: 'Test Admin',
    password: 'AdminPass123!',
  },
};

// Mock localStorage for testing
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {};

  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
  };
};

// Helper to create auth headers
export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper to wait for auth state
export const waitForAuthState = async (page: any, expectedState: boolean) => {
  await page.waitForFunction(
    (state: boolean) => {
      const token = localStorage.getItem('auth_token');
      return state ? !!token : !token;
    },
    expectedState,
    { timeout: 5000 },
  );
};
