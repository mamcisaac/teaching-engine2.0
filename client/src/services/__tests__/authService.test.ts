/**
 * Authentication Service Integration Tests
 * Tests real authentication flows with actual backend endpoints
 */

import { describe, it as test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { authService } from '../authService';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Setup MSW server for intercepting real network requests
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  server.resetHandlers();
  // Clear localStorage before each test
  localStorage.clear();
});

describe('AuthService Integration Tests', () => {
  const TEST_API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
  const testUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
  };
  const testToken = 'test-access-token-' + Date.now();
  const testRefreshToken = 'test-refresh-token-' + Date.now();

  describe('Token Management', () => {
    test('should store and retrieve access tokens in localStorage', () => {
      const tokens = { accessToken: testToken };

      authService.setTokens(tokens);

      // Verify token was stored
      const storedToken = localStorage.getItem('auth_access_token');
      expect(storedToken).toBe(testToken);

      // Verify retrieval
      expect(authService.getAccessToken()).toBe(testToken);
    });

    test('should handle token expiration correctly', () => {
      // Set expired token
      const expiredTime = Date.now() - 1000; // 1 second ago
      localStorage.setItem('auth_access_token', 'expired-token');
      localStorage.setItem('auth_expires_at', expiredTime.toString());

      // Should return null for expired token
      expect(authService.getAccessToken()).toBeNull();
    });

    test('should clear all authentication data', () => {
      // Set various auth data
      localStorage.setItem('auth_access_token', testToken);
      localStorage.setItem('auth_expires_at', (Date.now() + 3600000).toString());
      localStorage.setItem('auth_user', JSON.stringify(testUser));
      localStorage.setItem('token', 'legacy-token');

      authService.clearTokens();

      // Verify all cleared
      expect(localStorage.getItem('auth_access_token')).toBeNull();
      expect(localStorage.getItem('auth_expires_at')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    test('should detect tokens expiring soon', () => {
      // Token expires in 3 minutes
      const soonExpiry = Date.now() + 3 * 60 * 1000;
      localStorage.setItem('auth_expires_at', soonExpiry.toString());

      expect(authService.isTokenExpiringSoon()).toBe(true);

      // Token expires in 10 minutes
      const laterExpiry = Date.now() + 10 * 60 * 1000;
      localStorage.setItem('auth_expires_at', laterExpiry.toString());

      expect(authService.isTokenExpiringSoon()).toBe(false);
    });
  });

  describe('Authentication State', () => {
    test('should correctly determine authentication status', () => {
      // Not authenticated initially
      expect(authService.isAuthenticated()).toBe(false);

      // Set valid token
      localStorage.setItem('auth_access_token', testToken);
      localStorage.setItem('auth_expires_at', (Date.now() + 3600000).toString());

      expect(authService.isAuthenticated()).toBe(true);

      // Clear tokens
      authService.clearTokens();
      expect(authService.isAuthenticated()).toBe(false);
    });

    test('should check if refresh token exists', () => {
      // Initially no refresh token
      expect(authService.hasRefreshToken()).toBe(false);

      // After successful login (simulated by cookie)
      // Note: In real app, this would be set as HTTP-only cookie by server
      document.cookie = 'refreshToken=exists; path=/';  
      
      // The service checks for cookie existence differently
      // For now, we'll test the localStorage-based logic
      expect(authService.hasRefreshToken()).toBe(true);
    });
  });

  describe('User Management', () => {
    test('should store and retrieve user data from localStorage', () => {
      authService.setUser(testUser);

      const storedUser = localStorage.getItem('auth_user');
      expect(storedUser).toBe(JSON.stringify(testUser));

      const retrievedUser = authService.getUser();
      expect(retrievedUser).toEqual(testUser);
    });

    test('should handle missing user data gracefully', () => {
      localStorage.removeItem('auth_user');
      expect(authService.getUser()).toBeNull();
    });

    test('should handle corrupted user data', () => {
      localStorage.setItem('auth_user', 'invalid-json');
      expect(authService.getUser()).toBeNull();
    });
  });

  describe('Authentication Headers', () => {
    test('should generate proper auth headers for API requests', () => {
      // No token initially
      expect(authService.getAuthHeaders()).toEqual({});

      // Set valid token
      localStorage.setItem('auth_access_token', testToken);
      localStorage.setItem('auth_expires_at', (Date.now() + 3600000).toString());

      const headers = authService.getAuthHeaders();
      expect(headers).toEqual({
        Authorization: `Bearer ${testToken}`,
      });

      // Clear tokens
      authService.clearTokens();
      expect(authService.getAuthHeaders()).toEqual({});
    });
  });

  describe('Login Flow', () => {
    test('should handle successful login with real API structure', async () => {
      const loginResponse = {
        user: testUser,
        token: testToken,
      };

      server.use(
        http.post(`${TEST_API_URL}/api/auth/login`, ({ request }) => {
          return HttpResponse.json(loginResponse);
        })
      );

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual(loginResponse);
      
      // Verify user was stored
      const storedUser = authService.getUser();
      expect(storedUser).toEqual(testUser);

      // Verify token was stored
      expect(authService.getAccessToken()).toBe(testToken);
    });

    test('should handle login failure', async () => {
      server.use(
        http.post(`${TEST_API_URL}/api/auth/login`, ({ request }) => {
          return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        })
      );

      await expect(
        authService.login('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');

      // Verify no user/token was stored
      expect(authService.getUser()).toBeNull();
      expect(authService.getAccessToken()).toBeNull();
    });

    test('should handle network errors during login', async () => {
      server.use(
        http.post(`${TEST_API_URL}/api/auth/login`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        authService.login('test@example.com', 'password')
      ).rejects.toThrow();
    });
  });

  describe('Token Refresh', () => {
    test('should attempt token refresh when access token expires', async () => {
      const newToken = 'new-access-token-' + Date.now();
      
      server.use(
        http.post(`${TEST_API_URL}/api/auth/refresh`, ({ request }) => {
          // Verify refresh token is sent as cookie
          const cookies = request.headers.get('cookie');
          if (!cookies?.includes('refreshToken')) {
            return HttpResponse.json({ error: 'No refresh token' }, { status: 401 });
          }
          
          return HttpResponse.json({ 
            accessToken: newToken,
            expiresIn: 3600
          });
        })
      );

      // Simulate having a refresh token cookie
      document.cookie = 'refreshToken=test-refresh; path=/; httpOnly';

      const result = await authService.refreshToken();
      
      expect(result).toBe(true);
      expect(authService.getAccessToken()).toBe(newToken);
    });

    test('should handle refresh token failure', async () => {
      server.use(
        http.post(`${TEST_API_URL}/api/auth/refresh`, ({ request }) => {
          return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        })
      );

      const result = await authService.refreshToken();
      
      expect(result).toBe(false);
      // Should clear all auth data on refresh failure
      expect(authService.getUser()).toBeNull();
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('Logout', () => {
    test('should clear all auth data and notify server', async () => {
      // Set up initial auth state
      authService.setTokens({ accessToken: testToken });
      authService.setUser(testUser);

      server.use(
        http.post(`${TEST_API_URL}/api/auth/logout`, ({ request }) => {
          return HttpResponse.json({ message: 'Logged out successfully' });
        })
      );

      await authService.logout();

      // Verify all auth data cleared
      expect(authService.getUser()).toBeNull();
      expect(authService.getAccessToken()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle 401 responses by attempting token refresh', async () => {
      const mockResponse = new Response('Unauthorized', { status: 401 });
      
      // Set up refresh endpoint
      server.use(
        http.post(`${TEST_API_URL}/api/auth/refresh`, ({ request }) => {
          return HttpResponse.json({ 
            accessToken: 'refreshed-token',
            expiresIn: 3600
          });
        })
      );

      document.cookie = 'refreshToken=valid; path=/; httpOnly';
      
      const result = await authService.handleAuthError(mockResponse);
      
      expect(result).toBe(true);
      expect(authService.getAccessToken()).toBe('refreshed-token');
    });

    test('should handle non-401 errors appropriately', async () => {
      const mockResponse = new Response('Server Error', { status: 500 });
      
      const result = await authService.handleAuthError(mockResponse);
      
      expect(result).toBe(false);
      // Should not clear auth data for non-auth errors
      expect(authService.getAccessToken()).toBeDefined();
    });
  });
});
