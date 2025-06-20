/**
 * Theme Analytics Service
 *
 * Analyzes theme usage across teaching activities, documentation, and assessment,
 * providing insights into thematic coverage, balance, and cross-subject integration.
 */

import { PrismaClient } from '@teaching-engine/database';
import { cached, analyticsCache } from './analyticsCache';

const prisma = new PrismaClient();

export interface ThemeUsageData {
  themeId: number;
  themeName: string;
  usageCount: number;
  domainsUsed: string[];
  subjectsUsed: string[];
  linkedOutcomes: string[];
  termsUsed: string[];
  usageTypes: {
    planner: number;
    reflection: number;
    artifact: number;
    assessment: number;
  };
  lastUsed: Date;
  integrationScore: number; // Cross-subject integration score 0-100
}

export interface ThemeAnalyticsSummary {
  totalThemes: number;
  activeThemes: number; // Used in current term
  averageUsagePerTheme: number;
  mostUsedThemes: ThemeUsageData[];
  underusedThemes: ThemeUsageData[];
  wellIntegratedThemes: ThemeUsageData[];
  themeBalance: {
    balanced: boolean;
    recommendation: string;
    distribution: Record<string, number>;
  };
  crossSubjectConnections: Array<{
    theme: string;
    subjects: string[];
    connectionStrength: number;
  }>;
}

export interface ThemeMatrixData {
  themes: string[];
  domains: string[];
  subjects: string[];
  matrix: Record<string, Record<string, number>>; // theme -> domain -> usage count
  heatmapData: Array<{
    theme: string;
    domain: string;
    value: number;
    activities: string[];
  }>;
}

export interface ThemeTrendData {
  theme: string;
  weeklyUsage: Array<{
    week: number;
    count: number;
    subjects: string[];
  }>;
  seasonality: {
    pattern: 'increasing' | 'decreasing' | 'cyclical' | 'stable';
    peakWeeks: number[];
    lowWeeks: number[];
  };
  forecast: Array<{
    week: number;
    predictedUsage: number;
    confidence: number;
  }>;
}

class ThemeAnalyticsService {
  /**
   * Generate comprehensive theme analytics summary
   */
  @cached(20 * 60 * 1000) // 20 minute cache
  async generateThemeAnalytics(params: {
    teacherId?: number;
    term?: string;
    subject?: string;
    year?: number;
  }): Promise<ThemeAnalyticsSummary> {
    const { teacherId, term, subject, year = new Date().getFullYear() } = params;

    // Get all themes with usage data
    const themeUsageData = await this.getAllThemeUsageData({ teacherId, term, subject, year });

    // Calculate summary statistics
    const totalThemes = themeUsageData.length;
    const activeThemes = themeUsageData.filter((theme) => theme.usageCount > 0).length;
    const averageUsagePerTheme = Math.round(
      themeUsageData.reduce((sum, theme) => sum + theme.usageCount, 0) / Math.max(1, totalThemes),
    );

    // Sort themes by usage
    const sortedByUsage = [...themeUsageData].sort((a, b) => b.usageCount - a.usageCount);
    const mostUsedThemes = sortedByUsage.slice(0, 5);
    const underusedThemes = sortedByUsage.slice(-5).reverse();

    // Sort by integration score
    const wellIntegratedThemes = [...themeUsageData]
      .sort((a, b) => b.integrationScore - a.integrationScore)
      .slice(0, 5);

    // Analyze theme balance
    const themeBalance = this.analyzeThemeBalance(themeUsageData);

    // Identify cross-subject connections
    const crossSubjectConnections = this.identifyCrossSubjectConnections(themeUsageData);

    return {
      totalThemes,
      activeThemes,
      averageUsagePerTheme,
      mostUsedThemes,
      underusedThemes,
      wellIntegratedThemes,
      themeBalance,
      crossSubjectConnections,
    };
  }

