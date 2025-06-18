import { prisma } from '../prisma';
import { getOutcomesCoverage } from './outcomeCoverage';
import { addDays } from 'date-fns';

export interface PlannerSuggestion {
  activityId: number;
  title: string;
  milestoneTitle: string;
  subject: string;
  linkedOutcomes: string[];
  coverageStatus: 'covers_uncovered' | 'general' | 'already_covered';
}

/**
 * Get planner suggestions for a specific week
 * @param weekStart - The start date of the week (Monday)
 * @param userId - Optional user ID (will use session user if not provided)
 */
export async function getPlannerSuggestions(
  weekStart: Date,
  userId?: number,
): Promise<PlannerSuggestion[]> {
  try {
    console.log('getPlannerSuggestions called with:', { weekStart, userId });

    // Calculate week range
    const weekEnd = addDays(weekStart, 6);
    console.log('Week range:', { weekStart, weekEnd });

    // Debug: Get ALL milestones for this user first
    const allMilestones = await prisma.milestone.findMany({
      where: { userId },
      include: { subject: true, activities: true },
    });
    console.log(
      `All milestones for user ${userId}:`,
      allMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        startDate: m.startDate,
        endDate: m.endDate,
        activitiesCount: m.activities.length,
      })),
    );

    // 1. Get all active milestones for the week
    // First, get all active milestones for the week
    const activeMilestones = await prisma.milestone.findMany({
      where: {
        userId,
        OR: [
          // Milestone spans the week
          {
            startDate: { lte: weekEnd },
            endDate: { gte: weekStart },
          },
          // Or milestone starts during the week
          {
            startDate: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        ],
      },
      include: {
        subject: true,
        activities: {
          where: {
            completedAt: null, // Only include incomplete activities
            dailyPlanItems: { none: {} }, // Not already scheduled
          },
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

    console.log(
      `Found ${activeMilestones.length} active milestones:`,
      activeMilestones.map((m) => ({
        id: m.id,
        title: m.title,
        startDate: m.startDate,
        endDate: m.endDate,
        activitiesCount: m.activities.length,
      })),
    );

    // 2. Get outcome coverage for all outcomes
    const outcomesCoverage = await getOutcomesCoverage({});
    const uncoveredOutcomeIds = new Set(
      outcomesCoverage
        .filter(
          (oc: { status: string; outcomeId: string }) =>
            oc.status === 'uncovered' || oc.status === 'partial',
        )
        .map((oc: { outcomeId: string }) => oc.outcomeId),
    );

    // 3. Process activities and determine coverage status
    const suggestions: PlannerSuggestion[] = [];

    for (const milestone of activeMilestones) {
      for (const activity of milestone.activities) {
        const linkedOutcomeIds = activity.outcomes.map(
          (outcome: { outcome: { id: string } }) => outcome.outcome.id,
        );
        const linkedOutcomeCodes = activity.outcomes.map(
          (outcome: { outcome: { id: string; code: string } }) => outcome.outcome.code,
        );
        const coversUncovered = linkedOutcomeIds.some((id: string) => uncoveredOutcomeIds.has(id));

        // Determine coverage status
        let coverageStatus: 'covers_uncovered' | 'general' | 'already_covered' = 'general';
        if (coversUncovered) {
          coverageStatus = 'covers_uncovered';
        } else if (linkedOutcomeIds.length === 0) {
          // No outcomes linked, so we can't determine coverage
          coverageStatus = 'general';
        } else {
          coverageStatus = 'already_covered';
        }

        suggestions.push({
          activityId: activity.id,
          title: activity.title,
          milestoneTitle: milestone.title,
          subject: milestone.subject ? milestone.subject.name : 'Uncategorized',
          linkedOutcomes: linkedOutcomeCodes,
          coverageStatus,
        });
      }
    }

    console.log(`Generated ${suggestions.length} total suggestions`);

    // Sort suggestions - uncovered outcomes first, then by milestone date
    const sortedSuggestions = suggestions.sort((a, b) => {
      // Sort by coverage status first
      if (a.coverageStatus === 'covers_uncovered' && b.coverageStatus !== 'covers_uncovered')
        return -1;
      if (b.coverageStatus === 'covers_uncovered' && a.coverageStatus !== 'covers_uncovered')
        return 1;

      // Then by number of outcomes covered
      return b.linkedOutcomes.length - a.linkedOutcomes.length;
    });

    console.log(
      'Final suggestions:',
      sortedSuggestions.map((s) => s.title),
    );
    return sortedSuggestions;
  } catch (error) {
    console.error('Error generating planner suggestions:', error);
    throw new Error('Failed to generate planner suggestions');
  }
}

export default {
  getPlannerSuggestions,
};
