import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';
import { authService } from '../../../services/authService';
import type { LoginCredentials, RegisterData, User } from '../../../types';

// Query hooks
export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider user data stale after 5 minutes
    retry: false, // Don't retry failed auth requests
  });

// Mutation hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      authService.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour default
      });
      
      // Store user
      authService.setUser(data.user);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
      
      showSuccessToast('Logged in successfully');
      navigate('/dashboard');
    },
    onError: (error) => handleApiError(error, 'Login failed'),
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (data) => {
      // Store tokens
      authService.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour default
      });
      
      // Store user
      authService.setUser(data.user);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
      
      showSuccessToast('Registration successful');
      navigate('/onboarding');
    },
    onError: (error) => handleApiError(error, 'Registration failed'),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear tokens
      authService.clearTokens();
      
      // Clear all cached data
      queryClient.clear();
      
      showSuccessToast('Logged out successfully');
      navigate('/login');
    },
    onError: (error) => {
      // Even if logout fails on server, clear local state
      authService.clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => authApi.updateProfile(updates),
    onSuccess: (data) => {
      // Update cached user data
      queryClient.setQueryData(['auth', 'currentUser'], data);
      showSuccessToast('Profile updated successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to update profile'),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwords: { currentPassword: string; newPassword: string }) => 
      authApi.changePassword(passwords),
    onSuccess: () => {
      showSuccessToast('Password changed successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to change password'),
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: () => {
      showSuccessToast('Password reset email sent. Please check your inbox.');
    },
    onError: (error) => handleApiError(error, 'Failed to send password reset email'),
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      showSuccessToast('Password reset successfully. Please login with your new password.');
      navigate('/login');
    },
    onError: (error) => handleApiError(error, 'Failed to reset password'),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      showSuccessToast('Email verified successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to verify email'),
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      showSuccessToast('Verification email sent. Please check your inbox.');
    },
    onError: (error) => handleApiError(error, 'Failed to send verification email'),
  });
};