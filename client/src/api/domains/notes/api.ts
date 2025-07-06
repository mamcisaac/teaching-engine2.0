import type { ReflectionJournalEntry, ReflectionInput, ReflectionUpdate } from '../../../types';
import { apiClient } from '../../core/client';

// API endpoints
export const notesApi = {
  // Journal entries
  journal: {
    // Get all journal entries
    getAll: async (params?: {
      themeId?: number;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }): Promise<ReflectionJournalEntry[]> => {
      const { data } = await apiClient.get<ReflectionJournalEntry[]>('/api/notes/journal', {
        params,
      });
      return data;
    },

    // Get journal entry by ID
    getById: async (id: number): Promise<ReflectionJournalEntry> => {
      const { data } = await apiClient.get<ReflectionJournalEntry>(`/api/notes/journal/${id}`);
      return data;
    },

    // Create journal entry
    create: async (input: ReflectionInput): Promise<ReflectionJournalEntry> => {
      const { data } = await apiClient.post<ReflectionJournalEntry>('/api/notes/journal', input);
      return data;
    },

    // Update journal entry
    update: async (id: number, input: ReflectionUpdate): Promise<ReflectionJournalEntry> => {
      const { data } = await apiClient.put<ReflectionJournalEntry>(`/api/notes/journal/${id}`, input);
      return data;
    },

    // Delete journal entry
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/notes/journal/${id}`);
    },

    // Search journal entries
    search: async (query: string): Promise<ReflectionJournalEntry[]> => {
      const { data } = await apiClient.get<ReflectionJournalEntry[]>('/api/notes/journal/search', {
        params: { q: query },
      });
      return data;
    },
  },

  // Quick notes
  quick: {
    // Get all quick notes
    getAll: async (): Promise<{
      id: number;
      content: string;
      createdAt: string;
      updatedAt: string;
      tags?: string[];
    }[]> => {
      const { data } = await apiClient.get<{
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        tags?: string[];
      }[]>('/api/notes/quick');
      return data;
    },

    // Create quick note
    create: async (input: { content: string; tags?: string[] }): Promise<{
      id: number;
      content: string;
      createdAt: string;
      updatedAt: string;
      tags?: string[];
    }> => {
      const { data } = await apiClient.post<{
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        tags?: string[];
      }>('/api/notes/quick', input);
      return data;
    },

    // Update quick note
    update: async (id: number, input: { content?: string; tags?: string[] }): Promise<{
      id: number;
      content: string;
      createdAt: string;
      updatedAt: string;
      tags?: string[];
    }> => {
      const { data } = await apiClient.put<{
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        tags?: string[];
      }>(`/api/notes/quick/${id}`, input);
      return data;
    },

    // Delete quick note
    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/api/notes/quick/${id}`);
    },
  },

  // Tags
  tags: {
    // Get all tags used in notes
    getAll: async (): Promise<{
      name: string;
      count: number;
    }[]> => {
      const { data } = await apiClient.get<{
        name: string;
        count: number;
      }[]>('/api/notes/tags');
      return data;
    },

    // Get notes by tag
    getByTag: async (tag: string): Promise<{
      journal: ReflectionJournalEntry[];
      quick: {
        id: number;
        content: string;
        createdAt: string;
        tags: string[];
      }[];
    }> => {
      const { data } = await apiClient.get<{
        journal: ReflectionJournalEntry[];
        quick: {
          id: number;
          content: string;
          createdAt: string;
          tags: string[];
        }[];
      }>(`/api/notes/tags/${encodeURIComponent(tag)}`);
      return data;
    },
  },

  // Export
  export: {
    // Export notes as PDF
    pdf: async (params: {
      type: 'journal' | 'quick' | 'all';
      startDate?: string;
      endDate?: string;
      themeId?: number;
    }): Promise<Blob> => {
      const response = await apiClient.get<Blob>('/api/notes/export/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },

    // Export notes as markdown
    markdown: async (params: {
      type: 'journal' | 'quick' | 'all';
      startDate?: string;
      endDate?: string;
      themeId?: number;
    }): Promise<{ content: string }> => {
      const { data } = await apiClient.get<{ content: string }>('/api/notes/export/markdown', {
        params,
      });
      return data;
    },
  },
};