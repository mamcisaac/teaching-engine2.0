import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';
import { getErrorMessage } from '../utils/typeGuards';
import type { 
  CurriculumExpectation, 
  LongRangePlan, 
  UnitPlan, 
  ETFOLessonPlan 
} from './useETFOPlanning';

export interface DaybookEntry {
  id: string;
  date: string;
  whatWorked?: string;
  whatDidntWork?: string;
  nextSteps?: string;
  classEngagement?: string;
  commonChallenges?: string;
  notableAchievements?: string;
  notes?: string;
  overallRating?: number;
  wouldReuseLesson?: boolean;
}

export interface CascadeLesson extends ETFOLessonPlan {
  daybookEntry?: DaybookEntry;
}

export interface CascadeUnit extends UnitPlan {
  lessonPlans?: CascadeLesson[];
  progress?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface CascadeLRP extends LongRangePlan {
  unitPlans?: CascadeUnit[];
  progress?: {
    totalUnits: number;
    totalLessons: number;
    completedLessons: number;
  };
}

export interface CurriculumCoverage {
  total: number;
  covered: number;
  coveragePercentage: number;
  expectations: Array<CurriculumExpectation & {
    coverage: {
      lessonCount: number;
      unitCount: number;
      lrpCount: number;
    };
  }>;
}

export interface CascadeMetrics {
  totalLongRangePlans: number;
  totalUnits: number;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
}

export interface PlanningCascadeData {
  curriculum: CurriculumCoverage | null;
  longRangePlans: CascadeLRP[];
  metrics: CascadeMetrics | null;
}

export interface CascadeSummary {
  curriculum: {
    bySubject: Record<string, number>;
    total: number;
  };
  planning: {
    longRangePlans: number;
    unitPlans: number;
    lessonPlans: number;
    daybookEntries: number;
    completionRate: number;
  };
}

export interface UsePlanningCascadeOptions {
  academicYear?: string;
  subject?: string;
  grade?: number;
  includeProgress?: boolean;
  includeDaybook?: boolean;
  depth?: 'curriculum' | 'lrp' | 'units' | 'lessons' | 'full';
}

export function usePlanningCascade(options: UsePlanningCascadeOptions = {}) {
  const {
    academicYear,
    subject,
    grade,
    includeProgress = true,
    includeDaybook = false,
    depth = 'full',
  } = options;

  return useQuery<PlanningCascadeData>({
    queryKey: ['planning-cascade', { academicYear, subject, grade, includeProgress, includeDaybook, depth }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        if (academicYear) params.append('academicYear', academicYear);
        if (subject) params.append('subject', subject);
        if (grade) params.append('grade', grade.toString());
        params.append('includeProgress', includeProgress.toString());
        params.append('includeDaybook', includeDaybook.toString());
        params.append('depth', depth);

        const response = await apiClient.get(`/api/planning-cascade?${params}`);
        return response.data;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useCascadeSummary() {
  return useQuery<CascadeSummary>({
    queryKey: ['planning-cascade-summary'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/planning-cascade/summary');
        return response.data;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
      }
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}