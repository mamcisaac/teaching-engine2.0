/**
 * Student Assessment System - Frontend Infrastructure
 * Complete export of types, hooks, API clients, and constants
 */

// Types
export * from '../types/studentAssessment';

// API Client
export * from '../services/studentAssessmentAPI';
export { studentAssessmentAPI as default } from '../services/studentAssessmentAPI';

// React Query Hooks
export * from '../hooks/useStudentAssessment';
export { studentAssessmentHooks } from '../hooks/useStudentAssessment';

// Constants and Utilities
export * from '../constants/studentAssessment';
export { ASSESSMENT_CONSTANTS } from '../constants/studentAssessment';

// Re-export commonly used items for convenience
// Import types from types module
export type {
  Student,
  StudentArtifact,
  StudentOutcomeProgress,
  MasteryLevel,
  EvidenceType,
  ArtifactType
} from '../types/studentAssessment';

// Import API functions from services module
export {
  studentsAPI,
  artifactsAPI,
  masteryAPI,
  analyticsAPI
} from '../services/studentAssessmentAPI';

// Import hooks from hooks module
export {
  // Students
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  // Artifacts
  useArtifacts,
  useUploadArtifact,
  useCreateNote,
  useTagArtifactWithOutcome,
  // Mastery
  useStudentMastery,
  useUpdateMastery,
  useOptimisticMasteryUpdate,
  useMasteryAnalytics,
  // Query keys
  QUERY_KEYS
} from '../hooks/useStudentAssessment';

// Import constants and utilities from constants module
export {
  MASTERY_LEVELS,
  EVIDENCE_TYPES,
  ARTIFACT_TYPES,
  formatFileSize,
  calculateMasteryPercentage,
  formatStudentName,
  getMasteryColor,
  getMasteryLabel
} from '../constants/studentAssessment';