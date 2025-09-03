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

// All items are already exported via the wildcard exports above
// Users can import directly from the respective modules