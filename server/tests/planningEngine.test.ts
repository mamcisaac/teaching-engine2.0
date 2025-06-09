import { prisma } from '../src/prisma';
import { generateWeeklySchedule } from '../src/services/planningEngine';

describe('planning engine', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('returns schedule for up to five days', async () => {
    const subj = await prisma.subject.create({ data: { name: 'S' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subj.id },
    });
    await prisma.activity.createMany({
      data: [
        { title: 'A1', milestoneId: milestone.id },
        { title: 'A2', milestoneId: milestone.id },
        { title: 'A3', milestoneId: milestone.id },
        { title: 'A4', milestoneId: milestone.id },
        { title: 'A5', milestoneId: milestone.id },
        { title: 'A6', milestoneId: milestone.id },
      ],
    });
    const schedule = await generateWeeklySchedule();
    expect(schedule.length).toBe(5);
    const days = new Set(schedule.map((s) => s.day));
    expect(days.size).toBe(5);
  });
});
