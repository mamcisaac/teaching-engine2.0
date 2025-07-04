import { apiClient } from '../../core/client';
import type { TeacherPreferencesInput, TeacherReflection, TeacherReflectionInput } from '../../../types';

// API endpoints
export const teacherApi = {
  // Preferences
  preferences: {
    // Get teacher preferences
    get: async () => {
      const { data } = await apiClient.get<TeacherPreferencesInput>('/api/teacher/preferences');
      return data;
    },

    // Update teacher preferences
    update: async (input: Partial<TeacherPreferencesInput>) => {
      const { data } = await apiClient.put<TeacherPreferencesInput>('/api/teacher/preferences', input);
      return data;
    },
  },

  // Reflections
  reflections: {
    // Get all teacher reflections
    getAll: async () => {
      const { data } = await apiClient.get<TeacherReflection[]>('/api/teacher/reflections');
      return data;
    },

    // Get teacher reflection by ID
    getById: async (id: number) => {
      const { data } = await apiClient.get<TeacherReflection>(`/api/teacher/reflections/${id}`);
      return data;
    },

    // Create teacher reflection
    create: async (input: TeacherReflectionInput) => {
      const { data } = await apiClient.post<TeacherReflection>('/api/teacher/reflections', input);
      return data;
    },

    // Update teacher reflection
    update: async (id: number, input: Partial<TeacherReflectionInput>) => {
      const { data } = await apiClient.put<TeacherReflection>(`/api/teacher/reflections/${id}`, input);
      return data;
    },

    // Delete teacher reflection
    delete: async (id: number) => {
      const { data } = await apiClient.delete(`/api/teacher/reflections/${id}`);
      return data;
    },
  },

  // Dashboard data
  dashboard: {
    // Get dashboard statistics
    getStats: async () => {
      const { data } = await apiClient.get<{
        totalStudents: number;
        totalLessonPlans: number;
        upcomingEvents: number;
        recentActivity: Array<{
          id: string;
          type: string;
          description: string;
          timestamp: string;
        }>;
      }>('/api/teacher/dashboard/stats');
      return data;
    },

    // Get recent activity
    getRecentActivity: async (limit: number = 10) => {
      const { data } = await apiClient.get<Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        metadata?: Record<string, unknown>;
      }>>('/api/teacher/dashboard/activity', {
        params: { limit },
      });
      return data;
    },
  },

  // Profile
  profile: {
    // Get teacher profile
    get: async () => {
      const { data } = await apiClient.get<{
        id: number;
        name: string;
        email: string;
        schoolBoard?: string;
        school?: string;
        grade?: number;
        createdAt: string;
        updatedAt: string;
      }>('/api/teacher/profile');
      return data;
    },

    // Update teacher profile
    update: async (input: {
      name?: string;
      schoolBoard?: string;
      school?: string;
      grade?: number;
    }) => {
      const { data } = await apiClient.put('/api/teacher/profile', input);
      return data;
    },
  },
};