  /**
   * Generate theme matrix heatmap data
   */
  @cached(15 * 60 * 1000) // 15 minute cache
  async generateThemeMatrix(params: {
    teacherId?: number;
    term?: string;
    viewBy?: 'domain' | 'subject';
    year?: number;
  }): Promise<ThemeMatrixData> {
    const { teacherId, term, viewBy = 'domain', year = new Date().getFullYear() } = params;

    // Get theme usage data
    const themeUsageData = await this.getAllThemeUsageData({ teacherId, term, year });

    // Extract unique themes and categories
    const themes = [...new Set(themeUsageData.map((t) => t.themeName))];
    const categories =
      viewBy === 'domain'
        ? [...new Set(themeUsageData.flatMap((t) => t.domainsUsed))]
        : [...new Set(themeUsageData.flatMap((t) => t.subjectsUsed))];

    // Build matrix
    const matrix: Record<string, Record<string, number>> = {};
    const heatmapData: Array<{
      theme: string;
      domain: string;
      value: number;
      activities: string[];
    }> = [];

    for (const theme of themes) {
      matrix[theme] = {};
      for (const category of categories) {
        const themeData = themeUsageData.find((t) => t.themeName === theme);
        const relevantCategories =
          viewBy === 'domain' ? themeData?.domainsUsed : themeData?.subjectsUsed;
        const count = relevantCategories?.includes(category) ? themeData?.usageCount || 0 : 0;

        matrix[theme][category] = count;

        if (count > 0) {
          heatmapData.push({
            theme,
            domain: category,
            value: count,
            activities: await this.getActivitiesForThemeAndCategory(theme, category, {
              teacherId,
              term,
            }),
          });
        }
      }
    }

    return {
      themes,
      domains: viewBy === 'domain' ? categories : [],
      subjects: viewBy === 'subject' ? categories : [],
      matrix,
      heatmapData,
    };
  }

  /**
   * Generate theme trend analysis
   */
  @cached(30 * 60 * 1000) // 30 minute cache
  async generateThemeTrends(params: {
    theme: string;
    teacherId?: number;
    weekCount?: number;
    year?: number;
  }): Promise<ThemeTrendData> {
    const { theme, teacherId, weekCount = 20, year = new Date().getFullYear() } = params;

    // Get weekly usage data
    const weeklyUsage = await this.getWeeklyThemeUsage(theme, { teacherId, weekCount, year });

    // Analyze seasonality patterns
    const seasonality = this.analyzeSeasonality(weeklyUsage);

    // Generate simple forecast
    const forecast = this.generateThemeForecast(weeklyUsage, 4); // 4 weeks ahead

    return {
      theme,
      weeklyUsage,
      seasonality,
      forecast,
    };
  }

