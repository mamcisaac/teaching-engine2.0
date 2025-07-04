import { apiClient } from '../../core/client';

export interface CognatePair {
  id: number;
  userId: number;
  englishWord: string;
  frenchWord: string;
  category?: string;
  notes?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CognateInput {
  englishWord: string;
  frenchWord: string;
  category?: string;
  notes?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CognateFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  verified?: boolean;
}

export interface CognateStats {
  totalCognates: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  verifiedCount: number;
}

// API endpoints
export const cognateApi = {
  // Get all cognate pairs
  getCognates: async (userId?: number, filters?: CognateFilters) => {
    const { data } = await apiClient.get<CognatePair[]>('/api/cognates', {
      params: { userId, ...filters },
    });
    return data;
  },

  // Get single cognate pair
  getCognate: async (id: number) => {
    const { data } = await apiClient.get<CognatePair>(`/api/cognates/${id}`);
    return data;
  },

  // Create new cognate pair
  createCognate: async (cognate: CognateInput) => {
    const { data } = await apiClient.post<CognatePair>('/api/cognates', cognate);
    return data;
  },

  // Update cognate pair
  updateCognate: async (id: number, updates: Partial<CognateInput>) => {
    const { data } = await apiClient.put<CognatePair>(`/api/cognates/${id}`, updates);
    return data;
  },

  // Delete cognate pair
  deleteCognate: async (id: number) => {
    await apiClient.delete(`/api/cognates/${id}`);
  },

  // Bulk create cognate pairs
  bulkCreateCognates: async (cognates: CognateInput[]) => {
    const { data } = await apiClient.post<{ created: CognatePair[]; failed: unknown[] }>(
      '/api/cognates/bulk',
      { cognates }
    );
    return data;
  },

  // Verify cognate pair
  verifyCognate: async (id: number, verified: boolean) => {
    const { data } = await apiClient.patch<CognatePair>(`/api/cognates/${id}/verify`, {
      verified,
    });
    return data;
  },

  // Search cognates
  searchCognates: async (query: string, filters?: CognateFilters) => {
    const { data } = await apiClient.get<CognatePair[]>('/api/cognates/search', {
      params: { q: query, ...filters },
    });
    return data;
  },

  // Get cognate suggestions
  getSuggestions: async (word: string, language: 'english' | 'french') => {
    const { data } = await apiClient.get<string[]>('/api/cognates/suggestions', {
      params: { word, language },
    });
    return data;
  },

  // Get random cognate pairs for practice
  getRandomCognates: async (count: number = 10, filters?: CognateFilters) => {
    const { data } = await apiClient.get<CognatePair[]>('/api/cognates/random', {
      params: { count, ...filters },
    });
    return data;
  },

  // Get cognate statistics
  getStats: async (userId?: number) => {
    const { data } = await apiClient.get<CognateStats>('/api/cognates/stats', {
      params: { userId },
    });
    return data;
  },

  // Get cognate categories
  getCategories: async () => {
    const { data } = await apiClient.get<string[]>('/api/cognates/categories');
    return data;
  },

  // Import cognates from file
  importCognates: async (file: File, format: 'csv' | 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const { data } = await apiClient.post<{
      imported: number;
      failed: number;
      errors?: string[];
    }>('/api/cognates/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Export cognates
  exportCognates: async (format: 'csv' | 'json', filters?: CognateFilters) => {
    const { data } = await apiClient.get('/api/cognates/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return data;
  },

  // Check if cognate pair already exists
  checkExists: async (englishWord: string, frenchWord: string) => {
    const { data } = await apiClient.get<{ exists: boolean; cognate?: CognatePair }>(
      '/api/cognates/check',
      {
        params: { englishWord, frenchWord },
      }
    );
    return data;
  },

  // Practice session endpoints
  startPracticeSession: async (filters?: CognateFilters) => {
    const { data } = await apiClient.post<{
      sessionId: string;
      cognates: CognatePair[];
    }>('/api/cognates/practice/start', filters);
    return data;
  },

  submitPracticeAnswer: async (sessionId: string, cognateId: number, correct: boolean) => {
    const { data } = await apiClient.post<{
      correct: boolean;
      nextCognate?: CognatePair;
    }>(`/api/cognates/practice/${sessionId}/answer`, {
      cognateId,
      correct,
    });
    return data;
  },

  getPracticeStats: async (sessionId: string) => {
    const { data } = await apiClient.get<{
      totalAnswered: number;
      correctAnswers: number;
      accuracy: number;
      timeSpent: number;
    }>(`/api/cognates/practice/${sessionId}/stats`);
    return data;
  },
};