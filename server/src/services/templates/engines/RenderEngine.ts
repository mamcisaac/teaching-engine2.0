/**
 * Render Engine Interface
 * Base interface for all template rendering engines
 */

import { Template } from '../providers/TemplateProvider';

export interface RenderResult {
  content: string | Buffer;
  format: 'html' | 'pdf' | 'text' | 'markdown';
  metadata?: {
    renderTime: number;
    engine: string;
    warnings?: string[];
  };
}

export interface RenderContext {
  data: Record<string, any>;
  helpers?: Record<string, Function>;
  partials?: Record<string, string>;
  options?: Record<string, any>;
}

export abstract class RenderEngine {
  constructor(protected name: string) {}

  /**
   * Render template with data
   */
  abstract render(template: Template, context: RenderContext): Promise<RenderResult>;

  /**
   * Validate template syntax
   */
  abstract validate(template: Template): Promise<boolean>;

  /**
   * Get supported formats
   */
  abstract getSupportedFormats(): string[];

  /**
   * Precompile template for performance
   */
  abstract precompile(template: Template): Promise<any>;

  /**
   * Get engine name
   */
  getName(): string {
    return this.name;
  }
}