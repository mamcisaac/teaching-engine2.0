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

export interface MilestoneUrgency extends MilestoneProgress {
  urgency: number;
}

/**
 * Calculate milestone urgency based on remaining time and completion rate.
 * Higher values indicate milestones that need attention sooner.
 */
export async function getMilestoneUrgency(): Promise<MilestoneUrgency[]> {
  const progress = await getMilestoneProgress();
  const today = new Date();
  return progress
    .map((p) => {
      const daysLeft = p.targetDate
        ? Math.max(1, Math.ceil((p.targetDate.getTime() - today.getTime()) / 86400000))
        : 30;
      const urgency = (1 - p.completionRate) / daysLeft;
      return { ...p, urgency };
    })
    .sort((a, b) => b.urgency - a.urgency);
}
