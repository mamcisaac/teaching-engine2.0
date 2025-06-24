import { prisma } from '../prisma';

export interface UnitPlanProgress {
  id: string;
  title: string;
  completionRate: number;
  endDate?: Date | null;
}

export async function getUnitPlanProgress(): Promise<UnitPlanProgress[]> {
  const unitPlans = await prisma.unitPlan.findMany({ include: { lessonPlans: true } });
  return unitPlans.map((plan) => {
    const total = plan.lessonPlans.length;
    const today = new Date();
    const completed = plan.lessonPlans.reduce(
      (sum, lesson) => sum + (lesson.date <= today ? 1 : 0),
      0,
    );
    return {
      id: plan.id,
      title: plan.title,
      completionRate: total === 0 ? 0 : completed / total,
      endDate: plan.endDate,
    };
  });
}

export interface UnitPlanUrgency extends UnitPlanProgress {
  urgency: number;
}

/**
 * Calculate unit plan urgency based on remaining time and completion rate.
 * Higher values indicate unit plans that need attention sooner.
 */
export async function getUnitPlanUrgency(): Promise<UnitPlanUrgency[]> {
  const progress = await getUnitPlanProgress();
  const today = new Date();
  return progress
    .map((p) => {
      const daysLeft = p.endDate
        ? Math.max(1, Math.ceil((p.endDate.getTime() - today.getTime()) / 86400000))
        : 30;
      const urgency = (1 - p.completionRate) / daysLeft;
      return { ...p, urgency };
    })
    .sort((a, b) => b.urgency - a.urgency);
}
