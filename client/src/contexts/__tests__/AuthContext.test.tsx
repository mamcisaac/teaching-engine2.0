/**
 * @file AuthContext.test.tsx
 * @description Comprehensive tests for AuthContext including authentication flows,
 * token management, and error handling scenarios.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the authentication service
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    getStoredToken: vi.fn(),
    validateUser: vi.fn(),
    refreshToken: vi.fn(),
    isTokenValid: vi.fn(),
  },
}));

const mockAuthService = {
  login: vi.fn(),
  logout: vi.fn(),
  getStoredToken: vi.fn(),
  validateUser: vi.fn(),
  refreshToken: vi.fn(),
  isTokenValid: vi.fn(),
};

// Test utilities
const createMockUser = (overrides = {}) => ({
  id: 1,
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  ...overrides,
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockAuthService.getStoredToken.mockReturnValue(null);
    mockAuthService.isTokenValid.mockReturnValue(false);
    mockAuthService.validateUser.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should provide authentication context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('loading');
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

  it('should handle successful login', async () => {
    const mockUser = createMockUser();
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'test-token',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout', async () => {
    const mockUser = createMockUser();
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'test-token',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Login first
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should restore user from stored token on mount', async () => {
    const mockUser = createMockUser();
    mockAuthService.getStoredToken.mockReturnValue('stored-token');
    mockAuthService.isTokenValid.mockReturnValue(true);
    mockAuthService.validateUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle token validation failure on mount', async () => {
    mockAuthService.getStoredToken.mockReturnValue('invalid-token');
    mockAuthService.isTokenValid.mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle user validation failure', async () => {
    mockAuthService.getStoredToken.mockReturnValue('valid-token');
    mockAuthService.isTokenValid.mockReturnValue(true);
    mockAuthService.validateUser.mockRejectedValue(new Error('Validation failed'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should refresh token automatically', async () => {
    vi.useFakeTimers();

    const mockUser = createMockUser();
    mockAuthService.getStoredToken.mockReturnValue('token');
    mockAuthService.isTokenValid.mockReturnValue(true);
    mockAuthService.validateUser.mockResolvedValue(mockUser);
    mockAuthService.refreshToken.mockResolvedValue('new-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Fast-forward time to trigger token refresh
    act(() => {
      vi.advanceTimersByTime(60000); // 1 minute
    });

    await waitFor(() => {
      expect(mockAuthService.refreshToken).toHaveBeenCalled();
    });

    vi.useRealTimers();
  });

  it('should handle network errors gracefully', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'password');
      } catch (error) {
        expect((error as Error).message).toBe('Network error');
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle concurrent login attempts', async () => {
    const mockUser = createMockUser();
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'test-token',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Trigger multiple concurrent login attempts
    const promises = [
      result.current.login('test@example.com', 'password'),
      result.current.login('test@example.com', 'password'),
      result.current.login('test@example.com', 'password'),
    ];

    await act(async () => {
      await Promise.allSettled(promises);
    });

    // Should only have one successful login
    expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
