import type { Newsletter } from '../../../types';
import { apiClient } from '../../core/client';

// API endpoints
export const newsletterApi = {
  // Get newsletter by ID
  getNewsletter: async (id: number, type: 'raw' | 'polished' = 'raw') => {
    const { data } = await apiClient.get<Newsletter>(`/api/newsletters/${id}`, {
      params: { type },
    });
    return data;
  },

  // Create newsletter draft
  createDraft: async (input: {
    weekStart: string;
    weekEnd: string;
    items: { type: string; content: string }[];
  }) => {
    const { data } = await apiClient.post<Newsletter>('/api/newsletters/draft', input);
    return data;
  },

  // Create newsletter
  create: async (input: {
    weekStart: string;
    weekEnd: string;
    items: { type: string; content: string }[];
  }) => {
    const { data } = await apiClient.post<Newsletter>('/api/newsletters', input);
    return data;
  },

  // Generate newsletter
  generate: async (input: {
    weekStart: string;
    weekEnd: string;
    lessonsCompleted: string[];
    reflections: string[];
    achievements: string[];
    nextWeekPlans: string[];
  }) => {
    const { data } = await apiClient.post<{ content: string }>(
      '/api/newsletters/generate',
      input
    );
    return data;
  },

  // Get newsletter suggestions
  getSuggestions: async () => {
    const { data } = await apiClient.get<{ suggested: boolean }>('/api/newsletter-suggestions');
    return data;
  },
};