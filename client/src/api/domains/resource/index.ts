/**
 * Resource Domain API
 * Handles media resources, collections, and file management
 */

export * from './api';
export * from './hooks';

// Re-export types for convenience
export type {
  MediaResource,
  MediaResourceInput,
  ResourceFilters,
  ResourceStats,
  ResourceCollection,
  UploadProgress,
} from './api';