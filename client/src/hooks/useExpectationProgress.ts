import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../api/core';

interface ExpectationProgress {
  expectationId: string;
  expectationCode: string;
  expectationTitle: string;
  subject: string;
  currentLevel: string;
  previousLevel?: string;
  totalEvidencePieces: number;
  lastAssessmentDate: string;
  strongestEvidence: any[];
  trend: string;
  assessments: {
    id: string;
    date: string;
    level: string;
    notes?: string;
    lessonTitle: string;
    lessonDate?: string;
  }[];
}

interface ExpectationProgressResponse {
  studentId: string;
  studentName: string;
  progressBySubject: Record<string, ExpectationProgress[]>;
  totalExpectationsAssessed: number;
  lastUpdated: string;
}

export function useExpectationProgress(studentId: string) {
  return useQuery<ExpectationProgressResponse>({
    queryKey: ['expectation-progress', studentId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/students/${studentId}/expectation-progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch expectation progress');
      }

      return response.json();
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}