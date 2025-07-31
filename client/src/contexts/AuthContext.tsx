
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { authService } from '../services/authService';
import { errorReportingService } from '../services/errorReportingService';
import type { User } from '../types';
import { getErrorMessage, isApiError } from '../types/errors';
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
  console.log('[AuthProvider] Rendering with children:', children);
  
  // Initialize state synchronously from localStorage to prevent race conditions
  const initializeFromStorage = (): { user: User | null; isAuthenticated: boolean } => {
    try {
      const storedUser = authService.getUser();
      const hasToken = authService.isAuthenticated();
      
      console.log('[AuthProvider] Initializing from storage:', { storedUser, hasToken });
      
      if (storedUser && hasToken) {
        return { user: storedUser, isAuthenticated: true };
      }
    } catch (error) {
      console.error('[AuthProvider] Error initializing from storage:', error);
    }
    
    return { user: null, isAuthenticated: false };
  };
  
  const initialState = initializeFromStorage();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialState.isAuthenticated);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Start as false
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const clearError = useCallback((): void => {
    setError(null);
  }, [])

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
  }, [])

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
        if (isApiError(_error)) {
          const responseData = _error.response?.data as { error?: string } | undefined;
          if (responseData?.error !== undefined && responseData.error !== '') {
            errorMessage = responseData.error;
          } else if (_error.response?.status === 401) {
            errorMessage = 'Invalid email or password';
          } else if (_error.response?.status !== undefined && _error.response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = getErrorMessage(_error);
          }
        } else {
          errorMessage = getErrorMessage(_error);
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

  // Simplified initialization - state is already set from localStorage
  useEffect((): (() => void) => {
    let isMounted = true;
    
    const performInitialAuthCheck = async (): Promise<void> => {
      console.log('[AuthContext] Starting simplified auth check');
      logger.debug('[AuthContext] Starting simplified auth check');
      
      try {
        // Development bypass: Auto-authenticate as Emily McIsaac for UI testing
        const isDevelopmentBypass = import.meta.env.DEV && (!import.meta.env.VITE_JWT_SECRET || import.meta.env.VITE_BYPASS_AUTH === 'true');
        
        if (isDevelopmentBypass) {
          console.log('[AuthContext] Development bypass active - auto-authenticating as Emily McIsaac');
          const emilyUser = {
            id: 1,
            email: 'emily.mcisaac@pei.ca',
            name: 'Emily McIsaac',
            role: 'USER' as const,
            organizationId: 1
          };
          updateAuthState(emilyUser);
        } else {
          // State is already initialized from localStorage, just verify with server if we have a user
          if (user && authService.isAuthenticated()) {
            console.log('[AuthContext] User already authenticated, verifying with server in background');
            // Verify with server in background (non-blocking) 
            checkAuth().catch((_error) => {
              logger.warn('Background auth verification failed, but keeping cached user');
              // Don't clear auth state on server verification failure
            });
          }
        }
      } catch (_error) {
        logger.error('Initial auth check failed:', _error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
          console.log('[AuthContext] Auth initialized - isAuthenticated:', isAuthenticated);
          logger.debug('[AuthContext] Auth initialized successfully');
        }
      }
    };

    void performInitialAuthCheck();

    // Backup timeout to ensure initialization completes
    const forceInitTimeout = setTimeout(() => {
      console.warn('[AuthContext] Force initializing due to timeout');
      if (isMounted && !isInitialized) {
        setIsLoading(false);
        setIsInitialized(true);
        console.log('[AuthContext] Force initialized - isAuthenticated:', isAuthenticated);
      }
    }, 1000); // Reduced timeout since we're doing less work

    return (): void => {
      isMounted = false;
      clearTimeout(forceInitTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - dependencies intentionally omitted to prevent re-runs

  // Auto-refresh token when it's about to expire
  useEffect((): (() => void) => {
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
    if (error !== null && error !== '' && retryCount > 0 && retryCount < 3) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      const timeoutId = setTimeout((): void => {
        void checkAuth();
      }, retryDelay);

      return (): void => {
        clearTimeout(timeoutId); 
      };
    }
    
    // Return empty cleanup function when condition is not met
    return (): void => {};
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
