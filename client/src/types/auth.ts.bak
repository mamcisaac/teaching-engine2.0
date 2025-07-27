/**
 * Shared authentication types to prevent circular dependencies
 */

import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  token?: string; // Legacy support
  tokens?: AuthTokens;
}

export interface LoginResponse {
  user: User;
  tokens?: AuthTokens;
  token?: string; // Legacy support
  accessToken?: string; // Current backend format
}

export interface TokenRefreshResponse {
  accessToken: string;
  tokens?: AuthTokens;
  token?: string;
}

export interface AuthApiInterface {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<TokenRefreshResponse>;
  checkAuth: () => Promise<User>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
}

export interface AuthServiceInterface {
  getAuthHeaders: () => { Authorization?: string };
  ensureValidToken: () => Promise<boolean>;
  handleAuthError: (response: Response) => Promise<boolean>;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  getAccessToken: () => string | null;
  hasRefreshToken: () => boolean;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  getUser: () => User | null;
}