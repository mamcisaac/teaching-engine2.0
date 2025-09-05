/**
 * React Query Hook for Student Progress Data
 * Fetches and caches student progress information with performance optimization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../api/core/client';
import type {
  QuickProgressData,
  Assessment,
  ParentCommunicationHistory,
  ImprovementEvidence
} from '../utils/studentProgress';

// Query Keys
export const PROGRESS_QUERY_KEYS = {
  all: ['studentProgress'] as const,
  quick: (studentId: string) => [...PROGRESS_QUERY_KEYS.all, 'quick', studentId] as const,
  full: (studentId: string) => [...PROGRESS_QUERY_KEYS.all, 'full', studentId] as const,
  assessments: (studentId: string) => [...PROGRESS_QUERY_KEYS.all, 'assessments', studentId] as const,
  communications: (studentId: string) => [...PROGRESS_QUERY_KEYS.all, 'communications', studentId] as const,
  evidence: (studentId: string, subject: string) => 
    [...PROGRESS_QUERY_KEYS.all, 'evidence', studentId, subject] as const,
};

interface StudentProgressSummary {
  studentId: string;
  studentName: string;
  strengths: Array<{
    expectation: string;
    subject: string;
    level: 'MEETING' | 'EXCEEDING';
    lastAssessed: Date;
  }>;
  growthAreas: Array<{
    expectation: string;
    subject: string;
    level: 'NOT_YET' | 'APPROACHING';
    lastAssessed: Date;
  }>;
  recentNotes: Array<{
    note: string;
    date: Date;
    subject?: string;
  }>;
  summary: string;
  lastUpdated: Date;
}

interface ProgressReportOptions {
  includePrivate?: boolean;
  startDate?: Date;
  endDate?: Date;
  subject?: string;
}

/**
 * Hook to fetch quick progress summary (optimized for < 2 second load)
 */
export function useQuickProgress(studentId: string) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.quick(studentId),
    queryFn: async (): Promise<QuickProgressData> => {
      const startTime = Date.now();
      
      try {
        // Add timeout to ensure < 2 second response
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1800); // 1.8 seconds to leave buffer
        
        const response = await apiClient.get(`/students/${studentId}/progress-summary`, {
          signal: controller.signal
        });
        clearTimeout(timeout);
        const data = response.data;
        
        return {
          ...data,
          loadTimeMs: Date.now() - startTime
        };
      } catch (error) {
        // Fallback to local computation if API fails
        console.error('Failed to fetch quick progress:', error);
        
        // Try to get from cached assessments
        const assessments = await apiClient.get(`/student-assessments?studentId=${studentId}&limit=20`);
        
        const strengths: string[] = [];
        const growthAreas: string[] = [];
        const recentNotes: string[] = [];
        
        assessments.data.forEach((assessment: any) => {
          if (!assessment.isAnecdotal) {
            if (assessment.level === 'MEETING' || assessment.level === 'EXCEEDING') {
              strengths.push(assessment.title);
            } else {
              growthAreas.push(assessment.title);
            }
          }
          if (assessment.notes) {
            recentNotes.push(assessment.notes);
          }
        });
        
        const studentName = 'Student'; // Would get from student data
        return {
          oneLiner: `${studentName} is progressing well in ${strengths[0] || 'several areas'}.`,
          safeToShare: true,
          strengths: strengths.slice(0, 3),
          growthAreas: growthAreas.slice(0, 3),
          recentNotes: recentNotes.slice(0, 5),
          loadTimeMs: Date.now() - startTime
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!studentId,
  });
}

/**
 * Hook to fetch full student progress data
 */
