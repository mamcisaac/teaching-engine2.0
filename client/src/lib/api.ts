import axios from 'axios';
import { authService } from '../services/authService';

// Create an axios instance with default configuration
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
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
});

// Handle auth errors with automatic retry
apiClient.interceptors.response.use(
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
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

// Export as 'api' for backward compatibility
export const api = apiClient;
