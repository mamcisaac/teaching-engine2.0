/**
 * Auth client that doesn't use interceptors to avoid circular dependency
 */

import type { User } from '../../types';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  TokenRefreshResponse
} from '../../types/auth';

// Create a separate auth client without interceptors
// Use empty string for relative URLs when in development (Vite will proxy)
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

interface AuthRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
}

class AuthClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(config: AuthRequestConfig): Promise<T> {
    const url = `${this.baseURL}${config.url}`;
    
    const response = await fetch(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      credentials: 'include',
      body: config.data !== undefined && config.data !== null ? JSON.stringify(config.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>({
      method: 'POST',
      url: '/api/auth/login',
      data: credentials,
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>({
      method: 'POST',
      url: '/api/auth/register',
      data: userData,
    });
  }

  async logout(): Promise<void> {
    await this.makeRequest({
      method: 'POST',
      url: '/api/auth/logout',
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    return this.makeRequest<TokenRefreshResponse>({
      method: 'POST',
      url: '/api/auth/refresh',
      data: { refreshToken },
    });
  }

  async checkAuth(authHeaders: Record<string, string>): Promise<User> {
    return this.makeRequest<User>({
      method: 'GET',
      url: '/api/auth/me',
      headers: authHeaders,
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>({
      method: 'POST',
      url: '/api/auth/forgot-password',
      data: { email },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>({
      method: 'POST',
      url: '/api/auth/reset-password',
      data: { token, newPassword },
    });
  }
}

export const authClient = new AuthClient(baseURL);