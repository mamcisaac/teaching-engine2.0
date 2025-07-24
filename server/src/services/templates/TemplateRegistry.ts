/**
 * Template Registry Service
 * Manages template providers and render engines
 */

import { BaseService } from '../base/BaseService';

import { HandlebarsEngine } from './engines/HandlebarsEngine';
import { PdfEngine } from './engines/PdfEngine';
import type { RenderEngine } from './engines/RenderEngine';
import { LessonTemplateProvider } from './providers/LessonTemplateProvider';
import { NewsletterTemplateProvider } from './providers/NewsletterTemplateProvider';
import { ReportTemplateProvider } from './providers/ReportTemplateProvider';
import type { TemplateProvider, Template } from './providers/TemplateProvider';

export interface ProviderInfo {
  name: string;
  type: string;
  provider: TemplateProvider;
  isActive: boolean;
  registeredAt: Date;
  templateCount?: number;
}

export interface EngineInfo {
  name: string;
  engine: RenderEngine;
  isActive: boolean;
  registeredAt: Date;
  supportedFormats: string[];
}

export interface RegistryStats {
  providers: {
    total: number;
    active: number;
    byType: Record<string, number>;
  };
  engines: {
    total: number;
    active: number;
    supportedFormats: string[];
  };
  templates: {
    total: number;
    byProvider: Record<string, number>;
  };
}

export class TemplateRegistry extends BaseService {
  private static instance: TemplateRegistry | undefined;
  private providers = new Map<string, ProviderInfo>();
  private engines = new Map<string, EngineInfo>();
  private providersByType = new Map<string, string[]>();

  private constructor() {
    super('TemplateRegistry');
    this.initializeDefaultProviders();
    this.initializeDefaultEngines();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TemplateRegistry {
    if (!TemplateRegistry.instance) {
      TemplateRegistry.instance = new TemplateRegistry();
    }
    return TemplateRegistry.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();

    // Initialize all providers
    for (const info of this.providers.values()) {
      if (info.provider.initialize) {
        await info.provider.initialize();
      }
    }

    // Initialize all engines
    for (const info of this.engines.values()) {
      if (info.engine.initialize) {
        await info.engine.initialize();
      }
    }

    this.logger.info({
      providers: this.providers.size,
      engines: this.engines.size,
    }, 'Template registry initialized');
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      providers: this.providers.size > 0,
      engines: this.engines.size > 0,
    };
  }

  /**
   * Initialize default providers
   */
  private initializeDefaultProviders(): void {
    this.registerProvider('lesson', new LessonTemplateProvider());
    this.registerProvider('newsletter', new NewsletterTemplateProvider());
    this.registerProvider('report', new ReportTemplateProvider());
  }

  /**
   * Initialize default engines
   */
  private initializeDefaultEngines(): void {
    this.registerEngine('handlebars', new HandlebarsEngine());
    this.registerEngine('pdf', new PdfEngine());
  }

  /**
   * Register a template provider
   */
  public registerProvider(name: string, provider: TemplateProvider, type?: string): void {
    const providerType = type || this.inferProviderType(name, provider);

    const info: ProviderInfo = {
      name,
      type: providerType,
      provider,
      isActive: true,
      registeredAt: new Date(),
    };

    this.providers.set(name, info);

    // Update type index
    if (!this.providersByType.has(providerType)) {
      this.providersByType.set(providerType, []);
    }
    const providers = this.providersByType.get(providerType);
    if (providers) {
      providers.push(name);
    }

    this.logger.info({ name, type: providerType }, 'Template provider registered');
  }

  /**
   * Register a render engine
   */
  public registerEngine(name: string, engine: RenderEngine): void {
    const info: EngineInfo = {
      name,
      engine,
      isActive: true,
      registeredAt: new Date(),
      supportedFormats: this.getSupportedFormats(engine),
    };

    this.engines.set(name, info);
    this.logger.info({
      name,
      supportedFormats: info.supportedFormats,
    }, 'Template engine registered');
  }

  /**
   * Get provider by name
   */
  public getProvider(name: string): TemplateProvider | null {
    const info = this.providers.get(name);
    return info.isActive ? info.provider : null;
  }

  /**
   * Get engine by name
   */
  public getEngine(name: string): RenderEngine | null {
    const info = this.engines.get(name);
    return info.isActive ? info.engine : null;
  }

  /**
   * Get providers by type
   */
  public getProvidersByType(type: string): TemplateProvider[] {
    const providerNames = this.providersByType.get(type) ?? [];
    return providerNames
      .map((name) => this.getProvider(name))
      .filter((provider) => provider !== null);
  }

