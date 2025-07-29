/**
 * ETFO Lesson Plan Page Hooks - Barrel Export
 * 
 * Following the printUtils.tsx pattern for clean, modular exports.
 * This file provides a single entry point for all custom hooks used
 * in the ETFO Lesson Plan Page functionality.
 */

// Re-export all hooks
export { useETFOLessonPlanForm } from './useETFOLessonPlanForm';
export { useTemplateIntegration } from './useTemplateIntegration';
export { useArrayFieldHandlers } from './useArrayFieldHandlers';
export { useAILessonPlanIntegration } from './useAILessonPlanIntegration';
export { useETFOModalState } from './useETFOModalState';
export { useETFOLessonPlanActions } from './useETFOLessonPlanActions';

// Re-export hook types for external use
export type { ETFOLessonPlanFormData } from './useETFOLessonPlanForm';
export type { ETFOModalState } from './useETFOModalState';
export type { ETFOLessonPlanActions } from './useETFOLessonPlanActions';