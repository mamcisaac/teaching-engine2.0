import { prisma } from '../prisma';

export interface OutcomeCoverage {
  outcomeId: string;
  status: 'covered' | 'uncovered' | 'partial';
  linked: number;
  completed: number;
}

export interface GetOutcomesCoverageOptions {
  subject?: string;
  grade?: number;
  milestoneId?: number;
}

/**
 * Get coverage status for multiple outcomes
 * @param options - Filter options (subject, grade, milestoneId)
 * @returns Array of coverage status for each outcome
 */
export async function getOutcomesCoverage(
  options: GetOutcomesCoverageOptions = {},
): Promise<OutcomeCoverage[]> {
  try {
    // Get all outcomes with their linked activities
    const outcomes = await prisma.outcome.findMany({
      where: {
        // Apply filters if provided
        ...(options.subject && { subject: options.subject }),
        ...(options.grade && { grade: options.grade }),
        ...(options.milestoneId && {
          milestones: {
            some: {
              milestoneId: options.milestoneId,
            },
          },
        }),
      },
      include: {
        milestones: {
          include: {
            milestone: {
              include: {
                activities: {
                  include: {
                    outcomes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate coverage for each outcome
    const coverageResults = await Promise.all(
      outcomes.map(async (outcome) => {
        // Get all activities linked to this outcome
        const allActivities = outcome.milestones.flatMap(
          (milestone) => milestone.milestone.activities,
        );

        // Count completed activities
        const completedCount = allActivities.filter(
          (activity) => activity.completedAt !== null,
        ).length;

        // Determine status
        let status: 'covered' | 'uncovered' | 'partial';
        if (allActivities.length === 0) {
          status = 'uncovered';
        } else if (completedCount === allActivities.length) {
          status = 'covered';
        } else if (completedCount > 0) {
          status = 'partial';
        } else {
          status = 'uncovered';
        }

        return {
          outcomeId: outcome.id,
          status,
          linked: allActivities.length,
          completed: completedCount,
        };
      }),
    );

    return coverageResults;
  } catch (error) {
    console.error('Error getting outcomes coverage:', error);
    throw new Error('Failed to get outcomes coverage');
  }
}

export default {
  getOutcomesCoverage,
};
