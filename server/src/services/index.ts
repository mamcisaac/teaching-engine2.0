// Core services
export { embeddingService } from './embeddingService';
export { curriculumImportService } from './curriculumImportService';
export { clusteringService } from './clusteringService';
export { enhancedPlanningService } from './enhancedPlanningService';
export { enhancedMaterialService } from './enhancedMaterialService';
export { notificationService } from './NotificationService';
export { cacheService } from './CacheService';

// Service infrastructure
export { serviceRegistry } from './ServiceRegistry';
export { default as BaseService } from './base/BaseService';

// Existing services
export { openai } from './llmService';
export * from './emailService';
export { extractMaterials } from './materialGenerator';
export { generateWeeklySchedule } from './planningEngine';
export { generateAuditReport, exportAuditData } from './curriculumAuditService';

// Service types
export type { EmbeddingResult } from './embeddingService';
export type { ImportOutcome, ImportProgress, ImportResult } from './curriculumImportService';
export type { ClusterResult, ClusteringOptions } from './clusteringService';
export type { ThematicGroup, EnhancedScheduleOptions } from './enhancedPlanningService';
export type {
  BulkMaterialRequest,
  MaterialTemplate,
  GeneratedMaterial,
} from './enhancedMaterialService';
export type {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
} from './NotificationService';
export type { CacheEntry, CacheOptions, CacheStats } from './CacheService';
export type { ServiceMetrics, RetryOptions } from './base/BaseService';
export type { ServiceHealth, ServiceRegistration } from './ServiceRegistry';
