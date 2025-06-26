// import { prisma } from '../prisma'; // Unused import

export function extractMaterials(note: string): string[] {
  const items = new Set<string>();
  const lines = note.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const header = line.match(
      /^(?:additional\s+|extra\s+)?(?:materials?|supplies)(?:\s+needed)?:?\s*(.*)/i,
    );
    if (header) {
      const rest = header[1];
      if (rest) {
        rest
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((m) => items.add(m));
      }
      // Look for list items after the header
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (/^[-*]\s+/.test(next)) {
          next
            .replace(/^[-*]\s+/, '')
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((m) => items.add(m));
        } else if (!next) {
          continue;
        } else {
          break;
        }
      }
      // Don't break - continue looking for more material sections
    }
  }
  return Array.from(items);
}

/**
 * Generate a list of materials needed for the given week by scanning
 * activity notes for lines beginning with "Materials:".
 */
export async function generateMaterialList(_weekStart: string): Promise<string[]> {
  // DISABLED: Legacy function that used lessonPlan/Activity models
  // TODO: Reimplement using ETFO lesson plans and daybook entries
  console.warn('generateMaterialList is disabled - legacy models removed');
  return [];
}

/**
 * Update or create the material list record for the given week.
 */
export async function updateMaterialList(weekStart: string): Promise<void> {
  const items = await generateMaterialList(weekStart);
  
  // DISABLED: MaterialList model has been archived
  // TODO: Implement using ETFO UnitPlanResource and ETFOLessonPlanResource models
  console.warn(`updateMaterialList is disabled - MaterialList model archived. Items for ${weekStart}:`, items);
}

export interface ActivityMaterials {
  day: number;
  activityId: number;
  title: string;
  materials: string[];
}

export async function generateMaterialDetails(_weekStart: string): Promise<ActivityMaterials[]> {
  // DISABLED: Legacy function that used lessonPlan/Activity models
  // TODO: Reimplement using ETFO lesson plans and daybook entries
  console.warn('generateMaterialDetails is disabled - legacy models removed');
  return [];
}

export async function zipWeeklyPrintables(_weekStart: string): Promise<Buffer> {
  // DISABLED: Legacy function that used lessonPlan/Activity models
  // TODO: Reimplement using ETFO lesson plans and resources
  console.warn('zipWeeklyPrintables is disabled - legacy models removed');
  return Buffer.alloc(0);
}
