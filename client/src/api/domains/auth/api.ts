import type { User, LoginCredentials, RegisterData, TokenResponse } from '../../../types';
import { apiClient } from '../../core/client';

// API endpoints
export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/api/auth/login', credentials);
    return data;
  },

  // Register
  register: async (userData: RegisterData): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/api/auth/register', userData);
    return data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  // Refresh token
  refreshToken: async (): Promise<TokenResponse> => {
    const { data } = await apiClient.post<TokenResponse>('/api/auth/refresh');
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me');
    return data;
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put<User>('/api/auth/profile', updates);
    return data;
  },

  // Change password
  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/api/auth/change-password', passwords);
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/auth/reset-password', { token, newPassword });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/api/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    await apiClient.post('/api/auth/resend-verification');
  },
};