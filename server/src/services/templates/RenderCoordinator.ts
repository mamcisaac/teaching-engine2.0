/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Render Coordinator Service
 * Coordinates the template rendering process using all template services
 */

import { BaseService } from '../base/BaseService';
import { TemplateRegistry } from './TemplateRegistry';
import { TemplateCache } from './TemplateCache';
import { TemplateHelpers } from './TemplateHelpers';
import { PartialManager } from './PartialManager';
import { TemplateProvider, TemplateContext, RenderOptions } from './providers/TemplateProvider';
import { RenderResult, RenderContext } from './engines/RenderEngine';
import { TemplateDataFetcher, FetchContext } from './data/TemplateDataFetcher';

export interface RenderRequest {
  context: TemplateContext;
  options: RenderOptions & {
    templateType: string;
    templateId?: string;
    data?: Record<string, unknown>;
    filters?: Record<string, unknown>;
    fetchData?: boolean;
    useCache?: boolean;
  };
}

export interface RenderResponse extends RenderResult {
  cacheHit?: boolean;
  renderTime: number;
  dataFetchTime?: number;
  templateResolutionTime: number;
}

export class RenderCoordinator extends BaseService {
  private static instance: RenderCoordinator;
  private registry: TemplateRegistry;
  private cache: TemplateCache;
  private helpers: TemplateHelpers;
  private partialManager: PartialManager;
  private dataFetcher: TemplateDataFetcher;

  private constructor() {
    super('RenderCoordinator');
    this.registry = TemplateRegistry.getInstance();
    this.cache = TemplateCache.getInstance();
    this.helpers = TemplateHelpers.getInstance();
    this.partialManager = PartialManager.getInstance();
    this.dataFetcher = new TemplateDataFetcher();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RenderCoordinator {
    if (!RenderCoordinator.instance) {
      RenderCoordinator.instance = new RenderCoordinator();
    }
    return RenderCoordinator.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize all dependent services
    await this.registry.initialize();
    await this.cache.initialize();
    await this.helpers.initialize();
    await this.partialManager.initialize();
    
    this.logger.info('Render coordinator initialized');
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
      dataFetcher: !!this.dataFetcher,
    };
  }

  /**
   * Main render method
   */
  public async render(request: RenderRequest): Promise<RenderResponse> {
    return this.executeWithMetrics(
      async () => {
        const startTime = Date.now();
        const { context, options } = request;

        // Step 1: Check cache first
        let cacheHit = false;
        if (options.useCache !== false) {
          const cacheKey = this.generateCacheKey(context, options);
          const cachedResult = this.cache.get(cacheKey);
          
          if (cachedResult) {
            cacheHit = true;
            const renderTime = Date.now() - startTime;
            
            this.logger.debug('Returning cached render result', { 
              cacheKey, 
              renderTime 
            });

            return {
              ...cachedResult,
              cacheHit,
              renderTime,
              templateResolutionTime: 0,
            };
          }
        }

        // Step 2: Resolve template provider and template
        const templateStartTime = Date.now();
        const { provider: _provider, template } = await this.resolveTemplate(options.templateType, context, options);
        const templateResolutionTime = Date.now() - templateStartTime;

        // Step 3: Fetch data if needed
        let data = options.data || {};
        let dataFetchTime: number | undefined;
        
        if (options.fetchData !== false && template.dataRequirements.length > 0) {
          const fetchStartTime = Date.now();
          data = await this.fetchTemplateData(template, context, options);
          dataFetchTime = Date.now() - fetchStartTime;
        }

        // Step 4: Resolve render engine
        const engine = this.registry.getEngine(template.engine);
        if (!engine) {
          throw new Error(`Render engine not found: ${template.engine}`);
        }

        // Step 5: Prepare render context
        const renderContext = await this.prepareRenderContext(data, options);

        // Step 6: Perform rendering
        const result = await engine.render(template, renderContext);

        // Step 7: Cache result if appropriate
        if (options.useCache !== false && !options.debug) {
          const cacheKey = this.generateCacheKey(context, options);
          this.cache.set(cacheKey, result);
        }

        const totalRenderTime = Date.now() - startTime;

        this.logger.info('Template rendered successfully', {
          templateType: options.templateType,
          templateId: template.id,
          engine: template.engine,
          format: result.format,
          renderTime: totalRenderTime,
          templateResolutionTime,
          dataFetchTime,
          cacheHit: false,
        });

        return {
          ...result,
          cacheHit: false,
          renderTime: totalRenderTime,
          dataFetchTime,
          templateResolutionTime,
        };
      },
      `render-${request.options.templateType}`
    );
  }

