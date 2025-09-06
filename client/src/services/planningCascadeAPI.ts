/**
 * Planning Cascade API Service
 * Client-side API calls for emergency planning features
 */

import { apiClient } from '../api/core/client';

export interface LessonSearchResult {
  id: string;
  name: string;
  subject: string;
  grade: number;
  date: Date;
  whenIsProbablyScheduled: string;
  whatUnitIsItIn: string;
  didIAlreadyTeachIt: boolean;
  status: string;
  duration: number;
  activities: string[];
  materials: string[];
  isSubFriendly: boolean;
  subNotes?: string;
}

export interface CoverageGaps {
  mustTeachToday: string[];
  canFudgeOnReportCard: string[];
  parentWillNotice: string[];
  stats: {
    totalUntaught: number;
    overdueCount: number;
    daysUntilReportCard: number;
    subjectGaps: Record<string, number>;
  };
}

export interface SupplyPlanResponse {
  plan: string;
  date: string;
  lessonCount: number;
}

export const planningCascadeAPI = {
  /**
   * Get the full planning cascade tree
   */
  async getCascade(): Promise<unknown> {
    const response = await apiClient.get('/api/planning-cascade/cascade');
    return response.data;
  },

  /**
   * Search for lessons using panic mode fuzzy search
   */
  async searchLessons(
    query: string,
    options?: {
      subject?: string;
      grade?: number;
      limit?: number;
    }
  ): Promise<{ results: LessonSearchResult[]; count: number; searchTime: number }> {
    const params = new URLSearchParams({
      query,
      ...(options?.subject && { subject: options.subject }),
      ...(options?.grade && { grade: options.grade.toString() }),
      ...(options?.limit && { limit: options.limit.toString() })
    });
    
    const response = await apiClient.get(`/api/planning-cascade/search?${params}`);
    return response.data;
  },

  /**
   * Update lesson status (taught/skipped/rescheduled)
   */
  async updateLessonStatus(
    lessonId: string,
    status: 'PLANNED' | 'TAUGHT' | 'SKIPPED' | 'RESCHEDULED',
    options?: {
      taughtDate?: string;
      skippedReason?: string;
    }
  ): Promise<{ success: boolean; lesson: LessonSearchResult }> {
    const response = await apiClient.patch(
      `/api/planning-cascade/${lessonId}/status`,
      {
        status,
        ...options
      }
    );
    return response.data;
  },

  /**
   * Get coverage gaps for report card preparation
   */
  async getCoverageGaps(
    reportCardDate: Date,
    includeOptional?: boolean
  ): Promise<CoverageGaps> {
    const params = new URLSearchParams({
      reportCardDate: reportCardDate.toISOString(),
      ...(includeOptional && { includeOptional: 'true' })
    });
    
    const response = await apiClient.get(`/api/planning-cascade/coverage-gaps?${params}`);
    return response.data;
  },

  /**
   * Generate emergency supply teacher plan
   */
  async generateSupplyPlan(date?: Date): Promise<SupplyPlanResponse> {
    const response = await apiClient.post('/api/planning-cascade/supply-plan', {
      date: date?.toISOString()
    });
    return response.data;
  }
};