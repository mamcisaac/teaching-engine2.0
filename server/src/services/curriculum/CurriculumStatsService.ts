/**
 * Curriculum Statistics Service
 * Handles curriculum-related statistics and analytics
 */

import { BaseService } from '../base/BaseService';
import { prisma } from '../../prisma';

export interface CurriculumStats {
  totalSubjects: number;
  totalExpectations: number;
  byGrade: Record<number, number>;
  bySubject: Record<string, number>;
  byStrand: Record<string, number>;
  byType: Record<string, number>;
  lastImport?: Date;
}

export interface SubjectStats {
  subjectId: number;
  subjectName: string;
  totalExpectations: number;
  byGrade: Record<number, number>;
  byStrand: Record<string, number>;
  byType: Record<string, number>;
  lastUpdated: Date;
}

export interface GradeStats {
  grade: number;
  totalExpectations: number;
  bySubject: Record<string, number>;
  byStrand: Record<string, number>;
  byType: Record<string, number>;
}

export class CurriculumStatsService extends BaseService {
  private static instance: CurriculumStatsService;

  private constructor() {
    super('CurriculumStatsService');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CurriculumStatsService {
    if (!CurriculumStatsService.instance) {
      CurriculumStatsService.instance = new CurriculumStatsService();
    }
    return CurriculumStatsService.instance;
  }

  /**
   * Initialize service
   */
  protected async initialize(): Promise<void> {
    await super.initialize();
    this.logger.info('Curriculum stats service initialized');
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
   * Get overall curriculum statistics
   */
  public async getOverallStats(): Promise<CurriculumStats> {
    return this.executeWithMetrics(
      async () => {
        const subjects = await prisma.subject.findMany({
          include: {
            expectations: {
              where: { isActive: true },
            },
          },
        });

        const stats: CurriculumStats = {
          totalSubjects: subjects.length,
          totalExpectations: 0,
          byGrade: {},
          bySubject: {},
          byStrand: {},
          byType: {},
        };

        for (const subject of subjects) {
          const count = subject.expectations.length;
          stats.totalExpectations += count;
          stats.bySubject[subject.name] = count;

          for (const exp of subject.expectations) {
            // By grade
            stats.byGrade[exp.grade] = (stats.byGrade[exp.grade] || 0) + 1;
            
            // By strand
            if (exp.strand) {
              stats.byStrand[exp.strand] = (stats.byStrand[exp.strand] || 0) + 1;
            }
            
            // By type
            if (exp.type) {
              stats.byType[exp.type] = (stats.byType[exp.type] || 0) + 1;
            }
          }
        }

        // Get last import date
        const lastImport = await prisma.curriculumImport.findFirst({
          where: { status: 'completed' },
          orderBy: { createdAt: 'desc' },
        });

        if (lastImport) {
          stats.lastImport = lastImport.createdAt;
        }

        return stats;
      },
      'getOverallStats'
    );
  }

  /**
   * Get statistics for a specific subject
   */
  public async getSubjectStats(subjectId: number): Promise<SubjectStats> {
    return this.executeWithMetrics(
      async () => {
        const subject = await prisma.subject.findUnique({
          where: { id: subjectId },
          include: {
            expectations: {
              where: { isActive: true },
            },
          },
        });

        if (!subject) {
          throw new Error(`Subject with id ${subjectId} not found`);
        }

        const stats: SubjectStats = {
          subjectId: subject.id,
          subjectName: subject.name,
          totalExpectations: subject.expectations.length,
          byGrade: {},
          byStrand: {},
          byType: {},
          lastUpdated: subject.updatedAt,
        };

        for (const exp of subject.expectations) {
          // By grade
          stats.byGrade[exp.grade] = (stats.byGrade[exp.grade] || 0) + 1;
          
          // By strand
          if (exp.strand) {
            stats.byStrand[exp.strand] = (stats.byStrand[exp.strand] || 0) + 1;
          }
          
          // By type
          if (exp.type) {
            stats.byType[exp.type] = (stats.byType[exp.type] || 0) + 1;
          }
        }

        return stats;
      },
      'getSubjectStats'
    );
  }

  /**
   * Get statistics for a specific grade
   */
  public async getGradeStats(grade: number): Promise<GradeStats> {
    return this.executeWithMetrics(
      async () => {
        const expectations = await prisma.curriculumExpectation.findMany({
          where: {
            grade,
            isActive: true,
          },
          include: {
            subject: true,
          },
        });

        const stats: GradeStats = {
          grade,
          totalExpectations: expectations.length,
          bySubject: {},
          byStrand: {},
          byType: {},
        };

        for (const exp of expectations) {
          // By subject
          const subjectName = exp.subject.name;
          stats.bySubject[subjectName] = (stats.bySubject[subjectName] || 0) + 1;
          
          // By strand
          if (exp.strand) {
            stats.byStrand[exp.strand] = (stats.byStrand[exp.strand] || 0) + 1;
          }
          
          // By type
          if (exp.type) {
            stats.byType[exp.type] = (stats.byType[exp.type] || 0) + 1;
          }
        }

        return stats;
      },
      'getGradeStats'
    );
  }

  /**
   * Get coverage statistics (how many expectations per strand/grade)
   */
  public async getCoverageStats(): Promise<{
    coverageByGradeAndStrand: Record<number, Record<string, number>>;
    coverageBySubjectAndGrade: Record<string, Record<number, number>>;
    gapsIdentified: Array<{
      grade: number;
      strand: string;
      subject: string;
      expectedCount: number;
      actualCount: number;
    }>;
  }> {
    return this.executeWithMetrics(
      async () => {
        const expectations = await prisma.curriculumExpectation.findMany({
          where: { isActive: true },
          include: {
            subject: true,
          },
        });

        const coverageByGradeAndStrand: Record<number, Record<string, number>> = {};
        const coverageBySubjectAndGrade: Record<string, Record<number, number>> = {};

        for (const exp of expectations) {
          // By grade and strand
          if (!coverageByGradeAndStrand[exp.grade]) {
            coverageByGradeAndStrand[exp.grade] = {};
          }
          if (exp.strand) {
            coverageByGradeAndStrand[exp.grade][exp.strand] = 
              (coverageByGradeAndStrand[exp.grade][exp.strand] || 0) + 1;
          }

          // By subject and grade
          const subjectName = exp.subject.name;
          if (!coverageBySubjectAndGrade[subjectName]) {
            coverageBySubjectAndGrade[subjectName] = {};
          }
          coverageBySubjectAndGrade[subjectName][exp.grade] = 
            (coverageBySubjectAndGrade[subjectName][exp.grade] || 0) + 1;
        }

        // Identify gaps (this is a simplified implementation)
        const gapsIdentified: Array<{
          grade: number;
          strand: string;
          subject: string;
          expectedCount: number;
          actualCount: number;
        }> = [];

        // This could be enhanced with curriculum standards to identify actual gaps
        
        return {
          coverageByGradeAndStrand,
          coverageBySubjectAndGrade,
          gapsIdentified,
        };
      },
      'getCoverageStats'
    );
  }

  /**
   * Get trending statistics (most used expectations)
   */
  public async getTrendingStats(): Promise<{
    mostUsedExpectations: Array<{
      id: number;
      code: string;
      description: string;
      usageCount: number;
    }>;
    popularStrands: Array<{
      strand: string;
      count: number;
    }>;
    popularGrades: Array<{
      grade: number;
      count: number;
    }>;
  }> {
    return this.executeWithMetrics(
      async () => {
        // This would require tracking usage in lesson plans, unit plans, etc.
        // For now, we'll return expectations by creation/update frequency
        
        const expectations = await prisma.curriculumExpectation.findMany({
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            code: true,
            description: true,
            strand: true,
            grade: true,
          },
        });

        // Count by strand
        const strandCounts: Record<string, number> = {};
        const gradeCounts: Record<number, number> = {};

        for (const exp of expectations) {
          if (exp.strand) {
            strandCounts[exp.strand] = (strandCounts[exp.strand] || 0) + 1;
          }
          gradeCounts[exp.grade] = (gradeCounts[exp.grade] || 0) + 1;
        }

        return {
          mostUsedExpectations: expectations.map(exp => ({
            id: exp.id,
            code: exp.code,
            description: exp.description,
            usageCount: 0, // Would need to count actual usage
          })),
          popularStrands: Object.entries(strandCounts)
            .map(([strand, count]) => ({ strand, count }))
            .sort((a, b) => b.count - a.count),
          popularGrades: Object.entries(gradeCounts)
            .map(([grade, count]) => ({ grade: parseInt(grade), count }))
            .sort((a, b) => b.count - a.count),
        };
      },
      'getTrendingStats'
    );
  }

  /**
   * Get import history statistics
   */
  public async getImportHistory(): Promise<Array<{
    id: string;
    userId: number;
    grade: number;
    subject: string;
    status: string;
    createdAt: Date;
    expectationsCount?: number;
  }>> {
    return this.executeWithMetrics(
      async () => {
        const imports = await prisma.curriculumImport.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        // Add expectations count for completed imports
        const importsWithStats = await Promise.all(
          imports.map(async (importRecord) => {
            let expectationsCount: number | undefined;

            if (importRecord.status === 'completed') {
              // Count expectations created around the import time
              const count = await prisma.curriculumExpectation.count({
                where: {
                  createdAt: {
                    gte: new Date(importRecord.createdAt.getTime() - 5 * 60 * 1000), // 5 minutes before
                    lte: new Date(importRecord.createdAt.getTime() + 5 * 60 * 1000), // 5 minutes after
                  },
                },
              });
              expectationsCount = count;
            }

            return {
              id: importRecord.id,
              userId: importRecord.userId,
              grade: importRecord.grade,
              subject: importRecord.subject,
              status: importRecord.status,
              createdAt: importRecord.createdAt,
              expectationsCount,
            };
          })
        );

        return importsWithStats;
      },
      'getImportHistory'
    );
  }
}

// Export singleton instance
export const curriculumStatsService = CurriculumStatsService.getInstance();