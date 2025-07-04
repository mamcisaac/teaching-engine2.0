import { apiClient } from '../../core/client';
import type { Subject, CurriculumExpectation, ThematicUnit } from '../../../types';

// API endpoints
export const curriculumApi = {
  // Subjects
  getSubjects: async () => {
    const { data } = await apiClient.get<Subject[]>('/api/subjects');
    return data;
  },

  getSubject: async (id: number) => {
    const { data } = await apiClient.get<Subject>(`/api/subjects/${id}`);
    return data;
  },

  createSubject: async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Subject>('/api/subjects', subject);
    return data;
  },

  updateSubject: async ({ id, ...subject }: Subject) => {
    const { data } = await apiClient.put<Subject>(`/api/subjects/${id}`, subject);
    return data;
  },

  deleteSubject: async (id: number) => {
    await apiClient.delete(`/api/subjects/${id}`);
  },

  // Curriculum Expectations
  getCurriculumExpectations: async (filters?: {
    subjectId?: number;
    grade?: number;
    strand?: string;
    keyword?: string;
  }) => {
    const { data } = await apiClient.get<CurriculumExpectation[]>('/api/curriculum-expectations', {
      params: filters,
    });
    return data;
  },

  getCurriculumExpectation: async (id: number) => {
    const { data } = await apiClient.get<CurriculumExpectation>(`/api/curriculum-expectations/${id}`);
    return data;
  },

  createCurriculumExpectation: async (expectation: Omit<CurriculumExpectation, 'id'>) => {
    const { data } = await apiClient.post<CurriculumExpectation>('/api/curriculum-expectations', expectation);
    return data;
  },

  updateCurriculumExpectation: async ({ id, ...expectation }: CurriculumExpectation) => {
    const { data } = await apiClient.put<CurriculumExpectation>(`/api/curriculum-expectations/${id}`, expectation);
    return data;
  },

  deleteCurriculumExpectation: async (id: number) => {
    await apiClient.delete(`/api/curriculum-expectations/${id}`);
  },

  // Thematic Units
  getThematicUnits: async (filters?: {
    grade?: number;
    subject?: string;
    theme?: string;
    userId?: number;
  }) => {
    const { data } = await apiClient.get<ThematicUnit[]>('/api/thematic-units', {
      params: filters,
    });
    return data;
  },

  getThematicUnit: async (id: number) => {
    const { data } = await apiClient.get<ThematicUnit>(`/api/thematic-units/${id}`);
    return data;
  },

  createThematicUnit: async (unit: Omit<ThematicUnit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<ThematicUnit>('/api/thematic-units', unit);
    return data;
  },

  updateThematicUnit: async ({ id, ...unit }: ThematicUnit) => {
    const { data } = await apiClient.put<ThematicUnit>(`/api/thematic-units/${id}`, unit);
    return data;
  },

  deleteThematicUnit: async (id: number) => {
    await apiClient.delete(`/api/thematic-units/${id}`);
  },

  duplicateThematicUnit: async (id: number) => {
    const { data } = await apiClient.post<ThematicUnit>(`/api/thematic-units/${id}/duplicate`);
    return data;
  },

  // Import/Export
  importCurriculum: async (file: File, format: 'csv' | 'pdf' | 'docx') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const { data } = await apiClient.post<{
      imported: number;
      failed: number;
      errors?: string[];
    }>('/api/curriculum/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  exportCurriculum: async (filters: {
    subjectIds?: number[];
    grades?: number[];
    format: 'csv' | 'pdf' | 'json';
  }) => {
    const { data } = await apiClient.post('/api/curriculum/export', filters, {
      responseType: 'blob',
    });
    return data;
  },

  // Strands and topics
  getStrands: async (subjectId: number) => {
    const { data } = await apiClient.get<string[]>(`/api/subjects/${subjectId}/strands`);
    return data;
  },

  getTopics: async (subjectId: number, strand: string) => {
    const { data } = await apiClient.get<string[]>(`/api/subjects/${subjectId}/strands/${strand}/topics`);
    return data;
  },

  // Search
  searchCurriculum: async (query: string, options?: {
    subjects?: string[];
    grades?: number[];
    strands?: string[];
  }) => {
    const { data } = await apiClient.get<{
      expectations: CurriculumExpectation[];
      units: ThematicUnit[];
    }>('/api/curriculum/search', {
      params: { q: query, ...options },
    });
    return data;
  },
};