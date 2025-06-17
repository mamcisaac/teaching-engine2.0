import { generateSubPlan, buildSubPlanData } from '../src/services/subPlanService';
import { getTestPrismaClient } from './jest.setup';

describe('sub plan service', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let teacherId: number;

  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Create a teacher for each test
    const teacher = await prisma.user.create({
      data: { email: 't@example.com', password: 'x', name: 'T' },
    });
    teacherId = teacher.id;
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

  it('generates multi-day sub plan', async () => {
    await prisma.substituteInfo.upsert({
      where: { id: 1 },
      create: { id: 1, teacherId, procedures: 'Fire drill at 10am' },
      update: { procedures: 'Fire drill at 10am' },
    });
    const buf = await generateSubPlan('2025-06-15', 2);
    expect(buf.length).toBeGreaterThan(0);
  });
});
