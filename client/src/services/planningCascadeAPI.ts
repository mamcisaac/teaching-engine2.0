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
    
    // Transform API response to match frontend expectations
    const data = response.data;
    if (data && typeof data === 'object' && 'summary' in data) {
      const summary = (data as any).summary;
      return {
        ...data,
        statistics: {
          totalLessons: summary.totalLessons || 0,
          taughtLessons: summary.taughtLessons || 0,
          plannedLessons: (summary.totalLessons || 0) - (summary.taughtLessons || 0),
          overdueCount: summary.overdueLessons || 0,
          completionPercentage: summary.completionRate || 0
        }
      };
    }
    
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