  /**
   * Render multiple templates in batch
   */
  public async renderBatch(requests: RenderRequest[]): Promise<RenderResponse[]> {
    return this.executeWithMetrics(
      async () => {
        const results = await Promise.all(
          requests.map(request => this.render(request))
        );

        this.logger.info('Batch rendering completed', {
          requestCount: requests.length,
          totalTime: results.reduce((sum, r) => sum + r.renderTime, 0),
        });

        return results;
      },
      'renderBatch'
    );
  }

  /**
   * Resolve template provider and template
   */
  private async resolveTemplate(
    templateType: string, 
    context: TemplateContext, 
    options: RenderRequest['options']
  ): Promise<{ provider: TemplateProvider; template: any }> {
    // Get provider
    const provider = this.registry.getProvider(templateType);
    if (!provider) {
      throw new Error(`Template provider not found: ${templateType}`);
    }

    // Validate context
    if (!provider.validateContext(context)) {
      throw new Error('Invalid template context for provider');
    }

    // Build template context
    const templateContext: TemplateContext = {
      ...context,
      templateId: options.templateId,
      parameters: {
        ...context.parameters,
        ...options,
      },
    };

    // Get template
    const template = await provider.getTemplate(templateContext);
    if (!template) {
      throw new Error(`Template not found: ${templateType}:${options.templateId || 'default'}`);
    }

    return { provider, template };
  }

  /**
   * Fetch template data
   */
  private async fetchTemplateData(
    template: unknown,
    context: TemplateContext,
    options: RenderRequest['options']
  ): Promise<Record<string, unknown>> {
    const fetchContext: FetchContext = {
      userId: context.userId,
      filters: options.filters,
      options: {
        includeRelations: true,
      },
    };

    const fetchedData = await this.dataFetcher.fetchData(
      template.dataRequirements,
      fetchContext
    );

    // Merge with provided data (provided data takes precedence)
    return { ...fetchedData, ...options.data };
  }

  /**
   * Prepare render context
   */
  private async prepareRenderContext(
    data: Record<string, unknown>,
    options: RenderRequest['options']
  ): Promise<RenderContext> {
    return {
      data,
      helpers: this.helpers.getHelpersRecord(),
      partials: this.partialManager.getPartialsRecord(),
      options: {
        format: options.format,
        locale: options.locale,
        timezone: options.timezone,
        includeStyles: options.includeStyles,
        debug: options.debug,
      },
    };
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    context: TemplateContext, 
    options: RenderRequest['options']
  ): string {
    const keyParts = [
      options.templateType,
      options.templateId || 'default',
      context.userId.toString(),
      options.format || 'html',
      options.locale || 'en',
    ];

    // Add filters to key if present
    if (options.filters && Object.keys(options.filters).length > 0) {
      keyParts.push(JSON.stringify(options.filters));
    }

    // Add data hash if provided
    if (options.data && Object.keys(options.data).length > 0) {
      keyParts.push(this.hashObject(options.data));
    }

    return keyParts.join('|');
  }

  /**
   * Hash object for cache key
   */
  private hashObject(obj: unknown): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Preview template with sample data
   */
  public async previewTemplate(
    templateType: string,
    templateId: string,
    sampleData: Record<string, unknown> = {},
    options: Partial<RenderRequest['options']> = {}
  ): Promise<RenderResponse> {
    const request: RenderRequest = {
      context: {
        userId: 0, // Preview user
        parameters: {},
      },
      options: {
        templateType,
        templateId,
        data: sampleData,
        fetchData: false,
        useCache: false,
        debug: true,
        format: 'html',
        ...options,
      },
    };

    return this.render(request);
  }

  /**
   * Validate template rendering capability
   */
  public async validateTemplate(
    templateType: string,
    templateId?: string
  ): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if provider exists
      const provider = this.registry.getProvider(templateType);
      if (!provider) {
        issues.push(`Template provider not found: ${templateType}`);
        return { isValid: false, issues, recommendations };
      }

