/**
 * Substitute Domain API
 * Handles substitute teacher plans and templates
 */

export * from './api';
export * from './hooks';

// Re-export types for convenience
export type {
  SubstitutePlan,
  SubstitutePlanInput,
  SubstituteTemplate,
  SubstituteFilters,
  SubstituteStats,
} from './api';