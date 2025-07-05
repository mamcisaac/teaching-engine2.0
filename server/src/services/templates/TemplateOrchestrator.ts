/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Template Orchestrator Service
 * Main coordination service for all template operations using specialized services
 */

import { BaseService } from '../base/BaseService';
import { TemplateRegistry } from './TemplateRegistry';
import { TemplateCache } from './TemplateCache';
import { TemplateHelpers } from './TemplateHelpers';
import { PartialManager } from './PartialManager';
import { RenderCoordinator } from './RenderCoordinator';
import { TemplateProvider, TemplateContext, RenderOptions, Template } from './providers/TemplateProvider';
import { RenderEngine, RenderResult } from './engines/RenderEngine';

export interface TemplateRenderOptions extends RenderOptions {
  templateType: string;
  templateId?: string;
  data?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  fetchData?: boolean;
  useCache?: boolean;
}

export interface TemplateServiceOptions {
  enableCache?: boolean;
  cacheOptions?: unknown;
  partialsDirectory?: string;
}

export class TemplateOrchestrator extends BaseService {
  private static instance: TemplateOrchestrator;
  private registry: TemplateRegistry;
  private cache: TemplateCache;
  private helpers: TemplateHelpers;
  private partialManager: PartialManager;
  private renderCoordinator: RenderCoordinator;

  private constructor(options?: TemplateServiceOptions) {
    super('TemplateOrchestrator');
    
    // Initialize all specialized services
    this.registry = TemplateRegistry.getInstance();
    this.cache = TemplateCache.getInstance(options?.cacheOptions);
    this.helpers = TemplateHelpers.getInstance();
    this.partialManager = PartialManager.getInstance(options?.partialsDirectory);
    this.renderCoordinator = RenderCoordinator.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(options?: TemplateServiceOptions): TemplateOrchestrator {
    if (!TemplateOrchestrator.instance) {
      TemplateOrchestrator.instance = new TemplateOrchestrator(options);
    }
    return TemplateOrchestrator.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize all specialized services
    await this.registry.initialize();
    await this.cache.initialize();
    await this.helpers.initialize();
    await this.partialManager.initialize();
    await this.renderCoordinator.initialize();
    
    this.logger.info('Template orchestrator initialized', {
      providers: this.registry.listProviders().length,
      engines: this.registry.listEngines().length,
      helpers: this.helpers.listHelperNames().length,
      partials: this.partialManager.listPartials().length,
    });
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      registry: this.registry.isHealthy(),
      cache: this.cache.isHealthy(),
      helpers: this.helpers.isHealthy(),
      partialManager: this.partialManager.isHealthy(),
      renderCoordinator: this.renderCoordinator.isHealthy(),
    };
  }

  /**
   * Main render method - delegates to RenderCoordinator
   */
  public async render(
    context: TemplateContext,
    options: TemplateRenderOptions
  ): Promise<RenderResult> {
    return this.executeWithMetrics(
      async () => {
        const response = await this.renderCoordinator.render({
          context,
          options,
        });

        // Return as RenderResult (strip extra metadata for backward compatibility)
        return {
          content: response.content,
          format: response.format,
          metadata: {
            ...response.metadata,
            renderTime: response.renderTime,
            cacheHit: response.cacheHit,
            templateResolutionTime: response.templateResolutionTime,
            dataFetchTime: response.dataFetchTime,
          },
        };
      },
      `render-${options.templateType}`
    );
  }

  /**
   * Render multiple templates in batch
   */
  public async renderBatch(
    requests: Array<{
      context: TemplateContext;
      options: TemplateRenderOptions;
    }>
  ): Promise<RenderResult[]> {
    return this.executeWithMetrics(
      async () => {
        const responses = await this.renderCoordinator.renderBatch(requests);
        
        // Convert to RenderResult format
        return responses.map(response => ({
          content: response.content,
          format: response.format,
          metadata: {
            ...response.metadata,
            renderTime: response.renderTime,
            cacheHit: response.cacheHit,
          },
        }));
      },
      'renderBatch'
    );
  }

  /**
   * List available templates
   */
  public async listTemplates(type?: string): Promise<Template[]> {
    if (type) {
      return this.registry.listTemplatesByProvider(type);
    }
    return this.registry.listAllTemplates();
  }

  /**
   * Get template by ID
   */
  public async getTemplate(type: string, templateId: string): Promise<Template | null> {
    return this.registry.getTemplate(type, templateId);
  }

  /**
   * Find templates by criteria
   */
  public async findTemplates(criteria: {
    type?: string;
    format?: string;
    engine?: string;
    tags?: string[];
  }): Promise<Template[]> {
    return this.registry.findTemplates(criteria);
  }

  /**
   * Preview template with sample data
   */
  public async previewTemplate(
    templateType: string,
    templateId: string,
    sampleData: Record<string, unknown> = {},
    options: Partial<TemplateRenderOptions> = {}
  ): Promise<RenderResult> {
    const response = await this.renderCoordinator.previewTemplate(
      templateType,
      templateId,
      sampleData,
      options
    );

    return {
      content: response.content,
      format: response.format,
      metadata: response.metadata,
    };
  }

