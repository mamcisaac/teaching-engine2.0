/**
 * Cognate Domain API
 * Handles French-English cognate pairs for language learning
 */

export * from './api';
export * from './hooks';

// Re-export types for convenience
export type {
  CognatePair,
  CognateInput,
  CognateFilters,
  CognateStats,
} from './api';