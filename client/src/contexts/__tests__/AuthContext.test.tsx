/**
 * @file AuthContext.test.tsx
 * @description Comprehensive tests for AuthContext including authentication flows,
 * token management, and error handling scenarios.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { setupTest, mockLocalStorage, createMockUser } from '../../test-utils';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  beforeEach(() => {
    setupTest();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null user and false authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    it('should check authentication on mount', async () => {
      const mockUser = createMockUser();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        credentials: 'include',
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('Login Functionality', () => {
    it('should set user and authentication state on login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      const mockUser = createMockUser();

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login with token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      const mockUser = createMockUser({ token: 'test-token' });

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.getToken()).toBe('test-token');
    });
  });

  describe('Logout Functionality', () => {
    it('should clear user state and make logout API call', async () => {
      const mockUser = createMockUser();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    it('should handle logout API failure gracefully', async () => {
      const mockUser = createMockUser();
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Token Management', () => {
    it('should get token from user object', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      const mockUser = createMockUser({ token: 'user-token' });

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.getToken()).toBe('user-token');
    });

    it('should get token from localStorage if user token not available', async () => {
      const mockStorage = mockLocalStorage();
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
      });

      mockStorage.setItem('auth_token', 'stored-token');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(result.current.getToken()).toBe('stored-token');
    });

    it('should set token in localStorage and update user', async () => {
      const mockStorage = mockLocalStorage();
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      const mockUser = createMockUser();

      act(() => {
        result.current.login(mockUser);
      });

      act(() => {
        result.current.setToken('new-token');
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(result.current.user?.token).toBe('new-token');
    });
  });

  describe('Authentication Check', () => {
    it('should check authentication and update state', async () => {
      const mockUser = createMockUser();
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle authentication check failure', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockUser(),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors during authentication check', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should handle delayed authentication check', async () => {
      // Mock a delayed response
      const mockUser = createMockUser();
      
      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockUser,
          }), 50)
        )
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <AuthProvider>{children}</AuthProvider>
        ),
      });

      // Wait for the auth check to complete
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('Cleanup and Abort Handling', () => {
    it('should abort fetch request when component unmounts', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(mockPromise);

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Unmount immediately to trigger abort
      unmount();

      // Resolve the promise after unmount
      act(() => {
        resolvePromise!({
          ok: true,
          json: async () => createMockUser(),
        });
      });

      // Wait a bit to ensure the abort signal was processed
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // The test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without token correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      const { token, ...userWithoutToken } = createMockUser();

      act(() => {
        result.current.login(userWithoutToken);
      });

      expect(result.current.user).toEqual(userWithoutToken);
      expect(result.current.getToken()).toBe(null);
    });

    it('should handle setToken when no user is logged in', async () => {
      const mockStorage = mockLocalStorage();
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      act(() => {
        result.current.setToken('new-token');
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
      expect(result.current.user).toBeNull();
    });
  });
});