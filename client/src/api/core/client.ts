import axios from 'axios';
import { authService } from '../../services/authService';

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

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure credentials are included for cookie-based auth
    config.withCredentials = true;

    // Add authorization header if we have a token
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
      console.warn('Token refresh failed before request:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to handle the auth error with the auth service
      try {
        const recovered = await authService.handleAuthError(error.response);
        if (recovered) {
          // Update the authorization header with the new token
          const authHeaders = authService.getAuthHeaders();
          if (authHeaders.Authorization) {
            originalRequest.headers.Authorization = authHeaders.Authorization;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If we couldn't recover, clear tokens and let the app handle redirect
      authService.clearTokens();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

// Export commonly used types
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Export base URL for reference
export const API_BASE_URL = baseURL;