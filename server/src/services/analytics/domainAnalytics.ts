/**
 * Domain Analytics Service
 *
 * Provides domain strength analysis across learning areas, generating
 * radar chart data and cross-domain progress metrics for students.
 */

import { PrismaClient } from '@teaching-engine/database';
import { cached, analyticsCache } from './analyticsCache';

const prisma = new PrismaClient();

export interface DomainData {
  domain: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  trajectory: 'improving' | 'stable' | 'declining';
  outcomesCompleted: number;
  outcomesTotal: number;
  reflectionCount: number;
  vocabWords: number;
  lastUpdated: Date;
}

export interface StudentDomainRadar {
  studentId: number;
  studentName: string;
  term: string;
  domains: Record<string, DomainData>;
  overallScore: number;
  strengths: string[];
  areasForGrowth: string[];
  comparisonTerm?: string;
  comparisonData?: Record<string, DomainData>;
}

export interface ClassDomainSummary {
  classAverages: Record<string, number>;
  domainDistribution: Record<
    string,
    {
      high: number; // students scoring 80+
      medium: number; // students scoring 50-79
      low: number; // students scoring <50
    }
  >;
  topPerformingDomains: string[];
  challengingDomains: string[];
  recommendedFocus: string[];
}

export interface DomainTrend {
  domain: string;
  weeklyScores: Array<{
    week: number;
    score: number;
    outcomeCount: number;
  }>;
  trendDirection: 'up' | 'down' | 'stable';
  velocityPerWeek: number;
}

class DomainAnalyticsService {
  /**
   * Generate domain radar data for a specific student
   */
  @cached(15 * 60 * 1000) // 15 minute cache
  async generateStudentRadar(params: {
    studentId: number;
    term?: string;
    compareTo?: string;
    teacherId?: number;
  }): Promise<StudentDomainRadar> {
    const { studentId, term, compareTo, teacherId } = params;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!student) {
      throw new Error(`Student with id ${studentId} not found`);
    }

    // Get domain data for current term
    const domains = await this.getStudentDomainData(studentId, term, teacherId);

    // Get comparison data if requested
    let comparisonData: Record<string, DomainData> | undefined;
    if (compareTo) {
      comparisonData = await this.getStudentDomainData(studentId, compareTo, teacherId);
    }

    // Calculate overall score and insights
    const domainScores = Object.values(domains).map((d) => d.currentLevel);
    const overallScore =
      domainScores.reduce((sum, score) => sum + score, 0) / Math.max(1, domainScores.length);

    const strengths = Object.entries(domains)
      .filter(([_, data]) => data.currentLevel >= 80)
      .map(([domain]) => domain)
      .slice(0, 3);

    const areasForGrowth = Object.entries(domains)
      .filter(([_, data]) => data.currentLevel < 60)
      .map(([domain]) => domain)
      .slice(0, 3);

