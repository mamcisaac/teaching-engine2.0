/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Curriculum Import Orchestrator
 * Coordinates curriculum import operations using specialized services
 */

import { BaseService } from '../base/BaseService';
import { prisma } from '../../prisma';
import { ParserFactory } from './parsers/ParserFactory';
import { CurriculumValidator, ValidationOptions } from './validators/CurriculumValidator';
import { CurriculumTransformer, TransformOptions } from './transformers/CurriculumTransformer';
import { CurriculumExportService } from './CurriculumExportService';
import { CurriculumSearchService } from './CurriculumSearchService';
import { CurriculumStatsService } from './CurriculumStatsService';
import type { ParsedCurriculum } from './parsers/CurriculumParser';

export interface ImportOptions {
  userId: number;
  filename: string;
  overwrite?: boolean;
  validate?: boolean;
  validationOptions?: ValidationOptions;
  dryRun?: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    totalExpectations: number;
    created: number;
    updated: number;
    deactivated: number;
    errors: number;
  };
  validation?: {
    isValid: boolean;
    errors: unknown[];
    warnings: unknown[];
  };
  subjectId?: number;
}

export class CurriculumImportOrchestrator extends BaseService {
  private static instance: CurriculumImportOrchestrator;
  private validator: CurriculumValidator;
  private transformer: CurriculumTransformer;
  private exportService: CurriculumExportService;
  private searchService: CurriculumSearchService;
  private statsService: CurriculumStatsService;

