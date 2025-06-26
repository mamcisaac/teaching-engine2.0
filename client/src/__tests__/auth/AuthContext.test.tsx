import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { renderWithProviders, mockUser, mockApiResponse, mockApiError } from '../../test-utils';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with loading state and checks authentication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Initially should be in loading state
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    // Wait for auth check to complete
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
      credentials: 'include',
      signal: expect.any(AbortSignal),
    });
  });

  it('sets unauthenticated state when auth check fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('handles network errors during auth check', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(consoleError).toHaveBeenCalledWith('Auth check failed:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('allows manual login', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial auth check fails

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    // Perform login
    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles logout correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    }); // Initial auth check
    mockFetch.mockResolvedValueOnce({ ok: true }); // Logout request

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Wait for initial auth
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Perform logout
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

  it('handles logout errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    }); // Initial auth check
    mockFetch.mockRejectedValueOnce(new Error('Logout failed')); // Logout request fails

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    // Should still logout locally even if server request fails
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(consoleError).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('provides checkAuth function for manual auth verification', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial auth check fails
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    }); // Manual check succeeds

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    // Perform manual auth check
    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('displays loading component during initial auth check', () => {
    // Mock a slow auth response
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<AuthProvider><div>App Content</div></AuthProvider>);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('aborts auth request when component unmounts', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    unmount();

    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});