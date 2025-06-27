import axios from 'axios';
import { authService } from '../services/authService';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Add authorization header if we have a token
    const authHeaders = authService.getAuthHeaders();
    if (authHeaders.Authorization) {
      config.headers.Authorization = authHeaders.Authorization;
    }

    // Also support legacy token for backward compatibility
    const legacyToken = localStorage.getItem('token');
    if (legacyToken && !authHeaders.Authorization) {
      config.headers.Authorization = `Bearer ${legacyToken}`;
    }

    // Try to ensure we have a valid token before making the request
    try {
      await authService.ensureValidToken();
    } catch (error) {
      console.warn('Token refresh failed before request:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling with automatic retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to handle the auth error with the auth service
      const shouldRetry = await authService.handleAuthError(error.response);

      if (shouldRetry) {
        // Update the authorization header with the new token
        const authHeaders = authService.getAuthHeaders();
        if (authHeaders.Authorization) {
          originalRequest.headers.Authorization = authHeaders.Authorization;
        }

        // Retry the original request
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
