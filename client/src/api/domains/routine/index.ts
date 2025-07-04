/**
 * Routine Domain API
 * Handles oral routines, daily routines, and class management routines
 */

export * from './api';
export * from './hooks';

// Re-export types for convenience
export type {
  OralRoutineTemplate,
  DailyOralRoutine,
  OralRoutineStats,
  ClassRoutine,
  RoutineFilters,
  RoutineTemplateInput,
  DailyRoutineInput,
} from './api';