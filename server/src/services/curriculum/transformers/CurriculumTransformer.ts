/**
 * Curriculum Transformer
 * Transforms parsed curriculum data into database entities
 */

import { ParsedCurriculum, ParsedExpectation } from '../parsers/CurriculumParser';
import { Prisma } from '@teaching-engine/database';

export interface TransformOptions {
  userId: number;
  sourceFile?: string;
  overwrite?: boolean;
  mergeDuplicates?: boolean;
}

export interface TransformedCurriculum {
  subject: Prisma.SubjectCreateInput;
  expectations: Prisma.CurriculumExpectationCreateInput[];
}

export class CurriculumTransformer {
  /**
   * Transform parsed curriculum to database entities
   */
  transform(
    parsed: ParsedCurriculum,
    options: TransformOptions
  ): TransformedCurriculum {
    // Transform subject
    const subject = this.transformSubject(parsed, options);

    // Transform expectations
    const expectations = this.transformExpectations(parsed.expectations, parsed, options);

    return { subject, expectations };
  }

  /**
   * Transform subject data
   */
  private transformSubject(
    parsed: ParsedCurriculum,
    options: TransformOptions
  ): Prisma.SubjectCreateInput {
    return {
      name: parsed.subject,
      description: `Grade ${parsed.grade} ${parsed.subject} Curriculum`,
      gradeLevel: parsed.grade,
      isActive: true,
      metadata: {
        source: options.sourceFile || 'Import',
        importDate: new Date().toISOString(),
        version: parsed.metadata?.version,
      },
    };
  }

  /**
   * Transform expectations
   */
  private transformExpectations(
    expectations: ParsedExpectation[],
    curriculum: ParsedCurriculum,
    options: TransformOptions
  ): Prisma.CurriculumExpectationCreateInput[] {
    const transformed: Prisma.CurriculumExpectationCreateInput[] = [];
    const processedCodes = new Set<string>();

    for (const expectation of expectations) {
      // Skip duplicates if not merging
      if (!options.mergeDuplicates && processedCodes.has(expectation.code)) {
        continue;
      }
      processedCodes.add(expectation.code);

      transformed.push(this.transformExpectation(expectation, curriculum, options));
    }

    return transformed;
  }

  /**
   * Transform single expectation
   */
  private transformExpectation(
    expectation: ParsedExpectation,
    curriculum: ParsedCurriculum,
    options: TransformOptions
  ): Prisma.CurriculumExpectationCreateInput {
    return {
      code: expectation.code,
      description: expectation.description,
      type: expectation.type,
      strand: expectation.strand,
      substrand: expectation.substrand,
      grade: expectation.grade || curriculum.grade,
      keywords: expectation.keywords || [],
      isActive: true,
      metadata: {
        imported: true,
        importDate: new Date().toISOString(),
        source: options.sourceFile,
      },
      // Relations will be connected in the service
      subject: undefined as any, // Will be connected by service
    };
  }

  /**
   * Transform for update (existing expectations)
   */
  transformForUpdate(
    parsed: ParsedCurriculum,
    existingExpectations: any[],
    options: TransformOptions
  ): {
    toCreate: Prisma.CurriculumExpectationCreateInput[];
    toUpdate: Array<{
      id: number;
      data: Prisma.CurriculumExpectationUpdateInput;
    }>;
    toDeactivate: number[];
  } {
    const toCreate: Prisma.CurriculumExpectationCreateInput[] = [];
    const toUpdate: Array<{ id: number; data: Prisma.CurriculumExpectationUpdateInput }> = [];
    const toDeactivate: number[] = [];

    // Create lookup map for existing expectations
    const existingMap = new Map(
      existingExpectations.map(e => [e.code, e])
    );

    // Process parsed expectations
    const processedIds = new Set<number>();

    for (const expectation of parsed.expectations) {
      const existing = existingMap.get(expectation.code);

      if (existing) {
        // Update existing
        processedIds.add(existing.id);
        
        if (this.hasChanges(expectation, existing)) {
          toUpdate.push({
            id: existing.id,
            data: {
              description: expectation.description,
              type: expectation.type,
              strand: expectation.strand,
              substrand: expectation.substrand,
              keywords: expectation.keywords || [],
              metadata: {
                ...(existing.metadata as any || {}),
                lastUpdated: new Date().toISOString(),
                updateSource: options.sourceFile,
              },
            },
          });
        }
      } else {
        // Create new
        toCreate.push(this.transformExpectation(expectation, parsed, options));
      }
    }

    // Mark unprocessed as inactive if overwriting
    if (options.overwrite) {
      for (const existing of existingExpectations) {
        if (!processedIds.has(existing.id)) {
          toDeactivate.push(existing.id);
        }
      }
    }

    return { toCreate, toUpdate, toDeactivate };
  }

  /**
   * Check if expectation has changes
   */
  private hasChanges(parsed: ParsedExpectation, existing: any): boolean {
    return (
      parsed.description !== existing.description ||
      parsed.type !== existing.type ||
      parsed.strand !== existing.strand ||
      parsed.substrand !== existing.substrand ||
      JSON.stringify(parsed.keywords || []) !== JSON.stringify(existing.keywords || [])
    );
  }

  /**
   * Transform to export format
   */
  static transformForExport(
    expectations: any[],
    format: 'csv' | 'json' | 'excel' = 'json'
  ): any {
    switch (format) {
      case 'csv':
        return expectations.map(e => ({
          code: e.code,
          description: e.description,
          type: e.type,
          strand: e.strand,
          substrand: e.substrand || '',
          grade: e.grade,
          subject: e.subject?.name || '',
          keywords: (e.keywords || []).join(';'),
        }));

      case 'excel':
        // Similar to CSV but with additional formatting info
        return {
          headers: ['Code', 'Description', 'Type', 'Strand', 'Substrand', 'Grade', 'Subject', 'Keywords'],
          data: expectations.map(e => [
            e.code,
            e.description,
            e.type,
            e.strand,
            e.substrand || '',
            e.grade,
            e.subject?.name || '',
            (e.keywords || []).join('; '),
          ]),
        };

      case 'json':
      default:
        return {
          metadata: {
            exportDate: new Date().toISOString(),
            totalExpectations: expectations.length,
          },
          expectations: expectations.map(e => ({
            code: e.code,
            description: e.description,
            type: e.type,
            strand: e.strand,
            substrand: e.substrand,
            grade: e.grade,
            subject: e.subject?.name,
            keywords: e.keywords,
            isActive: e.isActive,
          })),
        };
    }
  }
}