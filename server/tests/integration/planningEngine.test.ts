import { prisma } from '../../src/prisma';
import {
  generateWeeklySchedule,
  filterAvailableBlocksByCalendar,
  generateSuggestions,
} from '../../src/services/planningEngine';
import { getMilestoneUrgency } from '../../src/services/progressAnalytics';

describe('planning engine', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
    await prisma.weeklySchedule.deleteMany();
    await prisma.dailyPlanItem.deleteMany();
    await prisma.dailyPlan.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.unavailableBlock.deleteMany();
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
    const slots = await prisma.timetableSlot.findMany();
    const blocks = filterAvailableBlocksByCalendar(slots, []);
    const urg = await getMilestoneUrgency();
    const priority = new Map(urg.map((u) => [u.id, u.urgency]));
    const schedule = await generateWeeklySchedule({
      availableBlocks: blocks,
      milestonePriorities: priority,
      pacingStrategy: 'relaxed',
      preserveBuffer: false,
    });
    expect(schedule.length).toBe(5);
    const days = new Set(schedule.map((s) => s.day));
    expect(days.size).toBe(5);
  });

  it('excludes teacher absences from blocks', async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.unavailableBlock.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const subj = await prisma.subject.create({ data: { name: 'Abs' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'MA', subjectId: subj.id },
    });
    await prisma.timetableSlot.create({
      data: { day: 0, startMin: 540, endMin: 600, subjectId: subj.id },
    });
    await prisma.activity.create({ data: { title: 'A1', milestoneId: milestone.id } });
    await prisma.unavailableBlock.create({
      data: {
        date: new Date('2025-01-06T00:00:00Z'),
        startMin: 540,
        endMin: 600,
        reason: 'Away',
        blockType: 'TEACHER_ABSENCE',
      },
    });
    const slots = await prisma.timetableSlot.findMany();
    const blocks = filterAvailableBlocksByCalendar(
      slots,
      [],
      await prisma.unavailableBlock.findMany(),
    );
    expect(blocks.length).toBe(0);
    await prisma.unavailableBlock.deleteMany();
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
    const slots = await prisma.timetableSlot.findMany();
    const blocks = filterAvailableBlocksByCalendar(slots, []);
    const urg = await getMilestoneUrgency();
    const priority = new Map(urg.map((u) => [u.id, u.urgency]));
    const schedule = await generateWeeklySchedule({
      availableBlocks: blocks,
      milestonePriorities: priority,
      pacingStrategy: 'relaxed',
      preserveBuffer: false,
    });
    const ids = schedule.map((s) => s.activityId);
    const i1 = ids.indexOf(a1.id);
    const i2 = ids.indexOf(a2.id);
    const i3 = ids.indexOf(a3.id);
    const i4 = ids.indexOf(a4.id);
    expect(i1).toBeLessThan(i2);
    expect(i2).toBeLessThan(i3);
    expect(i3).toBeLessThan(i4);
  });

  it('prioritizes urgent milestones', async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const subj = await prisma.subject.create({ data: { name: 'U' } });
    const dueSoon = await prisma.milestone.create({
      data: { title: 'Soon', subjectId: subj.id, targetDate: new Date() },
    });
    const later = await prisma.milestone.create({
      data: {
        title: 'Later',
        subjectId: subj.id,
        targetDate: new Date(Date.now() + 7 * 86400000),
      },
    });
    await prisma.timetableSlot.createMany({
      data: [0, 1].map((d) => ({ day: d, startMin: 540, endMin: 600, subjectId: subj.id })),
    });
    const aSoon = await prisma.activity.create({ data: { title: 'A1', milestoneId: dueSoon.id } });
    const aLater = await prisma.activity.create({ data: { title: 'A2', milestoneId: later.id } });

    const slots = await prisma.timetableSlot.findMany();
    const blocks = filterAvailableBlocksByCalendar(slots, []);
    const urg = await getMilestoneUrgency();
    const priority = new Map(urg.map((u) => [u.id, u.urgency]));
    const schedule = await generateWeeklySchedule({
      availableBlocks: blocks,
      milestonePriorities: priority,
      pacingStrategy: 'relaxed',
      preserveBuffer: false,
    });
    expect(schedule[0].activityId).toBe(aSoon.id);
    expect(schedule[1].activityId).toBe(aLater.id);
  });

  it('adds buffer blocks and drops low priority when week is short', async () => {
    await prisma.weeklySchedule.deleteMany();
    await prisma.lessonPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const subj = await prisma.subject.create({ data: { name: 'B' } });
    const milestone = await prisma.milestone.create({
      data: { title: 'MB', subjectId: subj.id },
    });
    const slotData = [] as { day: number; startMin: number; endMin: number; subjectId: number }[];
    for (const day of [0, 1, 2, 3]) {
      slotData.push({ day, startMin: 540, endMin: 600, subjectId: subj.id });
      slotData.push({ day, startMin: 610, endMin: 670, subjectId: subj.id });
    }
    await prisma.timetableSlot.createMany({ data: slotData });
    await prisma.calendarEvent.create({
      data: {
        title: 'PD',
        start: new Date('2024-03-22T00:00:00Z'),
        end: new Date('2024-03-22T23:59:59Z'),
        allDay: true,
        eventType: 'PD_DAY',
      },
    });
    await prisma.activity.createMany({
      data: Array.from({ length: 6 }, (_, i) => ({
        title: `A${i + 1}`,
        milestoneId: milestone.id,
      })),
    });

    const slots = await prisma.timetableSlot.findMany();
    const events = await prisma.calendarEvent.findMany();
    const blocks = filterAvailableBlocksByCalendar(slots, events);
    const urg = await getMilestoneUrgency();
    const priority = new Map(urg.map((u) => [u.id, u.urgency]));

    const schedule = await generateWeeklySchedule({
      availableBlocks: blocks,
      milestonePriorities: priority,
      pacingStrategy: 'relaxed',
      preserveBuffer: true,
    });

    const bufferCount = schedule.filter((s) => s.activityId == null).length;
    expect(bufferCount).toBe(4);
    const assigned = schedule.filter((s) => s.activityId != null).map((s) => s.activityId);
    expect(assigned.length).toBe(2);
  });

  it('filters suggestions by tags', async () => {
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();

    const subj = await prisma.subject.create({ data: { name: 'F' } });
    const m = await prisma.milestone.create({ data: { title: 'MF', subjectId: subj.id } });
    await prisma.activity.createMany({
      data: [
        { title: 'A1', milestoneId: m.id, tags: ['HandsOn'] },
        { title: 'A2', milestoneId: m.id, tags: ['Worksheet'] },
      ],
    });

    const res = await generateSuggestions({ filters: { HandsOn: false } });
    const titles = res.map((a) => a.title);
    expect(titles).not.toContain('A1');
    expect(titles).toContain('A2');
  });
});
