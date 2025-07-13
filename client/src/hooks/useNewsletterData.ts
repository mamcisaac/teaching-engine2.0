import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';
import type { 
  NewsletterGenerationParams, 
  GeneratedNewsletter, 
  NewsletterDraft, 
  Student,
  ParentSummary
} from '../types/newsletter';

// Hook for fetching all students
export function useStudents(): UseQueryResult<Student[], Error> {
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await apiClient.get('/students');
      return response.data as Student[];
    },
  });
}

// Hook for generating newsletter content with AI
export function useGenerateNewsletter(): UseMutationResult<GeneratedNewsletter, Error, NewsletterGenerationParams> {
  const queryClient = useQueryClient();

  return useMutation<GeneratedNewsletter, Error, NewsletterGenerationParams>({
    mutationFn: async (params) => {
      // For multi-student newsletters, we'll generate a comprehensive summary
      const response = await apiClient.post('/newsletters/generate-newsletter', {
        studentIds: params.studentIds,
        from: params.from.toISOString(),
        to: params.to.toISOString(),
        tone: params.tone,
        focusAreas: params.focusAreas,
        includeArtifacts: params.includeArtifacts ?? true,
        includeReflections: params.includeReflections ?? true,
        includeLearningGoals: params.includeLearningGoals ?? true,
        includeUpcomingEvents: params.includeUpcomingEvents ?? true,
      });
      return response.data as GeneratedNewsletter;
    },
    onSuccess: () => {
      toast.success('Newsletter content generated successfully!');
      void queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to generate newsletter: ${(error instanceof Error ? error.message : String(error))}`);
    },
  });
}

// Hook for regenerating newsletter content with variations
export function useRegenerateNewsletter(): UseMutationResult<GeneratedNewsletter, Error, {
    draft: NewsletterDraft;
    tone?: 'friendly' | 'formal' | 'informative';
  }> {
  return useMutation<GeneratedNewsletter, Error, {
    draft: NewsletterDraft;
    tone?: 'friendly' | 'formal' | 'informative';
  }>({
    mutationFn: async ({ draft, tone }) => {
      const response = await apiClient.post('/newsletters/regenerate-newsletter', {
        sections: draft.sections,
        studentIds: draft.studentIds,
        from: draft.dateFrom,
        to: draft.dateTo,
        tone: tone ?? draft.tone,
      });
      return response.data as GeneratedNewsletter;
    },
    onSuccess: () => {
      toast.success('Newsletter regenerated with new variations!');
    },
    onError: (error) => {
      toast.error(`Failed to regenerate newsletter: ${(error instanceof Error ? error.message : String(error))}`);
    },
  });
}

// Hook for saving newsletter draft
export function useSaveNewsletterDraft(): UseMutationResult<NewsletterDraft, Error, NewsletterDraft> {
  const queryClient = useQueryClient();

  return useMutation<NewsletterDraft, Error, NewsletterDraft>({
    mutationFn: async (draft) => {
      const endpoint = draft.id 
        ? `/newsletters/${draft.id}` 
        : '/newsletters';
      
      const method = draft.id ? 'put' : 'post';
      
      const response = await apiClient[method](endpoint, draft);
      return response.data as NewsletterDraft;
    },
    onSuccess: (_data) => {
      toast.success(_data.isDraft ? 'Draft saved!' : 'Newsletter finalized!');
      void queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
      void queryClient.invalidateQueries({ queryKey: ['newsletter', _data.id] });
    },
    onError: (error) => {
      toast.error(`Failed to save newsletter: ${(error instanceof Error ? error.message : String(error))}`);
    },
  });
}

// Hook for fetching newsletter drafts
export function useNewsletterDrafts(): UseQueryResult<NewsletterDraft[], Error> {
  return useQuery<NewsletterDraft[]>({
    queryKey: ['newsletter-drafts'],
    queryFn: async () => {
      const response = await apiClient.get('/newsletters?isDraft=true');
      return response.data as NewsletterDraft[];
    },
  });
}

// Hook for fetching a specific newsletter
export function useNewsletter(id: string | undefined): UseQueryResult<NewsletterDraft, Error> {
  return useQuery<NewsletterDraft>({
    queryKey: ['newsletter', id],
    queryFn: async () => {
      if (id === null || id === undefined || id === '') {
throw new Error('Newsletter ID is required');
}
      const response = await apiClient.get(`/newsletters/${id}`);
      return response.data as NewsletterDraft;
    },
    enabled: id !== null && id !== undefined && id !== '',
  });
}

// Hook for sending newsletter to parents
export function useSendNewsletter(): UseMutationResult<void, Error, { newsletterId: string; recipientEmails?: string[] }> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { newsletterId: string; recipientEmails?: string[] }>({
    mutationFn: async ({ newsletterId, recipientEmails }) => {
      await apiClient.post(`/newsletters/${newsletterId}/send`, {
        recipientEmails,
      });
    },
    onSuccess: (_, { newsletterId }) => {
      toast.success('Newsletter sent successfully!');
      void queryClient.invalidateQueries({ queryKey: ['newsletter', newsletterId] });
      void queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to send newsletter: ${(error instanceof Error ? error.message : String(error))}`);
    },
  });
}

// Hook for deleting a newsletter
export function useDeleteNewsletter(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/newsletters/${id}`);
    },
    onSuccess: () => {
      toast.success('Newsletter deleted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete newsletter: ${(error instanceof Error ? error.message : String(error))}`);
    },
  });
}

// Hook for fetching parent summaries for a student (legacy support)
export function useParentSummaries(studentId: number | undefined): UseQueryResult<ParentSummary[], Error> {
  return useQuery<ParentSummary[]>({
    queryKey: ['parent-summaries', studentId],
    queryFn: async () => {
      if (studentId === null || studentId === undefined) {
throw new Error('Student ID is required');
}
      const response = await apiClient.get(`/parent-summaries/student/${studentId}`);
      return response.data as ParentSummary[];
    },
    enabled: studentId !== null && studentId !== undefined,
  });
}

// Export all hooks
export const useNewsletterData = {
  useStudents,
  useGenerateNewsletter,
  useRegenerateNewsletter,
  useSaveNewsletterDraft,
  useNewsletterDrafts,
  useNewsletter,
  useSendNewsletter,
  useDeleteNewsletter,
  useParentSummaries,
};