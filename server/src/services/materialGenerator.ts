import prisma from '../prisma';

/**
 * Generate material list items by scanning activity notes for "Materials:" lines.
 */
export async function generateMaterialList(weekStart: Date): Promise<string[]> {
  const plan = await prisma.lessonPlan.findFirst({
    where: { weekStart },
    include: { schedule: { include: { activity: true } } },
  });
  if (!plan) return [];

  const items = new Set<string>();
  for (const s of plan.schedule) {
    const note = s.activity.publicNote || '';
    const match = note.match(/Materials:(.*)/i);
    if (match) {
      match[1]
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
        .forEach((i) => items.add(i));
    }
  }
  return Array.from(items);
}
