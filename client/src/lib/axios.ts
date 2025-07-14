import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

import { authService } from '../services/authService';
import { logger } from '../utils/logger';
// Create axios instance with base configuration
const api = axios.create({
  baseURL: ((import.meta.env.VITE_API_URL as string | undefined) !== null && (import.meta.env.VITE_API_URL as string | undefined) !== undefined && (import.meta.env.VITE_API_URL as string | undefined) !== '') ? (import.meta.env.VITE_API_URL as string) : 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Add authorization header if we have a token
    const authHeaders = authService.getAuthHeaders();
    if (authHeaders.Authorization !== null && authHeaders.Authorization !== undefined && authHeaders.Authorization !== '') {
      config.headers.Authorization = authHeaders.Authorization;
    }

    // Also support legacy token for backward compatibility
    const legacyToken = localStorage.getItem('token');
    if ((legacyToken !== null && legacyToken !== undefined && legacyToken !== '') && (authHeaders.Authorization === undefined || authHeaders.Authorization === null || authHeaders.Authorization === '')) {
      config.headers.Authorization = `Bearer ${legacyToken}`;
    }

    // Try to ensure we have a valid token before making the request
    try {
      await authService.ensureValidToken();
    } catch (_error) {
      logger.warn('Token refresh failed before request:', _error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Add response interceptor for error handling with automatic retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Convert AxiosResponse to standard Response for compatibility with authService
      const response = new Response(JSON.stringify(error.response.data ?? 'Unknown error'), {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers as Record<string, string>),
      });
      
      // Try to handle the auth error with the auth service
      const shouldRetry = await authService.handleAuthError(response);

      if (shouldRetry) {
        // Update the authorization header with the new token
        const authHeaders = authService.getAuthHeaders();
        if ((authHeaders.Authorization !== null && authHeaders.Authorization !== undefined && authHeaders.Authorization !== '') && originalRequest.headers) {
          originalRequest.headers.Authorization = authHeaders.Authorization;
        }

        // Retry the original request
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
