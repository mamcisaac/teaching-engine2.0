/**
 * @file authService.test.ts
 * @description Tests for the centralized authentication service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../authService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should store and retrieve access tokens', () => {
      const token = 'test-access-token';
      const tokens = { accessToken: token };

      authService.setTokens(tokens);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_access_token', token);

      mockLocalStorage.getItem.mockReturnValue(token);
      expect(authService.getAccessToken()).toBe(token);
    });

    it('should store legacy tokens', () => {
      const token = 'legacy-token';

      authService.setLegacyToken(token);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_access_token', token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', token);
    });

    it('should clear all tokens', () => {
      authService.clearTokens();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_access_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_refresh_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_expires_at');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('should detect expired tokens', () => {
      const expiredTime = Date.now() - 1000; // 1 second ago
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_expires_at') return expiredTime.toString();
        if (key === 'auth_access_token') return 'expired-token';
        return null;
      });

      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('Authentication State', () => {
    it('should detect if user is authenticated', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') return 'valid-token';
        if (key === 'auth_expires_at') return (Date.now() + 60000).toString();
        return null;
      });

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should detect if token is expiring soon', () => {
      const soonExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes from now
      mockLocalStorage.getItem.mockReturnValue(soonExpiry.toString());

      expect(authService.isTokenExpiringSoon()).toBe(true);
    });
  });

  describe('User Management', () => {
    it('should store and retrieve user data', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'teacher',
      };

      authService.setUser(user);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(user));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(user));
      expect(authService.getUser()).toEqual(user);
    });
  });

  describe('Authentication Headers', () => {
    it('should return empty headers when no token', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(authService.getAuthHeaders()).toEqual({});
    });

    it('should return authorization header when token exists', () => {
      const token = 'test-token';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_access_token') return token;
        if (key === 'auth_expires_at') return (Date.now() + 60000).toString();
        return null;
      });

      expect(authService.getAuthHeaders()).toEqual({
        Authorization: `Bearer ${token}`,
      });
    });
  });

  describe('Login', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'teacher',
      };

      const mockResponse = {
        user: mockUser,
        token: 'login-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        data: mockResponse,
      });

      // Mock axios-style response
      const mockAxios = {
        post: vi.fn().mockResolvedValue({ data: mockResponse }),
      };

      // We need to mock the api import
      vi.doMock('../../api', () => ({
        api: mockAxios,
      }));

      const result = await authService.login('test@example.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });
  });

  describe('Error Handling', () => {
    it('should handle auth errors correctly', async () => {
      const mockResponse = new Response('', { status: 401 });

      // Mock no refresh token available
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await authService.handleAuthError(mockResponse);

      expect(result).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });
});