  /**
   * Validate template
   */
  public async validateTemplate(
    templateType: string,
    templateId?: string
  ): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    return this.renderCoordinator.validateTemplate(templateType, templateId);
  }

  // Provider Management Methods

  /**
   * Register custom provider
   */
  public registerProvider(type: string, provider: TemplateProvider): void {
    this.registry.registerProvider(type, provider);
    this.logger.info('Template provider registered', { type });
  }

  /**
   * Register custom engine
   */
  public registerEngine(name: string, engine: RenderEngine): void {
    this.registry.registerEngine(name, engine);
    this.logger.info('Template engine registered', { name });
  }

  /**
   * Get provider by type
   */
  public getProvider(type: string): TemplateProvider | null {
    return this.registry.getProvider(type);
  }

  /**
   * Get engine by name
   */
  public getEngine(name: string): RenderEngine | null {
    return this.registry.getEngine(name);
  }

  // Helper Management Methods

  /**
   * Register custom helper
   */
  public registerHelper(name: string, helperFn: (...args: unknown[]) => unknown, description?: string, category?: string): void {
    this.helpers.registerHelper(name, {
      fn: helperFn,
      description,
      category,
    });
    this.logger.debug('Template helper registered', { name });
  }

  /**
   * Get helper function
   */
  public getHelper(name: string): ((...args: unknown[]) => unknown) | null {
    return this.helpers.getHelper(name);
  }

  /**
   * List all helpers
   */
  public listHelpers(): string[] {
    return this.helpers.listHelperNames();
  }

  /**
   * Search helpers
   */
  public searchHelpers(query: string): unknown[] {
    return this.helpers.searchHelpers(query);
  }

  // Partial Management Methods

  /**
   * Register custom partial
   */
  public registerPartial(name: string, content: string, category?: string, description?: string): void {
    this.partialManager.registerPartial(name, {
      name,
      content,
      category,
      description,
      lastModified: new Date(),
      source: 'memory',
    });
    this.logger.debug('Template partial registered', { name });
  }

  /**
   * Get partial content
   */
  public getPartial(name: string): string | null {
    return this.partialManager.getPartial(name);
  }

  /**
   * List all partials
   */
  public listPartials(): unknown[] {
    return this.partialManager.listPartials();
  }

  /**
   * Search partials
   */
  public searchPartials(query: string): unknown[] {
    return this.partialManager.searchPartials(query);
  }

  // Cache Management Methods

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.renderCoordinator.clearCaches();
    this.logger.info('Template cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): unknown {
    return this.cache.getStats();
  }

  /**
   * Warm up caches
   */
  public async warmupCaches(
    templates: Array<{
      templateType: string;
      templateId?: string;
      sampleData?: Record<string, unknown>;
    }>
  ): Promise<void> {
    await this.renderCoordinator.warmupCaches(templates);
  }

  /**
   * Invalidate cache by pattern
   */
  public invalidateCacheByPattern(pattern: RegExp): number {
    return this.cache.invalidateByPattern(pattern);
  }

  // Statistics and Health Methods

  /**
   * Get comprehensive statistics
   */
  public async getStats(): Promise<{
    registry: unknown;
    cache: unknown;
    helpers: unknown;
    partials: unknown;
    health: unknown;
  }> {
    return {
      registry: await this.registry.getStats(),
      cache: this.cache.getStats(),
      helpers: {
        total: this.helpers.listHelperNames().length,
        categories: this.helpers.listCategories().length,
      },
      partials: this.partialManager.getUsageStats(),
      health: await this.getHealthStatus(),
    };
  }

  /**
   * Get health status
   */
  public async getHealthStatus(): Promise<{
    isHealthy: boolean;
    services: Record<string, boolean>;
    issues: string[];
  }> {
    const services = {
      registry: this.registry.isHealthy(),
      cache: this.cache.isHealthy(),
      helpers: this.helpers.isHealthy(),
      partialManager: this.partialManager.isHealthy(),
      renderCoordinator: this.renderCoordinator.isHealthy(),
    };

    const issues: string[] = [];
    
    for (const [service, healthy] of Object.entries(services)) {
      if (!healthy) {
        issues.push(`${service} service is not healthy`);
      }
    }

    // Additional health checks
    const registryHealth = await this.registry.validateHealth();
    if (!registryHealth.isHealthy) {
      issues.push(...registryHealth.issues);
    }

    const partialValidation = this.partialManager.validateDependencies();
    if (partialValidation.invalid.length > 0) {
      issues.push(`Invalid partial dependencies: ${partialValidation.invalid.map(i => i.name).join(', ')}`);
    }

    return {
      isHealthy: issues.length === 0,
      services,
      issues,
    };
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.renderCoordinator.cleanup();
    await this.registry.cleanup();
    await this.cache.cleanup();
    await this.partialManager.cleanup();
    
    this.logger.info('Template orchestrator cleanup completed');
  }
}

// Export singleton instance
export const templateOrchestrator = TemplateOrchestrator.getInstance();

// Export convenience functions for backward compatibility
export const renderLessonPlan = async (
  userId: number,
  lessonData: unknown,
  format: 'html' | 'pdf' = 'html'
): Promise<RenderResult> => {
  return templateOrchestrator.render(
    { userId },
    {
      templateType: 'lesson',
      templateId: format === 'pdf' ? 'lesson-standard' : 'lesson-standard',
      data: { lesson: lessonData, user: { id: userId } },
      format,
    }
  );
};

export const renderNewsletter = async (
  userId: number,
  startDate: Date,
  endDate: Date,
  style: 'standard' | 'detailed' | 'bilingual' = 'standard'
): Promise<RenderResult> => {
  return templateOrchestrator.render(
    { userId },
    {
      templateType: 'newsletter',
      templateId: `newsletter-weekly-${style}`,
      filters: { startDate, endDate },
      fetchData: true,
      format: 'html',
    }
  );
};

export const renderProgressReport = async (
  userId: number,
  studentId: number,
  reportPeriod: unknown,
  format: 'html' | 'pdf' = 'pdf'
): Promise<RenderResult> => {
  return templateOrchestrator.render(
    { userId },
    {
      templateType: 'report',
      templateId: 'report-progress-pdf',
      filters: { studentId },
      data: { reportPeriod },
      fetchData: true,
      format,
    }
  );
};