  /**
   * Get detailed theme usage data for all themes
   */
  private async getAllThemeUsageData(params: {
    teacherId?: number;
    term?: string;
    subject?: string;
    year: number;
  }): Promise<ThemeUsageData[]> {
    const { teacherId, term, subject, year } = params;

    // Get all thematic units
    const thematicUnits = await prisma.thematicUnit.findMany({
      where: {
        ...(teacherId && { userId: teacherId }),
        ...(term && {
          startDate: { gte: getTermStartDate(term) },
          endDate: { lte: getTermEndDate(term) },
        }),
      },
      include: {
        outcomes: {
          include: {
            outcome: true,
          },
        },
        activities: {
          include: {
            activity: {
              include: {
                outcomes: {
                  include: {
                    outcome: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const themeUsageData: ThemeUsageData[] = [];

    for (const unit of thematicUnits) {
      // Calculate usage metrics
      const usageTypes = {
        planner: unit.activities.length,
        reflection: await this.getReflectionCountForTheme(unit.id, term),
        artifact: await this.getArtifactCountForTheme(unit.id, term),
        assessment: await this.getAssessmentCountForTheme(unit.id, term),
      };

      const usageCount = Object.values(usageTypes).reduce((sum, count) => sum + count, 0);

      // Extract domains and subjects
      const outcomes = [
        ...unit.outcomes.map((o) => o.outcome),
        ...unit.activities.flatMap((a) => a.activity.outcomes.map((o) => o.outcome)),
      ];

      const domainsUsed = [...new Set(outcomes.map((o) => o.domain).filter(Boolean))];
      const subjectsUsed = [...new Set(outcomes.map((o) => o.subject))];
      const linkedOutcomes = [...new Set(outcomes.map((o) => o.id))];

      // Calculate integration score
      const integrationScore = this.calculateIntegrationScore(
        subjectsUsed,
        domainsUsed,
        usageCount,
      );

      themeUsageData.push({
        themeId: unit.id,
        themeName: unit.title,
        usageCount,
        domainsUsed,
        subjectsUsed,
        linkedOutcomes,
        termsUsed: [term || 'Current'],
        usageTypes,
        lastUsed: unit.updatedAt,
        integrationScore,
      });
    }

    return themeUsageData;
  }

  /**
   * Get reflection count for theme
   */
  private async getReflectionCountForTheme(themeId: number, term?: string): Promise<number> {
    return await prisma.teacherReflection.count({
      where: {
        thematicUnitId: themeId,
        ...(term && {
          createdAt: {
            gte: getTermStartDate(term),
            lte: getTermEndDate(term),
          },
        }),
      },
    });
  }

  /**
   * Get artifact count for theme
   */
  private async getArtifactCountForTheme(themeId: number, term?: string): Promise<number> {
    // This would integrate with artifact tracking when implemented
    return Math.floor(Math.random() * 5); // Placeholder
  }

  /**
   * Get assessment count for theme
   */
  private async getAssessmentCountForTheme(themeId: number, term?: string): Promise<number> {
    return await prisma.assessmentResult.count({
      where: {
        template: {
          thematicUnitId: themeId,
        },
        ...(term && {
          createdAt: {
            gte: getTermStartDate(term),
            lte: getTermEndDate(term),
          },
        }),
      },
    });
  }

  /**
   * Calculate integration score based on cross-subject usage
   */
  private calculateIntegrationScore(
    subjects: string[],
    domains: string[],
    usageCount: number,
  ): number {
    const subjectBonus = Math.min(subjects.length * 20, 60); // Max 60 points for subjects
    const domainBonus = Math.min(domains.length * 10, 30); // Max 30 points for domains
    const usageBonus = Math.min(usageCount * 2, 10); // Max 10 points for usage

    return Math.min(100, subjectBonus + domainBonus + usageBonus);
  }

  /**
   * Analyze theme balance and distribution
   */
  private analyzeThemeBalance(themeUsageData: ThemeUsageData[]): {
    balanced: boolean;
    recommendation: string;
    distribution: Record<string, number>;
  } {
    const totalUsage = themeUsageData.reduce((sum, theme) => sum + theme.usageCount, 0);

    if (totalUsage === 0) {
      return {
        balanced: false,
        recommendation:
          'No theme usage detected. Consider incorporating thematic units into your planning.',
        distribution: {},
      };
    }

    // Calculate distribution by subjects
    const subjectDistribution: Record<string, number> = {};
    themeUsageData.forEach((theme) => {
      theme.subjectsUsed.forEach((subject) => {
        subjectDistribution[subject] = (subjectDistribution[subject] || 0) + theme.usageCount;
      });
    });

    // Check for balance (no subject should have >50% of usage)
    const maxSubjectUsage = Math.max(...Object.values(subjectDistribution));
    const balanced = maxSubjectUsage / totalUsage <= 0.5;

    let recommendation = '';
    if (!balanced) {
      const dominantSubject = Object.entries(subjectDistribution).find(
        ([, usage]) => usage === maxSubjectUsage,
      )?.[0];
      recommendation = `Consider diversifying themes beyond ${dominantSubject} to create more cross-curricular connections.`;
    } else {
      recommendation =
        'Good thematic balance across subjects. Continue integrating themes cross-curricularly.';
    }

    return {
      balanced,
      recommendation,
      distribution: subjectDistribution,
    };
  }

  /**
   * Identify cross-subject connections
   */
  private identifyCrossSubjectConnections(themeUsageData: ThemeUsageData[]): Array<{
    theme: string;
    subjects: string[];
    connectionStrength: number;
  }> {
    return themeUsageData
      .filter((theme) => theme.subjectsUsed.length > 1)
      .map((theme) => ({
        theme: theme.themeName,
        subjects: theme.subjectsUsed,
        connectionStrength: Math.min(100, theme.subjectsUsed.length * 25 + theme.usageCount * 5),
      }))
      .sort((a, b) => b.connectionStrength - a.connectionStrength)
      .slice(0, 10);
  }

  /**
   * Get activities for theme and category combination
   */
  private async getActivitiesForThemeAndCategory(
    theme: string,
    category: string,
    params: { teacherId?: number; term?: string },
  ): Promise<string[]> {
    const { teacherId, term } = params;

    const activities = await prisma.activity.findMany({
      where: {
        ...(teacherId && { milestone: { userId: teacherId } }),
        outcomes: {
          some: {
            outcome: {
              OR: [{ domain: category }, { subject: category }],
            },
          },
        },
        ...(term && {
          createdAt: {
            gte: getTermStartDate(term),
            lte: getTermEndDate(term),
          },
        }),
      },
      select: {
        title: true,
      },
      take: 5,
    });

    return activities.map((a) => a.title);
  }

  /**
   * Get weekly theme usage data
   */
  private async getWeeklyThemeUsage(
    theme: string,
    params: { teacherId?: number; weekCount: number; year: number },
  ): Promise<Array<{ week: number; count: number; subjects: string[] }>> {
    const { teacherId, weekCount, year } = params;

    // This would query actual usage data across weeks
    // For now, generating representative data
    return Array.from({ length: weekCount }, (_, i) => ({
      week: i + 1,
      count: Math.floor(Math.random() * 5) + Math.sin(i / 4) * 2,
      subjects: ['Math', 'Science', 'English'].slice(0, Math.floor(Math.random() * 3) + 1),
    }));
  }

  /**
   * Analyze seasonality patterns
   */
  private analyzeSeasonality(
    weeklyUsage: Array<{ week: number; count: number; subjects: string[] }>,
  ): {
    pattern: 'increasing' | 'decreasing' | 'cyclical' | 'stable';
    peakWeeks: number[];
    lowWeeks: number[];
  } {
    const counts = weeklyUsage.map((w) => w.count);
    const maxCount = Math.max(...counts);
    const avgCount = counts.reduce((sum, c) => sum + c, 0) / counts.length;

    const peakWeeks = weeklyUsage.filter((w) => w.count > avgCount * 1.5).map((w) => w.week);

    const lowWeeks = weeklyUsage.filter((w) => w.count < avgCount * 0.5).map((w) => w.week);

    // Simple pattern detection
    const firstHalf = counts.slice(0, Math.floor(counts.length / 2));
    const secondHalf = counts.slice(Math.floor(counts.length / 2));

    const firstAvg = firstHalf.reduce((sum, c) => sum + c, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, c) => sum + c, 0) / secondHalf.length;

    let pattern: 'increasing' | 'decreasing' | 'cyclical' | 'stable';

    if (secondAvg > firstAvg * 1.2) {
      pattern = 'increasing';
    } else if (firstAvg > secondAvg * 1.2) {
      pattern = 'decreasing';
    } else if (peakWeeks.length > 2 && lowWeeks.length > 2) {
      pattern = 'cyclical';
    } else {
      pattern = 'stable';
    }

    return {
      pattern,
      peakWeeks,
      lowWeeks,
    };
  }

  /**
   * Generate simple forecast
   */
  private generateThemeForecast(
    weeklyUsage: Array<{ week: number; count: number; subjects: string[] }>,
    forecastWeeks: number,
  ): Array<{ week: number; predictedUsage: number; confidence: number }> {
    const recentCounts = weeklyUsage.slice(-4).map((w) => w.count);
    const avgRecent = recentCounts.reduce((sum, c) => sum + c, 0) / recentCounts.length;

    return Array.from({ length: forecastWeeks }, (_, i) => ({
      week: weeklyUsage.length + i + 1,
      predictedUsage: Math.max(0, Math.round(avgRecent + (Math.random() - 0.5) * 2)),
      confidence: Math.max(0.3, 0.9 - i * 0.15), // Decreasing confidence
    }));
  }

  /**
   * Invalidate cache when theme data changes
   */
  invalidateCache(teacherId?: number): void {
    if (teacherId) {
      analyticsCache.invalidatePattern(`ThemeAnalyticsService.*teacherId:${teacherId}`);
    } else {
      analyticsCache.invalidatePattern('ThemeAnalyticsService.*');
    }
  }
}

export const themeAnalyticsService = new ThemeAnalyticsService();

// Helper functions (reused from other services)
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
