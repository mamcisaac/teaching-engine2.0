import { prisma } from '../src/prisma';
import { buildSubPlanData } from '../src/services/subPlanService';

describe('fallback activities', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('selects fallback when planned activity not sub-friendly', async () => {
    const subject = await prisma.subject.create({ data: { name: 'Math' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subject.id },
    });
    const act = await prisma.activity.create({
      data: { title: 'Hard Task', milestoneId: milestone.id, isSubFriendly: false },
    });
    const fbMilestone = await prisma.milestone.create({
      data: { title: 'Fallback Activities', subjectId: subject.id },
    });
    await prisma.activity.create({
      data: {
        title: 'Worksheet',
        milestoneId: fbMilestone.id,
        isSubFriendly: true,
        isFallback: true,
      },
    });
    const plan = await prisma.lessonPlan.create({ data: { weekStart: new Date('2025-06-15') } });
    await prisma.dailyPlan.create({
      data: {
        date: new Date('2025-06-15'),
        lessonPlanId: plan.id,
        items: { create: { startMin: 540, endMin: 600, activityId: act.id } },
      },
    });

    const data = await buildSubPlanData('2025-06-15');
    expect(data.schedule[0].activity).toBe('Worksheet');
  });
});
