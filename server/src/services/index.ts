// Core services
export { curriculumImportService } from './curriculumImportService';
// Deleted services: embeddingService, clusteringService, cacheService, serviceRegistry, BaseService - over-engineered for single-teacher use

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
// Deleted types: EmbeddingResult, ClusterResult, ClusteringOptions, CacheEntry, CacheOptions, CacheStats, ServiceMetrics, RetryOptions, ServiceHealth, ServiceRegistration, ParentSummaryRequest, ParentSummaryResponse - over-engineered for single-teacher use
