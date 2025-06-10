import { prisma } from '../prisma';
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
      include: { items: { include: { activity: true } } },
    }),
    prisma.calendarEvent.findMany({
      where: { start: { lte: dayEnd }, end: { gte: dayStart } },
    }),
    prisma.unavailableBlock.findMany({ where: { date: dayStart } }),
    prisma.teacherPreferences.findFirst({ where: { id: 1 } }),
  ]);

  const schedule: ScheduleEntry[] = [];
  plan?.items.forEach((i) =>
    schedule.push({ time: minToTime(i.startMin), activity: i.activity?.title ?? '' }),
  );
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

  return {
    date: dayStart.toISOString().split('T')[0],
    schedule,
    pullOuts,
    contacts: contacts || {},
    procedures: prefs?.subPlanProcedures || undefined,
  };
}

export async function generateSubPlan(date: string): Promise<Buffer> {
  const data = await buildSubPlanData(date);
  return generateSubPlanPDF({
    today: data.schedule.map((s) => ({ time: s.time, activity: s.activity ?? s.note ?? '' })),
    upcoming: [],
    procedures: data.procedures || '',
    studentNotes: pullOutsText(data.pullOuts),
    emergencyContacts: formatContacts(data.contacts),
  });
}

function pullOutsText(pullOuts: { time: string; reason: string }[]): string {
  return pullOuts.map((p) => `${p.time} - ${p.reason}`).join('\n');
}

function formatContacts(c: Record<string, string>): string {
  return Object.entries(c)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}