    return {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      term: term || 'Current',
      domains,
      overallScore: Math.round(overallScore),
      strengths,
      areasForGrowth,
      comparisonTerm: compareTo,
      comparisonData,
    };
  }

  /**
   * Generate class-wide domain summary
   */
  @cached(10 * 60 * 1000) // 10 minute cache
  async generateClassSummary(params: {
    teacherId: number;
    term?: string;
    grade?: number;
  }): Promise<ClassDomainSummary> {
    const { teacherId, term, grade } = params;

    // Get all students for this teacher
    const students = await prisma.student.findMany({
      where: {
        ...(teacherId && { userId: teacherId }),
        ...(grade && { grade }),
      },
      select: { id: true, firstName: true, lastName: true },
    });

    // Get domain data for each student
    const studentDomainData = await Promise.all(
      students.map((student) => this.getStudentDomainData(student.id, term, teacherId)),
    );

    // Calculate class averages
    const allDomains = new Set<string>();
    studentDomainData.forEach((data) =>
      Object.keys(data).forEach((domain) => allDomains.add(domain)),
    );

    const classAverages: Record<string, number> = {};
    const domainDistribution: Record<string, { high: number; medium: number; low: number }> = {};

    for (const domain of allDomains) {
      const scores = studentDomainData
        .map((data) => data[domain]?.currentLevel || 0)
        .filter((score) => score > 0);

      if (scores.length > 0) {
        classAverages[domain] = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        );

        domainDistribution[domain] = {
          high: scores.filter((score) => score >= 80).length,
          medium: scores.filter((score) => score >= 50 && score < 80).length,
          low: scores.filter((score) => score < 50).length,
        };
      }
    }

    // Identify top performing and challenging domains
    const sortedDomains = Object.entries(classAverages).sort(([, a], [, b]) => b - a);

    const topPerformingDomains = sortedDomains.slice(0, 3).map(([domain]) => domain);

    const challengingDomains = sortedDomains
      .slice(-3)
      .reverse()
      .map(([domain]) => domain);

    // Generate recommendations based on distribution
    const recommendedFocus = Object.entries(domainDistribution)
      .filter(([, dist]) => dist.low > dist.high)
      .map(([domain]) => domain)
      .slice(0, 2);

    return {
      classAverages,
      domainDistribution,
      topPerformingDomains,
      challengingDomains,
      recommendedFocus,
    };
  }

  /**
   * Generate domain trend analysis
   */
  @cached(20 * 60 * 1000) // 20 minute cache
  async generateDomainTrends(params: {
    studentId: number;
    domain: string;
    weekCount?: number;
    teacherId?: number;
  }): Promise<DomainTrend> {
    const { studentId, domain, weekCount = 12, teacherId } = params;

    // Get weekly progression data
    const weeklyData = await this.getWeeklyDomainProgression(
      studentId,
      domain,
      weekCount,
      teacherId,
    );

    // Calculate trend direction and velocity
    const scores = weeklyData.map((d) => d.score);
    const trendDirection = this.calculateTrendDirection(scores);
    const velocityPerWeek = this.calculateVelocity(scores);

    return {
      domain,
      weeklyScores: weeklyData,
      trendDirection,
      velocityPerWeek,
    };
  }

  /**
   * Get domain data for a specific student
   */
  private async getStudentDomainData(
    studentId: number,
    term?: string,
    teacherId?: number,
  ): Promise<Record<string, DomainData>> {
    // Get domain mapping from outcomes
    const outcomes = await prisma.outcome.findMany({
      where: {
        domain: { not: null },
      },
      select: {
        id: true,
        domain: true,
        subject: true,
      },
    });

    const domainGroups = outcomes.reduce(
      (groups, outcome) => {
        const domain = outcome.domain!;
        if (!groups[domain]) groups[domain] = [];
        groups[domain].push(outcome.id);
        return groups;
      },
      {} as Record<string, string[]>,
    );

    const domainData: Record<string, DomainData> = {};

    for (const [domain, outcomeIds] of Object.entries(domainGroups)) {
      // Get outcome completion data
      const completedOutcomes = await this.getCompletedOutcomesForStudent(
        studentId,
        outcomeIds,
        term,
      );

      // Get reflection count
      const reflectionCount = await this.getReflectionCountForDomain(studentId, domain, term);

      // Get vocabulary count (simplified for now)
      const vocabWords = await this.getVocabularyCountForDomain(studentId, domain, term);

      // Calculate weighted score
      const outcomeScore = (completedOutcomes.length / Math.max(1, outcomeIds.length)) * 100;
      const reflectionBonus = Math.min(reflectionCount * 5, 20); // Max 20 points from reflections
      const vocabBonus = Math.min(vocabWords * 2, 10); // Max 10 points from vocabulary

      const currentLevel = Math.min(100, Math.round(outcomeScore + reflectionBonus + vocabBonus));

      // Calculate trajectory (simplified)
      const trajectory = await this.calculateTrajectory(studentId, domain, term);

      domainData[domain] = {
        domain,
        currentLevel,
        targetLevel: 85, // Could be personalized
        trajectory,
        outcomesCompleted: completedOutcomes.length,
        outcomesTotal: outcomeIds.length,
        reflectionCount,
        vocabWords,
        lastUpdated: new Date(),
      };
    }

    return domainData;
  }

  /**
   * Get completed outcomes for a student
   */
  private async getCompletedOutcomesForStudent(
    studentId: number,
    outcomeIds: string[],
    term?: string,
  ): Promise<string[]> {
    // Check assessment results
    const assessmentResults = await prisma.studentAssessmentResult.findMany({
      where: {
        studentId,
        result: {
          template: {
            outcomes: {
              hasSome: outcomeIds,
            },
          },
        },
        ...(term && {
          result: {
            createdAt: {
              gte: getTermStartDate(term),
              lte: getTermEndDate(term),
            },
          },
        }),
      },
      include: {
        result: {
          include: {
            template: {
              select: { outcomes: true },
            },
          },
        },
      },
    });

    // Extract completed outcome IDs
    const completedIds = new Set<string>();
    assessmentResults.forEach((result) => {
      result.result.template.outcomes.forEach((outcomeId) => {
        if (outcomeIds.includes(outcomeId)) {
          completedIds.add(outcomeId);
        }
      });
    });

    return Array.from(completedIds);
  }

  /**
   * Get reflection count for domain
   */
  private async getReflectionCountForDomain(
    studentId: number,
    domain: string,
    term?: string,
  ): Promise<number> {
    const count = await prisma.studentReflection.count({
      where: {
        studentId,
        ...(term && {
          createdAt: {
            gte: getTermStartDate(term),
            lte: getTermEndDate(term),
          },
        }),
      },
    });

    return count;
  }

  /**
   * Get vocabulary count for domain (simplified)
   */
  private async getVocabularyCountForDomain(
    studentId: number,
    domain: string,
    term?: string,
  ): Promise<number> {
    // This would integrate with vocabulary tracking when implemented
    return Math.floor(Math.random() * 20); // Placeholder
  }

  /**
   * Calculate trajectory for domain
   */
  private async calculateTrajectory(
    studentId: number,
    domain: string,
    term?: string,
  ): Promise<'improving' | 'stable' | 'declining'> {
    // Simplified trajectory calculation
    // In practice, would compare current performance to previous term
    const randomValue = Math.random();
    if (randomValue > 0.6) return 'improving';
    if (randomValue > 0.3) return 'stable';
    return 'declining';
  }

  /**
   * Get weekly domain progression
   */
  private async getWeeklyDomainProgression(
    studentId: number,
    domain: string,
    weekCount: number,
    teacherId?: number,
  ): Promise<Array<{ week: number; score: number; outcomeCount: number }>> {
    const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

    return weeks.map((week) => ({
      week,
      score: Math.floor(Math.random() * 40) + 40, // Placeholder data
      outcomeCount: Math.floor(Math.random() * 5) + 1,
    }));
  }

  /**
   * Calculate trend direction from scores
   */
  private calculateTrendDirection(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable';

    const recent = scores.slice(-3).reduce((sum, s) => sum + s, 0) / 3;
    const earlier = scores.slice(0, 3).reduce((sum, s) => sum + s, 0) / 3;

    const difference = recent - earlier;

    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  }

  /**
   * Calculate velocity (points per week)
   */
  private calculateVelocity(scores: number[]): number {
    if (scores.length < 2) return 0;

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const weeks = scores.length - 1;

    return Math.round(((lastScore - firstScore) / weeks) * 10) / 10;
  }

  /**
   * Invalidate cache when student data changes
   */
  invalidateStudentCache(studentId: number): void {
    analyticsCache.invalidatePattern(`DomainAnalyticsService.*studentId:${studentId}`);
  }

  /**
   * Invalidate cache when teacher data changes
   */
  invalidateTeacherCache(teacherId: number): void {
    analyticsCache.invalidatePattern(`DomainAnalyticsService.*teacherId:${teacherId}`);
  }
}

export const domainAnalyticsService = new DomainAnalyticsService();

// Helper functions
function getTermStartDate(term: string): Date {
  const currentYear = new Date().getFullYear();
  switch (term) {
    case 'Term 1':
      return new Date(currentYear, 8, 1); // September 1
    case 'Term 2':
      return new Date(currentYear + 1, 0, 1); // January 1
    case 'Term 3':
      return new Date(currentYear + 1, 3, 1); // April 1
    default:
      return new Date(currentYear, 0, 1);
  }
}

function getTermEndDate(term: string): Date {
  const currentYear = new Date().getFullYear();
  switch (term) {
    case 'Term 1':
      return new Date(currentYear, 11, 31); // December 31
    case 'Term 2':
      return new Date(currentYear + 1, 2, 31); // March 31
    case 'Term 3':
      return new Date(currentYear + 1, 5, 30); // June 30
    default:
      return new Date(currentYear, 11, 31);
  }
}
