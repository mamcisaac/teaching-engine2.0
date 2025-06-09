import { prisma } from '../prisma';

export interface MilestoneProgress {
  id: number;
  title: string;
  completionRate: number;
  targetDate?: Date | null;
}

export async function getMilestoneProgress(): Promise<MilestoneProgress[]> {
  const milestones = await prisma.milestone.findMany({ include: { activities: true } });
  return milestones.map((m) => {
    const total = m.activities.length;
    const completed = m.activities.reduce((sum, a) => sum + (a.completedAt ? 1 : 0), 0);
    return {
      id: m.id,
      title: m.title,
      completionRate: total === 0 ? 0 : completed / total,
      targetDate: m.targetDate,
    };
  });
}
