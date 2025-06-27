import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, type User } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  getToken: () => string | null;
  refreshToken: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {},
  getToken: () => null,
  refreshToken: async () => false,
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateAuthState = useCallback((userData: User | null) => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    if (userData) {
      setError(null); // Clear errors on successful auth
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authService.verifyAuth();
      updateAuthState(userData);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Auth check failed:', error);
      updateAuthState(null);

      // Set user-friendly error message
      if (retryCount < 3) {
        setError('Connection issue. Retrying...');
        setRetryCount((prev) => prev + 1);
      } else {
        setError('Unable to verify authentication. Please try logging in again.');
      }
    }
  }, [updateAuthState, retryCount]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(email, password);
        updateAuthState(response.user);
        setRetryCount(0);
      } catch (error) {
        console.error('Login failed:', error);

        // Extract user-friendly error message
        let errorMessage = 'Login failed';
        const err = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        if (err?.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err?.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err?.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        updateAuthState(null);
        throw error; // Re-throw for component handling
      } finally {
        setIsLoading(false);
      }
    },
    [updateAuthState],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Don't show error for logout failures, just clear local state
    } finally {
      updateAuthState(null);
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const getToken = useCallback((): string | null => {
    return authService.getAccessToken();
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();

      if (success) {
        // Re-verify auth after refresh
        const userData = await authService.verifyAuth();
        updateAuthState(userData);
        return true;
      } else {
        updateAuthState(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      updateAuthState(null);
      return false;
    }
  }, [updateAuthState]);

  // Initial auth check with improved error handling and retry logic
  useEffect(() => {
    let isMounted = true;
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Auth check timeout - assuming not authenticated');
        setIsLoading(false);
        updateAuthState(null);
      }
    }, AUTH_CHECK_TIMEOUT);

    const performInitialAuthCheck = async () => {
      try {
        // Check if we have any stored authentication data
        const storedUser = authService.getUser();
        const hasToken = authService.isAuthenticated();

        if (!hasToken) {
          // No token, definitely not authenticated
          if (isMounted) {
            updateAuthState(null);
            setIsLoading(false);
          }
          return;
        }

        // If we have a stored user and token, verify with server
        if (storedUser && hasToken) {
          await checkAuth();
        } else {
          // Clear inconsistent state
          authService.clearTokens();
          updateAuthState(null);
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        if (isMounted) {
          updateAuthState(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performInitialAuthCheck();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await authService.ensureValidToken();
      } catch (error) {
        console.error('Auto token refresh failed:', error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Retry auth check with exponential backoff when there are connection issues
  useEffect(() => {
    if (error && retryCount > 0 && retryCount < 3) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      const timeoutId = setTimeout(() => {
        checkAuth();
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, checkAuth]);

  const contextValue: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    checkAuth,
    getToken,
    refreshToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
