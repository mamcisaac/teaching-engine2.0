import { prisma } from '../prisma';
import type { Activity } from '@teaching-engine/database';
import { getMilestoneUrgency } from './progressAnalytics';

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
    include: { milestone: { select: { id: true, subjectId: true } } },
    orderBy: { id: 'asc' },
  });

  const urgencies = await getMilestoneUrgency();
  const urgencyMap = new Map(urgencies.map((u) => [u.id, u.urgency]));

  const bySubject: Record<number, Activity[]> = {};
  for (const act of activities) {
    const s = act.milestone.subjectId;
    if (!bySubject[s]) bySubject[s] = [];
    bySubject[s].push(act);
  }
  for (const list of Object.values(bySubject)) {
    list.sort((a, b) => {
      const ua = urgencyMap.get(a.milestoneId) ?? 0;
      const ub = urgencyMap.get(b.milestoneId) ?? 0;
      if (ub !== ua) return ub - ua;
      return a.id - b.id;
    });
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
