/**
 * Centralized authentication service for managing tokens and auth state
 */

import { api } from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginResponse {
  user: User;
  tokens?: AuthTokens;
  token?: string; // Legacy support
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
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
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

    if (tokens.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

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
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('token'); // Legacy cleanup
    localStorage.removeItem(this.USER_KEY);
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
    return userData ? JSON.parse(userData) : null;
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
    if (!expiresAt) return false;

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/login', { email, password });
      const data: LoginResponse = response.data;

      if (data.user) {
        this.setUser(data.user);

        if (data.tokens) {
          this.setTokens(data.tokens);
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
      await api.post(
        '/api/logout',
        {},
        {
          headers: this.getAuthHeaders(),
        },
      );
    } catch (error) {
      console.warn('Logout request failed:', error);
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
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
        credentials: 'include',
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
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Verify current authentication status with server
   */
  async verifyAuth(): Promise<User | null> {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        // Try to refresh token if available
        if (this.getRefreshToken() && (await this.refreshToken())) {
          // Retry with new token
          return this.verifyAuth();
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
      console.error('Auth verification failed:', error);

      // Try token refresh on network errors
      if (this.getRefreshToken()) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry once after successful refresh
          try {
            return await this.verifyAuth();
          } catch (retryError) {
            console.error('Auth verification retry failed:', retryError);
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
      if (this.getRefreshToken()) {
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

    if (this.isTokenExpiringSoon() && this.getRefreshToken()) {
      return await this.refreshToken();
    }

    return true;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
