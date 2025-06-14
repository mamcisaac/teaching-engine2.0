import { prisma } from '../prisma';
import PDFDocument from 'pdfkit';
import { generateSubPlanPDF } from './subPlanGenerator';
import { Prisma } from '@teaching-engine/database';

export interface ScheduleEntry {
  time: string;
  activity?: string;
  note?: string;
}

export interface SubPlanData {
  date: string;
  schedule: ScheduleEntry[];
  pullOuts: { time: string; reason: string }[];
  contacts: Record<string, string>;
  procedures?: string;
  outcomes?: Array<{
    code: string;
    description: string;
    subject: string;
  }>;
}

function minToTime(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export async function buildSubPlanData(date: string): Promise<SubPlanData> {
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

  const [plan, events, blocks, prefs] = await Promise.all([
    prisma.dailyPlan.findFirst({
      where: { date: dayStart },
      include: {
        items: {
          include: {
            activity: { 
              include: { 
                milestone: { select: { subjectId: true } },
                outcomes: { include: { outcome: true } }
              } 
            },
            slot: true,
          },
        },
      },
    }),
    prisma.calendarEvent.findMany({
      where: { start: { lte: dayEnd }, end: { gte: dayStart } },
    }),
    prisma.unavailableBlock.findMany({ where: { date: dayStart } }),
    prisma.teacherPreferences.findFirst({ where: { id: 1 } }),
  ]);

  const schedule: ScheduleEntry[] = [];
  if (plan) {
    for (const item of plan.items) {
      const subjectId = item.slot?.subjectId ?? item.activity?.milestone.subjectId;
      let act = item.activity;
      if (act?.id && !act.isSubFriendly && subjectId) {
        act = await prisma.activity.findFirst({
          where: { isFallback: true, milestone: { subjectId } },
          include: { milestone: { select: { subjectId: true } } },
        });
      }
      if (!act && subjectId) {
        act = await prisma.activity.findFirst({
          where: { isFallback: true, milestone: { subjectId } },
          include: { milestone: { select: { subjectId: true } } },
        });
      }
      schedule.push({ time: minToTime(item.startMin), activity: act?.title ?? '' });
    }
  }
  events.forEach((e) =>
    schedule.push({
      time: minToTime(new Date(e.start).getUTCHours() * 60 + new Date(e.start).getUTCMinutes()),
      note: e.title,
    }),
  );
  blocks
    .filter((b) => b.blockType === 'TEACHER_ABSENCE')
    .forEach((b) => schedule.push({ time: minToTime(b.startMin), note: b.reason }));

  schedule.sort((a, b) => a.time.localeCompare(b.time));

  const pullOuts = blocks
    .filter((b) => b.blockType === 'STUDENT_PULL_OUT')
    .map((b) => ({ time: minToTime(b.startMin), reason: b.reason }));

  const contacts = prefs?.subPlanContacts as Prisma.JsonValue | null as
    | Record<string, string>
    | undefined;

  // Extract all unique outcomes from activities
  const uniqueOutcomes = new Map<string, {
    code: string;
    description: string;
    subject: string;
  }>();
  
  if (plan) {
    for (const item of plan.items) {
      if (item.activity?.outcomes) {
        for (const outcomeRelation of item.activity.outcomes) {
          const outcome = outcomeRelation.outcome;
          uniqueOutcomes.set(outcome.id, {
            code: outcome.code,
            description: outcome.description,
            subject: outcome.subject
          });
        }
      }
    }
  }

  return {
    date: dayStart.toISOString().split('T')[0],
    schedule,
    pullOuts,
    contacts: contacts || {},
    procedures: prefs?.subPlanProcedures || undefined,
    outcomes: Array.from(uniqueOutcomes.values())
  };
}

export async function generateSubPlan(date: string, days = 1): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const info = await prisma.substituteInfo.findFirst({ where: { id: 1 } });
  for (let i = 0; i < days; i++) {
    if (i > 0) doc.addPage();
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + i);
    const data = await buildSubPlanData(d.toISOString().slice(0, 10));
    await generateSubPlanPDF(
      {
        today: data.schedule.map((s) => ({ time: s.time, activity: s.activity ?? s.note ?? '' })),
        upcoming: [],
        procedures: info?.procedures || data.procedures || '',
        studentNotes:
          pullOutsText(data.pullOuts) + (info?.allergies ? `\nAllergies: ${info.allergies}` : ''),
        emergencyContacts: formatContacts(data.contacts),
        curriculumOutcomes: data.outcomes
      },
      doc,
    );
  }
  doc.end();
  return new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
}

function pullOutsText(pullOuts: { time: string; reason: string }[]): string {
  return pullOuts.map((p) => `${p.time} - ${p.reason}`).join('\n');
}

function formatContacts(c: Record<string, string>): string {
  return Object.entries(c)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}
