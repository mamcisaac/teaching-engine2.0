import { prisma } from '../src/prisma';
import { generateWeeklySchedule } from '../src/services/planningEngine';

describe('planning engine', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.weeklySchedule.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
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
    await prisma.timetableSlot.createMany({
      data: [0, 1, 2, 3, 4].map((d) => ({
        day: d,
        startMin: 540,
        endMin: 600,
        subjectId: subj.id,
      })),
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

  it('rotates subjects sequentially', async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const s1 = await prisma.subject.create({ data: { name: 'S1' } });
    const s2 = await prisma.subject.create({ data: { name: 'S2' } });
    const m1 = await prisma.milestone.create({
      data: { title: 'M1', subjectId: s1.id },
    });
    const m2 = await prisma.milestone.create({
      data: { title: 'M2', subjectId: s2.id },
    });
    await prisma.timetableSlot.createMany({
      data: [
        { day: 0, startMin: 540, endMin: 600, subjectId: s1.id },
        { day: 1, startMin: 540, endMin: 600, subjectId: s2.id },
        { day: 2, startMin: 540, endMin: 600, subjectId: s1.id },
        { day: 3, startMin: 540, endMin: 600, subjectId: s2.id },
      ],
    });
    const a1 = await prisma.activity.create({ data: { title: 'A1', milestoneId: m1.id } });
    const a2 = await prisma.activity.create({ data: { title: 'A2', milestoneId: m2.id } });
    const a3 = await prisma.activity.create({ data: { title: 'A3', milestoneId: m1.id } });
    const a4 = await prisma.activity.create({ data: { title: 'A4', milestoneId: m2.id } });
    const schedule = await generateWeeklySchedule();
    const ids = schedule.map((s) => s.activityId);
    const i1 = ids.indexOf(a1.id);
    const i2 = ids.indexOf(a2.id);
    const i3 = ids.indexOf(a3.id);
    const i4 = ids.indexOf(a4.id);
    expect(i1).toBeLessThan(i2);
    expect(i2).toBeLessThan(i3);
    expect(i3).toBeLessThan(i4);
  });
});
