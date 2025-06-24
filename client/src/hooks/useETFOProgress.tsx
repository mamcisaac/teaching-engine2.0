import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export interface ETFOProgressData {
  curriculumExpectations: {
    total: number;
    imported: number;
    covered: number;
  };
  longRangePlans: {
    total: number;
    completed: number;
  };
  unitPlans: {
    total: number;
    completed: number;
  };
  lessonPlans: {
    total: number;
    completed: number;
  };
  daybookEntries: {
    total: number;
    completed: number;
  };
}

export interface ETFOLevel {
  id: number;
  name: string;
  path: string;
  icon: JSX.Element;
  isComplete: boolean;
  isAccessible: boolean;
  progress: number;
  description: string;
}

/**
 * Hook to track ETFO planning progress across all 5 levels
 */
export function useETFOProgress() {
  const { data: progressData, isLoading } = useQuery<ETFOProgressData>({
    queryKey: ['etfo-progress'],
    queryFn: async () => {
      const response = await api.get('/api/etfo/progress');
      return response.data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  /**
   * Calculate if a level is complete based on progress data
   */
  const isLevelComplete = (level: string): boolean => {
    if (!progressData) return false;

    switch (level) {
      case 'curriculum':
        return progressData.curriculumExpectations.imported > 0;
      case 'long-range':
        return progressData.longRangePlans.completed > 0;
      case 'units':
        return progressData.unitPlans.completed > 0;
      case 'lessons':
        return progressData.lessonPlans.completed > 0;
      case 'daybook':
        return progressData.daybookEntries.completed > 0;
      default:
        return false;
    }
  };

  /**
   * Calculate if a level is accessible based on prerequisites
   */
  const isLevelAccessible = (level: string): boolean => {
    if (!progressData) return false;

    switch (level) {
      case 'curriculum':
        return true; // Always accessible
      case 'long-range':
        return isLevelComplete('curriculum');
      case 'units':
        return isLevelComplete('long-range');
      case 'lessons':
        return isLevelComplete('units');
      case 'daybook':
        return isLevelComplete('lessons');
      default:
        return false;
    }
  };

  /**
   * Calculate progress percentage for a level
   */
  const getLevelProgress = (level: string): number => {
    if (!progressData) return 0;

    switch (level) {
      case 'curriculum': {
        const { total: expTotal, imported } = progressData.curriculumExpectations;
        return expTotal > 0 ? (imported / expTotal) * 100 : 0;
      }
      case 'long-range': {
        const { total: lrpTotal, completed: lrpCompleted } = progressData.longRangePlans;
        return lrpTotal > 0 ? (lrpCompleted / lrpTotal) * 100 : 0;
      }
      case 'units': {
        const { total: unitTotal, completed: unitCompleted } = progressData.unitPlans;
        return unitTotal > 0 ? (unitCompleted / unitTotal) * 100 : 0;
      }
      case 'lessons': {
        const { total: lessonTotal, completed: lessonCompleted } = progressData.lessonPlans;
        return lessonTotal > 0 ? (lessonCompleted / lessonTotal) * 100 : 0;
      }
      case 'daybook': {
        const { total: daybookTotal, completed: daybookCompleted } = progressData.daybookEntries;
        return daybookTotal > 0 ? (daybookCompleted / daybookTotal) * 100 : 0;
      }
      default:
        return 0;
    }
  };

  /**
   * Get the ETFO levels with their current status
   */
  const getETFOLevels = (): ETFOLevel[] => {
    return [
      {
        id: 1,
        name: 'Curriculum Expectations',
        path: '/curriculum',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
        isComplete: isLevelComplete('curriculum'),
        isAccessible: isLevelAccessible('curriculum'),
        progress: getLevelProgress('curriculum'),
        description: 'Import and organize curriculum standards',
      },
      {
        id: 2,
        name: 'Long-Range Plans',
        path: '/planner/long-range',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        ),
        isComplete: isLevelComplete('long-range'),
        isAccessible: isLevelAccessible('long-range'),
        progress: getLevelProgress('long-range'),
        description: 'Create year/term overview with major units',
      },
      {
        id: 3,
        name: 'Unit Plans',
        path: '/planner/units',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
        isComplete: isLevelComplete('units'),
        isAccessible: isLevelAccessible('units'),
        progress: getLevelProgress('units'),
        description: 'Develop detailed instructional units',
      },
      {
        id: 4,
        name: 'Lesson Plans',
        path: '/planner/lessons',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
        isComplete: isLevelComplete('lessons'),
        isAccessible: isLevelAccessible('lessons'),
        progress: getLevelProgress('lessons'),
        description: 'Plan individual teaching sessions',
      },
      {
        id: 5,
        name: 'Daybook',
        path: '/planner/daybook',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        isComplete: isLevelComplete('daybook'),
        isAccessible: isLevelAccessible('daybook'),
        progress: getLevelProgress('daybook'),
        description: 'Maintain daily planning records',
      },
    ];
  };

  return {
    progressData,
    isLoading,
    isLevelComplete,
    isLevelAccessible,
    getLevelProgress,
    getETFOLevels,
  };
}
