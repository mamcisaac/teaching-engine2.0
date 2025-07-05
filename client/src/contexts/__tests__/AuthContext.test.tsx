/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file AuthContext.test.tsx
 * @description Comprehensive tests for AuthContext using real authentication flows
 * instead of mocks to ensure TDD compliance and real-world reliability.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { 
  createTestUser, 
  clearAuthState, 
  createAuthenticatedTestUser,
  deleteTestUser,
  setupAuthTest,
  verifyTestAuth,
  type TestUser 
} from '../../test-utils/auth-test-utils';

// Test utilities for creating users
let testCleanupFunctions: Array<() => Promise<void>> = [];

describe('AuthContext - Real Authentication Flows', () => {
  beforeEach(async () => {
    // Clear any existing auth state
    clearAuthState();
    testCleanupFunctions = [];
  });

  afterEach(async () => {
    // Clean up all test users and auth state
    await Promise.all(testCleanupFunctions.map(cleanup => cleanup()));
    testCleanupFunctions = [];
    clearAuthState();
  });

  it('should provide authentication context with all required methods', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('checkAuth');
    expect(result.current).toHaveProperty('getToken');
    expect(result.current).toHaveProperty('refreshToken');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('clearError');
  });

  it('should initialize with no authenticated user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle successful login with real user', async () => {
    // Create a real test user
    const testUser = await createTestUser({
      email: 'test-login@example.com',
      password: 'TestPassword123!',
    });
    testCleanupFunctions.push(() => deleteTestUser(testUser.id));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login(testUser.email, testUser.password);
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe(testUser.email);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle login failure with invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      try {
        await result.current.login('nonexistent@example.com', 'wrong-password');
      } catch (error) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });

  it('should handle complete login and logout flow', async () => {
    // Setup test with real user
    const { user, authContext, cleanup } = await setupAuthTest();
    testCleanupFunctions.push(cleanup);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Login
    await act(async () => {
      await result.current.login(user.email, user.password);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe(user.email);
    });

    // Logout
    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should restore user from real stored token on mount', async () => {
    // Create authenticated user and store token
    const authContext = await createAuthenticatedTestUser();
    testCleanupFunctions.push(authContext.cleanup);

    // Verify token is stored
    expect(authContext.token).toBeTruthy();

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe(authContext.user.email);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 10000 });
  });

  it('should handle token validation failure on mount', async () => {
    // Set an invalid token manually
    localStorage.setItem('auth_access_token', 'invalid-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle real token refresh flow', async () => {
    const authContext = await createAuthenticatedTestUser();
    testCleanupFunctions.push(authContext.cleanup);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Test token refresh
    await act(async () => {
      const refreshResult = await result.current.refreshToken();
      expect(refreshResult).toBeDefined();
    });

    // Should still be authenticated after refresh
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle network errors gracefully during real requests', async () => {
    // Try to login with malformed server URL (this will cause a network error)
    process.env.VITE_API_BASE_URL = 'http://nonexistent-server:9999';

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password');
      } catch (error) {
        // Expected to fail due to network error
      }
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    // Restore normal URL
    delete process.env.VITE_API_BASE_URL;
  });

  it('should verify auth status with real backend calls', async () => {
    const authContext = await createAuthenticatedTestUser();
    testCleanupFunctions.push(authContext.cleanup);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.checkAuth();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBeNull();
    });

    // Verify that we can get a real token
    const token = result.current.getToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should handle concurrent login attempts with real backend', async () => {
    const testUser = await createTestUser({
      email: 'concurrent-test@example.com',
      password: 'TestPassword123!',
    });
    testCleanupFunctions.push(() => deleteTestUser(testUser.id));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Trigger multiple concurrent login attempts with same credentials
    const promises = [
      result.current.login(testUser.email, testUser.password),
      result.current.login(testUser.email, testUser.password),
      result.current.login(testUser.email, testUser.password),
    ];

    await act(async () => {
      const results = await Promise.allSettled(promises);
      
      // At least one should succeed
      const successfulLogins = results.filter(r => r.status === 'fulfilled');
      expect(successfulLogins.length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe(testUser.email);
    });
  });

  it('should clear error state when clearing errors', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Trigger an error by trying to login with invalid credentials
    await act(async () => {
      try {
        await result.current.login('invalid@example.com', 'wrongpassword');
      } catch (error) {
        // Expected to fail
      }
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    // Clear the error
    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
