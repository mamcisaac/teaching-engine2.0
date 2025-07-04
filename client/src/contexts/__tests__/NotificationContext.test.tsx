/**
 * @file NotificationContext.test.tsx
 * @description Comprehensive tests for NotificationContext including notification fetching,
 * authentication handling, error scenarios, and state management.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { NotificationProvider, useNotification } from '../NotificationContext';
import { useAuth } from '../AuthContext';
import { useNotifications, useMarkNotificationAsRead } from '../../api';

// Mock the API hooks
vi.mock('../../api', () => ({
  useNotifications: vi.fn(),
  useMarkNotificationAsRead: vi.fn(),
}));

// Mock the AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseNotifications = vi.mocked(useNotifications);
const mockUseMarkNotificationAsRead = vi.mocked(useMarkNotificationAsRead);
const mockUseAuth = vi.mocked(useAuth);

// Test utilities
const createMockNotification = (overrides = {}) => ({
  id: 1,
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info' as const,
  read: false,
  createdAt: new Date().toISOString(),
  userId: 1,
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>{children}</NotificationProvider>
    </QueryClientProvider>
  );
};

describe('NotificationContext', () => {
  const mockMarkMutation = {
    mutate: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' },
      login: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    // Default notification query state
    mockUseNotifications.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Default mark mutation state
    mockUseMarkNotificationAsRead.mockReturnValue(mockMarkMutation);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider initialization', () => {
    it('should provide notification context', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('markRead');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should initialize with empty notifications', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Authentication handling', () => {
    it('should only fetch notifications when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(mockUseNotifications).toHaveBeenCalledWith({
        enabled: true,
        retry: expect.any(Function),
        retryDelay: expect.any(Function),
      });
    });

    it('should not fetch notifications when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(mockUseNotifications).toHaveBeenCalledWith({
        enabled: false,
        retry: expect.any(Function),
        retryDelay: expect.any(Function),
      });
    });

    it('should handle authentication state changes', () => {
      const { rerender } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      // Start authenticated
      expect(mockUseNotifications).toHaveBeenLastCalledWith(
        expect.objectContaining({ enabled: true }),
      );

      // Change to unauthenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      rerender();

      expect(mockUseNotifications).toHaveBeenLastCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });
  });

  describe('Notification data handling', () => {
    it('should display notifications when available', () => {
      const mockNotifications = [
        createMockNotification({ id: 1, title: 'Notification 1' }),
        createMockNotification({ id: 2, title: 'Notification 2' }),
      ];

      mockUseNotifications.mockReturnValue({
        data: mockNotifications,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle loading state', () => {
      mockUseNotifications.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle error state', () => {
      const mockError = new Error('Failed to fetch notifications');
      mockUseNotifications.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('Mark as read functionality', () => {
    it('should mark notification as read when authenticated', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markRead(1);
      });

      expect(mockMarkMutation.mutate).toHaveBeenCalledWith(1);
    });

    it('should not mark notification as read when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markRead(1);
      });

      expect(mockMarkMutation.mutate).not.toHaveBeenCalled();
    });

    it('should handle mark as read with different notification IDs', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markRead(5);
      });

      expect(mockMarkMutation.mutate).toHaveBeenCalledWith(5);

      act(() => {
        result.current.markRead(10);
      });

      expect(mockMarkMutation.mutate).toHaveBeenCalledWith(10);
    });
  });

  describe('Error handling and retry logic', () => {
    it('should not retry on 401 errors', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      // Get the retry function that was passed to useNotifications
      const retryFn = mockUseNotifications.mock.calls[0][0].retry;

      // Test with 401 error
      const error401 = { response: { status: 401 } };
      expect(retryFn(1, error401)).toBe(false);
    });

    it('should retry on other errors up to 3 times', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      const retryFn = mockUseNotifications.mock.calls[0][0].retry;

      // Test with 500 error
      const error500 = { response: { status: 500 } };
      expect(retryFn(0, error500)).toBe(true);
      expect(retryFn(1, error500)).toBe(true);
      expect(retryFn(2, error500)).toBe(true);
      expect(retryFn(3, error500)).toBe(false); // Should not retry after 3 attempts
    });

    it('should use exponential backoff for retry delay', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      const retryDelayFn = mockUseNotifications.mock.calls[0][0].retryDelay;

      expect(retryDelayFn(0)).toBe(1000); // 1 second
      expect(retryDelayFn(1)).toBe(2000); // 2 seconds
      expect(retryDelayFn(2)).toBe(4000); // 4 seconds
      expect(retryDelayFn(10)).toBe(30000); // Max 30 seconds
    });
  });

  describe('Context provider edge cases', () => {
    it('should handle undefined data gracefully', () => {
      mockUseNotifications.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual([]);
    });

    it('should handle null data gracefully', () => {
      mockUseNotifications.mockReturnValue({
        data: null as unknown,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual([]);
    });

    it('should maintain referential stability of functions', () => {
      const { result, rerender } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      const markReadRef = result.current.markRead;

      rerender();

      expect(result.current.markRead).toBe(markReadRef);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle rapid authentication changes', () => {
      const { rerender } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      // Rapid authentication state changes
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });
      rerender();

      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });
      rerender();

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      });
      rerender();

      // Should handle these changes gracefully without errors
      expect(() => rerender()).not.toThrow();
    });

    it('should handle notification updates with different data structures', () => {
      const notifications1 = [createMockNotification({ id: 1 })];
      const notifications2 = [createMockNotification({ id: 1 }), createMockNotification({ id: 2 })];

      // Start with first set
      mockUseNotifications.mockReturnValue({
        data: notifications1,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useNotification(), {
        wrapper: createWrapper(),
      });

      expect(result.current.notifications).toEqual(notifications1);

      // Update to second set
      mockUseNotifications.mockReturnValue({
        data: notifications2,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      rerender();

      expect(result.current.notifications).toEqual(notifications2);
    });
  });
});
