/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Curriculum Export Service
 * Handles exporting curriculum expectations to various formats
 */

import { prisma } from '../../prisma';
import { BaseService } from '../base/BaseService';

import { CurriculumTransformer } from './transformers/CurriculumTransformer';

export interface ExportOptions {
  subjectId?: number;
  grade?: number;
  strand?: string;
  format: 'csv' | 'json' | 'excel';
  includeInactive?: boolean;
}

export class CurriculumExportService extends BaseService {
  private static instance: CurriculumExportService;

  private constructor() {
    super('CurriculumExportService');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CurriculumExportService {
    if (!CurriculumExportService.instance) {
      CurriculumExportService.instance = new CurriculumExportService();
    }
    return CurriculumExportService.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Curriculum export service initialized');
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      database: !!prisma,
    };
  }

  /**
   * Export curriculum expectations
   */
  public async export(options: ExportOptions): Promise<Buffer> {
    return this.executeWithMetrics(
      async () => {
        // Build query
        const where: any = {};
        
        if (options.subjectId) {
          where.subjectId = options.subjectId;
        }
        
        if (options.grade) {
          where.grade = options.grade;
        }
        
        if (options.strand) {
          where.strand = options.strand;
        }
        
        if (!options.includeInactive) {
          where.isActive = true;
        }

        // Fetch expectations
        const expectations = await prisma.curriculumExpectation.findMany({
          where,
          include: {
            import: true,
          },
          orderBy: [
            { grade: 'asc' },
            { strand: 'asc' },
            { subject: 'asc' },
            { code: 'asc' },
          ],
        });

        if (expectations.length === 0) {
          throw new Error('No expectations found matching criteria');
        }

        // Transform for export
        const exportData = CurriculumTransformer.transformForExport(
          expectations,
          options.format
        ) as any[];

        // Convert to buffer based on format
        let buffer: Buffer;
        
        switch (options.format) {
          case 'json':
            buffer = Buffer.from(JSON.stringify(exportData, null, 2));
            break;
            
          case 'csv': {
            // Convert to CSV
            const csv = this.convertToCSV(exportData);
            buffer = Buffer.from(csv);
            break;
          }
            
          case 'excel': {
            // Would use xlsx library here
            throw new Error('Excel export not yet implemented');
          }
            
          default:
            throw new Error(`Unsupported export format: ${options.format}`);
        }

        this.logger.info('Export completed');

        return buffer;
      },
      'export'
    );
  }

  /**
   * Convert data to CSV
   */
  private convertToCSV(data: unknown[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get headers from first row
    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value || '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      rows.push(values.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Get supported export formats
   */
  public getSupportedFormats(): string[] {
    return ['csv', 'json', 'excel'];
  }

  /**
   * Validate export options
   */
  public validateExportOptions(options: ExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.format) {
      errors.push('Export format is required');
    } else if (!this.getSupportedFormats().includes(options.format)) {
      errors.push(`Unsupported export format: ${options.format}`);
    }

    if (options.grade && (options.grade < 1 || options.grade > 12)) {
      errors.push('Grade must be between 1 and 12');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const curriculumExportService = CurriculumExportService.getInstance();