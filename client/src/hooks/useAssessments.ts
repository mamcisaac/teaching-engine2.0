import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import type { AssessmentTemplate, AssessmentResult } from '../types';

// Fetch all assessment templates
export function useAssessmentTemplates() {
  return useQuery({
    queryKey: ['assessmentTemplates'],
    queryFn: async () => {
      const response = await api.get('/api/assessments/templates');
      return response.data as AssessmentTemplate[];
    },
  });
}

// Fetch a single assessment template
export function useAssessmentTemplate(id: string) {
  return useQuery({
    queryKey: ['assessmentTemplates', id],
    queryFn: async () => {
      const response = await api.get(`/api/assessments/templates/${id}`);
      return response.data as AssessmentTemplate;
    },
    enabled: !!id,
  });
}

// Create assessment template
export function useCreateAssessmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Partial<AssessmentTemplate>) => {
      const response = await api.post('/api/assessments/templates', template);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates'] });
    },
  });
}

// Update assessment template
export function useUpdateAssessmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<AssessmentTemplate> & { id: string }) => {
      const response = await api.put(`/api/assessments/templates/${id}`, template);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates'] });
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates', id] });
    },
  });
}

// Delete assessment template
export function useDeleteAssessmentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/assessments/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates'] });
    },
  });
}

// Fetch assessment results
export function useAssessmentResults(templateId?: string) {
  return useQuery({
    queryKey: ['assessmentResults', templateId],
    queryFn: async () => {
      const params = templateId ? `?templateId=${templateId}` : '';
      const response = await api.get(`/api/assessments/results${params}`);
      return response.data as AssessmentResult[];
    },
  });
}

// Create assessment result
export function useCreateAssessmentResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: Partial<AssessmentResult>) => {
      const response = await api.post('/api/assessments/results', result);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
      if (data.templateId) {
        queryClient.invalidateQueries({ queryKey: ['assessmentResults', data.templateId] });
      }
    },
  });
}

// Update assessment result
export function useUpdateAssessmentResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...result }: Partial<AssessmentResult> & { id: string }) => {
      const response = await api.put(`/api/assessments/results/${id}`, result);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
      if (data.templateId) {
        queryClient.invalidateQueries({ queryKey: ['assessmentResults', data.templateId] });
      }
    },
  });
}

// Delete assessment result
export function useDeleteAssessmentResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/assessments/results/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentResults'] });
    },
  });
}
