import prisma from '../prisma';

export interface ScheduleSuggestion {
  day: number;
  activityId: number;
}

/**
 * Generate a simple weekly schedule balancing subjects and respecting milestone deadlines.
 */
export async function generateSchedule(): Promise<ScheduleSuggestion[]> {
  const activities = await prisma.activity.findMany({
    where: { completedAt: null },
    include: { milestone: { include: { subject: true } } },
  });
  activities.sort((a, b) => {
    const ad = a.milestone.targetDate ?? new Date('2100-01-01');
    const bd = b.milestone.targetDate ?? new Date('2100-01-01');
    return ad.getTime() - bd.getTime();
  });

  const bySubject: Record<number, typeof activities> = {} as any;
  for (const act of activities) {
    const sid = act.milestone.subjectId;
    if (!bySubject[sid]) bySubject[sid] = [];
    bySubject[sid].push(act);
  }

  const suggestions: ScheduleSuggestion[] = [];
  const subjectIds = Object.keys(bySubject).map(Number);
  let idx = 0;
  while (suggestions.length < 5 && activities.length > 0) {
    const sid = subjectIds[idx % subjectIds.length];
    const list = bySubject[sid];
    if (list && list.length) {
      const act = list.shift()!;
      suggestions.push({ day: suggestions.length, activityId: act.id });
      activities.splice(activities.indexOf(act), 1);
    }
    idx++;
  }

  return suggestions;
}
