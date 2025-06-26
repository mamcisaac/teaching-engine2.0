import type { CalendarEvent, UnavailableBlock } from '@teaching-engine/database';

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
  holidays: CalendarEvent[] = [], // Now using CalendarEvent with type 'HOLIDAY'
): DailyBlock[] {
  return slots
    .filter((s) => s.subjectId)
    .filter((slot) => {
      // Filter out holidays (CalendarEvents with type 'HOLIDAY' and allDay true)
      const holidayEvents = holidays.filter(h => h.eventType === 'HOLIDAY' && h.allDay);
      return !holidayEvents.some((h) => (new Date(h.start).getUTCDay() + 6) % 7 === slot.day);
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
 * TODO: Reimplement using ETFO lesson plans
 * Generate a weekly schedule using ETFO lesson plans and unit plans
 * @param opts Schedule generation options
 * @returns Array of scheduled items mapped to ETFO lesson plans
 */
export async function generateWeeklySchedule(
  _opts: GenerateScheduleOptions,
): Promise<ScheduleItem[]> {
  // TODO: Implement scheduling logic using:
  // - ETFOLessonPlan model for individual lessons
  // - UnitPlan model for unit-level scheduling
  // - DayPlan model for daily organization
  console.warn('generateWeeklySchedule pending reimplementation with ETFO planning models');
  return [];
}

/**
 * TODO: Reimplement using ETFO lesson plans and Activity Discovery
 * Generate activity suggestions based on curriculum alignment
 * @param options Filter options for suggestions
 * @returns Array of suggested activities from Activity Discovery service
 */
export async function generateSuggestions(
  _options: { filters?: Record<string, boolean> } = {},
): Promise<Array<unknown>> {
  // TODO: Implement suggestion logic using:
  // - Activity Discovery service for external activities
  // - ExternalActivity model for activity suggestions
  // - CurriculumExpectation model for alignment
  console.warn('generateSuggestions pending reimplementation with Activity Discovery service');
  return [];
}
