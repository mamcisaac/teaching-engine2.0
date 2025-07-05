/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Template Helpers Service
 * Manages template helper functions and utilities
 */

import { BaseService } from '../base/BaseService';

export interface HelperFunction {
  name: string;
  fn: (...args: unknown[]) => unknown;
  description?: string;
  category?: string;
  examples?: string[];
}

export interface HelperCategory {
  name: string;
  description: string;
  helpers: string[];
}

export class TemplateHelpers extends BaseService {
  private static instance: TemplateHelpers;
  private helpers: Map<string, HelperFunction> = new Map();
  private categories: Map<string, HelperCategory> = new Map();

  private constructor() {
    super('TemplateHelpers');
    this.initializeDefaultHelpers();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TemplateHelpers {
    if (!TemplateHelpers.instance) {
      TemplateHelpers.instance = new TemplateHelpers();
    }
    return TemplateHelpers.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Template helpers initialized', {
      helpersCount: this.helpers.size,
      categoriesCount: this.categories.size,
    });
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      helpers: this.helpers.size > 0,
    };
  }

  /**
   * Initialize default helpers
   */
  private initializeDefaultHelpers(): void {
    // Formatting helpers
    this.registerHelper('formatCurrency', {
      name: 'formatCurrency',
      fn: (amount: number, currency: string = 'USD', locale: string = 'en-US') => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(amount);
      },
      description: 'Format a number as currency',
      category: 'formatting',
      examples: ['{{formatCurrency 1234.56}}', '{{formatCurrency 1234.56 "CAD" "en-CA"}}'],
    });

    this.registerHelper('formatDate', {
      name: 'formatDate',
      fn: (date: Date | string, format: string = 'short', locale: string = 'en-US') => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (format === 'short') {
          return dateObj.toLocaleDateString(locale);
        } else if (format === 'long') {
          return dateObj.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } else if (format === 'time') {
          return dateObj.toLocaleTimeString(locale);
        } else {
          return dateObj.toLocaleDateString(locale);
        }
      },
      description: 'Format a date',
      category: 'formatting',
      examples: ['{{formatDate myDate}}', '{{formatDate myDate "long"}}'],
    });

    this.registerHelper('formatGrade', {
      name: 'formatGrade',
      fn: (grade: string | number) => {
        const numGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
        if (isNaN(numGrade)) return 'N/A';
        if (numGrade >= 80) return 'A';
        if (numGrade >= 70) return 'B';
        if (numGrade >= 60) return 'C';
        if (numGrade >= 50) return 'D';
        return 'R';
      },
      description: 'Convert numeric grade to letter grade',
      category: 'educational',
      examples: ['{{formatGrade 85}}', '{{formatGrade student.grade}}'],
    });

    this.registerHelper('formatPhoneNumber', {
      name: 'formatPhoneNumber',
      fn: (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
      },
      description: 'Format phone number',
      category: 'formatting',
      examples: ['{{formatPhoneNumber "5551234567"}}'],
    });

    // Math helpers
    this.registerHelper('add', {
      name: 'add',
      fn: (a: number, b: number) => a + b,
      description: 'Add two numbers',
      category: 'math',
      examples: ['{{add 5 3}}', '{{add student.score bonus}}'],
    });

    this.registerHelper('subtract', {
      name: 'subtract',
      fn: (a: number, b: number) => a - b,
      description: 'Subtract two numbers',
      category: 'math',
      examples: ['{{subtract 10 3}}'],
    });

    this.registerHelper('multiply', {
      name: 'multiply',
      fn: (a: number, b: number) => a * b,
      description: 'Multiply two numbers',
      category: 'math',
      examples: ['{{multiply 5 3}}'],
    });

    this.registerHelper('divide', {
      name: 'divide',
      fn: (a: number, b: number) => (b !== 0 ? a / b : 0),
      description: 'Divide two numbers (safe division)',
      category: 'math',
      examples: ['{{divide 15 3}}'],
    });

    this.registerHelper('percentage', {
      name: 'percentage',
      fn: (value: number, total: number) => {
        if (total === 0) return '0%';
        return `${Math.round((value / total) * 100)}%`;
      },
      description: 'Calculate percentage',
      category: 'math',
      examples: ['{{percentage correct total}}'],
    });

    // String helpers
    this.registerHelper('capitalize', {
      name: 'capitalize',
      fn: (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },
      description: 'Capitalize first letter',
      category: 'string',
      examples: ['{{capitalize "hello world"}}'],
    });

    this.registerHelper('uppercase', {
      name: 'uppercase',
      fn: (str: string) => (str ? str.toUpperCase() : ''),
      description: 'Convert to uppercase',
      category: 'string',
      examples: ['{{uppercase student.name}}'],
    });

    this.registerHelper('lowercase', {
      name: 'lowercase',
      fn: (str: string) => (str ? str.toLowerCase() : ''),
      description: 'Convert to lowercase',
      category: 'string',
      examples: ['{{lowercase student.name}}'],
    });

    this.registerHelper('truncate', {
      name: 'truncate',
      fn: (str: string, length: number = 50) => {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length - 3) + '...';
      },
      description: 'Truncate string to specified length',
      category: 'string',
      examples: ['{{truncate description 100}}'],
    });

    // Comparison helpers
    this.registerHelper('eq', {
      name: 'eq',
      fn: (a: unknown, b: unknown) => a === b,
      description: 'Check if values are equal',
      category: 'comparison',
      examples: ['{{#if (eq status "active")}}...{{/if}}'],
    });

    this.registerHelper('ne', {
      name: 'ne',
      fn: (a: unknown, b: unknown) => a !== b,
      description: 'Check if values are not equal',
      category: 'comparison',
      examples: ['{{#if (ne status "inactive")}}...{{/if}}'],
    });

    this.registerHelper('gt', {
      name: 'gt',
      fn: (a: number, b: number) => a > b,
      description: 'Check if first value is greater than second',
      category: 'comparison',
      examples: ['{{#if (gt score 80)}}...{{/if}}'],
    });

    this.registerHelper('lt', {
      name: 'lt',
      fn: (a: number, b: number) => a < b,
      description: 'Check if first value is less than second',
      category: 'comparison',
      examples: ['{{#if (lt score 50)}}...{{/if}}'],
    });

    // Educational helpers
    this.registerHelper('gradeLevel', {
      name: 'gradeLevel',
      fn: (grade: number) => {
        if (grade <= 0) return 'Pre-K';
        if (grade <= 8) return `Grade ${grade}`;
        if (grade === 9) return 'Grade 9';
        if (grade === 10) return 'Grade 10';
        if (grade === 11) return 'Grade 11';
        if (grade === 12) return 'Grade 12';
        return 'Post-Secondary';
      },
      description: 'Format grade number to grade level',
      category: 'educational',
      examples: ['{{gradeLevel 5}}', '{{gradeLevel student.grade}}'],
    });

    this.registerHelper('academicYear', {
      name: 'academicYear',
      fn: (date?: Date) => {
        const now = date || new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        if (month >= 8) {
          // September or later
          return `${year}-${year + 1}`;
        } else {
          return `${year - 1}-${year}`;
        }
      },
      description: 'Get current academic year',
      category: 'educational',
      examples: ['{{academicYear}}', '{{academicYear startDate}}'],
    });

    // Array helpers
    this.registerHelper('first', {
      name: 'first',
      fn: (array: unknown[]) => (array && array.length > 0 ? array[0] : null),
      description: 'Get first item from array',
      category: 'array',
      examples: ['{{first students}}'],
    });

    this.registerHelper('last', {
      name: 'last',
      fn: (array: unknown[]) => (array && array.length > 0 ? array[array.length - 1] : null),
      description: 'Get last item from array',
      category: 'array',
      examples: ['{{last grades}}'],
    });

    this.registerHelper('length', {
      name: 'length',
      fn: (array: unknown[]) => (array ? array.length : 0),
      description: 'Get array length',
      category: 'array',
      examples: ['{{length students}}'],
    });

    this.registerHelper('join', {
      name: 'join',
      fn: (array: unknown[], separator: string = ', ') => {
        if (!array || !Array.isArray(array)) return '';
        return array.join(separator);
      },
      description: 'Join array elements with separator',
      category: 'array',
      examples: ['{{join subjects ", "}}'],
    });

    // Initialize categories
    this.initializeCategories();
  }

  /**
   * Initialize helper categories
   */
  private initializeCategories(): void {
    this.categories.set('formatting', {
      name: 'Formatting',
      description: 'Helpers for formatting numbers, dates, and text',
      helpers: [],
    });

    this.categories.set('math', {
      name: 'Math',
      description: 'Mathematical operations and calculations',
      helpers: [],
    });

    this.categories.set('string', {
      name: 'String',
      description: 'String manipulation and formatting',
      helpers: [],
    });

    this.categories.set('comparison', {
      name: 'Comparison',
      description: 'Comparison operations for conditional logic',
      helpers: [],
    });

    this.categories.set('educational', {
      name: 'Educational',
      description: 'Education-specific helpers for grades, dates, etc.',
      helpers: [],
    });

    this.categories.set('array', {
      name: 'Array',
      description: 'Array manipulation and iteration helpers',
      helpers: [],
    });

    // Populate category helper lists
    for (const helper of this.helpers.values()) {
      if (helper.category) {
        const category = this.categories.get(helper.category);
        if (category) {
          category.helpers.push(helper.name);
        }
      }
    }
  }

  /**
   * Register a helper function
   */
  public registerHelper(name: string, helper: Omit<HelperFunction, 'name'>): void {
    this.helpers.set(name, { name, ...helper });

    // Add to category if specified
    if (helper.category) {
      const category = this.categories.get(helper.category);
      if (category && !category.helpers.includes(name)) {
        category.helpers.push(name);
      }
    }

    this.logger.debug('Helper registered', { name, category: helper.category });
  }

  /**
   * Get helper function
   */
  public getHelper(name: string): ((...args: unknown[]) => unknown) | null {
    const helper = this.helpers.get(name);
    return helper ? helper.fn : null;
  }

  /**
   * Get all helpers as a record for template engines
   */
  public getHelpersRecord(): Record<string, (...args: unknown[]) => unknown> {
    const record: Record<string, (...args: unknown[]) => unknown> = {};

    for (const [name, helper] of this.helpers) {
      record[name] = helper.fn;
    }

    return record;
  }

  /**
   * Get helpers by category
   */
  public getHelpersByCategory(category: string): HelperFunction[] {
    return Array.from(this.helpers.values()).filter((h) => h.category === category);
  }

  /**
   * List all helper names
   */
  public listHelperNames(): string[] {
    return Array.from(this.helpers.keys());
  }

  /**
   * List all categories
   */
  public listCategories(): HelperCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Get helper documentation
   */
  public getHelperDocumentation(name: string): HelperFunction | null {
    return this.helpers.get(name) || null;
  }

  /**
   * Search helpers by name or description
   */
  public searchHelpers(query: string): HelperFunction[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.helpers.values()).filter(
      (helper) =>
        helper.name.toLowerCase().includes(lowerQuery) ||
        (helper.description && helper.description.toLowerCase().includes(lowerQuery)),
    );
  }

  /**
   * Remove helper
   */
  public removeHelper(name: string): boolean {
    const helper = this.helpers.get(name);
    if (helper) {
      this.helpers.delete(name);

      // Remove from category
      if (helper.category) {
        const category = this.categories.get(helper.category);
        if (category) {
          const index = category.helpers.indexOf(name);
          if (index > -1) {
            category.helpers.splice(index, 1);
          }
        }
      }

      this.logger.debug('Helper removed', { name });
      return true;
    }
    return false;
  }

  /**
   * Test helper function
   */
  public testHelper(name: string, ...args: unknown[]): unknown {
    const helper = this.getHelper(name);
    if (!helper) {
      throw new Error(`Helper not found: ${name}`);
    }

    try {
      return helper(...args);
    } catch (_error) {
      this.logger.error('Helper test failed', {
        name,
        args,
        error: _error instanceof Error ? _error.message : _error,
      });
      throw _error;
    }
  }

  /**
   * Validate all helpers
   */
  public validateHelpers(): { valid: string[]; invalid: Array<{ name: string; error: string }> } {
    const valid: string[] = [];
    const invalid: Array<{ name: string; error: string }> = [];

    for (const [name, helper] of this.helpers) {
      try {
        // Basic validation - check if function exists
        if (typeof helper.fn !== 'function') {
          invalid.push({ name, error: 'Not a function' });
        } else {
          valid.push(name);
        }
      } catch (_error) {
        invalid.push({ name, error: _error instanceof Error ? _error.message : String(_error) });
      }
    }

    return { valid, invalid };
  }
}

// Export singleton instance
export const templateHelpers = TemplateHelpers.getInstance();
