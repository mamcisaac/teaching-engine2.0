/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Template Provider Interface
 * Base interface for all template providers
 */

export interface Template {
  id: string;
  name: string;
  type?: string;
  engine: 'handlebars' | 'pdf' | 'email' | 'react';
  format: 'html' | 'pdf' | 'text' | 'markdown';
  supportedFormats: string[];
  content: string;
  dataRequirements: DataRequirement[];
  metadata?: {
    version?: string;
    author?: string;
    lastModified?: Date;
    tags?: string[];
  };
}

export interface DataRequirement {
  key: string;
  type: 'user' | 'student' | 'lesson' | 'assessment' | 'curriculum' | 'custom';
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface TemplateContext {
  userId: number;
  templateId?: string;
  locale?: string;
  timezone?: string;
  parameters?: Record<string, unknown>;
}

export interface RenderOptions {
  format?: 'html' | 'pdf' | 'text' | 'markdown';
  locale?: string;
  timezone?: string;
  includeStyles?: boolean;
  debug?: boolean;
}

export abstract class TemplateProvider {
  protected templates = new Map<string, Template>();

  constructor(protected name: string) {}

  /**
   * Get template by context
   */
  abstract getTemplate(context: TemplateContext): Promise<Template>;

  /**
   * List available templates
   */
  abstract listTemplates(): Promise<Template[]>;

  /**
   * Validate template context
   */
  abstract validateContext(context: TemplateContext): boolean;

  /**
   * Initialize the provider (optional)
   */
  async initialize?(): Promise<void>;

  /**
   * Validate provider health (optional)
   */
  validateHealth?(): Promise<boolean>;

  /**
   * Get provider metadata (optional)
   */
  getMetadata?(): Record<string, unknown>;

  /**
   * Cleanup provider resources (optional)
   */
  async cleanup?(): Promise<void>;

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<Template | null> {
    return this.templates.get(id) ?? null;
  }

  /**
   * Register template
   */
  protected registerTemplate(template: Template): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get data requirements for template
   */
  async getDataRequirements(templateId: string): Promise<DataRequirement[]> {
    const template = await this.getTemplateById(templateId);
    return template.dataRequirements ?? [];
  }

  /**
   * Load templates from files
   */
  protected abstract loadTemplates(): void;

  /**
   * Get template variables
   */
  protected extractVariables(content: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!match[1]) continue;
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }
}