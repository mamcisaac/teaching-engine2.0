import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { TeacherReflectionInput, TeacherReflection, TeacherPreferencesInput } from '../../../types';

// Types for dashboard and profile
interface DashboardStats {
  totalStudents: number;
  totalLessonPlans: number;
  upcomingEvents: number;
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  schoolBoard?: string;
  school?: string;
  grade?: number;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileInput {
  name?: string;
  schoolBoard?: string;
  school?: string;
  grade?: number;
}
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { teacherApi } from './api';

// Preferences Query hooks
export const useTeacherPreferences = (): UseQueryResult<TeacherPreferencesInput> =>
  useQuery({
    queryKey: queryKeys.teacher.preferences,
    queryFn: teacherApi.preferences.get,
  });

// Preferences Mutation hooks
export const useUpdateTeacherPreferences = (): UseMutationResult<TeacherPreferencesInput, Error, Partial<TeacherPreferencesInput>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.preferences.update,
    onSuccess: () => {
      showSuccessToast('Preferences updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.preferences });
    },
    onError: (error) => handleApiError(error, 'Failed to update preferences'),
  });
};

// Reflections Query hooks
export const useTeacherReflections = (): UseQueryResult<TeacherReflection[]> =>
  useQuery({
    queryKey: queryKeys.teacher.reflections.all,
    queryFn: teacherApi.reflections.getAll,
  });

export const useTeacherReflection = (id: number): UseQueryResult<TeacherReflection> =>
  useQuery({
    queryKey: queryKeys.teacher.reflections.detail(id),
    queryFn: () => teacherApi.reflections.getById(id),
    enabled: !!id,
  });

// Reflections Mutation hooks
export const useCreateTeacherReflection = (): UseMutationResult<TeacherReflection, Error, TeacherReflectionInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.reflections.create,
    onSuccess: () => {
      showSuccessToast('Reflection created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
    },
    onError: (error) => handleApiError(error, 'Failed to create reflection'),
  });
};

export const useUpdateTeacherReflection = (): UseMutationResult<TeacherReflection, Error, { id: number; input: Partial<TeacherReflectionInput> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<TeacherReflectionInput> }) =>
      teacherApi.reflections.update(id, input),
    onSuccess: (_, { id }) => {
      showSuccessToast('Reflection updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.detail(id) });
    },
    onError: (error) => handleApiError(error, 'Failed to update reflection'),
  });
};

export const useDeleteTeacherReflection = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.reflections.delete,
    onSuccess: () => {
      showSuccessToast('Reflection deleted successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.reflections.all });
    },
    onError: (error) => handleApiError(error, 'Failed to delete reflection'),
  });
};

// Dashboard Query hooks
export const useTeacherDashboardStats = (): UseQueryResult<DashboardStats> =>
  useQuery({
    queryKey: queryKeys.teacher.dashboard.stats,
    queryFn: teacherApi.dashboard.getStats,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

export const useTeacherRecentActivity = (limit = 10): UseQueryResult<RecentActivity[]> =>
  useQuery({
    queryKey: queryKeys.teacher.dashboard.activity(limit),
    queryFn: () => teacherApi.dashboard.getRecentActivity(limit),
  });

// Profile Query hooks
export const useTeacherProfile = (): UseQueryResult<TeacherProfile> =>
  useQuery({
    queryKey: queryKeys.teacher.profile,
    queryFn: teacherApi.profile.get,
  });

// Profile Mutation hooks
export const useUpdateTeacherProfile = (): UseMutationResult<TeacherProfile, Error, UpdateProfileInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.profile.update,
    onSuccess: () => {
      showSuccessToast('Profile updated successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.teacher.profile });
    },
    onError: (error) => handleApiError(error, 'Failed to update profile'),
  });
};