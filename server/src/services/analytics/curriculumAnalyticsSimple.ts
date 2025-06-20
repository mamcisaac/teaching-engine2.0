/**
 * Simplified Curriculum Analytics Service
 *
 * Provides analytics for curriculum outcome coverage using mock data
 * for demonstration purposes. In production, this would connect to
 * actual curriculum tracking systems.
 */

import { cached, analyticsCache } from './analyticsCache';
import { mockDataService } from './mockDataService';

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
    const { subject, domain, viewMode, startWeek = 1, endWeek = 20 } = params;

    // Get filtered outcomes from mock data
    const outcomes = mockDataService.getOutcomes({ subject, domain });

    // Generate weeks array
    const weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => startWeek + i);

    // Generate coverage grid based on view mode
    const grid = mockDataService.generateCoverageData(outcomes, weeks, viewMode);

    // Calculate coverage statistics
    let totalCells = 0;
    let coveredCells = 0;

    for (const outcome of outcomes) {
      for (const week of weeks) {
        totalCells++;
        if (grid[outcome.id][week] > 0) {
          coveredCells++;
        }
      }
    }

    const coveragePercentage = Math.round((coveredCells / totalCells) * 100);

    return {
      outcomes: outcomes.map((o) => ({
        id: o.id,
        code: o.code,
        label: o.description,
        subject: o.subject,
        domain: o.domain,
      })),
      weeks,
      grid,
      metadata: {
        viewMode,
        totalOutcomes: outcomes.length,
        totalWeeks: weeks.length,
        coveragePercentage,
      },
    };
  }

  /**
   * Generate curriculum coverage summary
   */
  @cached(15 * 60 * 1000) // 15 minute cache
  async getCurriculumSummary(params: {
    teacherId?: number;
    subject?: string;
    term?: string;
    year?: number;
  }): Promise<CurriculumSummary> {
    const { subject } = params;

    // Get outcomes and generate coverage data
    const outcomes = mockDataService.getOutcomes({ subject });
    const weeks = Array.from({ length: 20 }, (_, i) => i + 1);
    const grid = mockDataService.generateCoverageData(outcomes, weeks, 'taught');

    // Calculate summary statistics
    const outcomeCounts = outcomes.map((outcome) => {
      const totalCount = weeks.reduce((sum, week) => sum + (grid[outcome.id][week] || 0), 0);
      return {
        outcomeId: outcome.id,
        code: outcome.code,
        count: totalCount,
      };
    });

    const coveredOutcomes = outcomeCounts.filter((oc) => oc.count > 0);
    const coveragePercentage = Math.round((coveredOutcomes.length / outcomes.length) * 100);

    // Top and least covered outcomes
    const sortedByCount = [...outcomeCounts].sort((a, b) => b.count - a.count);
    const topCoveredOutcomes = sortedByCount.slice(0, 5);
    const leastCoveredOutcomes = sortedByCount
      .filter((oc) => oc.count > 0)
      .slice(-5)
      .reverse();

    // Average weekly hits
    const totalHits = outcomeCounts.reduce((sum, oc) => sum + oc.count, 0);
    const averageWeeklyHits = Math.round((totalHits / weeks.length) * 10) / 10;

    // Domain breakdown
    const domainBreakdown: Record<string, number> = {};
    outcomes.forEach((outcome) => {
      domainBreakdown[outcome.domain] = (domainBreakdown[outcome.domain] || 0) + 1;
    });

    // Check for domain imbalance (if any domain has >60% of outcomes)
    const maxDomainPercentage = Math.max(
      ...Object.values(domainBreakdown).map((count) => (count / outcomes.length) * 100),
    );
    const domainImbalance = maxDomainPercentage > 60;

    return {
      totalOutcomes: outcomes.length,
      coveredOutcomes: coveredOutcomes.length,
      coveragePercentage,
      topCoveredOutcomes,
      leastCoveredOutcomes,
      averageWeeklyHits,
      domainImbalance,
      domainBreakdown,
    };
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
