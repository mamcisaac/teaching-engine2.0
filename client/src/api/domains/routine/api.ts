/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { apiClient } from '../../core/client';

export interface OralRoutineTemplate {
  id: number;
  userId: number;
  name: string;
  description?: string;
  category: 'greeting' | 'calendar' | 'weather' | 'counting' | 'question' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frenchContent: string;
  englishTranslation: string;
  audioUrl?: string;
  visualAids?: string[];
  estimatedDuration: number; // in minutes
  tags: string[];
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyOralRoutine {
  id: number;
  userId: number;
  date: string;
  templateId: number;
  template?: OralRoutineTemplate;
  status: 'planned' | 'completed' | 'skipped';
  actualDuration?: number;
  studentEngagement?: 'low' | 'medium' | 'high';
  notes?: string;
  adaptations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OralRoutineStats {
  totalRoutines: number;
  completedRoutines: number;
  averageDuration: number;
  averageEngagement: number;
  routinesByCategory: Record<string, number>;
  routinesByDifficulty: Record<string, number>;
  weeklyProgress: Array<{
    week: string;
    completed: number;
    planned: number;
  }>;
  engagementTrends: Array<{
    date: string;
    engagement: number;
  }>;
}

export interface ClassRoutine {
  id: number;
  name: string;
  type: 'entry' | 'transition' | 'exit' | 'emergency';
  steps: Array<{
    order: number;
    instruction: string;
    duration?: number;
    visualCue?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineFilters {
  category?: string;
  difficulty?: string;
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface RoutineTemplateInput {
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  frenchContent: string;
  englishTranslation: string;
  estimatedDuration: number;
  tags: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

export interface DailyRoutineInput {
  templateId: number;
  date: string;
  status?: string;
  actualDuration?: number;
  studentEngagement?: string;
  notes?: string;
  adaptations?: string;
}

// API endpoints
export const routineApi = {
  // Oral routine templates
  templates: {
    // Get all templates
    getAll: async (filters?: RoutineFilters) => {
      const { data } = await apiClient.get<OralRoutineTemplate[]>('/api/routines/templates', {
        params: filters,
      });
      return data;
    },

    // Get template by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<OralRoutineTemplate>(`/api/routines/templates/${id}`);
      return data;
    },

    // Create template
    create: async (template: RoutineTemplateInput) => {
      const { data } = await apiClient.post<OralRoutineTemplate>('/api/routines/templates', template);
      return data;
    },

    // Update template
    update: async (id: number, updates: Partial<RoutineTemplateInput>) => {
      const { data } = await apiClient.put<OralRoutineTemplate>(`/api/routines/templates/${id}`, updates);
      return data;
    },

    // Delete template
    delete: async (id: number) => {
      await apiClient.delete(`/api/routines/templates/${id}`);
    },

    // Duplicate template
    duplicate: async (id: number) => {
      const { data } = await apiClient.post<OralRoutineTemplate>(`/api/routines/templates/${id}/duplicate`);
      return data;
    },

    // Get public templates (from other teachers)
    getPublic: async (filters?: RoutineFilters) => {
      const { data } = await apiClient.get<OralRoutineTemplate[]>('/api/routines/templates/public', {
        params: filters,
      });
      return data;
    },

    // Import template from public library
    importFromPublic: async (templateId: number) => {
      const { data } = await apiClient.post<OralRoutineTemplate>(`/api/routines/templates/import/${templateId}`);
      return data;
    },
  },

  // Daily oral routines
  daily: {
    // Get daily routines
    getAll: async (filters?: RoutineFilters) => {
      const { data } = await apiClient.get<DailyOralRoutine[]>('/api/routines/daily', {
        params: filters,
      });
      return data;
    },

    // Get routine by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<DailyOralRoutine>(`/api/routines/daily/${id}`);
      return data;
    },

    // Get routines for specific date
    getByDate: async (date: string) => {
      const { data } = await apiClient.get<DailyOralRoutine[]>('/api/routines/daily/date', {
        params: { date },
      });
      return data;
    },

    // Create daily routine
    create: async (routine: DailyRoutineInput) => {
      const { data } = await apiClient.post<DailyOralRoutine>('/api/routines/daily', routine);
      return data;
    },

    // Update daily routine
    update: async (id: number, updates: Partial<DailyRoutineInput>) => {
      const { data } = await apiClient.put<DailyOralRoutine>(`/api/routines/daily/${id}`, updates);
      return data;
    },

    // Delete daily routine
    delete: async (id: number) => {
      await apiClient.delete(`/api/routines/daily/${id}`);
    },

    // Mark routine as completed
    markCompleted: async (id: number, data: {
      actualDuration?: number;
      studentEngagement?: 'low' | 'medium' | 'high';
      notes?: string;
      adaptations?: string;
    }) => {
      const { data: result } = await apiClient.patch<DailyOralRoutine>(`/api/routines/daily/${id}/complete`, data);
      return result;
    },

    // Generate routine suggestions for date
    getSuggestions: async (date: string) => {
      const { data } = await apiClient.get<OralRoutineTemplate[]>('/api/routines/daily/suggestions', {
        params: { date },
      });
      return data;
    },

    // Bulk create routines for week
    createWeekly: async (startDate: string, templateIds: number[]) => {
      const { data } = await apiClient.post<DailyOralRoutine[]>('/api/routines/daily/bulk', {
        startDate,
        templateIds,
      });
      return data;
    },
  },

  // Class routines (non-oral)
  class: {
    // Get all class routines
    getAll: async () => {
      const { data } = await apiClient.get<ClassRoutine[]>('/api/routines/class');
      return data;
    },

    // Get routine by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<ClassRoutine>(`/api/routines/class/${id}`);
      return data;
    },

    // Create class routine
    create: async (routine: Omit<ClassRoutine, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<ClassRoutine>('/api/routines/class', routine);
      return data;
    },

    // Update class routine
    update: async (id: number, updates: Partial<ClassRoutine>) => {
      const { data } = await apiClient.put<ClassRoutine>(`/api/routines/class/${id}`, updates);
      return data;
    },

    // Delete class routine
    delete: async (id: number) => {
      await apiClient.delete(`/api/routines/class/${id}`);
    },
  },

  // Statistics and analytics
  stats: {
    // Get routine statistics
    getStats: async (filters?: { startDate?: string; endDate?: string }) => {
      const { data } = await apiClient.get<OralRoutineStats>('/api/routines/stats', {
        params: filters,
      });
      return data;
    },

    // Get engagement trends
    getEngagementTrends: async (startDate: string, endDate: string) => {
      const { data } = await apiClient.get<Array<{
        date: string;
        engagement: number;
        routineCount: number;
      }>>('/api/routines/stats/engagement', {
        params: { startDate, endDate },
      });
      return data;
    },

    // Get completion rates
    getCompletionRates: async (period: 'week' | 'month' | 'quarter') => {
      const { data } = await apiClient.get<Array<{
        period: string;
        planned: number;
        completed: number;
        rate: number;
      }>>('/api/routines/stats/completion', {
        params: { period },
      });
      return data;
    },
  },

  // Audio and media
  media: {
    // Upload audio for routine
    uploadAudio: async (templateId: number, audioFile: File) => {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const { data } = await apiClient.post<{ audioUrl: string }>(
        `/api/routines/templates/${templateId}/audio`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },

    // Delete audio
    deleteAudio: async (templateId: number) => {
      await apiClient.delete(`/api/routines/templates/${templateId}/audio`);
    },

    // Upload visual aids
    uploadVisualAids: async (templateId: number, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('visuals', file));

      const { data } = await apiClient.post<{ visualAids: string[] }>(
        `/api/routines/templates/${templateId}/visuals`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    },
  },

  // Search and discovery
  search: async (query: string, type: 'templates' | 'daily' | 'class' = 'templates') => {
    const { data } = await apiClient.get<any[]>('/api/routines/search', {
      params: { q: query, type },
    });
    return data;
  },

  // Get routine categories
  getCategories: async () => {
    const { data } = await apiClient.get<string[]>('/api/routines/categories');
    return data;
  },

  // Get popular tags
  getTags: async () => {
    const { data } = await apiClient.get<Array<{ name: string; count: number }>>('/api/routines/tags');
    return data;
  },

  // Export routines
  export: async (filters?: RoutineFilters, format: 'csv' | 'pdf' | 'json' = 'csv') => {
    const { data } = await apiClient.get('/api/routines/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return data;
  },

  // Import routines
  import: async (file: File, format: 'csv' | 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const { data } = await apiClient.post<{
      imported: number;
      failed: number;
      errors?: string[];
    }>('/api/routines/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};