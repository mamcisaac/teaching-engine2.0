import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';
import type { TeacherReflectionInput } from '../../../types';

// Preferences Query hooks
export const useTeacherPreferences = () =>
  useQuery({
    queryKey: queryKeys.teacher.preferences,
    queryFn: teacherApi.preferences.get,
  });

// Preferences Mutation hooks
export const useUpdateTeacherPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.preferences.update,
    onSuccess: () => {
      showSuccessToast('Preferences updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.preferences });
    },
    onError: (error) => handleApiError(error, 'Failed to update preferences'),
  });
};

// Reflections Query hooks
export const useTeacherReflections = () =>
  useQuery({
    queryKey: queryKeys.teacher.reflections.all,
    queryFn: teacherApi.reflections.getAll,
  });

export const useTeacherReflection = (id: number) =>
  useQuery({
    queryKey: queryKeys.teacher.reflections.detail(id),
    queryFn: () => teacherApi.reflections.getById(id),
    enabled: !!id,
  });

// Reflections Mutation hooks
export const useCreateTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.reflections.create,
    onSuccess: () => {
      showSuccessToast('Reflection created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create reflection'),
  });
};

export const useUpdateTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<TeacherReflectionInput> }) =>
      teacherApi.reflections.update(id, input),
    onSuccess: (_, { id }) => {
      showSuccessToast('Reflection updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.detail(id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update reflection'),
  });
};

export const useDeleteTeacherReflection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.reflections.delete,
    onSuccess: () => {
      showSuccessToast('Reflection deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete reflection'),
  });
};

// Dashboard Query hooks
export const useTeacherDashboardStats = () =>
  useQuery({
    queryKey: queryKeys.teacher.dashboard.stats,
    queryFn: teacherApi.dashboard.getStats,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

export const useTeacherRecentActivity = (limit: number = 10) =>
  useQuery({
    queryKey: queryKeys.teacher.dashboard.activity(limit),
    queryFn: () => teacherApi.dashboard.getRecentActivity(limit),
  });

// Profile Query hooks
export const useTeacherProfile = () =>
  useQuery({
    queryKey: queryKeys.teacher.profile,
    queryFn: teacherApi.profile.get,
  });

// Profile Mutation hooks
export const useUpdateTeacherProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.profile.update,
    onSuccess: () => {
      showSuccessToast('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.teacher.profile });
    },
    onError: (error) => handleApiError(error, 'Failed to update profile'),
  });
};