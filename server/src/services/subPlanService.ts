import { prisma, Prisma } from '../prisma';
import PDFDocument from 'pdfkit';
import { generateSubPlanPDF } from './subPlanGenerator';

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
  goals?: Array<{
    id: number;
    text: string;
    status: string;
    studentName?: string;
  }>;
  routines?: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    timeOfDay?: string;
  }>;
  fallbackPlan?: string;
}

function minToTime(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export interface SubPlanOptions {
  includeGoals?: boolean;
  includeRoutines?: boolean;
  includePlans?: boolean;
  anonymize?: boolean;
  userId?: number;
}

export async function buildSubPlanData(date: string, options: SubPlanOptions = {}): Promise<SubPlanData> {
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayStart.getUTCDate() + 1);

  const {
    includeGoals = true,
    includeRoutines = true,
    includePlans = true,
    anonymize = false,
    userId = 1
  } = options;

  const [plan, events, blocks, prefs, routines, studentGoals] = await Promise.all([
    includePlans ? prisma.dailyPlan.findFirst({
      where: { date: dayStart },
      include: {
        items: {
          include: {
            activity: {
              include: {
                milestone: { select: { subjectId: true } },
                outcomes: { include: { outcome: true } },
              },
            },
            slot: true,
          },
        },
      },
    }) : null,
    prisma.calendarEvent.findMany({
      where: { start: { lte: dayEnd }, end: { gte: dayStart } },
    }),
    prisma.unavailableBlock.findMany({ where: { date: dayStart } }),
    prisma.teacherPreferences.findFirst({ where: { id: 1 } }),
    includeRoutines ? prisma.classRoutine.findMany({
      where: { userId, isActive: true },
      orderBy: [{ priority: 'desc' }, { category: 'asc' }],
    }) : [],
    includeGoals ? prisma.studentGoal.findMany({
      where: { 
        status: 'active',
        student: { userId }
      },
      include: {
        student: true,
        outcome: true
      },
      take: 10 // Limit to most relevant goals
    }) : [],
  ]);

  const schedule: ScheduleEntry[] = [];
  if (plan) {
    for (const item of plan.items) {
      const subjectId = item.slot?.subjectId ?? item.activity?.milestone.subjectId;
      let act = item.activity;
      if (act?.id && !act.isSubFriendly && subjectId) {
        act = await prisma.activity.findFirst({
          where: { isFallback: true, milestone: { subjectId } },
          include: {
            milestone: { select: { subjectId: true } },
            outcomes: { include: { outcome: true } },
          },
        });
      }
      if (!act && subjectId) {
        act = await prisma.activity.findFirst({
          where: { isFallback: true, milestone: { subjectId } },
          include: {
            milestone: { select: { subjectId: true } },
            outcomes: { include: { outcome: true } },
          },
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
  const uniqueOutcomes = new Map<
    string,
    {
      code: string;
      description: string;
      subject: string;
    }
  >();

  if (plan) {
    for (const item of plan.items) {
      if (item.activity?.outcomes) {
        for (const outcomeRelation of item.activity.outcomes) {
          const outcome = outcomeRelation.outcome;
          uniqueOutcomes.set(outcome.id, {
            code: outcome.code,
            description: outcome.description,
            subject: outcome.subject,
          });
        }
      }
    }
  }

  // Format goals with optional anonymization
  const formattedGoals = studentGoals.map(goal => ({
    id: goal.id,
    text: goal.text,
    status: goal.status,
    studentName: anonymize ? undefined : `${goal.student.firstName} ${goal.student.lastName}`
  }));

  // Format routines
  const formattedRoutines = routines.map(routine => ({
    id: routine.id,
    title: routine.title,
    description: routine.description,
    category: routine.category,
    timeOfDay: routine.timeOfDay || undefined
  }));

  // Generate fallback plan
  const fallbackPlan = prefs?.subPlanProcedures 
    ? `Emergency Fallback: ${prefs.subPlanProcedures}\n\nIf technology fails or activities cannot be completed, use print materials from the substitute folder and engage students in quiet reading or journaling activities.`
    : 'If technology fails or activities cannot be completed, use print materials from the substitute folder and engage students in quiet reading or journaling activities.';

  return {
    date: dayStart.toISOString().split('T')[0],
    schedule,
    pullOuts,
    contacts: contacts || {},
    procedures: prefs?.subPlanProcedures || undefined,
    outcomes: includePlans ? Array.from(uniqueOutcomes.values()) : undefined,
    goals: includeGoals ? formattedGoals : undefined,
    routines: includeRoutines ? formattedRoutines : undefined,
    fallbackPlan
  };
}

export async function generateSubPlan(date: string, days = 1, options: SubPlanOptions = {}): Promise<Buffer> {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const info = await prisma.substituteInfo.findFirst({ where: { id: 1 } });
  
  for (let i = 0; i < days; i++) {
    if (i > 0) doc.addPage();
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + i);
    const data = await buildSubPlanData(d.toISOString().slice(0, 10), options);
    
    await generateSubPlanPDF(
      {
        today: data.schedule.map((s) => ({ time: s.time, activity: s.activity ?? s.note ?? '' })),
        upcoming: [],
        procedures: info?.procedures || data.procedures || '',
        studentNotes:
          pullOutsText(data.pullOuts) + (info?.allergies ? `\nAllergies: ${info.allergies}` : ''),
        emergencyContacts: formatContacts(data.contacts),
        curriculumOutcomes: data.outcomes,
        goals: data.goals,
        routines: data.routines,
        fallbackPlan: data.fallbackPlan,
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
