import { prisma } from '../prisma';
import type {
  Activity,
  TimetableSlot,
  CalendarEvent,
  UnavailableBlock,
  Holiday,
} from '@teaching-engine/database';

export interface ScheduleItem {
  day: number;
  slotId: number;
  activityId: number;
}

export interface DailyBlock {
  day: number;
  slotId: number;
  startMin: number;
  endMin: number;
  subjectId?: number | null;
}

export interface GenerateScheduleOptions {
  availableBlocks: DailyBlock[];
  milestonePriorities: Map<number, number>;
  pacingStrategy: 'strict' | 'relaxed';
  preserveBuffer: boolean;
}

export function filterAvailableBlocksByCalendar(
  slots: TimetableSlot[],
  events: CalendarEvent[],
  unavailable: UnavailableBlock[] = [],
  holidays: Holiday[] = [],
): DailyBlock[] {
  return slots
    .filter((s) => s.subjectId)
    .filter((slot) => {
      return !holidays.some((h) => (new Date(h.date).getUTCDay() + 6) % 7 === slot.day);
    })
    .filter((slot) => {
      const dayEvents = events.filter((e) => (new Date(e.start).getUTCDay() + 6) % 7 === slot.day);
      return dayEvents.every((ev) => {
        const start = ev.allDay
          ? 0
          : new Date(ev.start).getUTCHours() * 60 + new Date(ev.start).getUTCMinutes();
        const end = ev.allDay
          ? 1440
          : new Date(ev.end).getUTCHours() * 60 + new Date(ev.end).getUTCMinutes();
        return end <= slot.startMin || start >= slot.endMin;
      });
    })
    .filter((slot) => {
      const dayBlocks = unavailable.filter(
        (b) => (new Date(b.date).getUTCDay() + 6) % 7 === slot.day,
      );
      return dayBlocks.every((b) => b.endMin <= slot.startMin || b.startMin >= slot.endMin);
    })
    .map((s) => ({
      day: s.day,
      slotId: s.id,
      startMin: s.startMin,
      endMin: s.endMin,
      subjectId: s.subjectId,
    }));
}

export function scheduleBufferBlockPerDay(
  schedule: ScheduleItem[],
  blocks: DailyBlock[],
  preserve: boolean,
): ScheduleItem[] {
  if (!preserve) return schedule;
  const byDay = new Map<number, DailyBlock[]>();
  for (const b of blocks) {
    if (!byDay.has(b.day)) byDay.set(b.day, []);
    byDay.get(b.day)!.push(b);
  }

  const result = [...schedule];
  for (const [day, dayBlocks] of byDay.entries()) {
    const used = new Set(result.filter((s) => s.day === day).map((s) => s.slotId));
    const free = dayBlocks.find((b) => !used.has(b.slotId));
    if (free) {
      result.push({ day, slotId: free.slotId, activityId: 0 });
    } else {
      const idx = result
        .map((s, i) => [s, i] as const)
        .filter(([s]) => s.day === day)
        .pop();
      if (idx) {
        const [removed, index] = idx;
        result.splice(index, 1);
        result.push({ day, slotId: removed.slotId, activityId: 0 });
      }
    }
  }
  return result;
}

/**
 * Generate a simple weekly schedule by rotating through subjects.
 * Activities are grouped by subject and assigned sequentially to
 * the five days of the week.
 */
export async function generateWeeklySchedule(
  opts: GenerateScheduleOptions,
): Promise<ScheduleItem[]> {
  const activities = await prisma.activity.findMany({
    where: { completedAt: null },
    include: { milestone: { select: { id: true, subjectId: true } } },
    orderBy: { id: 'asc' },
  });

  const urgencyMap = opts.milestonePriorities;

  const bySubject: Record<number, Activity[]> = {};
  for (const act of activities) {
    const s = act.milestone.subjectId;
    if (!bySubject[s]) bySubject[s] = [];
    bySubject[s].push(act);
  }
  for (const list of Object.values(bySubject)) {
    list.sort((a, b) => {
      const ua = urgencyMap.get(a.milestoneId) ?? 0;
      const ub = urgencyMap.get(b.milestoneId) ?? 0;
      if (ub !== ua) return ub - ua;
      return a.id - b.id;
    });
  }

  const blocks = [...opts.availableBlocks].sort((a, b) => a.day - b.day || a.startMin - b.startMin);

  const totalDays = new Set(blocks.map((b) => b.day)).size;
  let remainingSlots = blocks.length;
  if (opts.preserveBuffer) remainingSlots -= totalDays;

  let remaining = remainingSlots;
  const schedule: ScheduleItem[] = [];
  for (const block of blocks) {
    if (opts.pacingStrategy === 'relaxed' && remaining <= 0) break;
    const list = block.subjectId ? bySubject[block.subjectId] : undefined;
    const next = list?.shift();
    if (next) {
      schedule.push({ day: block.day, slotId: block.slotId, activityId: next.id });
      if (opts.pacingStrategy === 'relaxed') remaining--;
    }
  }

  return scheduleBufferBlockPerDay(schedule, blocks, opts.preserveBuffer);
}

export async function generateSuggestions(
  options: { filters?: Record<string, boolean> } = {},
): Promise<Activity[]> {
  const acts = await prisma.activity.findMany({ where: { completedAt: null } });
  const filters = options.filters ?? {};
  return acts.filter((a) => {
    const tags: string[] = Array.isArray(a.tags) ? (a.tags as unknown as string[]) : [];
    for (const [tag, include] of Object.entries(filters)) {
      if (include === false && tags.includes(tag)) return false;
    }
    return true;
  });
}
