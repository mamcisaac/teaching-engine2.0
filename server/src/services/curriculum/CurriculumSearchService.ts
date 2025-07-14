/**
 * Curriculum Search Service
 * Handles searching and filtering curriculum expectations
 */

import { prisma } from '../../prisma';
import {
  isValidString,
  isValidNumber
} from '../../types/prisma-types';
import type {
  CurriculumExpectation,
  CurriculumExpectationWhereInput,
  CurriculumExpectationQueryResult,
  AutoCompleteEntry
} from '../../types/prisma-types';
import { BaseService } from '../base/BaseService';

export interface SearchFilters {
  subjectId?: number;
  grade?: number;
  strand?: string;
  type?: 'overall' | 'specific';
  includeInactive?: boolean;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  expectations: CurriculumExpectationQueryResult[];
  total: number;
  hasMore: boolean;
}

export class CurriculumSearchService extends BaseService {
  private static instance: CurriculumSearchService | undefined;

  private constructor() {
    super('CurriculumSearchService');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CurriculumSearchService {
    if (!CurriculumSearchService.instance) {
      CurriculumSearchService.instance = new CurriculumSearchService();
    }
    return CurriculumSearchService.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Curriculum search service initialized');
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
   * Search expectations
   */
  public async searchExpectations(options: SearchOptions): Promise<SearchResult> {
    return this.executeWithMetrics(
      async () => {
        const { query, filters = {}, limit = 50, offset = 0 } = options;

        const where: CurriculumExpectationWhereInput = {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        };

        // Apply filters
        if (filters.grade !== undefined) {
          where.grade = filters.grade;
        }
        
        if (filters.strand && isValidString(filters.strand)) {
          where.strand = { contains: filters.strand, mode: 'insensitive' };
        }

        // Get total count
        const total = await prisma.curriculumExpectation.count({ where });

        // Get expectations
        const expectations = await prisma.curriculumExpectation.findMany({
          where,
          // Note: subject is a string field, not a relation
          // include: { subject: true },
          orderBy: [
            { grade: 'asc' },
            { code: 'asc' },
          ],
          take: limit,
          skip: offset,
        });

        return {
          expectations,
          total,
          hasMore: offset + expectations.length < total,
        };
      },
      'searchExpectations'
    );
  }

  /**
   * Search by keywords
   */
  public async searchByKeywords(keywords: string[], filters?: SearchFilters): Promise<CurriculumExpectationQueryResult[]> {
    return this.executeWithMetrics(
      async () => {
        const where: CurriculumExpectationWhereInput = {};
        
        // Use description search for keywords
        if (keywords.length > 0) {
          where.description = {
            contains: keywords.join(' '),
            mode: 'insensitive'
          };
        }

        // Apply filters
        if (filters?.grade !== undefined && isValidNumber(filters.grade)) {
          where.grade = filters.grade;
        }
        
        if (filters?.strand !== undefined && isValidString(filters.strand)) {
          where.strand = { contains: filters.strand, mode: 'insensitive' };
        }
        
        // Note: type field doesn't exist in schema
        // if (filters?.type) {
        //   where.type = filters.type;
        // }

        return prisma.curriculumExpectation.findMany({
          where,
          // Note: subject is a string field, not a relation
          // include: { subject: true },
          orderBy: [
            { grade: 'asc' },
            { code: 'asc' },
          ],
        });
      },
      'searchByKeywords'
    );
  }

  /**
   * Search by code pattern
   */
  public async searchByCodePattern(pattern: string, filters?: SearchFilters): Promise<CurriculumExpectationQueryResult[]> {
    return this.executeWithMetrics(
      async () => {
        const where: CurriculumExpectationWhereInput = {
          code: {
            contains: pattern,
            mode: 'insensitive',
          },
        };

        // Apply filters
        if (filters?.grade !== undefined && isValidNumber(filters.grade)) {
          where.grade = filters.grade;
        }
        
        if (filters?.strand !== undefined && isValidString(filters.strand)) {
          where.strand = { contains: filters.strand, mode: 'insensitive' };
        }
        
        // Note: type field doesn't exist in schema
        // if (filters?.type) {
        //   where.type = filters.type;
        // }

        return prisma.curriculumExpectation.findMany({
          where,
          // Note: subject is a string field, not a relation
          // include: { subject: true },
          orderBy: [
            { grade: 'asc' },
            { code: 'asc' },
          ],
        });
      },
      'searchByCodePattern'
    );
  }

  /**
   * Get similar expectations
   */
  public async getSimilarExpectations(expectationId: string, limit = 10): Promise<CurriculumExpectationQueryResult[]> {
    return this.executeWithMetrics(
      async () => {
        // Get the reference expectation
        const reference = await prisma.curriculumExpectation.findUnique({
          where: { id: expectationId },
        });

        if (!reference) {
          throw new Error('Reference expectation not found');
        }

        // Find similar expectations by strand and grade (keywords field doesn't exist)
        const similar = await prisma.curriculumExpectation.findMany({
          where: {
            id: { not: expectationId },
            // Note: isActive field doesn't exist in schema
            // isActive: true,
            OR: [
              {
                strand: reference.strand,
                grade: reference.grade,
              },
              {
                subject: reference.subject,
                grade: reference.grade,
              },
            ],
          },
          // Note: subject is a string field, not a relation
          // include: { subject: true },
          orderBy: [
            { grade: 'asc' },
            { code: 'asc' },
          ],
          take: limit,
        });

        return similar;
      },
      'getSimilarExpectations'
    );
  }

  /**
   * Auto-complete suggestions
   */
  public async getAutoCompleteSuggestions(
    query: string,
    field: 'code' | 'description',
    limit = 10
  ): Promise<string[]> {
    return this.executeWithMetrics(
      async () => {
        const where: CurriculumExpectationWhereInput = {};

        if (field === 'code') {
          where.code = { startsWith: query, mode: 'insensitive' };
        } else if (field === 'description') {
          where.description = { contains: query, mode: 'insensitive' };
        }

        const expectations = await prisma.curriculumExpectation.findMany({
          where,
          select: field === 'code' ? { code: true } : { description: true },
          take: limit,
        });

        return expectations
          .map((e: AutoCompleteEntry) => field === 'code' ? e.code : e.description)
          .filter((value: string | undefined): value is string => typeof value === 'string' && Boolean(value));
      },
      'getAutoCompleteSuggestions'
    );
  }
}

// Export singleton instance
export const curriculumSearchService = CurriculumSearchService.getInstance();