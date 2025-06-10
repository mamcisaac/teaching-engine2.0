import { prisma } from '../src/prisma';
import { generateSubPlan, buildSubPlanData } from '../src/services/subPlanService';

describe('sub plan service', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.calendarEvent.deleteMany();
    await prisma.unavailableBlock.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.teacherPreferences.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
  });

  afterAll(async () => {
    await prisma.calendarEvent.deleteMany();
    await prisma.unavailableBlock.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.teacherPreferences.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.$disconnect();
  });

  it('generates sub plan from stored data', async () => {
    const subject = await prisma.subject.create({ data: { name: 'Math' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'M', subjectId: subject.id },
    });
    const activity = await prisma.activity.create({
      data: { title: 'Count to 20', milestoneId: milestone.id },
    });
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date('2025-06-15'),
        schedule: { create: { day: 0, activityId: activity.id } },
      },
    });
    await prisma.dailyPlan.create({
      data: {
        date: new Date('2025-06-15'),
        lessonPlanId: lessonPlan.id,
        items: { create: { startMin: 540, endMin: 600, activityId: activity.id } },
      },
    });
    await prisma.calendarEvent.create({
      data: {
        title: 'Assembly',
        start: new Date('2025-06-15T09:45:00.000Z'),
        end: new Date('2025-06-15T10:30:00.000Z'),
        allDay: false,
        eventType: 'ASSEMBLY',
        source: 'MANUAL',
      },
    });
    await prisma.unavailableBlock.create({
      data: {
        date: new Date('2025-06-15'),
        startMin: 660,
        endMin: 690,
        reason: 'Speech therapy',
        blockType: 'STUDENT_PULL_OUT',
      },
    });
    await prisma.teacherPreferences.create({
      data: {
        teachingStyles: '[]',
        pacePreference: 'balanced',
        prepTime: 30,
        subPlanContacts: { principal: 'P', office: '555' },
        subPlanProcedures: 'Lockdown routine',
      },
    });
    const buf = await generateSubPlan('2025-06-15', 1);
    expect(buf.length).toBeGreaterThan(0);
    const data = await buildSubPlanData('2025-06-15');
    const hasEvent = data.schedule.some((s) => s.note === 'Assembly');
    expect(hasEvent).toBe(true);
  });
});
