import { apiClient } from '../core/client';

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

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name?: string;
    role?: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', userData);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post<{ accessToken: string }>('/api/auth/refresh', {
      refreshToken,
    });
    return data;
  },

  checkAuth: async (): Promise<AuthResponse['user']> => {
    const { data } = await apiClient.get<AuthResponse['user']>('/api/auth/me');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },
};