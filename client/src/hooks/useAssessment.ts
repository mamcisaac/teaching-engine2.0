import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../api/core/client';

export interface QuickAssessmentData {
  quickAssessment: 'thumbs-up' | 'thumbs-okay' | 'thumbs-down';
  quickAssessmentNotes?: string;
}

export interface DetailedReflectionData {
  studentEngagement?: 'high' | 'medium' | 'low';
  paceAssessment?: 'too-fast' | 'just-right' | 'too-slow';
  materialEffectiveness?: 'very-effective' | 'effective' | 'needs-improvement';
  wouldRepeat?: boolean;
  modificationNotes?: string;
}

export interface AssessmentStatsFilters {
  startDate?: string;
  endDate?: string;
  unitPlanId?: string;
  subject?: string;
  grade?: number;
}

export interface AssessmentStats {
  totalLessons: number;
  assessedLessons: number;
  assessmentBreakdown: {
    thumbsUp: number;
    thumbsOkay: number;
    thumbsDown: number;
  };
  wouldRepeatPercentage: number;
  engagementStats: {
    high: number;
    medium: number;
    low: number;
  };
  paceStats: {
    tooFast: number;
    justRight: number;
    tooSlow: number;
  };
  recentAssessments: Array<{
    id: string;
    title: string;
    date: string;
    quickAssessment: string;
    quickAssessmentNotes?: string;
    assessedAt: string;
    unitPlanTitle?: string;
  }>;
}

// Hook for updating quick assessment
export function useQuickAssessment(lessonPlanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuickAssessmentData) => {
      const response = await apiClient.patch(
        `/api/etfo-lesson-plans/${lessonPlanId}/quick-assessment`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Quick assessment saved successfully');
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
    },
    onError: () => {
      toast.error('Failed to save quick assessment');
    },
  });
}

// Hook for updating detailed reflection
export function useDetailedReflection(lessonPlanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DetailedReflectionData) => {
      const response = await apiClient.patch(
        `/api/etfo-lesson-plans/${lessonPlanId}/detailed-reflection`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Detailed reflection saved successfully');
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
    },
    onError: () => {
      toast.error('Failed to save detailed reflection');
    },
  });
}

// Hook for fetching assessment statistics
export function useAssessmentStats(filters?: AssessmentStatsFilters) {
  return useQuery<AssessmentStats>({
    queryKey: ['assessment-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.unitPlanId) params.append('unitPlanId', filters.unitPlanId);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.grade) params.append('grade', filters.grade.toString());

      const response = await apiClient.get(`/api/etfo-lesson-plans/assessment-stats?${params}`);
      return response.data;
    },
  });
}

// Hook for bulk assessment update
export function useBulkAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { lessonIds: string[]; assessment: QuickAssessmentData }) => {
      const promises = data.lessonIds.map(id =>
        apiClient.patch(`/api/etfo-lesson-plans/${id}/quick-assessment`, data.assessment)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Bulk assessment saved successfully');
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-stats'] });
    },
    onError: () => {
      toast.error('Failed to save bulk assessment');
    },
  });
}