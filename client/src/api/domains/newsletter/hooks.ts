import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterApi } from './api';
import { queryKeys, showSuccessToast, handleApiError } from '../../core';
import type { Newsletter } from '../../../types';

// Query hooks
export const useNewsletter = (id: number, type: 'raw' | 'polished' = 'raw') =>
  useQuery({
    queryKey: queryKeys.newsletter.detail(id, type),
    queryFn: () => newsletterApi.getNewsletter(id, type),
    enabled: !!id,
  });

export const useNewsletterSuggestions = () =>
  useQuery({
    queryKey: queryKeys.newsletter.suggestions,
    queryFn: newsletterApi.getSuggestions,
  });

// Mutation hooks
export const useCreateNewsletterDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsletterApi.createDraft,
    onSuccess: (data) => {
      showSuccessToast('Newsletter draft created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create newsletter draft'),
  });
};

export const useCreateNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsletterApi.create,
    onSuccess: (data) => {
      showSuccessToast('Newsletter created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create newsletter'),
  });
};

export const useGenerateNewsletter = () => {
  return useMutation({
    mutationFn: newsletterApi.generate,
    onSuccess: (data) => {
      showSuccessToast('Newsletter generated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to generate newsletter'),
  });
};