  /**
   * List all providers
   */
  public listProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).filter((info) => info.isActive);
  }

  /**
   * List all engines
   */
  public listEngines(): EngineInfo[] {
    return Array.from(this.engines.values()).filter((info) => info.isActive);
  }

  /**
   * List all templates from all providers
   */
  public async listAllTemplates(): Promise<Template[]> {
    const allTemplates: Template[] = [];

    for (const info of this.providers.values()) {
      if (info.isActive) {
        try {
          const templates = await info.provider.listTemplates();
          allTemplates.push(...templates);
        } catch (_error) {
          this.logger.error({
            provider: info.name,
            error: _error instanceof Error ? _error.message : _error,
          }, 'Failed to list templates');
        }
      }
    }

    return allTemplates;
  }

  /**
   * List templates by provider
   */
  public async listTemplatesByProvider(providerName: string): Promise<Template[]> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }

    return provider.listTemplates();
  }

  /**
   * Get template by provider and ID
   */
  public async getTemplate(providerName: string, templateId: string): Promise<Template | null> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      return null;
    }

    return provider.getTemplateById(templateId);
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
    const allTemplates = await this.listAllTemplates();

    return allTemplates.filter((template) => {
      if (criteria.type && template.type !== criteria.type) {
        return false;
      }

      if (criteria.format && !template.supportedFormats.includes(criteria.format)) {
        return false;
      }

      if (criteria.engine && template.engine !== criteria.engine) {
        return false;
      }

      if (criteria.tags && criteria.tags.length > 0) {
        const templateTags = template.metadata.tags ?? [];
        if (!criteria.tags.some((tag) => templateTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Activate/deactivate provider
   */
  public setProviderActive(name: string, active: boolean): boolean {
    const info = this.providers.get(name);
    if (info) {
      info.isActive = active;
      this.logger.info({ name, active }, 'Provider activation changed');
      return true;
    }
    return false;
  }

  /**
   * Activate/deactivate engine
   */
  public setEngineActive(name: string, active: boolean): boolean {
    const info = this.engines.get(name);
    if (info) {
      info.isActive = active;
      this.logger.info({ name, active }, 'Engine activation changed');
      return true;
    }
    return false;
  }

  /**
   * Remove provider
   */
  public removeProvider(name: string): boolean {
    const info = this.providers.get(name);
    if (info) {
      // Remove from type index
      const typeProviders = this.providersByType.get(info.type);
      if (typeProviders) {
        const index = typeProviders.indexOf(name);
        if (index > -1) {
          typeProviders.splice(index, 1);
        }
      }

      this.providers.delete(name);
      this.logger.info({ name }, 'Provider removed');
      return true;
    }
    return false;
  }

  /**
   * Remove engine
   */
  public removeEngine(name: string): boolean {
    const removed = this.engines.delete(name);
    if (removed) {
      this.logger.info({ name }, 'Engine removed');
    }
    return removed;
  }

  /**
   * Get registry statistics
   */
  public async getStats(): Promise<RegistryStats> {
    const stats: RegistryStats = {
      providers: {
        total: this.providers.size,
        active: 0,
        byType: {},
      },
      engines: {
        total: this.engines.size,
        active: 0,
        supportedFormats: [],
      },
      templates: {
        total: 0,
        byProvider: {},
      },
    };

    // Provider stats
    for (const info of this.providers.values()) {
      if (info.isActive) {
        stats.providers.active++;
        stats.providers.byType[info.type] = (stats.providers.byType[info.type] || 0) + 1;

        // Count templates
        try {
          const templates = await info.provider.listTemplates();
          stats.templates.total += templates.length;
          stats.templates.byProvider[info.name] = templates.length;
        } catch (_error) {
          this.logger.error({
            provider: info.name,
            error: _error instanceof Error ? _error.message : _error,
          }, 'Failed to count templates');
        }
      }
    }

    // Engine stats
    const allFormats = new Set<string>();
    for (const info of this.engines.values()) {
      if (info.isActive) {
        stats.engines.active++;
        info.supportedFormats.forEach((format) => allFormats.add(format));
      }
    }
    stats.engines.supportedFormats = Array.from(allFormats);

    return stats;
  }

  /**
   * Validate registry health
   */
  public async validateHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if we have active providers
    const activeProviders = Array.from(this.providers.values()).filter((p) => p.isActive);
    if (activeProviders.length === 0) {
      issues.push('No active template providers found');
    }

    // Check if we have active engines
    const activeEngines = Array.from(this.engines.values()).filter((e) => e.isActive);
    if (activeEngines.length === 0) {
      issues.push('No active render engines found');
    }

    // Check provider health
    for (const info of activeProviders) {
      try {
        if (info.provider.validateHealth) {
          const health = await info.provider.validateHealth();
          if (!health) {
            issues.push(`Provider ${info.name} health check failed`);
          }
        }
      } catch (_error) {
        issues.push(
          `Provider ${info.name} health check error: ${_error instanceof Error ? _error.message : _error}`,
        );
      }
    }

    // Check engine health
    for (const info of activeEngines) {
      try {
        if (info.engine.validateHealth) {
          const health = await info.engine.validateHealth();
          if (!health) {
            issues.push(`Engine ${info.name} health check failed`);
          }
        }
      } catch (_error) {
        issues.push(
          `Engine ${info.name} health check error: ${_error instanceof Error ? _error.message : _error}`,
        );
      }
    }

    // Recommendations
    if (activeProviders.length < 3) {
      recommendations.push('Consider adding more template providers for better coverage');
    }

    if (activeEngines.length < 2) {
      recommendations.push('Consider adding more render engines for format diversity');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Infer provider type from name or provider
   */
  private inferProviderType(name: string, provider: TemplateProvider): string {
    // Try to get type from provider metadata
    if (provider.getMetadata().type) {
      const {type} = provider.getMetadata();
      return typeof type === 'string' ? type : 'generic';
    }

    // Fallback to name-based inference
    if (name.includes('lesson')) {
return 'lesson';
}
    if (name.includes('newsletter')) {
return 'newsletter';
}
    if (name.includes('report')) {
return 'report';
}
    if (name.includes('plan')) {
return 'planning';
}

    return 'generic';
  }

  /**
   * Get supported formats from engine
   */
  private getSupportedFormats(engine: RenderEngine): string[] {
    if (engine.getSupportedFormats !== null) {
      return engine.getSupportedFormats();
    }

    // Fallback to common formats
    return ['html'];
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    // Cleanup providers
    for (const info of this.providers.values()) {
      if (info.provider.cleanup) {
        await info.provider.cleanup();
      }
    }

    // Cleanup engines
    for (const info of this.engines.values()) {
      if (info.engine.cleanup) {
        await info.engine.cleanup();
      }
    }

    this.logger.info('Template registry cleanup completed');
  }
}

// Export singleton instance
export const templateRegistry = TemplateRegistry.getInstance();
