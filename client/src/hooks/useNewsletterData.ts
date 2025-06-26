import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { 
  NewsletterGenerationParams, 
  GeneratedNewsletter, 
  NewsletterDraft, 
  Student,
  ParentSummary
} from '../types/newsletter';
import { toast } from 'sonner';

// Hook for fetching all students
export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    },
  });
}

// Hook for generating newsletter content with AI
export function useGenerateNewsletter() {
  const queryClient = useQueryClient();

  return useMutation<GeneratedNewsletter, Error, NewsletterGenerationParams>({
    mutationFn: async (params) => {
      // For multi-student newsletters, we'll generate a comprehensive summary
      const response = await api.post('/newsletters/generate-newsletter', {
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
      return response.data;
    },
    onSuccess: () => {
      toast.success('Newsletter content generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to generate newsletter: ${error.message}`);
    },
  });
}

// Hook for regenerating newsletter content with variations
export function useRegenerateNewsletter() {
  return useMutation<GeneratedNewsletter, Error, {
    draft: NewsletterDraft;
    tone?: 'friendly' | 'formal' | 'informative';
  }>({
    mutationFn: async ({ draft, tone }) => {
      const response = await api.post('/newsletters/regenerate-newsletter', {
        sections: draft.sections,
        studentIds: draft.studentIds,
        from: draft.dateFrom,
        to: draft.dateTo,
        tone: tone || draft.tone,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Newsletter regenerated with new variations!');
    },
    onError: (error) => {
      toast.error(`Failed to regenerate newsletter: ${error.message}`);
    },
  });
}

// Hook for saving newsletter draft
export function useSaveNewsletterDraft() {
  const queryClient = useQueryClient();

  return useMutation<NewsletterDraft, Error, NewsletterDraft>({
    mutationFn: async (draft) => {
      const endpoint = draft.id 
        ? `/newsletters/${draft.id}` 
        : '/newsletters';
      
      const method = draft.id ? 'put' : 'post';
      
      const response = await api[method](endpoint, draft);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.isDraft ? 'Draft saved!' : 'Newsletter finalized!');
      queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
      queryClient.invalidateQueries({ queryKey: ['newsletter', data.id] });
    },
    onError: (error) => {
      toast.error(`Failed to save newsletter: ${error.message}`);
    },
  });
}

// Hook for fetching newsletter drafts
export function useNewsletterDrafts() {
  return useQuery<NewsletterDraft[]>({
    queryKey: ['newsletter-drafts'],
    queryFn: async () => {
      const response = await api.get('/newsletters?isDraft=true');
      return response.data;
    },
  });
}

// Hook for fetching a specific newsletter
export function useNewsletter(id: string | undefined) {
  return useQuery<NewsletterDraft>({
    queryKey: ['newsletter', id],
    queryFn: async () => {
      if (!id) throw new Error('Newsletter ID is required');
      const response = await api.get(`/newsletters/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Hook for sending newsletter to parents
export function useSendNewsletter() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { newsletterId: string; recipientEmails?: string[] }>({
    mutationFn: async ({ newsletterId, recipientEmails }) => {
      await api.post(`/newsletters/${newsletterId}/send`, {
        recipientEmails,
      });
    },
    onSuccess: (_, { newsletterId }) => {
      toast.success('Newsletter sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['newsletter', newsletterId] });
      queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to send newsletter: ${error.message}`);
    },
  });
}

// Hook for deleting a newsletter
export function useDeleteNewsletter() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/newsletters/${id}`);
    },
    onSuccess: () => {
      toast.success('Newsletter deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['newsletter-drafts'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete newsletter: ${error.message}`);
    },
  });
}

// Hook for fetching parent summaries for a student (legacy support)
export function useParentSummaries(studentId: number | undefined) {
  return useQuery<ParentSummary[]>({
    queryKey: ['parent-summaries', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      const response = await api.get(`/parent-summaries/student/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
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