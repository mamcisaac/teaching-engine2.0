// Core services
export { curriculumImportService } from './curriculumImportService';
export { embeddingService } from './embeddingService';
export { clusteringService } from './clusteringService';
export { CacheService } from './CacheService';
export { BaseService } from './base/BaseService';

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
export type { EmbeddingResult, SimilarityResult } from './embeddingService';
export type { ClusterItem, Cluster, ClusteringOptions } from './clusteringService';
