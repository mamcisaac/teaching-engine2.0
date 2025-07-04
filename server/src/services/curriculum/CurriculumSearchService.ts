/**
 * Curriculum Search Service
 * Handles searching and filtering curriculum expectations
 */

import { BaseService } from '../base/BaseService';
import { prisma } from '../../prisma';

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
  expectations: any[];
  total: number;
  hasMore: boolean;
}

export class CurriculumSearchService extends BaseService {
  private static instance: CurriculumSearchService;

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

        const where: any = {
          isActive: filters.includeInactive ? undefined : true,
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { keywords: { has: query.toLowerCase() } },
          ],
        };

        // Apply filters
        if (filters.subjectId) {
          where.subjectId = filters.subjectId;
        }
        
        if (filters.grade) {
          where.grade = filters.grade;
        }
        
        if (filters.strand) {
          where.strand = filters.strand;
        }
        
        if (filters.type) {
          where.type = filters.type;
        }

        // Get total count
        const total = await prisma.curriculumExpectation.count({ where });

        // Get expectations
        const expectations = await prisma.curriculumExpectation.findMany({
          where,
          include: {
            subject: true,
          },
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
  public async searchByKeywords(keywords: string[], filters?: SearchFilters): Promise<any[]> {
    return this.executeWithMetrics(
      async () => {
        const where: any = {
          isActive: filters?.includeInactive ? undefined : true,
          keywords: {
            hasEvery: keywords.map(k => k.toLowerCase()),
          },
        };

        // Apply filters
        if (filters?.subjectId) {
          where.subjectId = filters.subjectId;
        }
        
        if (filters?.grade) {
          where.grade = filters.grade;
        }
        
        if (filters?.strand) {
          where.strand = filters.strand;
        }
        
        if (filters?.type) {
          where.type = filters.type;
        }

        return prisma.curriculumExpectation.findMany({
          where,
          include: {
            subject: true,
          },
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
  public async searchByCodePattern(pattern: string, filters?: SearchFilters): Promise<any[]> {
    return this.executeWithMetrics(
      async () => {
        const where: any = {
          isActive: filters?.includeInactive ? undefined : true,
          code: {
            contains: pattern,
            mode: 'insensitive',
          },
        };

        // Apply filters
        if (filters?.subjectId) {
          where.subjectId = filters.subjectId;
        }
        
        if (filters?.grade) {
          where.grade = filters.grade;
        }
        
        if (filters?.strand) {
          where.strand = filters.strand;
        }
        
        if (filters?.type) {
          where.type = filters.type;
        }

        return prisma.curriculumExpectation.findMany({
          where,
          include: {
            subject: true,
          },
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
  public async getSimilarExpectations(expectationId: number, limit: number = 10): Promise<any[]> {
    return this.executeWithMetrics(
      async () => {
        // Get the reference expectation
        const reference = await prisma.curriculumExpectation.findUnique({
          where: { id: expectationId },
        });

        if (!reference) {
          throw new Error('Reference expectation not found');
        }

        // Find similar expectations by keywords and strand
        const similar = await prisma.curriculumExpectation.findMany({
          where: {
            id: { not: expectationId },
            isActive: true,
            OR: [
              {
                keywords: {
                  hasEvery: reference.keywords.slice(0, 3), // First 3 keywords
                },
              },
              {
                strand: reference.strand,
                grade: reference.grade,
              },
            ],
          },
          include: {
            subject: true,
          },
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
    field: 'code' | 'description' | 'keywords',
    limit: number = 10
  ): Promise<string[]> {
    return this.executeWithMetrics(
      async () => {
        const where: any = {
          isActive: true,
        };

        if (field === 'code') {
          where.code = { startsWith: query, mode: 'insensitive' };
        } else if (field === 'description') {
          where.description = { contains: query, mode: 'insensitive' };
        } else if (field === 'keywords') {
          where.keywords = { has: query.toLowerCase() };
        }

        const expectations = await prisma.curriculumExpectation.findMany({
          where,
          select: {
            [field]: true,
          },
          take: limit,
        });

        if (field === 'keywords') {
          // For keywords, return unique keywords that match
          const allKeywords = expectations.flatMap(e => e.keywords);
          const uniqueKeywords = [...new Set(allKeywords)];
          return uniqueKeywords.filter(k => k.includes(query.toLowerCase()));
        }

        return expectations.map(e => e[field]).filter(Boolean);
      },
      'getAutoCompleteSuggestions'
    );
  }
}

// Export singleton instance
export const curriculumSearchService = CurriculumSearchService.getInstance();