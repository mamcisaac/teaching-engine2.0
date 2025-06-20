/**
 * Curriculum Analytics Service
 *
 * Provides data aggregation and analysis for curriculum outcome coverage,
 * generating heatmap data and coverage statistics for visual dashboards.
 */

import { PrismaClient } from '@teaching-engine/database';
import { cached, analyticsCache } from './analyticsCache';

const prisma = new PrismaClient();

export interface OutcomeCoverageData {
  outcomeId: string;
  code: string;
  description: string;
  subject: string;
  domain: string | null;
  grade: number;
  weeklyData: Record<number, CoverageEntry>;
}

export interface CoverageEntry {
  planned: number;
  taught: number;
  assessed: number;
  reinforced: number;
}

export interface HeatmapData {
  outcomes: Array<{
    id: string;
    code: string;
    label: string;
    subject: string;
    domain: string | null;
  }>;
  weeks: number[];
  grid: Record<string, Record<number, number>>;
  metadata: {
    viewMode: 'planned' | 'taught' | 'assessed' | 'reinforced';
    totalOutcomes: number;
    totalWeeks: number;
    coveragePercentage: number;
  };
}

export interface CurriculumSummary {
  totalOutcomes: number;
  coveredOutcomes: number;
  coveragePercentage: number;
  topCoveredOutcomes: Array<{
    outcomeId: string;
    code: string;
    count: number;
  }>;
  leastCoveredOutcomes: Array<{
    outcomeId: string;
    code: string;
    count: number;
  }>;
  averageWeeklyHits: number;
  domainImbalance: boolean;
  domainBreakdown: Record<string, number>;
}

class CurriculumAnalyticsService {
  /**
   * Generate heatmap data for curriculum outcome coverage
   */
  @cached(10 * 60 * 1000) // 10 minute cache
  async generateHeatmapData(params: {
    teacherId?: number;
    subject?: string;
    domain?: string;
    viewMode: 'planned' | 'taught' | 'assessed' | 'reinforced';
    startWeek?: number;
    endWeek?: number;
    year?: number;
  }): Promise<HeatmapData> {
    const {
      teacherId,
      subject,
      domain,
      viewMode,
      startWeek = 1,
      endWeek = 40,
      year = new Date().getFullYear(),
    } = params;

    // Get relevant outcomes
    const outcomes = await this.getFilteredOutcomes({ subject, domain });

    // Get coverage data based on view mode
    const coverageData = await this.getCoverageByViewMode(viewMode, {
      teacherId,
      outcomeIds: outcomes.map((o) => o.id),
      startWeek,
      endWeek,
      year,
    });

    // Build grid data
    const weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);
    const grid: Record<string, Record<number, number>> = {};

    for (const outcome of outcomes) {
      grid[outcome.id] = {};
      for (const week of weeks) {
        grid[outcome.id][week] = coverageData[outcome.id]?.[week] || 0;
      }
    }

    // Calculate coverage percentage
    const totalCells = outcomes.length * weeks.length;
    const coveredCells = Object.values(grid).reduce(
      (total, outcomeData) =>
        total + Object.values(outcomeData).filter((count) => count > 0).length,
      0,
    );

