
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import { authService } from '../services/authService';
import { errorReportingService } from '../services/errorReportingService';
import type { User } from '../types';
import { logger } from '../utils/logger';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const queryClient = useQueryClient();

  // Query for current user
  const {
    data: user,
    isLoading,
    error: queryError,
    refetch: checkAuth,
  } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      try {
        // Check if we have a token first
        const hasToken = authService.isAuthenticated();
        if (!hasToken) {
          return null;
        }

        const userData = await authService.verifyAuth();
        
        // Set user context for error reporting
        if (userData !== null) {
          errorReportingService.setUserContext({
            id: String(userData.id),
            email: userData.email,
            name: userData.name,
            role: userData.role,
            organizationId: (userData.organizationId !== undefined && userData.organizationId !== 0) ? String(userData.organizationId) : undefined,
          });
        }
        
        return userData;
      } catch (error) {
        logger.error('Auth verification failed:', error);
        // Clear tokens on auth failure
        authService.clearTokens();
        errorReportingService.setUserContext(null);
        return null;
      }
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not auth errors
      const statusCode = (error as { response?: { status?: number } }).response?.status;
      if (statusCode === 401 || statusCode === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login(credentials.email, credentials.password);
        return response.user;
      } catch (error) {
        logger.error('Login failed:', error);
        
        // Extract user-friendly error message
        let errorMessage = 'Login failed';
        const err = error as {
          response?: { data?: { error?: string }; status?: number };
          message?: string;
        };
        
        if ((err.response?.data?.error !== undefined && err.response.data.error !== '')) {
          errorMessage = err.response.data.error;
        } else if (err.response?.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (err.response?.status !== undefined && err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message !== null && err.message !== '') {
          errorMessage = err.message;
        }
        
        throw new Error(errorMessage);
      }
    },
    onSuccess: (userData) => {
      // Update the auth query cache
      queryClient.setQueryData(['auth', 'currentUser'], userData);
      
      // Set user context for error reporting
      errorReportingService.setUserContext({
        id: String(userData.id),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organizationId: (userData.organizationId !== undefined && userData.organizationId !== 0) ? String(userData.organizationId) : undefined,
      });
      
      // Invalidate other queries that depend on auth
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        logger.error('Logout failed:', error);
        // Don't throw error for logout failures, just clear local state
      }
    },
    onSettled: () => {
      // Always clear local state, even if server logout fails
      queryClient.setQueryData(['auth', 'currentUser'], null);
      errorReportingService.setUserContext(null);
      
      // Clear all cached data
      queryClient.clear();
    },
  });

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();
      
      if (success ) {
        // Re-verify auth after refresh
        const userData = await checkAuth();
        return userData.data !== null;
      } 
        // Clear auth state on refresh failure
        queryClient.setQueryData(['auth', 'currentUser'], null);
        errorReportingService.setUserContext(null);
        return false;
      
    } catch (error) {
      logger.error('Token refresh failed:', error);
      queryClient.setQueryData(['auth', 'currentUser'], null);
      errorReportingService.setUserContext(null);
      return false;
    }
  };

  // Extract error message
  const getErrorMessage = (): string | null => {
    if (loginMutation.error) {
      return loginMutation.error instanceof Error ? loginMutation.error.message : String(loginMutation.error);
    }
    if (logoutMutation.error) {
      return 'Logout failed';
    }
    if (queryError) {
      return 'Failed to verify authentication';
    }
    return null;
  };

  const contextValue: AuthContextValue = {
    user: user || null,
    login: async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    isInitialized: !isLoading,
    error: getErrorMessage(),
    clearError: () => {
      loginMutation.reset();
      logoutMutation.reset();
    },
    refreshToken,
    getToken: () => authService.getAccessToken(),
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Additional hooks for specific auth states
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export const useAuthLoading = (): boolean => {
  const { isLoading } = useAuth();
  return isLoading;
};