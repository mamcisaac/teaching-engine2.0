/**
 * Handlebars Template Engine
 * Renders templates using Handlebars
 */

import * as Handlebars from 'handlebars';
import { RenderEngine, RenderResult, RenderContext } from './RenderEngine';
import { Template } from '../providers/TemplateProvider';

export class HandlebarsEngine extends RenderEngine {
  private handlebars: typeof Handlebars;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    super('handlebars');
    this.handlebars = Handlebars.create();
    this.registerDefaultHelpers();
  }

  /**
   * Render template
   */
  async render(template: Template, context: RenderContext): Promise<RenderResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Get or compile template
      let compiled = this.compiledTemplates.get(template.id);
      if (!compiled) {
        compiled = await this.precompile(template);
      }

      // Register custom helpers
      if (context.helpers) {
        Object.entries(context.helpers).forEach(([name, helper]) => {
          this.handlebars.registerHelper(name, helper);
        });
      }

      // Register partials
      if (context.partials) {
        Object.entries(context.partials).forEach(([name, partial]) => {
          this.handlebars.registerPartial(name, partial);
        });
      }

      // Render template
      const content = compiled(context.data);

      return {
        content,
        format: template.format as any,
        metadata: {
          renderTime: Date.now() - startTime,
          engine: this.name,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (error) {
      throw new Error(`Handlebars render error: ${error.message}`);
    }
  }

  /**
   * Validate template
   */
  async validate(template: Template): Promise<boolean> {
    try {
      this.handlebars.compile(template.content);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return ['html', 'text', 'markdown'];
  }

  /**
   * Precompile template
   */
  async precompile(template: Template): Promise<HandlebarsTemplateDelegate> {
    const compiled = this.handlebars.compile(template.content);
    this.compiledTemplates.set(template.id, compiled);
    return compiled;
  }

  /**
   * Register default helpers
   */
  private registerDefaultHelpers(): void {
    // Date formatting
    this.handlebars.registerHelper('formatDate', (date: any, format?: string) => {
      if (!date) return '';
      
      const d = date === 'now' ? new Date() : new Date(date);
      
      if (format === 'short') {
        return d.toLocaleDateString();
      } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    });

    // Time formatting
    this.handlebars.registerHelper('formatTime', (date: any) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    });

    // Number formatting
    this.handlebars.registerHelper('formatNumber', (num: any, decimals: number = 0) => {
      const n = parseFloat(num);
      if (isNaN(n)) return '0';
      return n.toFixed(decimals);
    });

    // Percentage formatting
    this.handlebars.registerHelper('formatPercent', (num: any) => {
      const n = parseFloat(num);
      if (isNaN(n)) return '0%';
      return `${Math.round(n)}%`;
    });

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    this.handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
    this.handlebars.registerHelper('lt', (a: any, b: any) => a < b);
    this.handlebars.registerHelper('gt', (a: any, b: any) => a > b);
    this.handlebars.registerHelper('lte', (a: any, b: any) => a <= b);
    this.handlebars.registerHelper('gte', (a: any, b: any) => a >= b);

    // Array helpers
    this.handlebars.registerHelper('length', (arr: any[]) => {
      return Array.isArray(arr) ? arr.length : 0;
    });

    this.handlebars.registerHelper('join', (arr: any[], separator: string = ', ') => {
      return Array.isArray(arr) ? arr.join(separator) : '';
    });

    // String helpers
    this.handlebars.registerHelper('uppercase', (str: string) => {
      return typeof str === 'string' ? str.toUpperCase() : '';
    });

    this.handlebars.registerHelper('lowercase', (str: string) => {
      return typeof str === 'string' ? str.toLowerCase() : '';
    });

    this.handlebars.registerHelper('capitalize', (str: string) => {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.handlebars.registerHelper('truncate', (str: string, length: number = 50) => {
      if (typeof str !== 'string') return '';
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });

    // Math helpers
    this.handlebars.registerHelper('add', (a: number, b: number) => a + b);
    this.handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
    this.handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
    this.handlebars.registerHelper('divide', (a: number, b: number) => b !== 0 ? a / b : 0);

    // Index helper for loops
    this.handlebars.registerHelper('inc', (value: number) => value + 1);

    // JSON helper
    this.handlebars.registerHelper('json', (context: any) => {
      return JSON.stringify(context, null, 2);
    });

    // Default value helper
    this.handlebars.registerHelper('default', (value: any, defaultValue: any) => {
      return value || defaultValue;
    });

    // Pluralize helper
    this.handlebars.registerHelper('pluralize', (count: number, singular: string, plural?: string) => {
      return count === 1 ? singular : (plural || singular + 's');
    });
  }

  /**
   * Clear compiled template cache
   */
  clearCache(): void {
    this.compiledTemplates.clear();
  }

  /**
   * Register custom helper
   */
  registerHelper(name: string, helper: Function): void {
    this.handlebars.registerHelper(name, helper as any);
  }

  /**
   * Register custom partial
   */
  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial);
  }
}