export function useStudentProgress(studentId: string, options: ProgressReportOptions = {}) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.full(studentId),
    queryFn: async (): Promise<StudentProgressSummary> => {
      const params = new URLSearchParams();
      
      if (options.startDate) {
        params.append('startDate', options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append('endDate', options.endDate.toISOString());
      }
      if (options.subject) {
        params.append('subject', options.subject);
      }
      if (options.includePrivate) {
        params.append('includePrivate', 'true');
      }
      
      const [studentData, progressData, assessmentData] = await Promise.all([
        apiClient.get(`/students/${studentId}`),
        apiClient.get(`/mastery/student/${studentId}?${params.toString()}`),
        apiClient.get(`/student-assessments?studentId=${studentId}&${params.toString()}&limit=50`)
      ]);
      
      const student = studentData.data;
      const progress = progressData.data;
      const assessments = assessmentData.data.filter((a: any) => !a.isAnecdotal);
      
      // Process strengths and growth areas
      const strengths = assessments
        .filter((a: any) => a.level === 'MEETING' || a.level === 'EXCEEDING')
        .map((a: any) => ({
          expectation: a.title,
          subject: a.subject,
          level: a.level,
          lastAssessed: new Date(a.date)
        }));
      
      const growthAreas = assessments
        .filter((a: any) => a.level === 'NOT_YET' || a.level === 'APPROACHING')
        .map((a: any) => ({
          expectation: a.title,
          subject: a.subject,
          level: a.level,
          lastAssessed: new Date(a.date)
        }));
      
      // Get recent notes
      const recentNotes = assessments
        .filter((a: any) => a.notes)
        .slice(0, 5)
        .map((a: any) => ({
          note: a.notes,
          date: new Date(a.date),
          subject: a.subject
        }));
      
      // Generate summary
      const studentName = `${student.firstName} ${student.lastName}`;
      let summary = `${studentName} `;
      
      if (strengths.length > 0) {
        summary += `shows strength in ${strengths.slice(0, 2).map((s: { expectation: string }) => s.expectation).join(' and ')}`;
      }
      
      if (growthAreas.length > 0) {
        summary += strengths.length > 0 ? ', and is ' : 'is ';
        summary += `working on ${growthAreas.slice(0, 2).map((g: { expectation: string }) => g.expectation).join(' and ')}`;
      }
      
      summary += '.';
      
      return {
        studentId,
        studentName,
        strengths,
        growthAreas,
        recentNotes,
        summary,
        lastUpdated: new Date()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studentId,
  });
}

/**
 * Hook to fetch student assessments
 */
export function useStudentAssessments(studentId: string, limit = 20) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.assessments(studentId),
    queryFn: async (): Promise<Assessment[]> => {
      const response = await apiClient.get(
        `/student-assessments?studentId=${studentId}&limit=${limit}&excludeAnecdotal=true`
      );
      
      return response.data.map((a: any) => ({
        id: a.id,
        studentId: a.studentId,
        expectation: a.title,
        subject: a.subject,
        level: a.level,
        notes: a.notes,
        date: new Date(a.date),
        isAnecdotal: a.isAnecdotal
      }));
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: !!studentId,
  });
}

/**
 * Hook to fetch parent communication history
 */
export function useParentCommunications(studentId: string) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.communications(studentId),
    queryFn: async (): Promise<ParentCommunicationHistory> => {
      try {
        const response = await apiClient.get(`/students/${studentId}/communications`);
        return response.data;
      } catch (error) {
        // Return empty history if not available
        return {
          previousReports: [],
          lastToldThem: '',
          contradictions: []
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studentId,
  });
}

/**
 * Hook to fetch improvement evidence
 */
export function useImprovementEvidence(studentId: string, subject: string) {
  return useQuery({
    queryKey: PROGRESS_QUERY_KEYS.evidence(studentId, subject),
    queryFn: async (): Promise<ImprovementEvidence> => {
      const response = await apiClient.get(
        `/students/${studentId}/evidence?subject=${encodeURIComponent(subject)}`
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!studentId && !!subject,
  });
}

/**
 * Mutation to save parent communication record
 */
export function useSaveParentCommunication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      studentId,
      summary,
      type,
      sharedWith
    }: {
      studentId: string;
      summary: string;
      type: 'verbal' | 'written' | 'report';
      sharedWith: string;
    }) => {
      const response = await apiClient.post(`/students/${studentId}/communications`, {
        summary,
        type,
        sharedWith,
        date: new Date().toISOString()
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate communications cache
      queryClient.invalidateQueries({
        queryKey: PROGRESS_QUERY_KEYS.communications(variables.studentId)
      });
    }
  });
}

/**
 * Mutation to generate parent report PDF
 */
export function useGenerateParentReport() {
  return useMutation({
    mutationFn: async ({
      studentId,
      includePrivate = false
    }: {
      studentId: string;
      includePrivate?: boolean;
    }) => {
      const response = await apiClient.get(
        `/reports/student/${studentId}?includePrivate=${includePrivate}`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress_report_${studentId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    }
  });
}

/**
 * Prefetch progress data for quick access
 */
export function usePrefetchProgress() {
  const queryClient = useQueryClient();
  
  return async (studentId: string) => {
    await queryClient.prefetchQuery({
      queryKey: PROGRESS_QUERY_KEYS.quick(studentId),
      queryFn: async () => {
        const response = await apiClient.get(`/students/${studentId}/progress-summary`);
        return response.data;
      },
      staleTime: 2 * 60 * 1000,
    });
  };
}

// Export all hooks for convenience
export const studentProgressHooks = {
  useQuickProgress,
  useStudentProgress,
  useStudentAssessments,
  useParentCommunications,
  useImprovementEvidence,
  useSaveParentCommunication,
  useGenerateParentReport,
  usePrefetchProgress,
};