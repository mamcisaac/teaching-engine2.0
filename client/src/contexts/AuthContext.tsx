
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { authService } from '../services/authService';
import { errorReportingService } from '../services/errorReportingService';
import type { User } from '../types';
import { logger } from '../utils/logger';
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
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
  isInitialized: false,
  checkAuth: async () => {},
  getToken: () => null,
  refreshToken: () => Promise.resolve(false),
  error: null,
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Start as false
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = useCallback((): void => {
    setError(null);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateAuthState = useCallback((userData: User | null): void => {
    setUser(userData);
    setIsAuthenticated(!!userData);
    if (userData !== null) {
      setError(null); // Clear errors on successful auth
      // Set user context for error reporting
      errorReportingService.setUserContext({
        id: String(userData.id),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organizationId: userData.organizationId !== undefined && userData.organizationId !== 0 && !isNaN(userData.organizationId) ? String(userData.organizationId) : undefined,
      });
    } else {
      // Clear user context when logged out
      errorReportingService.setUserContext(null);
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = useCallback(async (): Promise<void> => {
    try {
      const userData = await authService.verifyAuth();
      updateAuthState(userData);
      setRetryCount(0); // Reset retry count on success
    } catch (_error) {
      logger.error('Auth check failed:', _error);
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
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.login(email, password);
        updateAuthState(response.user);
        setRetryCount(0);
      } catch (_error) {
        logger.error('Login failed:', _error);

        // Extract user-friendly error message
        let errorMessage = 'Login failed';
        const err = _error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response?.status !== null && err.response?.status !== undefined && err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        updateAuthState(null);
        throw _error; // Re-throw for component handling
      } finally {
        setIsLoading(false);
      }
    },
    [updateAuthState],
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch (_error) {
      logger.error('Logout failed:', _error);
      // Don't show error for logout failures, just clear local state
    } finally {
      updateAuthState(null);
      setIsLoading(false);
    }
  }, [updateAuthState]);

  const getToken = useCallback((): string | null => authService.getAccessToken(), []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();

      if (success) {
        // Re-verify auth after refresh
        const userData = await authService.verifyAuth();
        updateAuthState(userData);
        return true;
      } 
        updateAuthState(null);
        return false;
      
    } catch (_error) {
      logger.error('Token refresh failed:', _error);
      updateAuthState(null);
      return false;
    }
  }, [updateAuthState]);

  // Initial auth check with improved error handling and retry logic
  useEffect((): (() => void) => {
    return (): void => { // Cleanup
    };

    let isMounted = true;
    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      if (isMounted && isLoading) {
        logger.warn('Auth check timeout - assuming not authenticated');
        setIsLoading(false);
        setIsInitialized(true);
        updateAuthState(null);
      }
    }, 2000); // 2 second timeout - reduced for better UX

    const performInitialAuthCheck = async (): Promise<void> => {
      logger.debug('[AuthContext] Starting initial auth check');
      try {
        // Check if we have any stored authentication data
        const storedUser = authService.getUser();
        const hasToken = authService.isAuthenticated();

        // Debug logging in development
        logger.debug('[AuthContext] Initial auth check:', {
          hasStoredUser: storedUser !== null,
          hasToken,
          storedUser,
          tokenValue: `${authService.getAccessToken()?.substring(0, 20)  }...`,
        });

        if (!hasToken) {
          // No token, definitely not authenticated
          if (isMounted) {
            updateAuthState(null);
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        // If we have a stored user and token, verify with server
        // Add a timeout to prevent hanging
        if (storedUser !== null && hasToken) {
          const checkAuthPromise = checkAuth();
          const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout((): void => {
 reject(new Error('Auth check timeout')); 
}, 1500),
          );

          try {
            await Promise.race([checkAuthPromise, timeoutPromise]);
          } catch (timeoutError) {
            logger.warn('Auth verification timed out, using cached user');
            // Use cached user data if server check times out
            if (isMounted && storedUser !== null) {
              updateAuthState(storedUser);
            }
          }
        } else {
          // Clear inconsistent state
          authService.clearTokens();
          updateAuthState(null);
        }
      } catch (_error) {
        logger.error('Initial auth check failed:', _error);
        if (isMounted) {
          updateAuthState(null);
        }
      } finally {
        logger.debug('[AuthContext] Finalizing auth check, isMounted:', isMounted);
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          logger.debug('[AuthContext] Auth initialized');
        }
      }
    };

    void performInitialAuthCheck();

    return (): void => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Auto-refresh token when it's about to expire
  useEffect((): (() => void) => {
    return (): void => { // Cleanup
    };

    if (!isAuthenticated) {
      return (): void => {}; // Return empty cleanup function
    }

    const interval = setInterval((): void => {
      void (async (): Promise<void> => {
        try {
          await authService.ensureValidToken();
        } catch (_error) {
          logger.error('Auto token refresh failed:', _error);
        }
      })();
    }, 60000); // Check every minute

    return (): void => {
 clearInterval(interval); 
};
  }, [isAuthenticated, error]);

  // Retry auth check with exponential backoff when there are connection issues
  useEffect((): (() => void) => {
    return (): void => { // Cleanup
    };

    if (error !== null && error !== '' && retryCount > 0 && retryCount < 3) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      const timeoutId = setTimeout((): void => {
        void checkAuth();
      }, retryDelay);

      return (): void => {
 clearTimeout(timeoutId); 
};
    }
  }, [error, retryCount, checkAuth]);

  const contextValue: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    isInitialized,
    checkAuth,
    getToken,
    refreshToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export const useAuth = (): AuthContextValue => useContext(AuthContext);
