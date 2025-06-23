import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient, getCurrentTestId } from './jest.setup';
import { createTestUtils } from './test-utils';
import { factories } from './factories/index';

describe('Database Transaction Isolation', () => {
  let testUtils: ReturnType<typeof createTestUtils>;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
    testUtils = createTestUtils(prisma);
  });

  it('should isolate each test with transactions', async () => {
    const testId = getCurrentTestId();
    expect(testId).toBeTruthy();

    // Create test data
    const subject = await factories.subject.create({ name: 'Isolation Test Subject' });
    const milestone = await factories.milestone.create({
      subjectId: subject.id,
      title: 'Isolation Test Milestone',
    });
    const activity = await factories.activity.create({
      milestoneId: milestone.id,
      title: 'Isolation Test Activity',
    });

    // Verify data exists in this test
    expect(subject.id).toBeTruthy();
    expect(milestone.id).toBeTruthy();
    expect(activity.id).toBeTruthy();

    const subjectCount = await testUtils.getTableCount('Subject');
    const milestoneCount = await testUtils.getTableCount('Milestone');
    const activityCount = await testUtils.getTableCount('Activity');

    expect(subjectCount).toBeGreaterThan(0);
    expect(milestoneCount).toBeGreaterThan(0);
    expect(activityCount).toBeGreaterThan(0);
  });

  it('should start with clean database state in each test', async () => {
    // This test should not see data from the previous test due to transaction rollback
    const subjectCount = await testUtils.getTableCount('Subject');
    const milestoneCount = await testUtils.getTableCount('Milestone');
    const activityCount = await testUtils.getTableCount('Activity');

    // These should be 0 if transaction isolation is working
    expect(subjectCount).toBe(0);
    expect(milestoneCount).toBe(0);
    expect(activityCount).toBe(0);
  });

  it('should maintain referential integrity within transactions', async () => {
    // Test foreign key constraints
    await expect(
      prisma.activity.create({
        data: {
          title: 'Invalid Activity',
          milestoneId: 99999, // Non-existent milestone
          activityType: 'LESSON',
          durationMins: 60,
          orderIndex: 0,
        },
      }),
    ).rejects.toThrow();
  });

  it('should enforce unique constraints within transactions', async () => {
    // Create an outcome with a specific code
    await factories.outcome.create({ code: 'UNIQUE-ISOLATION-TEST' });

    // Try to create another outcome with the same code
    await expect(factories.outcome.create({ code: 'UNIQUE-ISOLATION-TEST' })).rejects.toThrow();
  });

  it('should handle concurrent operations safely', async () => {
    const results = await Promise.all([
      factories.subject.create({ name: 'Concurrent Subject 1' }),
      factories.subject.create({ name: 'Concurrent Subject 2' }),
      factories.subject.create({ name: 'Concurrent Subject 3' }),
    ]);

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('Concurrent Subject 1');
    expect(results[1].name).toBe('Concurrent Subject 2');
    expect(results[2].name).toBe('Concurrent Subject 3');

    const subjectCount = await testUtils.getTableCount('Subject');
    expect(subjectCount).toBe(3);
  });

  it('should rollback all changes after test completion', async () => {
    // Create a lot of test data
    const subjects = await factories.subject.createMany(5);
    const milestones = await Promise.all(
      subjects.map((subject) => factories.milestone.createMany(3, { subjectId: subject.id })),
    );
    await Promise.all(
      milestones
        .flat()
        .map((milestone) => factories.activity.createMany(2, { milestoneId: milestone.id })),
    );

    // Verify data was created
    const subjectCount = await testUtils.getTableCount('Subject');
    const milestoneCount = await testUtils.getTableCount('Milestone');
    const activityCount = await testUtils.getTableCount('Activity');

    expect(subjectCount).toBe(5);
    expect(milestoneCount).toBe(15); // 5 subjects * 3 milestones each
    expect(activityCount).toBe(30); // 15 milestones * 2 activities each

    // Data will be rolled back after this test completes
  });

  it('should handle complex relational data correctly', async () => {
    // Create interconnected test data
    const user = await factories.user.create({ name: 'Test User' });
    const subject = await factories.subject.create({
      name: 'Complex Subject',
      userId: user.id,
    });
    const milestone = await factories.milestone.create({
      subjectId: subject.id,
      userId: user.id,
      title: 'Complex Milestone',
    });
    const activity = await factories.activity.create({
      milestoneId: milestone.id,
      userId: user.id,
      title: 'Complex Activity',
    });
    const outcome = await factories.outcome.create({ code: 'COMPLEX-TEST' });

    // Link activity to outcome
    await prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: outcome.id,
      },
    });

    // Verify relationships
    const activityWithOutcomes = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: {
        outcomes: {
          include: {
            outcome: true,
          },
        },
        milestone: {
          include: {
            subject: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    expect(activityWithOutcomes).toBeTruthy();
    expect(activityWithOutcomes?.outcomes).toHaveLength(1);
    expect(activityWithOutcomes?.outcomes[0].outcome.code).toBe('COMPLEX-TEST');
    expect(activityWithOutcomes?.milestone.subject.user?.name).toBe('Test User');
  });
});
