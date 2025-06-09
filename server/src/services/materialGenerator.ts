import { prisma } from '../prisma';

/**
 * Generate a list of materials needed for the given week by scanning
 * activity notes for lines beginning with "Materials:".
 */
export async function generateMaterialList(weekStart: string): Promise<string[]> {
  const plan = await prisma.lessonPlan.findFirst({
    where: { weekStart: new Date(weekStart) },
    include: {
      schedule: { include: { activity: true } },
    },
  });
  if (!plan) return [];

  const items = new Set<string>();
  for (const entry of plan.schedule) {
    const note = entry.activity.publicNote ?? '';
    const match = note.match(/materials?:\s*(.+)/i);
    if (match) {
      match[1]
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((m) => items.add(m));
    }
  }

  return Array.from(items);
}
