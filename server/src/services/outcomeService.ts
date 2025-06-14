import { prisma } from '../prisma';

/**
 * Links an outcome to a milestone
 * @param milestoneId - The ID of the milestone
 * @param outcomeId - The ID of the outcome
 * @returns The created MilestoneOutcome relation
 */
export async function linkMilestoneOutcome(milestoneId: number, outcomeId: string) {
  return prisma.milestoneOutcome.create({
    data: {
      milestoneId,
      outcomeId,
    },
  });
}

/**
 * Links an outcome to an activity
 * @param activityId - The ID of the activity
 * @param outcomeId - The ID of the outcome
 * @returns The created ActivityOutcome relation
 */
export async function linkActivityOutcome(activityId: number, outcomeId: string) {
  return prisma.activityOutcome.create({
    data: {
      activityId,
      outcomeId,
    },
  });
}

/**
 * Finds or creates an outcome with the given code
 * @param code - The outcome code
 * @param subject - The subject code (e.g., "FRA", "MTH")
 * @param grade - The grade level (e.g., 1, 2)
 * @param description - The outcome description
 * @returns The found or created outcome
 */
export async function findOrCreateOutcome(
  code: string,
  subject = 'UNKNOWN',
  grade = 0,
  description = 'TEMP'
) {
  return prisma.outcome.upsert({
    where: { code },
    update: {},
    create: {
      code,
      subject,
      grade,
      description,
    },
  });
}

/**
 * Updates outcome links for a milestone
 * @param milestoneId - The ID of the milestone
 * @param outcomeCodes - Array of outcome codes to link
 * @returns Array of created MilestoneOutcome relations
 */
export async function updateMilestoneOutcomes(milestoneId: number, outcomeCodes: string[]) {
  // First delete any existing relations
  await prisma.milestoneOutcome.deleteMany({
    where: { milestoneId },
  });

  // Then create new relations for each code
  const relations = [];
  for (const code of outcomeCodes) {
    const outcome = await findOrCreateOutcome(code);
    const relation = await linkMilestoneOutcome(milestoneId, outcome.id);
    relations.push(relation);
  }

  return relations;
}

/**
 * Updates outcome links for an activity
 * @param activityId - The ID of the activity
 * @param outcomeCodes - Array of outcome codes to link
 * @returns Array of created ActivityOutcome relations
 */
export async function updateActivityOutcomes(activityId: number, outcomeCodes: string[]) {
  // First delete any existing relations
  await prisma.activityOutcome.deleteMany({
    where: { activityId },
  });

  // Then create new relations for each code
  const relations = [];
  for (const code of outcomeCodes) {
    const outcome = await findOrCreateOutcome(code);
    const relation = await linkActivityOutcome(activityId, outcome.id);
    relations.push(relation);
  }

  return relations;
}