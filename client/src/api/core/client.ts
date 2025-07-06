import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { logger } from '../../utils/logger';
// Extend the ImportMeta interface to include Vite's environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Create base axios instance
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lazy import to avoid circular dependency
interface AuthServiceModule {
  authService: {
    getAuthHeaders: () => { Authorization?: string };
    ensureValidToken: () => Promise<boolean>;
    handleAuthError: (response: Response) => Promise<boolean>;
    clearTokens: () => void;
  };
}

let authServiceModule: AuthServiceModule | undefined;
const getAuthService = async (): Promise<AuthServiceModule['authService']> => {
  if (!authServiceModule) {
    authServiceModule = await import('../../services/authService') as AuthServiceModule;
  }
  return authServiceModule.authService;
};

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure credentials are included for cookie-based auth
    config.withCredentials = true;

    // Add authorization header if we have a token
    const authService = await getAuthService();
    const authHeaders = authService.getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers.Authorization = authHeaders.Authorization;
    }

    // Try to ensure we have a valid token before making the request
    try {
      await authService.ensureValidToken();
    } catch (_error) {
      // If token refresh fails, continue with request anyway
      // The response interceptor will handle 401 errors
      logger.warn('Token refresh failed before request:', _error);
    }

    return config;
  },
  (error: unknown): Promise<never> => Promise.reject(error as Error),
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest._retry !== true) {
      originalRequest._retry = true;

      // Try to handle the auth error with the auth service
      try {
        const authService = await getAuthService();
        // Convert AxiosResponse to standard Response for compatibility
        const response = new Response(JSON.stringify(error.response.data), {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: new Headers(error.response.headers as Record<string, string>),
        });
        const recovered = await authService.handleAuthError(response);
        if (recovered) {
          // Update the authorization header with the new token
          const authHeaders = authService.getAuthHeaders();
          if (authHeaders.Authorization && originalRequest.headers) {
            originalRequest.headers.Authorization = authHeaders.Authorization;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError);
      }

      // If we couldn't recover, clear tokens and let the app handle redirect
      const authService = await getAuthService();
      authService.clearTokens();
      return Promise.reject(error as Error);
    }

    return Promise.reject(error as Error);
  },
);

// Export commonly used types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Export base URL for reference
export const API_BASE_URL = baseURL;