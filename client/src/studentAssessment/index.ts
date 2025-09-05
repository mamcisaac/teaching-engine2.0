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

// Constants and Utilities
export * from '../constants/studentAssessment';