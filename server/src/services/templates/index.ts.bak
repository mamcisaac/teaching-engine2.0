/**
 * Template Services Index
 * Centralized exports for all template-related services
 */

// Main orchestrator service (replaces old templateService)
export { 
  TemplateOrchestrator, 
  templateOrchestrator,
  renderLessonPlan,
  renderNewsletter,
  renderProgressReport 
} from './TemplateOrchestrator';

// Specialized services
export { TemplateRegistry, templateRegistry } from './TemplateRegistry';
export { TemplateCache, templateCache } from './TemplateCache';
export { TemplateHelpers, templateHelpers } from './TemplateHelpers';
export { PartialManager, partialManager } from './PartialManager';
export { RenderCoordinator, renderCoordinator } from './RenderCoordinator';

// Legacy compatibility - export main orchestrator as templateService
export { templateOrchestrator as templateService } from './TemplateOrchestrator';

// Re-export types and interfaces
export type { TemplateRenderOptions, TemplateServiceOptions } from './TemplateOrchestrator';
export type { CacheOptions, CacheStats } from './TemplateCache';
export type { ProviderInfo, EngineInfo, RegistryStats } from './TemplateRegistry';
export type { HelperFunction, HelperCategory } from './TemplateHelpers';
export type { PartialInfo, PartialCategory } from './PartialManager';
export type { RenderRequest, RenderResponse } from './RenderCoordinator';

// Re-export existing template infrastructure
export * from './providers';
export * from './engines';
export * from './data';