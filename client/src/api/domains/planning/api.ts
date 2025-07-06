/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { 
  YearPlanEntry, 
  DailyPlan, 
  MaterialList,
  LessonPlan,
  PlannerSuggestion
} from '../../../types';
import { apiClient } from '../../core/client';
import { getWeekStartISO } from '../../core/utils';

// API endpoints
export const planningApi = {
  // Year Plan
  getYearPlan: async (teacherId: number, year: number) => {
    const { data } = await apiClient.get<YearPlanEntry[]>(`/api/year-plan/${teacherId}/${year}`);
    return data;
  },

  shareYearPlan: async (input: { recipientEmail: string; yearPlan: YearPlanEntry[] }) => {
    const { data } = await apiClient.post('/api/year-plan/share', input);
    return data;
  },

  // Daily Plans
  getDailyPlan: async (date: string) => {
    const { data } = await apiClient.get<DailyPlan>(`/api/daily-plans/${date}`);
    return data;
  },

  updateDailyPlan: async (input: DailyPlan) => {
    const { data } = await apiClient.put<DailyPlan>(`/api/daily-plans/${input.date}`, input);
    return data;
  },

  generateDailyPlan: async (input: { date: string; subjects: string[]; duration: number }) => {
    const { data } = await apiClient.post<DailyPlan>('/api/daily-plans/generate', input);
    return data;
  },

  // Lesson Plans
  getLessonPlan: async (weekStart: string) => {
    const { data } = await apiClient.get<LessonPlan>(`/api/lesson-plans/${weekStart}`);
    return data;
  },

  generateLessonPlan: async (input: { 
    weekStart: string; 
    subjects: string[]; 
    theme?: string 
  }) => {
    const { data } = await apiClient.post<LessonPlan>('/api/lesson-plans/generate', input);
    return data;
  },

  // Materials
  getMaterialList: async (weekStart: string) => {
    const { data } = await apiClient.get<MaterialList>(`/api/materials/${weekStart}`);
    return data;
  },

  getMaterialDetails: async (weekStart: string) => {
    const { data } = await apiClient.get<{ items: { category: string; items: string[] }[] }>(
      `/api/materials/${weekStart}/details`
    );
    return data;
  },

  // Planner Suggestions
  getPlannerSuggestions: async (weekStart: string, filters?: Record<string, boolean>) => {
    const { data } = await apiClient.get<PlannerSuggestion[]>('/api/planner-suggestions', {
      params: { weekStart, ...filters },
    });
    return data;
  },

  // Resources (deprecated - using ETFO lesson plans now)
  deleteResource: async (id: number) => {
    await apiClient.delete(`/api/resources/${id}`);
  },

  // Printables
  downloadPrintables: async (weekStart: string) => apiClient.get(`/printables?weekStart=${weekStart}`, {
      responseType: 'blob',
    }),
};