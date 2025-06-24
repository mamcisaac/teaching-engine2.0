// Core services
export { embeddingService } from './embeddingService';
export { curriculumImportService } from './curriculumImportService';
export { clusteringService } from './clusteringService';
export { cacheService } from './CacheService';

// Service infrastructure
export { serviceRegistry } from './ServiceRegistry';
export { default as BaseService } from './base/BaseService';

// Existing services
export { openai } from './llmService';
export { extractMaterials } from './materialGenerator';
export { generateWeeklySchedule } from './planningEngine';

// Service types
export type { EmbeddingResult } from './embeddingService';
export type { ImportProgress } from './curriculumImportService';
export type { ClusterResult, ClusteringOptions } from './clusteringService';
export type { CacheEntry, CacheOptions, CacheStats } from './CacheService';
export type { ServiceMetrics, RetryOptions } from './base/BaseService';
export type { ServiceHealth, ServiceRegistration } from './ServiceRegistry';
