/**
 * Real Authentication Test Utilities
 * Provides utilities for testing with real authentication flows instead of mocks
 */

import { authService, AuthTokens } from '../services/authService';
import type { User } from '../types';

// Real test environment configuration
const TEST_API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface TestUser {
  id: number;
  email: string;
  name: string;
  role: string;
  password: string;
}

export interface AuthTestContext {
  user: User;
  token: string;
  tokens?: AuthTokens;
  cleanup: () => Promise<void>;
}

/**
 * Create a real test user in the database
 */
export async function createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
  const defaultUser = {
    email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    name: 'Test User',
    password: 'TestPassword123!',
    role: 'USER',
    ...userData,
  };

  const response = await fetch(`${TEST_API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: defaultUser.email,
      name: defaultUser.name,
      password: defaultUser.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to create test user: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  const result = await response.json();
  
  return {
    id: result.user.id,
    email: result.user.email,
    name: result.user.name,
    role: result.user.role,
    password: defaultUser.password,
  };
}

/**
 * Login a test user and return authentication context
 */
export async function loginTestUser(email: string, password: string): Promise<AuthTestContext> {
  const response = await fetch(`${TEST_API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to login test user: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  const result = await response.json();
  
  const tokens: AuthTokens = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
  };

  // Store tokens in authService for subsequent requests
  if (result.accessToken) {
    authService.setLegacyToken(result.accessToken);
  }
  if (tokens.refreshToken) {
    authService.setTokens(tokens);
  }
  authService.setUser(result.user);

  return {
    user: result.user,
    token: result.accessToken,
    tokens,
    cleanup: async () => {
      try {
        await logoutTestUser();
      } catch (error) {
        console.warn('Failed to cleanup test user session:', error);
      }
    },
  };
}

/**
 * Create and login a test user in one step
 */
export async function createAuthenticatedTestUser(userData: Partial<TestUser> = {}): Promise<AuthTestContext> {
  const testUser = await createTestUser(userData);
  return await loginTestUser(testUser.email, testUser.password);
}

/**
 * Logout the current test user
 */
export async function logoutTestUser(): Promise<void> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch(`${TEST_API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers,
    });
  } finally {
    // Always clear local tokens
    authService.clearTokens();
  }
}

/**
 * Delete a test user from the database
 */
export async function deleteTestUser(userId: number): Promise<void> {
  const token = authService.getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${TEST_API_BASE}/api/users/${userId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok && response.status !== 404) {
    console.warn(`Failed to delete test user ${userId}: ${response.status}`);
  }
}

/**
 * Verify authentication status with real API call
 */
export async function verifyTestAuth(): Promise<User | null> {
  try {
    return await authService.verifyAuth();
  } catch (error) {
    console.warn('Auth verification failed:', error);
    return null;
  }
}

/**
 * Generate a real JWT token for testing (bypasses login)
 */
export async function generateTestToken(user: TestUser): Promise<string> {
  // This requires a test-only endpoint or using the server's token generation
  // For now, we'll use the login flow as the most reliable method
  const authContext = await loginTestUser(user.email, user.password);
  return authContext.token;
}

/**
 * Test token refresh functionality
 */
export async function testTokenRefresh(): Promise<boolean> {
  try {
    return await authService.refreshToken();
  } catch (error) {
    console.warn('Token refresh test failed:', error);
    return false;
  }
}

/**
 * Create a test user with specific role
 */
export async function createTestUserWithRole(role: string): Promise<TestUser> {
  // First create a regular user
  const user = await createTestUser();
  
  // Update their role through admin endpoint (if available)
  // For now, return user with role - role updates might need admin privileges
  return { ...user, role };
}

/**
 * Setup auth for integration tests
 */
export async function setupAuthTest(): Promise<{
  user: TestUser;
  authContext: AuthTestContext;
  cleanup: () => Promise<void>;
}> {
  const user = await createTestUser();
  const authContext = await loginTestUser(user.email, user.password);
  
  const cleanup = async () => {
    await authContext.cleanup();
    await deleteTestUser(user.id);
  };

  return { user, authContext, cleanup };
}

/**
 * Test authentication middleware behavior
 */
export async function testAuthMiddleware(endpoint: string, token?: string): Promise<{
  status: number;
  authenticated: boolean;
  response: any;
}> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${TEST_API_BASE}${endpoint}`, {
    method: 'GET',
    headers,
  });

  const responseData = await response.json().catch(() => ({}));

  return {
    status: response.status,
    authenticated: response.status !== 401 && response.status !== 403,
    response: responseData,
  };
}

/**
 * Helper for testing protected routes
 */
export async function testProtectedRoute(endpoint: string): Promise<{
  unauthorizedStatus: number;
  authorizedStatus: number;
  authRequired: boolean;
}> {
  // Test without auth
  const unauthorizedResult = await testAuthMiddleware(endpoint);
  
  // Test with auth
  const authContext = await createAuthenticatedTestUser();
  const authorizedResult = await testAuthMiddleware(endpoint, authContext.token);
  
  // Cleanup
  await authContext.cleanup();
  await deleteTestUser(authContext.user.id);

  return {
    unauthorizedStatus: unauthorizedResult.status,
    authorizedStatus: authorizedResult.status,
    authRequired: unauthorizedResult.status === 401 || unauthorizedResult.status === 403,
  };
}

/**
 * Utility to clear all auth state for clean tests
 */
export function clearAuthState(): void {
  authService.clearTokens();
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Wait for auth state to settle (useful for async auth checks)
 */
export async function waitForAuthState(timeoutMs: number = 5000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const user = await authService.verifyAuth();
      if (user !== null) {
        return; // Auth state has settled
      }
    } catch (error) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error('Auth state did not settle within timeout');
}

/**
 * Create multiple test users for role-based testing
 */
export async function createTestUsersWithRoles(roles: string[]): Promise<TestUser[]> {
  const users: TestUser[] = [];
  
  for (const role of roles) {
    const user = await createTestUserWithRole(role);
    users.push(user);
  }
  
  return users;
}

/**
 * Test JWT token validation
 */
export async function validateTestToken(token: string): Promise<{
  valid: boolean;
  decoded?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`${TEST_API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      return { valid: true, decoded: user };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}