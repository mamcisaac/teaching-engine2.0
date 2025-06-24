import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export interface WorkflowState {
  userId: number;
  currentLevel: ETFOLevel;
  completedLevels: ETFOLevel[];
  accessibleLevels: ETFOLevel[];
  blockedLevels: ETFOLevel[];
  progress: LevelProgress[];
}

export interface LevelProgress {
  level: ETFOLevel;
  isComplete: boolean;
  isAccessible: boolean;
  progressPercentage: number;
  completedItems: number;
  totalItems: number;
  blockedReason?: string;
}

export enum ETFOLevel {
  CURRICULUM_EXPECTATIONS = 'CURRICULUM_EXPECTATIONS',
  LONG_RANGE_PLANS = 'LONG_RANGE_PLANS',
  UNIT_PLANS = 'UNIT_PLANS',
  LESSON_PLANS = 'LESSON_PLANS',
  DAYBOOK_ENTRIES = 'DAYBOOK_ENTRIES',
}

export const ETFO_LEVEL_PATHS = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: '/curriculum',
  [ETFOLevel.LONG_RANGE_PLANS]: '/planner/long-range',
  [ETFOLevel.UNIT_PLANS]: '/planner/units',
  [ETFOLevel.LESSON_PLANS]: '/planner/lessons',
  [ETFOLevel.DAYBOOK_ENTRIES]: '/planner/daybook',
};

export function useWorkflowState() {
  const queryClient = useQueryClient();

  const { data: workflowState, isLoading, error } = useQuery<WorkflowState>({
    queryKey: ['workflow-state'],
    queryFn: async () => {
      const response = await api.get('/api/workflow/state');
      return response.data;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  const checkLevelAccess = async (level: ETFOLevel): Promise<{ canAccess: boolean; reason?: string }> => {
    try {
      const response = await api.get(`/api/workflow/access/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error checking level access:', error);
      return { canAccess: false, reason: 'Error checking access' };
    }
  };

  const validateLevel = async (level: ETFOLevel, entityId: string): Promise<{ isValid: boolean; missingFields: string[] }> => {
    try {
      const response = await api.post('/api/workflow/validate', {
        level,
        entityId,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating level:', error);
      return { isValid: false, missingFields: ['Validation error'] };
    }
  };

  const refreshWorkflowState = () => {
    queryClient.invalidateQueries({ queryKey: ['workflow-state'] });
    queryClient.invalidateQueries({ queryKey: ['etfo-progress'] });
  };

  const getLevelProgress = (level: ETFOLevel): LevelProgress | undefined => {
    return workflowState?.progress.find(p => p.level === level);
  };

  const isLevelComplete = (level: ETFOLevel): boolean => {
    return workflowState?.completedLevels.includes(level) || false;
  };

  const isLevelAccessible = (level: ETFOLevel): boolean => {
    return workflowState?.accessibleLevels.includes(level) || false;
  };

  const getBlockedReason = (level: ETFOLevel): string | undefined => {
    const progress = getLevelProgress(level);
    return progress?.blockedReason;
  };

  const getNextLevel = (): ETFOLevel | null => {
    if (!workflowState) return null;
    
    // Find the first incomplete but accessible level
    const nextLevel = workflowState.progress.find(p => !p.isComplete && p.isAccessible);
    return nextLevel?.level || null;
  };

  const getPreviousLevel = (level: ETFOLevel): ETFOLevel | null => {
    const levels = Object.values(ETFOLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex > 0 ? levels[currentIndex - 1] : null;
  };

  return {
    workflowState,
    isLoading,
    error,
    checkLevelAccess,
    validateLevel,
    refreshWorkflowState,
    getLevelProgress,
    isLevelComplete,
    isLevelAccessible,
    getBlockedReason,
    getNextLevel,
    getPreviousLevel,
  };
}