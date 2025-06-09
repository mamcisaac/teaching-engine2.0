import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { prisma } from '../prisma';

const uploadDir = path.join(__dirname, '../uploads');

export function extractMaterials(note: string): string[] {
  const items = new Set<string>();
  const lines = note.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const header = line.match(/^materials?:?\s*(.*)/i);
    if (header) {
      const rest = header[1];
      if (rest) {
        rest
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((m) => items.add(m));
      }
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
      break;
    }
  }
  return Array.from(items);
}

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
    extractMaterials(entry.activity.publicNote ?? '').forEach((m) => items.add(m));
  }

  return Array.from(items);
}

export interface ActivityMaterials {
  day: number;
  activityId: number;
  title: string;
  materials: string[];
}

export async function generateMaterialDetails(weekStart: string): Promise<ActivityMaterials[]> {
  const plan = await prisma.lessonPlan.findFirst({
    where: { weekStart: new Date(weekStart) },
    include: { schedule: { include: { activity: true } } },
  });
  if (!plan) return [];
  const details: ActivityMaterials[] = [];
  for (const entry of plan.schedule) {
    const materials = extractMaterials(entry.activity.publicNote ?? '');
    if (materials.length) {
      details.push({
        day: entry.day,
        activityId: entry.activityId,
        title: entry.activity.title,
        materials,
      });
    }
  }
  return details;
}

export async function zipWeeklyPrintables(weekStart: string): Promise<Buffer> {
  const plan = await prisma.lessonPlan.findFirst({
    where: { weekStart: new Date(weekStart) },
    include: { schedule: { include: { activity: { include: { resources: true } } } } },
  });
  if (!plan) return Buffer.alloc(0);
  const archive = archiver('zip');
  const chunks: Buffer[] = [];
  archive.on('data', (c: Buffer) => chunks.push(c));
  for (const entry of plan.schedule) {
    for (const res of entry.activity.resources) {
      if (res.url.startsWith('/uploads/')) {
        const filePath = path.join(uploadDir, path.basename(res.url));
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: res.filename });
        }
      }
    }
  }
  await archive.finalize();
  return Buffer.concat(chunks);
}
