/**
 * Partial Manager Service
 * Manages template partials and reusable components
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { BaseService } from '../base/BaseService';

export interface PartialInfo {
  name: string;
  content: string;
  category?: string;
  description?: string;
  variables?: string[];
  dependencies?: string[];
  lastModified: Date;
  source: 'file' | 'database' | 'memory';
}

export interface PartialCategory {
  name: string;
  description: string;
  partials: string[];
}

export class PartialManager extends BaseService {
  private static instance: PartialManager;
  private partials = new Map<string, PartialInfo>();
  private categories = new Map<string, PartialCategory>();
  private partialsDirectory: string;

  private constructor(partialsDirectory?: string) {
    super('PartialManager');
    this.partialsDirectory = partialsDirectory || path.join(process.cwd(), 'templates', 'partials');
    this.initializeDefaultPartials();
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    this.partials.clear();
    this.categories.clear();
    await this.shutdown();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(partialsDirectory?: string): PartialManager {
    if (!PartialManager.instance) {
      PartialManager.instance = new PartialManager(partialsDirectory);
    }
    return PartialManager.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();

    // Load partials from file system
    await this.loadPartialsFromFiles();

    this.logger.info(`Partial manager initialized with ${this.partials.size} partials in ${this.categories.size} categories`);
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      partials: this.partials.size > 0,
    };
  }

  /**
   * Initialize default partials
   */
  private initializeDefaultPartials(): void {
    // Header partial
    this.registerPartial('header', {
      // name: 'header', // name is not part of PartialInfo type
      // name: 'header',
      content: `
        <div class="header">
          <h1>{{title}}</h1>
          {{#if subtitle}}<p class="subtitle">{{subtitle}}</p>{{/if}}
          {{#if date}}<p class="date">{{formatDate date}}</p>{{/if}}
        </div>
      `,
      category: 'layout',
      description: 'Standard header with title, subtitle, and date',
      variables: ['title', 'subtitle', 'date'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Footer partial
    this.registerPartial('footer', {
      // name: 'footer', // name is not part of PartialInfo type
      content: `
        <div class="footer">
          <p>&copy; {{year}} {{schoolName}}</p>
          {{#if address}}<p class="address">{{address}}</p>{{/if}}
          {{#if phone}}<p class="phone">{{formatPhoneNumber phone}}</p>{{/if}}
        </div>
      `,
      category: 'layout',
      description: 'Standard footer with school information',
      variables: ['year', 'schoolName', 'address', 'phone'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Student info partial
    this.registerPartial('studentInfo', {
      // name: 'studentInfo', // name is not part of PartialInfo type
      content: `
        <div class="student-info">
          <h3>{{student.firstName}} {{student.lastName}}</h3>
          <div class="student-details">
            <p><strong>Grade:</strong> {{gradeLevel student.grade}}</p>
            <p><strong>Student ID:</strong> {{student.id}}</p>
            {{#if student.email}}<p><strong>Email:</strong> {{student.email}}</p>{{/if}}
            {{#if student.parentEmail}}<p><strong>Parent Email:</strong> {{student.parentEmail}}</p>{{/if}}
          </div>
        </div>
      `,
      category: 'student',
      description: 'Student information display',
      variables: [
        'student.firstName',
        'student.lastName',
        'student.grade',
        'student.id',
        'student.email',
        'student.parentEmail',
      ],
      lastModified: new Date(),
      source: 'memory',
    });

    // Grade display partial
    this.registerPartial('gradeDisplay', {
      // name: 'gradeDisplay', // name is not part of PartialInfo type
      content: `
        <div class="grade-display {{#if (gt grade 80)}}grade-excellent{{else if (gt grade 70)}}grade-good{{else if (gt grade 60)}}grade-satisfactory{{else}}grade-needs-improvement{{/if}}">
          <span class="grade-number">{{grade}}%</span>
          <span class="grade-letter">{{formatGrade grade}}</span>
          {{#if comment}}<p class="grade-comment">{{comment}}</p>{{/if}}
        </div>
      `,
      category: 'educational',
      description: 'Grade display with styling based on performance',
      variables: ['grade', 'comment'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Assignment summary partial
    this.registerPartial('assignmentSummary', {
      // name: 'assignmentSummary', // name is not part of PartialInfo type
      content: `
        <div class="assignment-summary">
          <h4>{{assignment.title}}</h4>
          <div class="assignment-meta">
            <span class="due-date">Due: {{formatDate assignment.dueDate}}</span>
            <span class="subject">{{assignment.subject}}</span>
            {{#if assignment.grade}}<span class="grade">{{assignment.grade}}%</span>{{/if}}
          </div>
          {{#if assignment.description}}
            <p class="description">{{truncate assignment.description 150}}</p>
          {{/if}}
        </div>
      `,
      category: 'educational',
      description: 'Assignment summary card',
      variables: [
        'assignment.title',
        'assignment.dueDate',
        'assignment.subject',
        'assignment.grade',
        'assignment.description',
      ],
      lastModified: new Date(),
      source: 'memory',
    });

    // Newsletter section partial
    this.registerPartial('newsletterSection', {
      // name: 'newsletterSection', // name is not part of PartialInfo type
      content: `
        <section class="newsletter-section">
          <h2 class="section-title">{{title}}</h2>
          {{#if subtitle}}<h3 class="section-subtitle">{{subtitle}}</h3>{{/if}}
          <div class="section-content">
            {{#each items}}
              <div class="newsletter-item">
                <h4>{{this.title}}</h4>
                <p>{{this.content}}</p>
                {{#if this.date}}<span class="item-date">{{formatDate this.date}}</span>{{/if}}
              </div>
            {{/each}}
          </div>
        </section>
      `,
      category: 'newsletter',
      description: 'Newsletter section with items',
      variables: ['title', 'subtitle', 'items'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Progress chart partial
    this.registerPartial('progressChart', {
      // name: 'progressChart', // name is not part of PartialInfo type
      content: `
        <div class="progress-chart">
          <h4>{{title}}</h4>
          <div class="chart-container">
            {{#each data}}
              <div class="progress-bar">
                <label>{{this.label}}</label>
                <div class="bar-container">
                  <div class="bar-fill" style="width: {{percentage this.value this.max}}"></div>
                  <span class="bar-value">{{this.value}}/{{this.max}}</span>
                </div>
              </div>
            {{/each}}
          </div>
        </div>
      `,
      category: 'charts',
      description: 'Progress chart with bars',
      variables: ['title', 'data'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Contact info partial
    this.registerPartial('contactInfo', {
      // name: 'contactInfo', // name is not part of PartialInfo type
      content: `
        <div class="contact-info">
          <h4>Contact Information</h4>
          {{#if teacher.name}}<p><strong>Teacher:</strong> {{teacher.name}}</p>{{/if}}
          {{#if teacher.email}}<p><strong>Email:</strong> <a href="mailto:{{teacher.email}}">{{teacher.email}}</a></p>{{/if}}
          {{#if teacher.phone}}<p><strong>Phone:</strong> {{formatPhoneNumber teacher.phone}}</p>{{/if}}
          {{#if classroom}}<p><strong>Classroom:</strong> {{classroom}}</p>{{/if}}
          {{#if officeHours}}<p><strong>Office Hours:</strong> {{officeHours}}</p>{{/if}}
        </div>
      `,
      category: 'contact',
      description: 'Teacher contact information',
      variables: ['teacher.name', 'teacher.email', 'teacher.phone', 'classroom', 'officeHours'],
      lastModified: new Date(),
      source: 'memory',
    });

    // Initialize categories
    this.initializeCategories();
  }

  /**
   * Initialize partial categories
   */
  private initializeCategories(): void {
    this.categories.set('layout', {
      name: 'Layout',
      description: 'Headers, footers, and structural components',
      partials: [],
    });

    this.categories.set('student', {
      name: 'Student',
      description: 'Student-related information displays',
      partials: [],
    });

    this.categories.set('educational', {
      name: 'Educational',
      description: 'Educational content like grades and assignments',
      partials: [],
    });

    this.categories.set('newsletter', {
      name: 'Newsletter',
      description: 'Newsletter-specific components',
      partials: [],
    });

    this.categories.set('charts', {
      name: 'Charts',
      description: 'Data visualization components',
      partials: [],
    });

    this.categories.set('contact', {
      name: 'Contact',
      description: 'Contact information displays',
      partials: [],
    });

    // Populate category partial lists
    this.updateCategoryMembership();
  }

  /**
   * Register a partial
   */
  public registerPartial(name: string, partial: Omit<PartialInfo, 'name'>): void {
    this.partials.set(name, { name, ...partial });

    // Update category membership
    this.updateCategoryMembership();

    this.logger.debug(`Partial registered: ${name} (category: ${partial.category})`);
  }

  /**
   * Get partial content
   */
  public getPartial(name: string): string | null {
    const partial = this.partials.get(name);
    return partial ? partial.content : null;
  }

  /**
   * Get all partials as a record for template engines
   */
  public getPartialsRecord(): Record<string, string> {
    const record: Record<string, string> = {};

    for (const [name, partial] of this.partials) {
      record[name] = partial.content;
    }

    return record;
  }

  /**
   * Get partial info
   */
  public getPartialInfo(name: string): PartialInfo | null {
    return this.partials.get(name) || null;
  }

  /**
   * List all partials
   */
  public listPartials(): PartialInfo[] {
    return Array.from(this.partials.values());
  }

  /**
   * Get partials by category
   */
  public getPartialsByCategory(category: string): PartialInfo[] {
    return Array.from(this.partials.values()).filter((p) => p.category === category);
  }

  /**
   * List all categories
   */
  public listCategories(): PartialCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Search partials
   */
  public searchPartials(query: string): PartialInfo[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.partials.values()).filter(
      (partial) =>
        partial.name.toLowerCase().includes(lowerQuery) ||
        (partial.description && partial.description.toLowerCase().includes(lowerQuery)) ||
        partial.content.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Load partials from file system
   */
  private async loadPartialsFromFiles(): Promise<void> {
    try {
      // Check if partials directory exists
      try {
        await fs.access(this.partialsDirectory);
      } catch (_error) {
        this.logger.info('Partials directory does not exist, skipping file loading');
        return;
      }

      const files = await fs.readdir(this.partialsDirectory);
      const partialFiles = files.filter(
        (file) => file.endsWith('.hbs') || file.endsWith('.handlebars') || file.endsWith('.html'),
      );

      for (const file of partialFiles) {
        try {
          const filePath = path.join(this.partialsDirectory, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const stats = await fs.stat(filePath);

          const name = path.basename(file, path.extname(file));
          const category = this.inferCategoryFromFilename(name);

          this.registerPartial(name, {
            content: content.trim(),
            category,
            description: `Loaded from ${file}`,
            variables: this.extractVariables(content),
            lastModified: stats.mtime,
            source: 'file',
          });

          this.logger.debug('Partial loaded from file');
        } catch (_error) {
          this.logger.error(`Failed to load partial file: ${file} - ${_error instanceof Error ? _error.message : _error}`);
        }
      }

      this.logger.info(`Partials loaded from files: ${partialFiles.length} loaded from ${this.partialsDirectory}`);
    } catch (_error) {
      this.logger.error(`Failed to load partials from files in ${this.partialsDirectory}: ${_error instanceof Error ? _error.message : _error}`);
    }
  }

  /**
   * Save partial to file
   */
  public async savePartialToFile(name: string): Promise<void> {
    const partial = this.partials.get(name);
    if (!partial) {
      throw new Error(`Partial not found: ${name}`);
    }

    try {
      // Ensure directory exists
      await fs.mkdir(this.partialsDirectory, { recursive: true });

      const filePath = path.join(this.partialsDirectory, `${name}.hbs`);
      await fs.writeFile(filePath, partial.content, 'utf-8');

      // Update partial info
      partial.source = 'file';
      partial.lastModified = new Date();

      this.logger.info(`Partial saved to file: ${name} -> ${filePath}`);
    } catch (_error) {
      this.logger.error(`Failed to save partial to file ${name}: ${_error instanceof Error ? _error.message : _error}`);
      throw _error;
    }
  }

  /**
   * Delete partial
   */
  public removePartial(name: string): boolean {
    const removed = this.partials.delete(name);
    if (removed) {
      this.updateCategoryMembership();
      this.logger.debug(`Partial removed: ${name}`);
    }
    return removed;
  }

  /**
   * Update partial content
   */
  public updatePartial(name: string, content: string, description?: string): void {
    const partial = this.partials.get(name);
    if (partial) {
      partial.content = content;
      partial.lastModified = new Date();
      partial.variables = this.extractVariables(content);

      if (description) {
        partial.description = description;
      }

      this.logger.debug(`Partial updated: ${name}`);
    } else {
      throw new Error(`Partial not found: ${name}`);
    }
  }

  /**
   * Extract variables from template content
   */
  private extractVariables(content: string): string[] {
    const variables = new Set<string>();

    // Match Handlebars variables: {{variable}} or {{object.property}}
    const variableRegex = /\{\{([^{}#/]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim();

      // Skip helpers and special syntax
      if (
        !variable.startsWith('#') &&
        !variable.startsWith('/') &&
        !variable.startsWith('else') &&
        !variable.startsWith('this.')
      ) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  }

  /**
   * Infer category from filename
   */
  private inferCategoryFromFilename(name: string): string {
    const lowerName = name.toLowerCase();

    if (
      lowerName.includes('header') ||
      lowerName.includes('footer') ||
      lowerName.includes('layout')
    ) {
      return 'layout';
    }
    if (lowerName.includes('student')) {
      return 'student';
    }
    if (
      lowerName.includes('grade') ||
      lowerName.includes('assignment') ||
      lowerName.includes('lesson')
    ) {
      return 'educational';
    }
    if (lowerName.includes('newsletter')) {
      return 'newsletter';
    }
    if (lowerName.includes('chart') || lowerName.includes('graph')) {
      return 'charts';
    }
    if (lowerName.includes('contact') || lowerName.includes('teacher')) {
      return 'contact';
    }

    return 'misc';
  }

  /**
   * Update category membership
   */
  private updateCategoryMembership(): void {
    // Clear current memberships
    for (const category of this.categories.values()) {
      category.partials = [];
    }

    // Rebuild memberships
    for (const partial of this.partials.values()) {
      if (partial.category) {
        const category = this.categories.get(partial.category);
        if (category) {
          category.partials.push(partial.name);
        }
      }
    }
  }

  /**
   * Validate partial dependencies
   */
  public validateDependencies(): {
    valid: string[];
    invalid: { name: string; missing: string[] }[];
  } {
    const valid: string[] = [];
    const invalid: { name: string; missing: string[] }[] = [];

    for (const [name, partial] of this.partials) {
      if (partial.dependencies && partial.dependencies.length > 0) {
        const missing = partial.dependencies.filter((dep) => !this.partials.has(dep));

        if (missing.length > 0) {
          invalid.push({ name, missing });
        } else {
          valid.push(name);
        }
      } else {
        valid.push(name);
      }
    }

    return { valid, invalid };
  }

  /**
   * Get usage statistics
   */
  public getUsageStats(): {
    totalPartials: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    averageVariables: number;
  } {
    const stats = {
      totalPartials: this.partials.size,
      byCategory: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      averageVariables: 0,
    };

    let totalVariables = 0;

    for (const partial of this.partials.values()) {
      // Count by category
      if (partial.category) {
        stats.byCategory[partial.category] = (stats.byCategory[partial.category] || 0) + 1;
      }

      // Count by source
      stats.bySource[partial.source] = (stats.bySource[partial.source] || 0) + 1;

      // Count variables
      totalVariables += partial.variables?.length || 0;
    }

    stats.averageVariables = this.partials.size > 0 ? totalVariables / this.partials.size : 0;

    return stats;
  }
}

// Export singleton instance
export const partialManager = PartialManager.getInstance();
