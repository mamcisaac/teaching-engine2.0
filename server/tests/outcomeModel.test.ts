import { prisma } from '../src/prisma';

describe('Outcome Model', () => {
  beforeAll(async () => {
    // Ensure SQLite doesn't immediately error when the database is busy
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.milestoneOutcome.deleteMany();
    await prisma.activityOutcome.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.milestoneOutcome.deleteMany();
    await prisma.activityOutcome.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('creates outcomes and links them to milestones', async () => {
    // Create a test subject
    const subject = await prisma.subject.create({
      data: { name: 'Test Subject' }
    });

    // Create an outcome
    const outcome = await prisma.outcome.create({
      data: {
        subject: 'FRA',
        grade: 1,
        code: '1CO.1',
        description: 'Test outcome'
      }
    });

    // Create a milestone
    const milestone = await prisma.milestone.create({
      data: {
        title: 'Test Milestone',
        subjectId: subject.id
      }
    });

    // Link the outcome to the milestone
    await prisma.milestoneOutcome.create({
      data: {
        milestoneId: milestone.id,
        outcomeId: outcome.id
      }
    });

    // Verify the link
    const milestoneWithOutcomes = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: { outcomes: { include: { outcome: true } } }
    });

    expect(milestoneWithOutcomes?.outcomes.length).toBe(1);
    expect(milestoneWithOutcomes?.outcomes[0].outcome.code).toBe('1CO.1');
  });

  it('creates outcomes and links them to activities', async () => {
    // Create a test subject
    const subject = await prisma.subject.create({
      data: { name: 'Test Subject 2' }
    });

    // Create a milestone
    const milestone = await prisma.milestone.create({
      data: {
        title: 'Test Milestone for Activity',
        subjectId: subject.id
      }
    });

    // Create an activity
    const activity = await prisma.activity.create({
      data: {
        title: 'Test Activity',
        milestoneId: milestone.id
      }
    });

    // Create an outcome
    const outcome = await prisma.outcome.create({
      data: {
        subject: 'MTH',
        grade: 2,
        code: '2M.1',
        description: 'Math outcome'
      }
    });

    // Link the outcome to the activity
    await prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: outcome.id
      }
    });

    // Verify the link
    const activityWithOutcomes = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: { outcomes: { include: { outcome: true } } }
    });

    expect(activityWithOutcomes?.outcomes.length).toBe(1);
    expect(activityWithOutcomes?.outcomes[0].outcome.code).toBe('2M.1');
  });
});