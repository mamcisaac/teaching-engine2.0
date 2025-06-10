import { prisma } from '../prisma';

export async function reorderActivities(milestoneId: number, activityIds: number[]) {
  await prisma.$transaction(
    activityIds.map((id, index) =>
      prisma.activity.update({ where: { id }, data: { orderIndex: index } }),
    ),
  );
  return prisma.activity.findMany({
    where: { milestoneId },
    orderBy: { orderIndex: 'asc' },
  });
}
