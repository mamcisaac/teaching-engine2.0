/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Handlebars Template Engine
 * Renders templates using Handlebars
 */

import * as Handlebars from 'handlebars';

import type { Template } from '../providers/TemplateProvider';

import type { RenderResult, RenderContext } from './RenderEngine';
import { RenderEngine } from './RenderEngine';

export class HandlebarsEngine extends RenderEngine {
  private handlebars: typeof Handlebars;
  private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

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
        format: template.format as 'html' | 'pdf' | 'text' | 'markdown',
        metadata: {
          renderTime: Date.now() - startTime,
          engine: this.name,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (error: unknown) {
      throw new Error(`Handlebars render error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate template
   */
  async validate(template: Template): Promise<boolean> {
    try {
      // Try to compile the template
      const compiled = this.handlebars.compile(template.content);
      
      // Try to render with empty context to catch runtime errors
      // This helps catch unclosed blocks and other syntax errors
      try {
        compiled({});
      } catch (renderError) {
        // If rendering with empty context fails, it's likely a syntax error
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      // Compilation error
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
    this.handlebars.registerHelper('formatDate', (date: unknown, format?: string) => {
      if (date === null || date === undefined) {
        return '';
      }
      
      let d: Date;
      if (date === 'now') {
        d = new Date();
      } else if (typeof date === 'string') {
        // Parse ISO date strings as UTC and convert to local date
        // This ensures '2024-01-15' is always treated as Jan 15, not Jan 14
        const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        } else {
          d = new Date(date);
        }
      } else if (date instanceof Date) {
        // For Date objects created from date-only strings, check if it's at UTC midnight
        // and adjust to local date if so
        if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && 
            date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
          // This is likely a date-only Date object, use local date components
          d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        } else {
          d = date;
        }
      } else {
        d = new Date(date as string | number | Date);
      }
      
      if (format === 'short') {
        // Use manual formatting to ensure consistent results
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } 
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      
    });

    // Time formatting
    this.handlebars.registerHelper('formatTime', (date: unknown) => {
      if (date === null || date === undefined) {
        return '';
      }
      const d = new Date(date as string | number | Date);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    });

    // Number formatting
    this.handlebars.registerHelper('formatNumber', (num: unknown, decimals = 0) => {
      const n = parseFloat(num as string);
      if (isNaN(n)) {
return '0';
}
      return n.toFixed(decimals);
    });

    // Percentage formatting
    this.handlebars.registerHelper('formatPercent', (num: unknown) => {
      const n = parseFloat(num as string);
      if (isNaN(n)) {
return '0%';
}
      return `${Math.round(n)}%`;
    });

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    this.handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
    this.handlebars.registerHelper('lt', (a: unknown, b: unknown) => (a as any) < (b as any));
    this.handlebars.registerHelper('gt', (a: unknown, b: unknown) => (a as any) > (b as any));
    this.handlebars.registerHelper('lte', (a: unknown, b: unknown) => (a as any) <= (b as any));
    this.handlebars.registerHelper('gte', (a: unknown, b: unknown) => (a as any) >= (b as any));

    // Array helpers
    this.handlebars.registerHelper('length', (arr: unknown[]) => Array.isArray(arr) ? arr.length : 0);

    this.handlebars.registerHelper('join', (arr: unknown[], separator = ', ') => Array.isArray(arr) ? arr.join(separator) : '');

    // String helpers
    this.handlebars.registerHelper('uppercase', (str: string) => typeof str === 'string' ? str.toUpperCase() : '');

    this.handlebars.registerHelper('lowercase', (str: string) => typeof str === 'string' ? str.toLowerCase() : '');

    this.handlebars.registerHelper('capitalize', (str: string) => {
      if (typeof str !== 'string') {
return '';
}
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.handlebars.registerHelper('truncate', (str: string, length = 50) => {
      if (typeof str !== 'string') {
return '';
}
      if (str.length <= length) {
return str;
}
      return `${str.substring(0, length)  }...`;
    });

    // Math helpers
    this.handlebars.registerHelper('add', (a: number, b: number) => a + b);
    this.handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
    this.handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
    this.handlebars.registerHelper('divide', (a: number, b: number) => b !== 0 ? a / b : 0);

    // Index helper for loops
    this.handlebars.registerHelper('inc', (value: number) => value + 1);

    // JSON helper
    this.handlebars.registerHelper('json', (context: unknown) => JSON.stringify(context, null, 2));

    // Default value helper
    this.handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => value !== null && value !== undefined ? value : defaultValue);

    // Pluralize helper
    this.handlebars.registerHelper('pluralize', (count: number, singular: string, plural?: string) => count === 1 ? singular : (plural !== null && plural !== undefined && plural !== '' ? plural : `${singular  }s`));
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
  registerHelper(name: string, helper: (...args: unknown[]) => unknown): void {
    this.handlebars.registerHelper(name, helper as any);
  }

  /**
   * Register custom partial
   */
  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial);
  }
}