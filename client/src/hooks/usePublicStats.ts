import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../api/core/client';

export interface PublicStats {
  unitCount: number;
  lessonCount: number;
  lrpCount: number;
  totalHours: number;
  septemberLessonCount: number;
}

export interface SampleUnit {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  estimatedHours: number | null;
  longRangePlan: {
    subject: string;
    title: string;
  } | null;
}

export interface SeptemberLesson {
  id: string;
  title: string;
  titleFr: string | null;
  date: string;
  duration: number | null;
  unitPlan: {
    title: string;
    longRangePlan: {
      subject: string;
    } | null;
  } | null;
}

export interface PublicStatsResponse {
  stats: PublicStats;
  sampleUnits: SampleUnit[];
  septemberLessons: SeptemberLesson[];
  subjectDistribution: Record<string, number>;
  academicYear: string;
  currentDate: string;
}

export function usePublicStats() {
  return useQuery<PublicStatsResponse>({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/api/public/stats');
      return response.data as PublicStatsResponse;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    retry: 2
  });
}