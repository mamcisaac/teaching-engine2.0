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
export {
  // Core types
  type Student,
  type StudentArtifact,
  type StudentOutcomeProgress,
  type MasteryLevel,
  type EvidenceType,
  type ArtifactType,
  
  // API functions
  studentsAPI,
  artifactsAPI,
  masteryAPI,
  analyticsAPI,
  
  // Hooks - Students
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  
  // Hooks - Artifacts
  useArtifacts,
  useUploadArtifact,
  useCreateNote,
  useTagArtifactWithOutcome,
  
  // Hooks - Mastery
  useStudentMastery,
  useUpdateMastery,
  useOptimisticMasteryUpdate,
  useMasteryAnalytics,
  
  // Constants
  MASTERY_LEVELS,
  EVIDENCE_TYPES,
  ARTIFACT_TYPES,
  
  // Utilities
  formatFileSize,
  calculateMasteryPercentage,
  formatStudentName,
  getMasteryColor,
  getMasteryLabel,
} from '../constants/studentAssessment';