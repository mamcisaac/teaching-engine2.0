/**
 * Centralized authentication service for managing tokens and auth state
 */

import { safeJsonParse } from '../utils/typeGuards';

// Dynamic import to avoid circular dependency
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken?: string;
  token?: string;
  tokens?: AuthTokens;
}

interface AuthApiModule {
  authApi: {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (userData: RegisterData) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshToken: (refreshToken: string) => Promise<{ accessToken: string }>;
    checkAuth: () => Promise<User>;
    forgotPassword: (email: string) => Promise<{ message: string }>;
    resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  };
}

let authApiModule: AuthApiModule | undefined;
const getAuthApi = async (): Promise<AuthApiModule['authApi']> => {
  if (!authApiModule) {
    authApiModule = await import('../api/auth/authApi') as AuthApiModule;
  }
  return authApiModule.authApi;
};

// Import User type from shared types
import type { User } from '../types';
import logger from '../utils/logger';
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginResponse {
  user: User;
  tokens?: AuthTokens;
  token?: string; // Legacy support
  accessToken?: string; // Current backend format
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_KEY = 'auth_user';
  private refreshPromise: Promise<boolean> | null = null;

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    // Check if token is expired
    const expiresAt = this.getTokenExpiration();
    if (expiresAt && Date.now() >= expiresAt) {
      this.clearTokens();
      return null;
    }

    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Check if refresh token exists (now stored as HTTP-only cookie)
   */
  hasRefreshToken(): boolean {
    // We can't directly read HTTP-only cookies from JavaScript
    // The server will tell us if the refresh token is valid when we try to use it
    return true; // Assume it exists and let the server validate
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): number | null {
    const expiresAt = localStorage.getItem('auth_expires_at');
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Store authentication tokens
   */
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);

    // Refresh token is now stored as HTTP-only cookie by the server
    // No longer store it in localStorage for security

    if (tokens.expiresAt) {
      localStorage.setItem('auth_expires_at', tokens.expiresAt.toString());
    }
  }

  /**
   * Store legacy token format for backward compatibility
   */
  setLegacyToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    localStorage.setItem('token', token); // Legacy support

    // Estimate expiration (1 hour from now if not provided)
    const expiresAt = Date.now() + 60 * 60 * 1000;
    localStorage.setItem('auth_expires_at', expiresAt.toString());
  }

  /**
   * Clear all authentication tokens
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('token'); // Legacy cleanup
    localStorage.removeItem(this.USER_KEY);
    // Refresh token cookie is cleared by the server on logout
  }

  /**
   * Store user data
   */
  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? safeJsonParse(userData, {}) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) {
return false;
}

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const authApi = await getAuthApi();
      const data = await authApi.login({ email, password });

      if (data.user) {
        this.setUser(data.user);

        if (data.tokens) {
          this.setTokens(data.tokens);
        } else if (data.accessToken) {
          // Current backend format
          this.setLegacyToken(data.accessToken);
        } else if (data.token) {
          // Legacy token format
          this.setLegacyToken(data.token);
        }
      }

      return data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const authApi = await getAuthApi();
      await authApi.logout();
    } catch (error) {
      logger.warn('Logout request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performTokenRefresh(): Promise<boolean> {
    const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    try {
      // Refresh token is now sent as HTTP-only cookie automatically
      const response = await fetch(`${baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (data.tokens) {
        this.setTokens(data.tokens);
        return true;
      } else if (data.token) {
        this.setLegacyToken(data.token);
        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      logger.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Verify current authentication status with server
   */
  async verifyAuth(isRetry = false): Promise<User | null> {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

    try {
      const response = await fetch(`${baseURL}/api/auth/me`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        // Try to refresh token if available, but only if not already retrying
        if (!isRetry && this.hasRefreshToken() && (await this.refreshToken())) {
          // Retry with new token
          return this.verifyAuth(true);
        }

        this.clearTokens();
        return null;
      }

      if (!response.ok) {
        throw new Error(`Auth verification failed: ${response.status}`);
      }

      const userData = await response.json();
      this.setUser(userData);
      return userData;
    } catch (error) {
      logger.error('Auth verification failed:', error);

      // Try token refresh on network errors, but only if not already retrying
      if (!isRetry && this.hasRefreshToken()) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry once after successful refresh
          try {
            return await this.verifyAuth(true);
          } catch (retryError) {
            logger.error('Auth verification retry failed:', retryError);
          }
        }
      }

      this.clearTokens();
      return null;
    }
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Handle API response that might indicate authentication issues
   */
  async handleAuthError(response: Response): Promise<boolean> {
    if (response.status === 401) {
      // If we have a refresh token, try to refresh
      if (this.hasRefreshToken()) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          return true; // Indicate that the request should be retried
        }
      }

      // Clear tokens and redirect to login
      this.clearTokens();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return false;
    }

    return false;
  }

  /**
   * Auto-refresh token if it's expiring soon
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isTokenExpiringSoon() && this.hasRefreshToken()) {
      return await this.refreshToken();
    }

    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
