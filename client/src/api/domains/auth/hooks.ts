import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { authService } from '../../../services/authService';
import type { LoginCredentials, RegisterData, User, TokenResponse } from '../../../types';
import { showSuccessToast, handleApiError } from '../../core/utils';

import { authApi } from './api';

// Query hooks
export const useCurrentUser = (): UseQueryResult<User> =>
  useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // Consider user data stale after 5 minutes
    retry: false, // Don't retry failed auth requests
  });

// Mutation hooks
export const useLogin = (): UseMutationResult<
  TokenResponse,
  Error,
  LoginCredentials
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      authService.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour default
      });

      // Store user
      authService.setUser(data.user);

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });

      showSuccessToast('Logged in successfully');
      navigate('/dashboard');
    },
    onError: (error) => handleApiError(error, 'Login failed'),
  });
};

export const useRegister = (): UseMutationResult<
  TokenResponse,
  Error,
  RegisterData
> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (data) => {
      // Store tokens
      authService.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour default
      });

      // Store user
      authService.setUser(data.user);

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });

      showSuccessToast('Registration successful');
      navigate('/onboarding');
    },
    onError: (error) => handleApiError(error, 'Registration failed'),
  });
};

export const useLogout = (): UseMutationResult<void, Error, void> => {
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
    onError: (_error) => {
      // Even if logout fails on server, clear local state
      authService.clearTokens();
      queryClient.clear();
      navigate('/login');
    },
  });
};

export const useUpdateProfile = (): UseMutationResult<User, Error, Partial<User>> => {
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

export const useChangePassword = (): UseMutationResult<
  void,
  Error,
  { currentPassword: string; newPassword: string }
> => useMutation({
    mutationFn: (passwords: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(passwords),
    onSuccess: () => {
      showSuccessToast('Password changed successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to change password'),
  });

export const useRequestPasswordReset = (): UseMutationResult<void, Error, string> => useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: () => {
      showSuccessToast('Password reset email sent. Please check your inbox.');
    },
    onError: (error) => handleApiError(error, 'Failed to send password reset email'),
  });

export const useResetPassword = (): UseMutationResult<
  void,
  Error,
  { token: string; newPassword: string }
> => {
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

export const useVerifyEmail = (): UseMutationResult<void, Error, string> => useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      showSuccessToast('Email verified successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to verify email'),
  });

export const useResendVerificationEmail = (): UseMutationResult<void, Error, void> => useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      showSuccessToast('Verification email sent. Please check your inbox.');
    },
    onError: (error) => handleApiError(error, 'Failed to send verification email'),
  });
