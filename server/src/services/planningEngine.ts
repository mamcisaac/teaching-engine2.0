import type { CalendarEvent, UnavailableBlock, Holiday } from '@teaching-engine/database';

export interface ScheduleItem {
  day: number;
  slotId: number;
  activityId: number | null;
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
  slots: Array<{
    id: number;
    day: number;
    startMin: number;
    endMin: number;
    subjectId: number | null;
  }>,
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
      result.push({ day, slotId: free.slotId, activityId: null });
    } else {
      const idx = result
        .map((s, i) => [s, i] as const)
        .filter(([s]) => s.day === day)
        .pop();
      if (idx) {
        const [removed, index] = idx;
        result.splice(index, 1);
        result.push({ day, slotId: removed.slotId, activityId: null });
      }
    }
  }
  return result;
}

/**
 * DISABLED: Legacy function that used Activity/Milestone models
 * TODO: Reimplement using ETFO lesson plans
 */
export async function generateWeeklySchedule(
  _opts: GenerateScheduleOptions,
): Promise<ScheduleItem[]> {
  // Legacy function disabled during migration to ETFO planning
  console.warn('generateWeeklySchedule is disabled - legacy Activity/Milestone models removed');
  return [];
}

export async function generateSuggestions(
  _options: { filters?: Record<string, boolean> } = {},
): Promise<Array<unknown>> {
  // Activity[] - disabled for legacy cleanup
  // Legacy function disabled during migration to ETFO planning
  console.warn('generateSuggestions is disabled - legacy Activity/Milestone models removed');
  return [];
}
