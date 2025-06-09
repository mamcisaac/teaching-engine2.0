import { prisma } from '../prisma';
import type { Activity } from '@teaching-engine/database';

export interface ScheduleItem {
  day: number;
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

  const subjects = Object.keys(bySubject).map(Number);
  const schedule: ScheduleItem[] = [];
  let day = 0;
  while (day < 5 && subjects.some((s) => bySubject[s].length > 0)) {
    for (const s of subjects) {
      const next = bySubject[s].shift();
      if (next) {
        schedule.push({ day, activityId: next.id });
        day++;
        if (day >= 5) break;
      }
    }
  }

  return schedule;
}
