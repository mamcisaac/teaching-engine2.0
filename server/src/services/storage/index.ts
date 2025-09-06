/**
 * Storage Service Module
 * Exports all storage service components for easy importing
 */

export * from './IStorageService';
export * from './LocalStorageService';
export * from './S3StorageService';

// Re-export convenience functions
export { 
  getStorageService, 
  validateStorageConfiguration,
  StorageServiceFactory 
} from './StorageServiceFactory';

// Default export for convenience
export { StorageServiceFactory as default } from './StorageServiceFactory';