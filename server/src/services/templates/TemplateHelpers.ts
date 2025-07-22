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
  private static instance: TemplateHelpers | undefined;
  private helpers = new Map<string, HelperFunction>();
  private categories = new Map<string, HelperCategory>();

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
    this.logger.info(
      `Template helpers initialized: helpersCount=${this.helpers.size}, categoriesCount=${this.categories.size}`,
    );
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
      fn: (...args: unknown[]) => {
        const [amount, currency = 'USD', locale = 'en-US'] = args as [number, string?, string?];
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
      fn: (...args: unknown[]) => {
        const [date, format = 'short', locale = 'en-US'] = args as [
          Date | string,
          string?,
          string?,
        ];
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
        } 
          return dateObj.toLocaleDateString(locale);
        
      },
      description: 'Format a date',
      category: 'formatting',
      examples: ['{{formatDate myDate}}', '{{formatDate myDate "long"}}'],
    });

    this.registerHelper('formatGrade', {
      fn: (...args: unknown[]) => {
        const [grade] = args as [string | number];
        const numGrade = typeof grade === 'string' ? parseFloat(grade) : grade;
        if (isNaN(numGrade)) {
return 'N/A';
}
        if (numGrade >= 80) {
return 'A';
}
        if (numGrade >= 70) {
return 'B';
}
        if (numGrade >= 60) {
return 'C';
}
        if (numGrade >= 50) {
return 'D';
}
        return 'R';
      },
      description: 'Convert numeric grade to letter grade',
      category: 'educational',
      examples: ['{{formatGrade 85}}', '{{formatGrade student.grade}}'],
    });

    this.registerHelper('formatPhoneNumber', {
      fn: (...args: unknown[]) => {
        const [phone] = args as [string];
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
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return a + b;
      },
      description: 'Add two numbers',
      category: 'math',
      examples: ['{{add 5 3}}', '{{add student.score bonus}}'],
    });

    this.registerHelper('subtract', {
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return a - b;
      },
      description: 'Subtract two numbers',
      category: 'math',
      examples: ['{{subtract 10 3}}'],
    });

    this.registerHelper('multiply', {
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return a * b;
      },
      description: 'Multiply two numbers',
      category: 'math',
      examples: ['{{multiply 5 3}}'],
    });

    this.registerHelper('divide', {
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return b !== 0 ? a / b : 0;
      },
      description: 'Divide two numbers (safe division)',
      category: 'math',
      examples: ['{{divide 15 3}}'],
    });

    this.registerHelper('percentage', {
      fn: (...args: unknown[]) => {
        const [value, total] = args as [number, number];
        if (total === 0) {
return '0%';
}
        return `${Math.round((value / total) * 100)}%`;
      },
      description: 'Calculate percentage',
      category: 'math',
      examples: ['{{percentage correct total}}'],
    });

    // String helpers
    this.registerHelper('capitalize', {
      fn: (...args: unknown[]) => {
        const [str] = args as [string];
        if (!str) {
return '';
}
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },
      description: 'Capitalize first letter',
      category: 'string',
      examples: ['{{capitalize "hello world"}}'],
    });

    this.registerHelper('uppercase', {
      fn: (...args: unknown[]) => {
        const [str] = args as [string];
        return str ? str.toUpperCase() : '';
      },
      description: 'Convert to uppercase',
      category: 'string',
      examples: ['{{uppercase student.name}}'],
    });

    this.registerHelper('lowercase', {
      fn: (...args: unknown[]) => {
        const [str] = args as [string];
        return str ? str.toLowerCase() : '';
      },
      description: 'Convert to lowercase',
      category: 'string',
      examples: ['{{lowercase student.name}}'],
    });

    this.registerHelper('truncate', {
      fn: (...args: unknown[]) => {
        const [str, length = 50] = args as [string, number?];
        if (!str) {
return '';
}
        if (str.length <= length) {
return str;
}
        return `${str.substring(0, length - 3)  }...`;
      },
      description: 'Truncate string to specified length',
      category: 'string',
      examples: ['{{truncate description 100}}'],
    });

    // Comparison helpers
    this.registerHelper('eq', {
      fn: (...args: unknown[]) => {
        const [a, b] = args;
        return a === b;
      },
      description: 'Check if values are equal',
      category: 'comparison',
      examples: ['{{#if (eq status "active")}}...{{/if}}'],
    });

    this.registerHelper('ne', {
      fn: (...args: unknown[]) => {
        const [a, b] = args;
        return a !== b;
      },
      description: 'Check if values are not equal',
      category: 'comparison',
      examples: ['{{#if (ne status "inactive")}}...{{/if}}'],
    });

    this.registerHelper('gt', {
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return a > b;
      },
      description: 'Check if first value is greater than second',
      category: 'comparison',
      examples: ['{{#if (gt score 80)}}...{{/if}}'],
    });

    this.registerHelper('lt', {
      fn: (...args: unknown[]) => {
        const [a, b] = args as [number, number];
        return a < b;
      },
      description: 'Check if first value is less than second',
      category: 'comparison',
      examples: ['{{#if (lt score 50)}}...{{/if}}'],
    });

    // Educational helpers
    this.registerHelper('gradeLevel', {
      fn: (...args: unknown[]) => {
        const [grade] = args as [number];
        if (grade <= 0) {
return 'Pre-K';
}
        if (grade <= 8) {
return `Grade ${grade}`;
}
        if (grade === 9) {
return 'Grade 9';
}
        if (grade === 10) {
return 'Grade 10';
}
        if (grade === 11) {
return 'Grade 11';
}
        if (grade === 12) {
return 'Grade 12';
}
        return 'Post-Secondary';
      },
      description: 'Format grade number to grade level',
      category: 'educational',
      examples: ['{{gradeLevel 5}}', '{{gradeLevel student.grade}}'],
    });

    this.registerHelper('academicYear', {
      fn: (...args: unknown[]) => {
        const [date] = args as [Date?];
        const now = date || new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        if (month >= 8) {
          // September or later
          return `${year}-${year + 1}`;
        } 
          return `${year - 1}-${year}`;
        
      },
      description: 'Get current academic year',
      category: 'educational',
      examples: ['{{academicYear}}', '{{academicYear startDate}}'],
    });

    // Array helpers
    this.registerHelper('first', {
      fn: (...args: unknown[]) => {
        const [array] = args as [unknown[]];
        return array !== null && array !== undefined && array.length > 0 ? array[0] : null;
      },
      description: 'Get first item from array',
      category: 'array',
      examples: ['{{first students}}'],
    });

    this.registerHelper('last', {
      fn: (...args: unknown[]) => {
        const [array] = args as [unknown[]];
        return array !== null && array !== undefined && array.length > 0 ? array[array.length - 1] : null;
      },
      description: 'Get last item from array',
      category: 'array',
      examples: ['{{last grades}}'],
    });

    this.registerHelper('length', {
      fn: (...args: unknown[]) => {
        const [array] = args as [unknown[]];
        return array.length ?? 0;
      },
      description: 'Get array length',
      category: 'array',
      examples: ['{{length students}}'],
    });

    this.registerHelper('join', {
      fn: (...args: unknown[]) => {
        const [array, separator = ', '] = args as [unknown[], string?];
        if (!array || !Array.isArray(array)) {
return '';
}
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
      name: 'formatting',
      description: 'Helpers for formatting numbers, dates, and text',
      helpers: [],
    });

    this.categories.set('math', {
      name: 'math',
      description: 'Mathematical operations and calculations',
      helpers: [],
    });

    this.categories.set('string', {
      name: 'string',
      description: 'String manipulation and formatting',
      helpers: [],
    });

    this.categories.set('comparison', {
      name: 'comparison',
      description: 'Comparison operations for conditional logic',
      helpers: [],
    });

    this.categories.set('educational', {
      name: 'educational',
      description: 'Education-specific helpers for grades, dates, etc.',
      helpers: [],
    });

    this.categories.set('array', {
      name: 'array',
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

    this.logger.debug(`Helper registered: name=${name}, category=${helper.category || 'none'}`);
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

      this.logger.debug(`Helper removed: name=${name}`);
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
      this.logger.error(
        `Helper test failed: name=${name}, args=${JSON.stringify(args)}, error=${_error instanceof Error ? _error.message : _error}`,
      );
      throw _error;
    }
  }

  /**
   * Validate all helpers
   */
  public validateHelpers(): { valid: string[]; invalid: { name: string; error: string }[] } {
    const valid: string[] = [];
    const invalid: { name: string; error: string }[] = [];

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
