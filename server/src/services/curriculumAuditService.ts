import { prisma } from '../prisma';

export interface OutcomeCoverage {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  domain?: string;
  coveredCount: number;
  assessed: boolean;
  lastUsed: Date | null;
}

export interface CoverageSummary {
  total: number;
  covered: number;
  assessed: number;
  overused: number;
  uncovered: number;
  coveragePercentage: number;
  assessmentPercentage: number;
}

export interface AuditFilters {
  classId?: number;
  userId?: number;
  term?: string;
  startDate?: Date;
  endDate?: Date;
  subject?: string;
  grade?: number;
  domain?: string;
}

export class CurriculumAuditService {
  /**
   * Get curriculum coverage audit data based on filters
   */
  async getCurriculumCoverage(filters: AuditFilters): Promise<OutcomeCoverage[]> {
    // Build date range based on term
    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (filters.term) {
      const termDates = this.getTermDates(filters.term);
      startDate = termDates.start;
      endDate = termDates.end;
    }

    // Get all outcomes based on filters
    const outcomeFilters: {
      subject?: string;
      grade?: number;
      domain?: string;
    } = {};
    if (filters.subject) outcomeFilters.subject = filters.subject;
    if (filters.grade) outcomeFilters.grade = filters.grade;
    if (filters.domain) outcomeFilters.domain = filters.domain;

    const outcomes = await prisma.outcome.findMany({
      where: outcomeFilters,
      include: {
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                completedAt: true,
                activityType: true,
                userId: true,
                milestone: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
        assessmentTemplates: {
          include: {
            assessmentTemplate: {
              include: {
                results: {
                  select: {
                    id: true,
                    date: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Process each outcome to calculate coverage
    const coverageData: OutcomeCoverage[] = [];

    for (const outcome of outcomes) {
      // Filter activities by user and date range
      let relevantActivities = outcome.activities;

      if (filters.userId) {
        relevantActivities = relevantActivities.filter(
          (ao) =>
            ao.activity.userId === filters.userId ||
            ao.activity.milestone?.userId === filters.userId,
        );
      }

      // Count covered activities within date range
      let coveredCount = 0;
      let lastUsed: Date | null = null;
      let assessed = false;

      for (const activityOutcome of relevantActivities) {
        const activity = activityOutcome.activity;

        // Check if activity is completed and within date range
        if (activity.completedAt) {
          if (
            !startDate ||
            !endDate ||
            (activity.completedAt >= startDate && activity.completedAt <= endDate)
          ) {
            coveredCount++;

            // Track most recent usage
            if (!lastUsed || activity.completedAt > lastUsed) {
              lastUsed = activity.completedAt;
            }

            // Check if this is an assessment activity
            if (activity.activityType === 'ASSESSMENT') {
              assessed = true;
            }
          }
        }
      }

      // Also check formal assessments
      if (!assessed && outcome.assessmentTemplates) {
        for (const at of outcome.assessmentTemplates) {
          const template = at.assessmentTemplate;

          // Check if template has results within date range
          const hasResults = template.results.some((result) => {
            if (!startDate || !endDate) return true;
            return result.date >= startDate && result.date <= endDate;
          });

          if (hasResults) {
            assessed = true;
            break;
          }
        }
      }

      coverageData.push({
        outcomeId: outcome.id,
        outcomeCode: outcome.code,
        outcomeDescription: outcome.description,
        domain: outcome.domain || undefined,
        coveredCount,
        assessed,
        lastUsed,
      });
    }

    return coverageData;
  }

  /**
   * Get term date ranges
   */
  private getTermDates(term: string): { start: Date; end: Date } {
    const currentYear = new Date().getFullYear();
    const academicYearStart = new Date(currentYear, 8, 1); // September 1

    // If current date is before September, use previous year
    if (new Date().getMonth() < 8) {
      academicYearStart.setFullYear(currentYear - 1);
    }

    switch (term.toLowerCase()) {
      case 'term1':
      case '1':
        return {
          start: new Date(academicYearStart),
          end: new Date(academicYearStart.getFullYear(), 11, 23), // Dec 23
        };
      case 'term2':
      case '2':
        return {
          start: new Date(academicYearStart.getFullYear() + 1, 0, 7), // Jan 7
          end: new Date(academicYearStart.getFullYear() + 1, 2, 31), // Mar 31
        };
      case 'term3':
      case '3':
        return {
          start: new Date(academicYearStart.getFullYear() + 1, 3, 1), // Apr 1
          end: new Date(academicYearStart.getFullYear() + 1, 5, 30), // Jun 30
        };
      default:
        // Full year
        return {
          start: academicYearStart,
          end: new Date(academicYearStart.getFullYear() + 1, 5, 30),
        };
    }
  }

  /**
   * Get coverage summary statistics
   */
  async getCoverageSummary(filters: AuditFilters) {
    const coverage = await this.getCurriculumCoverage(filters);

    const total = coverage.length;
    const covered = coverage.filter((o) => o.coveredCount > 0).length;
    const assessed = coverage.filter((o) => o.assessed).length;
    const overused = coverage.filter((o) => o.coveredCount > 3).length;
    const uncovered = coverage.filter((o) => o.coveredCount === 0).length;

    return {
      total,
      covered,
      assessed,
      overused,
      uncovered,
      coveragePercentage: total > 0 ? Math.round((covered / total) * 100) : 0,
      assessmentPercentage: total > 0 ? Math.round((assessed / total) * 100) : 0,
    };
  }
}
