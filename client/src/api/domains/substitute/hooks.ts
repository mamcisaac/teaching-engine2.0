/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showSuccessToast, handleApiError } from '../../core/utils';

import { substituteApi } from './api';
import type { SubstitutePlan, SubstitutePlanInput, SubstituteTemplate, SubstituteFilters } from './api';

// Plan query hooks
export const useSubstitutePlans = (filters?: SubstituteFilters): UseQueryResult<SubstitutePlan[], Error> =>
  useQuery({
    queryKey: ['substitute-plans', filters],
    queryFn: () => substituteApi.plans.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

export const useSubstitutePlan = (id: number): UseQueryResult<SubstitutePlan, Error> =>
  useQuery({
    queryKey: ['substitute-plan', id],
    queryFn: () => substituteApi.plans.getById(id),
    enabled: !!id,
  });

export const useSubstitutePlansByDate = (date: string): UseQueryResult<SubstitutePlan[], Error> =>
  useQuery({
    queryKey: ['substitute-plans-by-date', date],
    queryFn: () => substituteApi.plans.getByDate(date),
    enabled: !!date,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

// Template query hooks
export const useSubstituteTemplates = (includePublic = true): UseQueryResult<SubstituteTemplate[], Error> =>
  useQuery({
    queryKey: ['substitute-templates', includePublic],
    queryFn: () => substituteApi.templates.getAll(includePublic),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useSubstituteTemplate = (id: number): UseQueryResult<SubstituteTemplate, Error> =>
  useQuery({
    queryKey: ['substitute-template', id],
    queryFn: () => substituteApi.templates.getById(id),
    enabled: !!id,
  });

export const usePopularTemplates = (limit = 10): UseQueryResult<SubstituteTemplate[], Error> =>
  useQuery({
    queryKey: ['popular-substitute-templates', limit],
    queryFn: () => substituteApi.templates.getPopular(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Statistics
import type { SubstituteStats } from './api';

export const useSubstituteStats = (): UseQueryResult<SubstituteStats, Error> =>
  useQuery({
    queryKey: ['substitute-stats'],
    queryFn: substituteApi.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

// Quick actions hooks
export const useSuggestedActivities = (grade: number, subject?: string, duration?: number): UseQueryResult<any[], Error> =>
  useQuery({
    queryKey: ['suggested-activities', grade, subject, duration],
    queryFn: () => substituteApi.quickActions.getSuggestedActivities(grade, subject, duration),
    enabled: !!grade,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

// Plan mutation hooks
export const useCreateSubstitutePlan = (): UseMutationResult<SubstitutePlan, Error, SubstitutePlanInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: SubstitutePlanInput) => substituteApi.plans.create(plan),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans-by-date', data.date] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-stats'] });
      
      showSuccessToast('Substitute plan created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create substitute plan'),
  });
};

export const useUpdateSubstitutePlan = (): UseMutationResult<SubstitutePlan, Error, { id: number; updates: Partial<SubstitutePlanInput> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<SubstitutePlanInput> }) =>
      substituteApi.plans.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['substitute-plan', data.id], data);
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans-by-date', data.date] });
      
      showSuccessToast('Substitute plan updated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to update substitute plan'),
  });
};

export const useDeleteSubstitutePlan = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => substituteApi.plans.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['substitute-plan', id] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-stats'] });
      
      showSuccessToast('Substitute plan deleted successfully');
    },
    onError: (error) => handleApiError(error, 'Failed to delete substitute plan'),
  });
};

export const useDuplicateSubstitutePlan = (): UseMutationResult<SubstitutePlan, Error, { id: number; newDate?: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDate }: { id: number; newDate?: string }) =>
      substituteApi.plans.duplicate(id, newDate),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      if (data.date) {
        void queryClient.invalidateQueries({ queryKey: ['substitute-plans-by-date', data.date] });
      }
      
      showSuccessToast('Substitute plan duplicated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to duplicate substitute plan'),
  });
};

export const useMarkPlanCompleted = (): UseMutationResult<SubstitutePlan, Error, { id: number; feedback?: string }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, feedback }: {
      id: number;
      feedback: {
        rating?: number;
        comments?: string;
        issues?: string;
        suggestions?: string;
        completedActivities?: string[];
        substituteNotes?: string;
      };
    }) => substituteApi.plans.markCompleted(id, feedback),
    onSuccess: (data) => {
      queryClient.setQueryData(['substitute-plan', data.id], data);
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-stats'] });
      
      showSuccessToast('Plan marked as completed');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to mark plan as completed'),
  });
};

// Template mutation hooks
export const useCreateSubstituteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: Omit<SubstituteTemplate, 'id' | 'userId' | 'usageCount' | 'rating' | 'createdAt' | 'updatedAt'>) =>
      substituteApi.templates.create(template),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['substitute-templates'] });
      
      showSuccessToast('Template created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create template'),
  });
};

export const useCreateEmergencyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grade, subject }: { grade: number; subject?: string }) =>
      substituteApi.quickActions.createEmergencyPlan(grade, subject),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['substitute-plans-by-date', data.date] });
      
      showSuccessToast('Emergency plan created successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create emergency plan'),
  });
};