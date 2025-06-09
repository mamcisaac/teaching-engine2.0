import { prisma } from '../prisma';
import type { Activity } from '@teaching-engine/database';

export interface ScheduleItem {
  day: number;
  slotId: number;
  activityId: number;
}

/**
 * Generate a simple weekly schedule by rotating through subjects.
 * Activities are grouped by subject and assigned sequentially to
 * the five days of the week.
 */
export async function generateWeeklySchedule(): Promise<ScheduleItem[]> {
  const activities = await prisma.activity.findMany({
    where: { completedAt: null },
    include: { milestone: { select: { subjectId: true } } },
    orderBy: { id: 'asc' },
  });

  const bySubject: Record<number, Activity[]> = {};
  for (const act of activities) {
    const s = act.milestone.subjectId;
    if (!bySubject[s]) bySubject[s] = [];
    bySubject[s].push(act);
  }

  const slots = await prisma.timetableSlot.findMany({
    where: { subjectId: { not: null } },
    orderBy: [{ day: 'asc' }, { startMin: 'asc' }],
  });

  const schedule: ScheduleItem[] = [];
  for (const slot of slots) {
    const list = slot.subjectId ? bySubject[slot.subjectId] : undefined;
    const next = list?.shift();
    if (next) {
      schedule.push({ day: slot.day, slotId: slot.id, activityId: next.id });
    }
  }

  return schedule;
}
