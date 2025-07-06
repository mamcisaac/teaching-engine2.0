import type { 
  ParentMessage, 
  ParentMessageInput, 
  ParentSummary, 
  GenerateParentSummaryRequest, 
  SaveParentSummaryRequest, 
  ParentSummaryGeneration 
} from '../../../types';
import { apiClient } from '../../core/client';

// API endpoints
export const parentApi = {
  // Parent Messages
  messages: {
    // Get all parent messages
    getAll: async () => {
      const { data } = await apiClient.get<ParentMessage[]>('/api/parent-messages');
      return data;
    },

    // Get parent message by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<ParentMessage>(`/api/parent-messages/${id}`);
      return data;
    },

    // Create parent message
    create: async (input: ParentMessageInput) => {
      const { data } = await apiClient.post<ParentMessage>('/api/parent-messages', input);
      return data;
    },

    // Update parent message
    update: async (id: number, input: Partial<ParentMessageInput>) => {
      const { data } = await apiClient.put<ParentMessage>(`/api/parent-messages/${id}`, input);
      return data;
    },

    // Delete parent message
    delete: async (id: number) => {
      const { data } = await apiClient.delete(`/api/parent-messages/${id}`);
      return data;
    },
  },

  // Parent Summaries
  summaries: {
    // Get all parent summaries for a student
    getByStudent: async (studentId: number) => {
      const { data } = await apiClient.get<ParentSummary[]>(
        `/api/students/${studentId}/parent-summaries`
      );
      return data;
    },

    // Get parent summary by ID
    getById: async (studentId: number, summaryId: number) => {
      const { data } = await apiClient.get<ParentSummary>(
        `/api/students/${studentId}/parent-summaries/${summaryId}`
      );
      return data;
    },

    // Generate parent summary
    generate: async (request: GenerateParentSummaryRequest) => {
      const { data } = await apiClient.post<ParentSummaryGeneration>(
        `/api/students/${request.studentId}/parent-summaries/generate`,
        {
          from: request.from,
          to: request.to,
          focus: request.focus,
        }
      );
      return data;
    },

    // Save parent summary
    save: async (request: SaveParentSummaryRequest) => {
      const { data } = await apiClient.post<ParentSummary>(
        `/api/students/${request.studentId}/parent-summaries`,
        {
          dateFrom: request.dateFrom,
          dateTo: request.dateTo,
          focus: request.focus,
          contentFr: request.contentFr,
          contentEn: request.contentEn,
          isDraft: request.isDraft,
        }
      );
      return data;
    },

    // Update parent summary
    update: async (studentId: number, summaryId: number, input: Partial<SaveParentSummaryRequest>) => {
      const { data } = await apiClient.put<ParentSummary>(
        `/api/students/${studentId}/parent-summaries/${summaryId}`,
        input
      );
      return data;
    },

    // Delete parent summary
    delete: async (studentId: number, summaryId: number) => {
      const { data } = await apiClient.delete(
        `/api/students/${studentId}/parent-summaries/${summaryId}`
      );
      return data;
    },

    // Send parent summary via email
    send: async (studentId: number, summaryId: number) => {
      const { data } = await apiClient.post(
        `/api/students/${studentId}/parent-summaries/${summaryId}/send`
      );
      return data;
    },
  },
};