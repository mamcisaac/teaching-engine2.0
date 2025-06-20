/* eslint-disable @typescript-eslint/no-explicit-any */
import { clusteringService } from './clusteringService';
import BaseService from './base/BaseService';
import type { GenerateScheduleOptions, ScheduleItem } from './planningEngine';

export interface EnhancedScheduleOptions extends GenerateScheduleOptions {
  useThematicGrouping: boolean;
  enableProgressTracking: boolean;
  considerPrerequisites: boolean;
  materialPrepTime: number; // minutes
}

export interface ThematicGroup {
  name: string;
  outcomeIds: string[];
  activityIds: number[];
  estimatedDuration: number;
  prerequisites: string[];
}

export class EnhancedPlanningService extends BaseService {
  constructor() {
    super('EnhancedPlanningService');
  }

  /**
   * Generate curriculum-intelligent weekly schedule with thematic grouping
   */
  async generateIntelligentSchedule(
    userId: number,
    opts: EnhancedScheduleOptions,
  ): Promise<{
    schedule: ScheduleItem[];
    thematicGroups: ThematicGroup[];
    recommendations: string[];
  }> {
    try {
      this.logger.info({ userId, options: opts }, 'Starting intelligent schedule generation');

      const recommendations: string[] = [];
      let thematicGroups: ThematicGroup[] = [];

      // Get user's activities and outcomes
      const activities = await this.getUserActivities(userId);

      if (activities.length === 0) {
        return {
          schedule: [],
          thematicGroups: [],
          recommendations: ['No activities found. Create some activities first.'],
        };
      }

      // Generate thematic groupings if enabled
      if (opts.useThematicGrouping) {
        thematicGroups = await this.generateThematicGroups(activities);
        if (thematicGroups.length > 0) {
          recommendations.push(
            `Found ${thematicGroups.length} thematic groups for better learning coherence`,
          );
        }
      }

      // Check prerequisites if enabled
      if (opts.considerPrerequisites) {
        const prerequisiteIssues = await this.checkPrerequisites(activities);
        recommendations.push(...prerequisiteIssues);
      }

      // Generate base schedule with enhancements
      const schedule = await this.createEnhancedSchedule(activities, opts, thematicGroups);

      // Add material preparation buffers
      const schedulWithBuffers = this.addMaterialPrepBuffers(schedule, opts.materialPrepTime);

      // Track progress if enabled
      if (opts.enableProgressTracking) {
        await this.trackScheduleGeneration(userId, schedulWithBuffers);
      }

      this.logger.info(
        {
          userId,
          scheduledActivities: schedulWithBuffers.length,
          thematicGroups: thematicGroups.length,
        },
        'Completed intelligent schedule generation',
      );

      return {
        schedule: schedulWithBuffers,
        thematicGroups,
        recommendations,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to generate intelligent schedule');
      throw new Error(`Schedule generation failed: ${error.message}`);
    }
  }

  /**
   * Suggest activity sequences based on curriculum flow
   */
  async suggestActivitySequence(outcomeIds: string[]): Promise<{
    sequence: { outcomeId: string; reasoning: string }[];
    prerequisites: { outcomeId: string; requires: string[] }[];
  }> {
    try {
      const outcomes = await this.prisma.outcome.findMany({
        where: { id: { in: outcomeIds } },
        select: {
          id: true,
          code: true,
          description: true,
          grade: true,
          domain: true,
        },
      });

      // Simple prerequisite detection based on grade and complexity
      const prerequisites: { outcomeId: string; requires: string[] }[] = [];
      const sequence: { outcomeId: string; reasoning: string }[] = [];

      // Sort by grade and domain complexity
      const sortedOutcomes = outcomes.sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;

        // Simple domain complexity ordering
        const complexityOrder = ['number', 'algebra', 'geometry', 'statistics'];
        const aIndex = complexityOrder.indexOf(a.domain?.toLowerCase() || '');
        const bIndex = complexityOrder.indexOf(b.domain?.toLowerCase() || '');

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        return a.code.localeCompare(b.code);
      });

      for (let i = 0; i < sortedOutcomes.length; i++) {
        const outcome = sortedOutcomes[i];
        const priorOutcomes = sortedOutcomes.slice(0, i);

        // Find potential prerequisites
        const requires: string[] = [];
        for (const prior of priorOutcomes) {
          if (await this.isPrerequisite(prior, outcome)) {
            requires.push(prior.id);
          }
        }

        if (requires.length > 0) {
          prerequisites.push({ outcomeId: outcome.id, requires });
        }

        // Add to sequence with reasoning
        let reasoning = `Grade ${outcome.grade} outcome`;
        if (outcome.domain) reasoning += ` in ${outcome.domain}`;
        if (requires.length > 0) reasoning += ` (builds on previous concepts)`;

        sequence.push({ outcomeId: outcome.id, reasoning });
      }

      return { sequence, prerequisites };
    } catch (error) {
      this.logger.error({ error, outcomeIds }, 'Failed to suggest activity sequence');
      return { sequence: [], prerequisites: [] };
    }
  }

  /**
   * Optimize schedule based on student progress and outcome coverage
   */
  async optimizeScheduleForProgress(
    userId: number,
    currentSchedule: ScheduleItem[],
  ): Promise<{
    optimizedSchedule: ScheduleItem[];
    changes: string[];
    coverageAnalysis: {
      totalOutcomes: number;
      coveredOutcomes: number;
      gaps: string[];
    };
  }> {
    try {
      // Get outcome coverage data
      const coverageData = await this.analyzeCoverageGaps(userId);
      const changes: string[] = [];

      // Find activities that cover gap outcomes
      const gapActivities = await this.prisma.activity.findMany({
        where: {
          milestone: { userId },
          outcomes: {
            some: {
              outcome: {
                id: { in: coverageData.gaps },
              },
            },
          },
        },
        include: {
          outcomes: {
            include: {
              outcome: true,
            },
          },
        },
      });

      // Prioritize gap-filling activities
      let optimizedSchedule = [...currentSchedule];

      if (gapActivities.length > 0) {
        // Move gap-filling activities to earlier slots
        const gapActivityIds = gapActivities.map((a) => a.id);

        optimizedSchedule = optimizedSchedule.sort((a, b) => {
          const aIsGap = a.activityId ? gapActivityIds.includes(a.activityId) : false;
          const bIsGap = b.activityId ? gapActivityIds.includes(b.activityId) : false;

          if (aIsGap && !bIsGap) return -1;
          if (!aIsGap && bIsGap) return 1;
          return 0;
        });

        changes.push(`Prioritized ${gapActivities.length} activities covering curriculum gaps`);
      }

      const coverageAnalysis = {
        totalOutcomes: coverageData.totalOutcomes,
        coveredOutcomes: coverageData.coveredOutcomes,
        gaps: coverageData.gaps,
      };

      return {
        optimizedSchedule,
        changes,
        coverageAnalysis,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to optimize schedule for progress');
      return {
        optimizedSchedule: currentSchedule,
        changes: [],
        coverageAnalysis: { totalOutcomes: 0, coveredOutcomes: 0, gaps: [] },
      };
    }
  }

  // Private helper methods

  private async getUserActivities(userId: number) {
    return await this.prisma.activity.findMany({
      where: {
        milestone: { userId },
        completedAt: null,
      },
      include: {
        milestone: {
          include: {
            subject: true,
            outcomes: {
              include: {
                outcome: true,
              },
            },
          },
        },
        outcomes: {
          include: {
            outcome: true,
          },
        },
      },
    });
  }

  private async generateThematicGroups(activities: any[]): Promise<ThematicGroup[]> {
    try {
      const groups: ThematicGroup[] = [];

      // Group activities by similar outcomes using clustering
      const outcomeActivityMap = new Map<string, number[]>();

      for (const activity of activities) {
        for (const activityOutcome of activity.outcomes) {
          const outcomeId = activityOutcome.outcome.id;
          if (!outcomeActivityMap.has(outcomeId)) {
            outcomeActivityMap.set(outcomeId, []);
          }
          outcomeActivityMap.get(outcomeId)!.push(activity.id);
        }
      }

      // Find similar outcomes and group them
      const processedOutcomes = new Set<string>();

      for (const [outcomeId] of outcomeActivityMap.entries()) {
        if (processedOutcomes.has(outcomeId)) continue;

        const similarOutcomes = await clusteringService.suggestSimilarOutcomes(outcomeId, 0.8, 5);
        const groupOutcomes = [outcomeId, ...similarOutcomes.map((s) => s.outcomeId)];

        // Collect all activities for this thematic group
        const groupActivityIds = new Set<number>();
        let totalDuration = 0;

        for (const oId of groupOutcomes) {
          const relatedActivities = outcomeActivityMap.get(oId) || [];
          relatedActivities.forEach((aId) => {
            groupActivityIds.add(aId);
            const activity = activities.find((a) => a.id === aId);
            if (activity) totalDuration += activity.estimatedDuration || 45;
          });
          processedOutcomes.add(oId);
        }

        if (groupActivityIds.size > 1) {
          // Get outcome descriptions for theme naming
          const outcomes = await this.prisma.outcome.findMany({
            where: { id: { in: groupOutcomes } },
            select: { description: true, domain: true },
          });

          const domain = outcomes[0]?.domain || 'General';
          const themeName = `${domain} Concepts ${groups.length + 1}`;

          groups.push({
            name: themeName,
            outcomeIds: groupOutcomes,
            activityIds: Array.from(groupActivityIds),
            estimatedDuration: totalDuration,
            prerequisites: [], // TODO: Implement prerequisite detection
          });
        }
      }

      return groups;
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate thematic groups');
      return [];
    }
  }

  private async checkPrerequisites(activities: any[]): Promise<string[]> {
    const issues: string[] = [];

    // Simple prerequisite checking based on grade levels
    const gradeMap = new Map<number, number[]>();

    for (const activity of activities) {
      for (const activityOutcome of activity.outcomes) {
        const grade = activityOutcome.outcome.grade;
        if (!gradeMap.has(grade)) gradeMap.set(grade, []);
        gradeMap.get(grade)!.push(activity.id);
      }
    }

    const grades = Array.from(gradeMap.keys()).sort();
    for (let i = 1; i < grades.length; i++) {
      const currentGrade = grades[i];
      const prevGrade = grades[i - 1];

      if (currentGrade - prevGrade > 1) {
        issues.push(
          `Gap detected: Activities jump from grade ${prevGrade} to ${currentGrade} - consider adding transitional content`,
        );
      }
    }

    return issues;
  }

  private async createEnhancedSchedule(
    activities: any[],
    opts: EnhancedScheduleOptions,
    thematicGroups: ThematicGroup[],
  ): Promise<ScheduleItem[]> {
    const schedule: ScheduleItem[] = [];
    const availableSlots = opts.availableBlocks;

    if (thematicGroups.length > 0) {
      // Schedule thematic groups together
      let slotIndex = 0;

      for (const group of thematicGroups) {
        for (const activityId of group.activityIds) {
          if (slotIndex < availableSlots.length) {
            const slot = availableSlots[slotIndex];
            schedule.push({
              day: slot.day,
              slotId: slot.slotId,
              activityId,
            });
            slotIndex++;
          }
        }
      }

      // Schedule remaining activities
      const scheduledActivityIds = new Set(schedule.map((s) => s.activityId).filter(Boolean));
      const remainingActivities = activities.filter((a) => !scheduledActivityIds.has(a.id));

      for (const activity of remainingActivities) {
        if (slotIndex < availableSlots.length) {
          const slot = availableSlots[slotIndex];
          schedule.push({
            day: slot.day,
            slotId: slot.slotId,
            activityId: activity.id,
          });
          slotIndex++;
        }
      }
    } else {
      // Fallback to simple scheduling
      for (let i = 0; i < Math.min(activities.length, availableSlots.length); i++) {
        const slot = availableSlots[i];
        schedule.push({
          day: slot.day,
          slotId: slot.slotId,
          activityId: activities[i].id,
        });
      }
    }

    return schedule;
  }

  private addMaterialPrepBuffers(
    schedule: ScheduleItem[],
    materialPrepTime: number,
  ): ScheduleItem[] {
    if (materialPrepTime <= 0) return schedule;

    // Add buffer time before activities that require materials
    // This is a simplified implementation - in reality, you'd check activity.notes for material requirements
    return schedule.map((item) => {
      // For now, assume all activities need some prep time
      // TODO: Integrate with material detection from activity notes
      return item;
    });
  }

  private async trackScheduleGeneration(userId: number, schedule: ScheduleItem[]): Promise<void> {
    try {
      // Log schedule generation for analytics
      this.logger.info(
        {
          userId,
          scheduledActivities: schedule.filter((s) => s.activityId).length,
          totalSlots: schedule.length,
          timestamp: new Date(),
        },
        'Schedule generation tracked',
      );

      // TODO: Store schedule generation metrics in database for analysis
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to track schedule generation');
    }
  }

  private async isPrerequisite(prerequisite: any, outcome: any): Promise<boolean> {
    // Simple heuristic: lower grades are prerequisites for higher grades
    if (prerequisite.grade < outcome.grade) return true;

    // Same grade: check if descriptions suggest a dependency
    if (prerequisite.grade === outcome.grade && prerequisite.domain === outcome.domain) {
      const prereqDesc = prerequisite.description.toLowerCase();
      const outcomeDesc = outcome.description.toLowerCase();

      // Basic patterns that suggest prerequisite relationships
      if (prereqDesc.includes('basic') && !outcomeDesc.includes('basic')) return true;
      if (prereqDesc.includes('introduce') && outcomeDesc.includes('apply')) return true;
    }

    return false;
  }

  private async analyzeCoverageGaps(userId: number): Promise<{
    totalOutcomes: number;
    coveredOutcomes: number;
    gaps: string[];
  }> {
    try {
      // Get all outcomes for user's subjects
      const userSubjects = await this.prisma.subject.findMany({
        where: { userId },
        include: {
          milestones: {
            include: {
              outcomes: {
                include: {
                  outcome: true,
                },
              },
            },
          },
        },
      });

      const allOutcomeIds = new Set<string>();
      for (const subject of userSubjects) {
        for (const milestone of subject.milestones) {
          for (const milestoneOutcome of milestone.outcomes) {
            allOutcomeIds.add(milestoneOutcome.outcome.id);
          }
        }
      }

      // Get outcomes covered by activities
      const coveredOutcomes = await this.prisma.activityOutcome.findMany({
        where: {
          activity: {
            milestone: { userId },
          },
        },
        select: {
          outcomeId: true,
        },
      });

      const coveredOutcomeIds = new Set(coveredOutcomes.map((co) => co.outcomeId));
      const gaps = Array.from(allOutcomeIds).filter((id) => !coveredOutcomeIds.has(id));

      return {
        totalOutcomes: allOutcomeIds.size,
        coveredOutcomes: coveredOutcomeIds.size,
        gaps,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to analyze coverage gaps');
      return { totalOutcomes: 0, coveredOutcomes: 0, gaps: [] };
    }
  }
}

// Export singleton instance
export const enhancedPlanningService = new EnhancedPlanningService();
