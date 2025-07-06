import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { Newsletter, NewsletterDraft, NewsletterInput, NewsletterGenerateInput } from '../../../types';
import { queryKeys, showSuccessToast, handleApiError } from '../../core/utils';

import { newsletterApi } from './api';

// Query hooks
export const useNewsletter = (id: number, type: 'raw' | 'polished' = 'raw'): UseQueryResult<Newsletter> =>
  useQuery({
    queryKey: queryKeys.newsletter.detail(id, type),
    queryFn: () => newsletterApi.getNewsletter(id, type),
    enabled: !!id,
  });

export const useNewsletterSuggestions = (): UseQueryResult<{ suggested: boolean }> =>
  useQuery({
    queryKey: queryKeys.newsletter.suggestions,
    queryFn: newsletterApi.getSuggestions,
  });

// Mutation hooks
export const useCreateNewsletterDraft = (): UseMutationResult<Newsletter, Error, NewsletterInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsletterApi.createDraft,
    onSuccess: (data) => {
      showSuccessToast('Newsletter draft created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create newsletter draft'),
  });
};

export const useCreateNewsletter = (): UseMutationResult<Newsletter, Error, NewsletterInput> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: newsletterApi.create,
    onSuccess: (data) => {
      showSuccessToast('Newsletter created successfully');
      void queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to create newsletter'),
  });
};

export const useGenerateNewsletter = (): UseMutationResult<{ content: string }, Error, NewsletterGenerateInput> => useMutation({
    mutationFn: newsletterApi.generate,
    onSuccess: (data) => {
      showSuccessToast('Newsletter generated successfully');
      return data;
    },
    onError: (error) => handleApiError(error, 'Failed to generate newsletter'),
  });