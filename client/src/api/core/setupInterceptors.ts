import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

import type { AuthServiceInterface } from '../../types/auth';
import { logger } from '../../utils/logger';

// Import auth service dynamically to avoid circular dependency
interface AuthServiceModule {
  authService: AuthServiceInterface;
}

let authServiceModule: AuthServiceModule | undefined;
const getAuthService = async (): Promise<AuthServiceModule['authService']> => {
  if (!authServiceModule) {
    authServiceModule = await import('../../services/authService') as AuthServiceModule;
  }
  return authServiceModule.authService;
};

export function setupInterceptors(apiClient: AxiosInstance): void {
  // Add request interceptor for authentication
  apiClient.interceptors.request.use(
    async (config): Promise<typeof config> => {
      // Ensure credentials are included for cookie-based auth
      config.withCredentials = true;

      // Add authorization header if we have a token
      const authService = await getAuthService();
      const authHeaders = authService.getAuthHeaders();
      if (authHeaders.Authorization !== undefined && authHeaders.Authorization !== '') {
        config.headers.Authorization = authHeaders.Authorization;
      }

      // Ensure token is valid before making the request
      try {
        await authService.ensureValidToken();
      } catch (_error) {
        // If token refresh fails, continue with request anyway
        // The response interceptor will handle 401 errors
        logger.warn('Token refresh failed before request:', _error);
      }

      return config;
    },
    (error: unknown): Promise<never> => {
      throw error as Error;
    },
  );

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response): typeof response => response,
    async (error: AxiosError): Promise<never> => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && originalRequest._retry !== true) {
        originalRequest._retry = true;

        // Try to handle the auth error with the auth service
        try {
          const authService = await getAuthService();
          // Convert AxiosResponse to standard Response for compatibility
          const response = new Response(JSON.stringify(error.response.data ?? 'Unknown error'), {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: new Headers(error.response.headers as Record<string, string>),
          });
          const recovered = await authService.handleAuthError(response);
          if (recovered) {
            // Update the authorization header with the new token
            const authHeaders = authService.getAuthHeaders();
            if ((authHeaders.Authorization !== undefined && authHeaders.Authorization !== '') && originalRequest.headers !== undefined) {
              originalRequest.headers.Authorization = authHeaders.Authorization;
            }
            return apiClient(originalRequest);
          }
        } catch (_error) {
          // Clear tokens if auth recovery fails
          const authService = await getAuthService();
          authService.clearTokens();
          throw error;
        }
      }

      // Report errors to monitoring service if available
      if (error.response && error.response.status >= 500) {
        logger.error('Server error:', {
          status: error.response.status,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response.data ?? 'Unknown error',
        });
      }

      throw error;
    },
  );
}