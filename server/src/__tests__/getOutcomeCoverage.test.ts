import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { getOutcomeCoverage, CoverageStatus } from '../utils/outcomeCoverage';

describe('getOutcomeCoverage', () => {
  const prisma = getTestPrismaClient();

  beforeEach(async () => {
    // Clean up test data in the correct order to avoid foreign key constraints
    await prisma.activityOutcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
  });

  it('should return uncovered status when no activities exist', async () => {
    // Create an outcome without any linked activities
    const outcome = await prisma.outcome.create({
      data: {
        code: 'test-outcome-1',
        description: 'Test outcome with no activities',
        subject: 'Math',
        grade: 1,
      },
    });

    const result = await getOutcomeCoverage(outcome.id);

    expect(result).toEqual({
      outcomeId: outcome.id,
      status: CoverageStatus.UNCOVERED,
      linked: 0,
      completed: 0,
    });
  });

  it('should return covered status when all activities are completed', async () => {
    // Create test data structure
    const outcome = await prisma.outcome.create({
      data: {
        code: 'test-outcome-2',
        description: 'Test outcome with completed activities',
        subject: 'Science',
        grade: 2,
      },
    });

    const subject = await prisma.subject.create({
      data: { name: 'Science' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Science Experiments',
        subjectId: subject.id,
      },
    });

    // Create two completed activities
    const activities = await Promise.all([
      prisma.activity.create({
        data: {
          title: 'Experiment 1',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      }),
      prisma.activity.create({
        data: {
          title: 'Experiment 2',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      }),
    ]);

    // Link activities to outcome
    await prisma.activityOutcome.createMany({
      data: activities.map((activity) => ({
        activityId: activity.id,
        outcomeId: outcome.id,
      })),
    });

    const result = await getOutcomeCoverage(outcome.id);

    expect(result).toEqual({
      outcomeId: outcome.id,
      status: CoverageStatus.COVERED,
      linked: 2,
      completed: 2,
    });
  });

  it('should return partial status when some activities are completed', async () => {
    // Create test data
    const outcome = await prisma.outcome.create({
      data: {
        code: 'test-outcome-3',
        description: 'Test outcome with mixed completion',
        subject: 'English',
        grade: 3,
      },
    });

    const subject = await prisma.subject.create({
      data: { name: 'English' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Reading Comprehension',
        subjectId: subject.id,
      },
    });

    // Create one completed and one incomplete activity
    const completedActivity = await prisma.activity.create({
      data: {
        title: 'Reading Task 1',
        milestoneId: milestone.id,
        completedAt: new Date(),
      },
    });

    const incompleteActivity = await prisma.activity.create({
      data: {
        title: 'Reading Task 2',
        milestoneId: milestone.id,
        completedAt: null,
      },
    });

    // Link both activities to outcome
    await prisma.activityOutcome.createMany({
      data: [
        { activityId: completedActivity.id, outcomeId: outcome.id },
        { activityId: incompleteActivity.id, outcomeId: outcome.id },
      ],
    });

    const result = await getOutcomeCoverage(outcome.id);

    expect(result).toEqual({
      outcomeId: outcome.id,
      status: CoverageStatus.PARTIAL,
      linked: 2,
      completed: 1,
    });
  });

  it('should handle outcome codes that do not exist in database', async () => {
    const result = await getOutcomeCoverage('non-existent-outcome');

    expect(result).toEqual({
      outcomeId: 'non-existent-outcome',
      status: CoverageStatus.UNCOVERED,
      linked: 0,
      completed: 0,
    });
  });

  it('should handle activities with null completedAt correctly', async () => {
    // Create outcome with only incomplete activities
    const outcome = await prisma.outcome.create({
      data: {
        code: 'test-outcome-4',
        description: 'Test outcome with only incomplete activities',
        subject: 'Art',
        grade: 4,
      },
    });

    const subject = await prisma.subject.create({
      data: { name: 'Art' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Drawing Techniques',
        subjectId: subject.id,
      },
    });

    // Create multiple incomplete activities
    const activities = await Promise.all([
      prisma.activity.create({
        data: {
          title: 'Sketching Practice',
          milestoneId: milestone.id,
          completedAt: null,
        },
      }),
      prisma.activity.create({
        data: {
          title: 'Color Theory',
          milestoneId: milestone.id,
          completedAt: null,
        },
      }),
      prisma.activity.create({
        data: {
          title: 'Perspective Drawing',
          milestoneId: milestone.id,
          completedAt: null,
        },
      }),
    ]);

    // Link all activities to outcome
    await prisma.activityOutcome.createMany({
      data: activities.map((activity) => ({
        activityId: activity.id,
        outcomeId: outcome.id,
      })),
    });

    const result = await getOutcomeCoverage(outcome.id);

    expect(result).toEqual({
      outcomeId: outcome.id,
      status: CoverageStatus.UNCOVERED,
      linked: 3,
      completed: 0,
    });
  });

  it('should correctly count activities when outcome is linked multiple times', async () => {
    // This tests the edge case where the same outcome might be linked to activities multiple times
    const outcome = await prisma.outcome.create({
      data: {
        code: 'test-outcome-5',
        description: 'Test outcome with duplicate links',
        subject: 'Physical Education',
        grade: 5,
      },
    });

    const subject = await prisma.subject.create({
      data: { name: 'Physical Education' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Fitness Goals',
        subjectId: subject.id,
      },
    });

    // Create activities that will be linked to the same outcome
    const activity1 = await prisma.activity.create({
      data: {
        title: 'Running Exercise',
        milestoneId: milestone.id,
        completedAt: new Date(),
      },
    });

    const activity2 = await prisma.activity.create({
      data: {
        title: 'Strength Training',
        milestoneId: milestone.id,
        completedAt: new Date(),
      },
    });

    // Link activities to outcome
    await prisma.activityOutcome.createMany({
      data: [
        { activityId: activity1.id, outcomeId: outcome.id },
        { activityId: activity2.id, outcomeId: outcome.id },
      ],
    });

    const result = await getOutcomeCoverage(outcome.id);

    expect(result).toEqual({
      outcomeId: outcome.id,
      status: CoverageStatus.COVERED,
      linked: 2,
      completed: 2,
    });
  });
});