  private constructor() {
    super('CurriculumImportOrchestrator');
    this.validator = CurriculumValidator.createDefault();
    this.transformer = new CurriculumTransformer();
    this.exportService = CurriculumExportService.getInstance();
    this.searchService = CurriculumSearchService.getInstance();
    this.statsService = CurriculumStatsService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CurriculumImportOrchestrator {
    if (!CurriculumImportOrchestrator.instance) {
      CurriculumImportOrchestrator.instance = new CurriculumImportOrchestrator();
    }
    return CurriculumImportOrchestrator.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize dependent services
    await this.exportService.initialize();
    await this.searchService.initialize();
    await this.statsService.initialize();
    
    this.logger.info('Curriculum import orchestrator initialized');
  }

  /**
   * Check dependencies
   */
  protected checkDependencies(): Record<string, boolean> {
    const baseDeps = super.checkDependencies();
    return {
      ...baseDeps,
      database: !!prisma,
      parsers: ParserFactory.getSupportedExtensions().length > 0,
      exportService: this.exportService.isHealthy(),
      searchService: this.searchService.isHealthy(),
      statsService: this.statsService.isHealthy(),
    };
  }

  /**
   * Start import session
   */
  public async startImport(
    userId: number,
    grade: number,
    subject: string,
    sourceFormat: 'pdf' | 'docx' | 'csv' | 'manual'
  ): Promise<string> {
    return this.executeWithMetrics(
      async () => {
        // Create import record
        const importRecord = await prisma.curriculumImport.create({
          data: {
            userId,
            status: 'pending',
            grade,
            subject,
            sourceFormat,
          },
        });
        
        this.logger.info('Import session started', {
          importId: importRecord.id,
          userId,
          grade,
          subject,
          sourceFormat,
        });
        
        return importRecord.id;
      },
      'startImport'
    );
  }

  /**
   * Store uploaded file
   */
  public async storeUploadedFile(
    importId: string,
    file: Express.Multer.File
  ): Promise<void> {
    return this.executeWithMetrics(
      async () => {
        // Store file content in import record
        await prisma.curriculumImport.update({
          where: { id: importId },
          data: {
            fileContent: file.buffer.toString('base64'),
            fileName: file.originalname,
            fileMimeType: file.mimetype,
          },
        });
        
        this.logger.info('File stored for import', {
          importId,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      },
      'storeUploadedFile'
    );
  }

  /**
   * Import curriculum from file
   */
  public async importFromFile(
    fileContent: Buffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    return this.executeWithMetrics(
      async () => {
        const result: ImportResult = {
          success: false,
          message: '',
          stats: {
            totalExpectations: 0,
            created: 0,
            updated: 0,
            deactivated: 0,
            errors: 0,
          },
        };

        try {
          // Check if file type is supported
          if (!ParserFactory.isSupported(options.filename)) {
            throw new Error(`Unsupported file type: ${options.filename}`);
          }

          // Parse file
          const parser = ParserFactory.createParser(options.filename);
          const parsed = await parser.parse(fileContent);
          
          result.stats.totalExpectations = parsed.expectations.length;

          // Validate if requested
          if (options.validate !== false) {
            const validationResult = await this.validateCurriculum(parsed, options.validationOptions);
            result.validation = validationResult;

            if (!validationResult.isValid) {
              result.message = 'Validation failed';
              result.stats.errors = validationResult.errors.length;
              return result;
            }
          }

          // Dry run - return without saving
          if (options.dryRun) {
            result.success = true;
            result.message = 'Dry run completed successfully';
            return result;
          }

          // Process import
          const importResult = await this.processImport(parsed, options);
          
          result.success = true;
          result.message = 'Import completed successfully';
          result.stats = {
            ...result.stats,
            ...importResult.stats,
          };
          result.subjectId = importResult.subjectId;

          return result;
        } catch (error) {
          this.logger.error('Import failed', { error, options });
          result.message = `Import failed: ${error.message}`;
          result.stats.errors++;
          return result;
        }
      },
      'importFromFile'
    );
  }

  /**
   * Validate curriculum data
   */
  private async validateCurriculum(
    parsed: ParsedCurriculum,
    validationOptions?: ValidationOptions
  ): Promise<{ isValid: boolean; errors: unknown[]; warnings: unknown[] }> {
    const validator = validationOptions 
      ? new CurriculumValidator(validationOptions)
      : this.validator;
      
    return validator.validate(parsed);
  }

  /**
   * Process import
   */
  private async processImport(
    parsed: ParsedCurriculum,
    options: ImportOptions
  ): Promise<{
    subjectId: number;
    stats: {
      created: number;
      updated: number;
      deactivated: number;
    };
  }> {
    const stats = {
      created: 0,
      updated: 0,
      deactivated: 0,
    };

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create subject
      let subject = await tx.subject.findFirst({
        where: {
          name: parsed.subject,
          gradeLevel: parsed.grade,
        },
      });

      if (!subject) {
        // Create subject
        const transformOptions: TransformOptions = {
          userId: options.userId,
          sourceFile: options.filename,
          overwrite: options.overwrite,
        };

        const transformed = this.transformer.transform(parsed, transformOptions);
        
        subject = await tx.subject.create({
          data: transformed.subject,
        });
        
        this.logger.info('Created new subject', { 
          subjectId: subject.id,
          name: subject.name,
        });
      }

      // Get existing expectations
      const existingExpectations = await tx.curriculumExpectation.findMany({
        where: {
          subjectId: subject.id,
          grade: parsed.grade,
        },
      });

      // Transform for update
      const transformOptions: TransformOptions = {
        userId: options.userId,
        sourceFile: options.filename,
        overwrite: options.overwrite,
        mergeDuplicates: true,
      };

      const { toCreate, toUpdate, toDeactivate } = this.transformer.transformForUpdate(
        parsed,
        existingExpectations,
        transformOptions
      );

      // Create new expectations
      if (toCreate.length > 0) {
        await tx.curriculumExpectation.createMany({
          data: toCreate.map(exp => ({
            ...exp,
            subjectId: subject!.id,
          })),
        });
        stats.created = toCreate.length;
      }

      // Update existing expectations
      for (const { id, data } of toUpdate) {
        await tx.curriculumExpectation.update({
          where: { id },
          data,
        });
        stats.updated++;
      }

      // Deactivate removed expectations
      if (toDeactivate.length > 0) {
        await tx.curriculumExpectation.updateMany({
          where: {
            id: { in: toDeactivate },
          },
          data: {
            isActive: false,
          },
        });
        stats.deactivated = toDeactivate.length;
      }

      return { subjectId: subject.id, stats };
    });

    this.logger.info('Import processed', result);
    return result;
  }

  /**
   * Get supported file formats
   */
  public getSupportedFormats(): string[] {
    return ParserFactory.getSupportedExtensions();
  }

  /**
   * Validate import options
   */
  public validateImportOptions(options: ImportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!options.userId) {
      errors.push('User ID is required');
    }

    if (!options.filename) {
      errors.push('Filename is required');
    } else if (!ParserFactory.isSupported(options.filename)) {
      errors.push(`Unsupported file type: ${options.filename}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Delegate to specialized services
  public async export(options: unknown): Promise<Buffer> {
    return this.exportService.export(options);
  }

  public async searchExpectations(options: unknown): Promise<unknown> {
    return this.searchService.searchExpectations(options);
  }

  public async getImportStats(): Promise<unknown> {
    return this.statsService.getOverallStats();
  }

  public async getSubjectStats(subjectId: number): Promise<unknown> {
    return this.statsService.getSubjectStats(subjectId);
  }

  public async getCoverageStats(): Promise<unknown> {
    return this.statsService.getCoverageStats();
  }
}

// Export singleton instance
export const curriculumImportOrchestrator = CurriculumImportOrchestrator.getInstance();

// Export static class for backward compatibility
export class CurriculumImportService {
  static async importFromFile(
    fileContent: Buffer,
    options: ImportOptions
  ): Promise<ImportResult> {
    return curriculumImportOrchestrator.importFromFile(fileContent, options);
  }

  static async export(options: unknown): Promise<Buffer> {
    return curriculumImportOrchestrator.export(options);
  }

  static async searchExpectations(query: string, filters?: unknown): Promise<any[]> {
    return curriculumImportOrchestrator.searchExpectations({ query, filters });
  }

  static async getImportStats(): Promise<unknown> {
    return curriculumImportOrchestrator.getImportStats();
  }
}