    return {
      outcomes: outcomes.map((o) => ({
        id: o.id,
        code: o.code,
        label: o.description.substring(0, 50) + (o.description.length > 50 ? '...' : ''),
        subject: o.subject,
        domain: o.domain,
      })),
      weeks,
      grid,
      metadata: {
        viewMode,
        totalOutcomes: outcomes.length,
        totalWeeks: weeks.length,
        coveragePercentage: Math.round((coveredCells / totalCells) * 100),
      },
    };
  }

  /**
   * Get curriculum coverage summary statistics
   */
  @cached(5 * 60 * 1000) // 5 minute cache
  async getCurriculumSummary(params: {
    teacherId?: number;
    subject?: string;
    term?: string;
    year?: number;
  }): Promise<CurriculumSummary> {
    const { teacherId, subject, term, year = new Date().getFullYear() } = params;

    // Get all outcomes for the filter criteria
    const outcomes = await this.getFilteredOutcomes({ subject });

    // Get combined coverage data across all view modes
    const combinedCoverage = await this.getCombinedCoverage({
      teacherId,
      outcomeIds: outcomes.map((o) => o.id),
      term,
      year,
    });

    // Calculate statistics
    const outcomeCounts = Object.entries(combinedCoverage).map(([outcomeId, count]) => ({
      outcomeId,
      code: outcomes.find((o) => o.id === outcomeId)?.code || '',
      count,
    }));

    const coveredOutcomes = outcomeCounts.filter((oc) => oc.count > 0);
    const sortedCounts = outcomeCounts.sort((a, b) => b.count - a.count);

    // Domain breakdown
    const domainBreakdown: Record<string, number> = {};
    for (const outcome of outcomes) {
      const domain = outcome.domain || 'Other';
      const count = combinedCoverage[outcome.id] || 0;
      domainBreakdown[domain] = (domainBreakdown[domain] || 0) + count;
    }

    // Check for domain imbalance (>60% in one domain)
    const totalCoverage = Object.values(domainBreakdown).reduce((sum, count) => sum + count, 0);
    const maxDomainPercentage = Math.max(...Object.values(domainBreakdown)) / totalCoverage;

    return {
      totalOutcomes: outcomes.length,
      coveredOutcomes: coveredOutcomes.length,
      coveragePercentage: Math.round((coveredOutcomes.length / outcomes.length) * 100),
      topCoveredOutcomes: sortedCounts.slice(0, 5),
      leastCoveredOutcomes: sortedCounts.slice(-5).reverse(),
      averageWeeklyHits: totalCoverage / Math.max(1, getWeeksInTerm(term)),
      domainImbalance: maxDomainPercentage > 0.6,
      domainBreakdown,
    };
  }

  /**
   * Get filtered outcomes based on criteria
   */
  private async getFilteredOutcomes(filters: {
    subject?: string;
    domain?: string;
    grade?: number;
  }) {
    const { subject, domain, grade } = filters;

    return await prisma.outcome.findMany({
      where: {
        ...(subject && { subject }),
        ...(domain && { domain }),
        ...(grade && { grade }),
      },
      select: {
        id: true,
        code: true,
        description: true,
        subject: true,
        domain: true,
        grade: true,
      },
    });
  }

  /**
   * Get coverage data by view mode
   */
  private async getCoverageByViewMode(
    viewMode: 'planned' | 'taught' | 'assessed' | 'reinforced',
    params: {
      teacherId?: number;
      outcomeIds: string[];
      startWeek: number;
      endWeek: number;
      year: number;
    },
  ): Promise<Record<string, Record<number, number>>> {
    const { teacherId, outcomeIds, startWeek, endWeek, year } = params;

    switch (viewMode) {
      case 'planned':
        return this.getPlannedCoverage(params);
      case 'taught':
        return this.getTaughtCoverage(params);
      case 'assessed':
        return this.getAssessedCoverage(params);
      case 'reinforced':
        return this.getReinforcedCoverage(params);
      default:
        return {};
    }
  }

  /**
   * Get planned coverage from activities
   */
  private async getPlannedCoverage(params: {
    teacherId?: number;
    outcomeIds: string[];
    startWeek: number;
    endWeek: number;
    year: number;
  }): Promise<Record<string, Record<number, number>>> {
    // Query activities with outcome linkages from planner
    const activities = await prisma.activity.findMany({
      where: {
        ...(params.teacherId && { milestone: { userId: params.teacherId } }),
        outcomes: {
          some: {
            outcomeId: { in: params.outcomeIds },
          },
        },
      },
      include: {
        outcomes: true,
      },
    });

    // Convert to week-based coverage data
    const coverage: Record<string, Record<number, number>> = {};

    for (const activity of activities) {
      const week = getWeekFromDate(activity.createdAt);
      if (week >= params.startWeek && week <= params.endWeek) {
        for (const outcome of activity.outcomes) {
          if (!coverage[outcome.outcomeId]) {
            coverage[outcome.outcomeId] = {};
          }
          coverage[outcome.outcomeId][week] = (coverage[outcome.outcomeId][week] || 0) + 1;
        }
      }
    }

    return coverage;
  }

  /**
   * Get taught coverage from reflections/artifacts
   */
  private async getTaughtCoverage(params: {
    teacherId?: number;
    outcomeIds: string[];
    startWeek: number;
    endWeek: number;
    year: number;
  }): Promise<Record<string, Record<number, number>>> {
    // Query reflection entries and artifacts
    const reflections = await prisma.teacherReflection.findMany({
      where: {
        ...(params.teacherId && { userId: params.teacherId }),
        outcomes: {
          some: {
            outcomeId: { in: params.outcomeIds },
          },
        },
      },
      include: {
        outcomes: true,
      },
    });

    const coverage: Record<string, Record<number, number>> = {};

    for (const reflection of reflections) {
      const week = getWeekFromDate(reflection.createdAt);
      if (week >= params.startWeek && week <= params.endWeek) {
        for (const outcome of reflection.outcomes) {
          if (!coverage[outcome.outcomeId]) {
            coverage[outcome.outcomeId] = {};
          }
          coverage[outcome.outcomeId][week] = (coverage[outcome.outcomeId][week] || 0) + 1;
        }
      }
    }

    return coverage;
  }

  /**
   * Get assessed coverage from assessment results
   */
  private async getAssessedCoverage(params: {
    teacherId?: number;
    outcomeIds: string[];
    startWeek: number;
    endWeek: number;
    year: number;
  }): Promise<Record<string, Record<number, number>>> {
    // Query assessment results
    const assessments = await prisma.assessmentResult.findMany({
      where: {
        template: {
          ...(params.teacherId && { userId: params.teacherId }),
          outcomes: {
            some: { in: params.outcomeIds },
          },
        },
      },
      include: {
        template: {
          include: {
            outcomes: true,
          },
        },
      },
    });

    const coverage: Record<string, Record<number, number>> = {};

    for (const assessment of assessments) {
      const week = getWeekFromDate(assessment.createdAt);
      if (week >= params.startWeek && week <= params.endWeek) {
        for (const outcomeId of assessment.template.outcomes) {
          if (params.outcomeIds.includes(outcomeId)) {
            if (!coverage[outcomeId]) {
              coverage[outcomeId] = {};
            }
            coverage[outcomeId][week] = (coverage[outcomeId][week] || 0) + 1;
          }
        }
      }
    }

    return coverage;
  }

  /**
   * Get reinforced coverage from mini-lessons/oral routines
   */
  private async getReinforcedCoverage(params: {
    teacherId?: number;
    outcomeIds: string[];
    startWeek: number;
    endWeek: number;
    year: number;
  }): Promise<Record<string, Record<number, number>>> {
    // Query daily oral routines with outcome linkages
    const routines = await prisma.dailyOralRoutine.findMany({
      where: {
        ...(params.teacherId && { template: { userId: params.teacherId } }),
        template: {
          outcomes: {
            some: {
              outcomeId: { in: params.outcomeIds },
            },
          },
        },
      },
      include: {
        template: {
          include: {
            outcomes: true,
          },
        },
      },
    });

    const coverage: Record<string, Record<number, number>> = {};

    for (const routine of routines) {
      const week = getWeekFromDate(routine.date);
      if (week >= params.startWeek && week <= params.endWeek) {
        for (const outcome of routine.template.outcomes) {
          if (!coverage[outcome.outcomeId]) {
            coverage[outcome.outcomeId] = {};
          }
          coverage[outcome.outcomeId][week] = (coverage[outcome.outcomeId][week] || 0) + 1;
        }
      }
    }

    return coverage;
  }

  /**
   * Get combined coverage across all modes
   */
  private async getCombinedCoverage(params: {
    teacherId?: number;
    outcomeIds: string[];
    term?: string;
    year: number;
  }): Promise<Record<string, number>> {
    const termWeeks = getTermWeeks(params.term);

    const [planned, taught, assessed, reinforced] = await Promise.all([
      this.getPlannedCoverage({ ...params, startWeek: termWeeks.start, endWeek: termWeeks.end }),
      this.getTaughtCoverage({ ...params, startWeek: termWeeks.start, endWeek: termWeeks.end }),
      this.getAssessedCoverage({ ...params, startWeek: termWeeks.start, endWeek: termWeeks.end }),
      this.getReinforcedCoverage({ ...params, startWeek: termWeeks.start, endWeek: termWeeks.end }),
    ]);

    const combined: Record<string, number> = {};

    for (const outcomeId of params.outcomeIds) {
      const plannedCount = Object.values(planned[outcomeId] || {}).reduce(
        (sum, count) => sum + count,
        0,
      );
      const taughtCount = Object.values(taught[outcomeId] || {}).reduce(
        (sum, count) => sum + count,
        0,
      );
      const assessedCount = Object.values(assessed[outcomeId] || {}).reduce(
        (sum, count) => sum + count,
        0,
      );
      const reinforcedCount = Object.values(reinforced[outcomeId] || {}).reduce(
        (sum, count) => sum + count,
        0,
      );

      combined[outcomeId] = plannedCount + taughtCount + assessedCount + reinforcedCount;
    }

    return combined;
  }

  /**
   * Invalidate cache when curriculum data changes
   */
  invalidateCache(teacherId?: number): void {
    if (teacherId) {
      analyticsCache.invalidatePattern(`CurriculumAnalyticsService.*teacherId:${teacherId}`);
    } else {
      analyticsCache.invalidatePattern('CurriculumAnalyticsService.*');
    }
  }
}

export const curriculumAnalyticsService = new CurriculumAnalyticsService();

// Helper functions
function getWeekFromDate(date: Date): number {
  // Simple week calculation - could be enhanced with school year specifics
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(dayOfYear / 7);
}

function getTermWeeks(term?: string): { start: number; end: number } {
  // Default term mapping - could be configured per school
  switch (term) {
    case 'Term 1':
      return { start: 1, end: 13 };
    case 'Term 2':
      return { start: 14, end: 26 };
    case 'Term 3':
      return { start: 27, end: 40 };
    default:
      return { start: 1, end: 40 };
  }
}

function getWeeksInTerm(term?: string): number {
  const { start, end } = getTermWeeks(term);
  return end - start + 1;
}
