/**
 * Upload Middleware Module
 * Exports all upload-related middleware and utilities
 */

// Re-export file processing service
export { getFileProcessingService, FileProcessingService } from '../../services/fileProcessingService';
export type { FileMetadata } from '../../services/fileProcessingService';

// Convenience exports for common upload patterns
export {
  // Basic upload middleware
  uploadSingle,
  uploadMultiple,
  processUpload,
  handleUploadErrors,
  
  // Validation middleware
  validateUploadRequirements,
  
  // Student-specific middleware
  uploadStudentPhoto,
  uploadStudentVideo,
  uploadStudentAudio,
  uploadStudentDocument,
  uploadMultipleArtifacts,
  mobileArtifactUpload,
  
  // Validation chains
  validateArtifactUpload,
  validateArtifactWithOutcomes,
  validateQuickNote,
  
  // Access validation
  validateStudentAccess,
  validateOutcomeAccess,
  handleValidationErrors,
  
  // File type constants
  ALLOWED_MIME_TYPES,
  ALL_ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS
  
} from '../uploadMiddleware';

export {
  studentArtifactValidation,
  outcomeTaggingValidation
} from '../studentArtifactUpload';