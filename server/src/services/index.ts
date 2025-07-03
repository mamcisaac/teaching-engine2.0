// Core services
export { curriculumImportService } from './curriculumImportService';

// AI services
// AIParentSummaryService removed - not aligned with single-teacher focus
export { AIPlanningAssistantService } from './aiPlanningAssistant';
export { AIActivityGenerator, aiActivityGenerator } from './aiActivityGenerator';
export { AIActivityGeneratorService } from './aiActivityGeneratorService';
export { aiPromptTemplateService } from './aiPromptTemplateService';
export {
  generateLongRangePlanDraft,
  generateUnitPlanDraft,
  generateLessonPlanDraft,
  generateDaybookDraft,
  generatePlanSuggestions,
} from './aiDraftService';

// Existing services
export { openai } from './llmService';
// materialGenerator and planningEngine removed - over-engineered for single-teacher use

// Service types
export type { ImportProgress } from './curriculumImportService';
