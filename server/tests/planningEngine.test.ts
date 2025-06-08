import prisma from '../src/prisma';
import { generateSchedule } from '../src/services/planningEngine';

describe('planning engine', () => {
  beforeAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('returns up to 5 activity suggestions', async () => {
    const s1 = await prisma.subject.create({ data: { name: 'S1' } });
    const m1 = await prisma.milestone.create({
      data: { title: 'M1', subjectId: s1.id, targetDate: new Date() },
    });
    const m2 = await prisma.milestone.create({
      data: { title: 'M2', subjectId: s1.id },
    });
    await prisma.activity.createMany({
      data: [
        { title: 'A1', milestoneId: m1.id },
        { title: 'A2', milestoneId: m1.id },
        { title: 'A3', milestoneId: m2.id },
        { title: 'A4', milestoneId: m2.id },
        { title: 'A5', milestoneId: m2.id },
        { title: 'A6', milestoneId: m2.id },
      ],
    });

    const schedule = await generateSchedule();
    expect(schedule.length).toBe(5);
    expect(schedule[0].day).toBe(0);
  });
});
