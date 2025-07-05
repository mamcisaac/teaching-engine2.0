/* eslint-disable @typescript-eslint/no-explicit-any */
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
      user: {
        connect: { id: options.userId }
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
      strand: expectation.strand,
      substrand: expectation.substrand,
      grade: expectation.grade || curriculum.grade,
      subject: curriculum.subject,
      // Note: type, keywords, isActive, metadata fields don't exist in the schema
    };
  }

  /**
   * Transform for update (existing expectations)
   */
  transformForUpdate(
    parsed: ParsedCurriculum,
    existingExpectations: Array<{ id: string; code: string; description: string; strand: string; substrand?: string | null; grade: number; subject: string }>,
    options: TransformOptions
  ): {
    toCreate: Prisma.CurriculumExpectationCreateInput[];
    toUpdate: Array<{
      id: string;
      data: Prisma.CurriculumExpectationUpdateInput;
    }>;
    toDeactivate: string[];
  } {
    const toCreate: Prisma.CurriculumExpectationCreateInput[] = [];
    const toUpdate: Array<{ id: string; data: Prisma.CurriculumExpectationUpdateInput }> = [];
    const toDeactivate: string[] = [];

    // Create lookup map for existing expectations
    const existingMap = new Map(
      existingExpectations.map(e => [e.code, e])
    );

    // Process parsed expectations
    const processedIds = new Set<string>();

    for (const expectation of parsed.expectations) {
      const typedExpectation = expectation as ParsedExpectation;
      const existing = existingMap.get(typedExpectation.code);

      if (existing) {
        // Update existing
        processedIds.add(existing.id);
        
        if (this.hasChanges(typedExpectation, existing)) {
          toUpdate.push({
            id: existing.id,
            data: {
              description: typedExpectation.description,
              strand: typedExpectation.strand,
              substrand: typedExpectation.substrand,
              // Note: type, keywords, metadata fields don't exist in schema
            },
          });
        }
      } else {
        // Create new
        toCreate.push(this.transformExpectation(typedExpectation, parsed, options));
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
  private hasChanges(parsed: ParsedExpectation, existing: { description: string; strand: string; substrand?: string | null }): boolean {
    return (
      parsed.description !== existing.description ||
      parsed.strand !== existing.strand ||
      parsed.substrand !== existing.substrand
      // Note: removed type and keywords checks as they don't exist in schema
    );
  }

  /**
   * Transform to export format
   */
  static transformForExport(
    expectations: Array<{ id: string; code: string; description: string; strand: string; substrand?: string | null; grade: number; subject: string }>,
    format: 'csv' | 'json' | 'excel' = 'json'
  ): unknown {
    switch (format) {
      case 'csv':
        return expectations.map(e => ({
          code: e.code,
          description: e.description,
          strand: e.strand,
          substrand: e.substrand || '',
          grade: e.grade,
          subject: e.subject,
          // Note: type and keywords fields don't exist in schema
        }));

      case 'excel':
        // Similar to CSV but with additional formatting info
        return {
          headers: ['Code', 'Description', 'Strand', 'Substrand', 'Grade', 'Subject'],
          data: expectations.map(e => [
            e.code,
            e.description,
            e.strand,
            e.substrand || '',
            e.grade,
            e.subject,
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
            id: e.id,
            code: e.code,
            description: e.description,
            strand: e.strand,
            substrand: e.substrand,
            grade: e.grade,
            subject: e.subject,
            // Note: type, keywords, isActive fields don't exist in schema
          })),
        };
    }
  }
}