      // Check if template exists
      if (templateId) {
        const template = await provider.getTemplateById(templateId);
        if (!template) {
          issues.push(`Template not found: ${templateId}`);
        } else {
          // Check if engine exists
          const engine = this.registry.getEngine(template.engine);
          if (!engine) {
            issues.push(`Render engine not found: ${template.engine}`);
          }

          // Check data requirements
          if (template.dataRequirements.length > 0) {
            recommendations.push('Template requires data fetching - ensure data sources are available');
          }

          // Check for missing variables in template
          const variables = this.extractTemplateVariables(template.content);
          if (variables.length > 0) {
            recommendations.push(`Template uses variables: ${variables.join(', ')}`);
          }
        }
      }

      // Check helper availability
      const missingHelpers = this.checkRequiredHelpers(templateType);
      if (missingHelpers.length > 0) {
        issues.push(`Missing required helpers: ${missingHelpers.join(', ')}`);
      }

      // Check partial availability
      const missingPartials = this.checkRequiredPartials(templateType);
      if (missingPartials.length > 0) {
        issues.push(`Missing required partials: ${missingPartials.join(', ')}`);
      }

    } catch (_error) {
      issues.push(`Validation error: ${_error instanceof Error ? _error.message : _error}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Extract variables from template content
   */
  private extractTemplateVariables(content: string): string[] {
    const variables = new Set<string>();
    const variableRegex = /\{\{([^{}#/]+)\}\}/g;
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variable.startsWith('#') && !variable.startsWith('/') && 
          !variable.startsWith('else') && !variable.startsWith('this.')) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Check required helpers for template type
   */
  private checkRequiredHelpers(templateType: string): string[] {
    const missingHelpers: string[] = [];
    
    // Define required helpers by template type
    const requiredHelpers: Record<string, string[]> = {
      lesson: ['formatDate', 'gradeLevel'],
      newsletter: ['formatDate', 'truncate'],
      report: ['formatGrade', 'percentage', 'formatDate'],
    };

    const required = requiredHelpers[templateType] || [];
    
    for (const helper of required) {
      if (!this.helpers.getHelper(helper)) {
        missingHelpers.push(helper);
      }
    }

    return missingHelpers;
  }

  /**
   * Check required partials for template type
   */
  private checkRequiredPartials(templateType: string): string[] {
    const missingPartials: string[] = [];
    
    // Define required partials by template type
    const requiredPartials: Record<string, string[]> = {
      lesson: ['header', 'footer'],
      newsletter: ['header', 'footer', 'newsletterSection'],
      report: ['header', 'footer', 'studentInfo'],
    };

    const required = requiredPartials[templateType] || [];
    
    for (const partial of required) {
      if (!this.partialManager.getPartial(partial)) {
        missingPartials.push(partial);
      }
    }

    return missingPartials;
  }

  /**
   * Get rendering statistics
   */
  public async getRenderingStats(): Promise<{
    cacheStats: unknown;
    registryStats: unknown;
    recentRenders: Array<{
      templateType: string;
      renderTime: number;
      cacheHit: boolean;
      timestamp: Date;
    }>;
  }> {
    return {
      cacheStats: this.cache.getStats(),
      registryStats: await this.registry.getStats(),
      recentRenders: [], // Would need to track this in implementation
    };
  }

  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.cache.clear();
    this.logger.info('All rendering caches cleared');
  }

  /**
   * Warm up caches with common templates
   */
  public async warmupCaches(
    commonTemplates: Array<{
      templateType: string;
      templateId?: string;
      sampleData?: Record<string, unknown>;
    }>
  ): Promise<void> {
    this.logger.info('Starting cache warmup', { templateCount: commonTemplates.length });

    for (const template of commonTemplates) {
      try {
        await this.previewTemplate(
          template.templateType,
          template.templateId || 'default',
          template.sampleData || {}
        );
      } catch (_error) {
        this.logger.error('Failed to warm up template cache', {
          template,
          error: _error instanceof Error ? _error.message : _error,
        });
      }
    }

    this.logger.info('Cache warmup completed');
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.registry.cleanup();
    await this.cache.cleanup();
    await this.partialManager.cleanup();
    
    this.logger.info('Render coordinator cleanup completed');
  }
}

// Export singleton instance
export const renderCoordinator = RenderCoordinator.getInstance();