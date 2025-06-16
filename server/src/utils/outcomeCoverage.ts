import { prisma } from '../prisma';

export type CoverageStatus = 'covered' | 'uncovered' | 'partial';

export interface ActivityWithCompletion {
  id: number;
  completedAt: Date | null;
}

export interface OutcomeCoverage {
  outcomeId: string;
  status: CoverageStatus;
  linked: number;
  completed: number;
}

export interface CoverageSummary {
  total: number;
  covered: number;
  partial: number;
  uncovered: number;
}

/**
 * Get coverage status for a specific outcome
 * @param outcomeId - The ID of the outcome to check coverage for
 * @returns Promise resolving to the coverage information for the outcome
 */
export async function getOutcomeCoverage(outcomeId: string): Promise<OutcomeCoverage> {
  try {
    // Get all activities linked to this outcome
    const activities = await prisma.$queryRaw<ActivityWithCompletion[]>`
      SELECT a.id, a."completedAt"
      FROM "Activity" a
      JOIN "ActivityOutcome" ao ON a.id = ao."activityId"
      WHERE ao."outcomeId" = ${outcomeId}
    `;

    if (!activities || activities.length === 0) {
      return {
        outcomeId,
        status: 'uncovered',
        linked: 0,
        completed: 0,
      };
    }

    const totalActivities = activities.length;
    const completedActivities = activities.filter(
      (a: ActivityWithCompletion) => a.completedAt !== null,
    ).length;

    let status: CoverageStatus;
    if (completedActivities === totalActivities) {
      status = 'covered';
    } else if (completedActivities > 0) {
      status = 'partial';
    } else {
      status = 'uncovered';
    }

    return {
      outcomeId,
      status,
      linked: totalActivities,
      completed: completedActivities,
    };
  } catch (error) {
    console.error(`Error getting coverage for outcome ${outcomeId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get coverage for outcome: ${errorMessage}`);
  }
}

/**
 * Get coverage status for multiple outcomes, optionally filtered by subject/grade or milestone
 */
export async function getOutcomesCoverage(
  options: {
    subject?: string;
    grade?: number;
    milestoneId?: number;
  } = {},
): Promise<OutcomeCoverage[]> {
  const { subject, grade, milestoneId } = options;

  // Base query for outcomes
  let whereClause: Record<string, unknown> = {};

  if (subject || grade) {
    whereClause = {
      ...(subject && { subject }),
      ...(grade && { grade }),
    };
  }

  // If milestoneId is provided, only get outcomes linked to this milestone
  if (milestoneId) {
    const milestoneOutcomes = (await prisma.$queryRaw`
      SELECT "outcomeId" 
      FROM "MilestoneOutcome" 
      WHERE "milestoneId" = ${milestoneId}
    `) as { outcomeId: string }[];

    whereClause.id = {
      in: milestoneOutcomes.map((mo) => mo.outcomeId),
    };
  }

  // Get all relevant outcomes
  const whereConditions: string[] = [];

  if (
    whereClause.id &&
    typeof whereClause.id === 'object' &&
    'in' in whereClause.id &&
    whereClause.id.in
  ) {
    whereConditions.push(
      `id IN (${(whereClause.id.in as string[]).map((id) => `'${id}'`).join(',')})`,
    );
  }

  if (whereClause.subject) {
    whereConditions.push(`subject = '${whereClause.subject as string}'`);
  }

  if (whereClause.grade) {
    whereConditions.push(`grade = ${whereClause.grade as number}`);
  }

  const outcomes = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "Outcome"
    ${whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''}
  `;

  // Get coverage for each outcome
  const coveragePromises = outcomes.map((outcome: { id: string }) =>
    getOutcomeCoverage(outcome.id),
  );

  return Promise.all(coveragePromises);
}

/**
 * Get a summary of coverage status for a set of outcomes
 * @param coverage - Array of outcome coverage objects
 * @returns Summary of coverage statistics
 */
export function getCoverageSummary(coverage: OutcomeCoverage[]): CoverageSummary {
  try {
    if (!Array.isArray(coverage)) {
      throw new Error('Coverage data must be an array');
    }

    // Initialize counts
    let covered = 0;
    let partial = 0;
    let uncovered = 0;

    // Count each status type
    coverage.forEach((item) => {
      if (!item || typeof item !== 'object') {
        console.warn('Invalid coverage item found:', item);
        return;
      }

      switch (item.status) {
        case 'covered':
          covered++;
          break;
        case 'partial':
          partial++;
          break;
        case 'uncovered':
          uncovered++;
          break;
        default:
          console.warn(`Unknown status '${item.status}' for outcome ${item.outcomeId}`);
      }
    });

    const total = coverage.length;

    // Verify that the sum of statuses matches the total
    if (covered + partial + uncovered > total) {
      console.warn('Coverage status counts exceed total number of items');
    }

    return {
      total,
      covered,
      partial,
      uncovered: Math.max(0, total - (covered + partial)), // Ensure non-negative
    };
  } catch (error) {
    console.error('Error generating coverage summary:', error);
    // Return zeroed summary in case of error
    return {
      total: 0,
      covered: 0,
      partial: 0,
      uncovered: 0,
    };
  }
}
