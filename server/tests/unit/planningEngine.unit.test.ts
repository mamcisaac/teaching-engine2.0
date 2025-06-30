import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { 
  filterAvailableBlocksByCalendar, 
  scheduleBufferBlockPerDay,
  generateWeeklySchedule,
  generateSuggestions,
  ScheduleItem,
  DailyBlock,
  GenerateScheduleOptions
} from '../../src/services/planningEngine';
import type { TimetableSlot, CalendarEvent } from '@teaching-engine/database';

describe('PlanningEngine Unit Tests', () => {
  describe('filterAvailableBlocksByCalendar', () => {
    const createTimetableSlot = (
      id: number,
      day: number,
      startMin: number,
      endMin: number,
      subjectId: number | null = 1,
    ): TimetableSlot => ({
      id,
      day,
      startMin,
      endMin,
      subjectId,
    });

    const createCalendarEvent = (start: string, end: string, allDay = false): CalendarEvent => ({
      id: 1,
      title: 'Test Event',
      description: null,
      start: new Date(start),
      end: new Date(end),
      allDay,
      eventType: 'ASSEMBLY',
      source: 'MANUAL',
      teacherId: 1,
      schoolId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createHoliday = (date: string): CalendarEvent => ({
      id: 1,
      title: 'Test Holiday',
      description: null,
      start: new Date(date),
      end: new Date(date),
      allDay: true,
      eventType: 'HOLIDAY',
      source: 'MANUAL',
      teacherId: 1,
      schoolId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should filter out slots without subjectId', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540, 1), // Monday 8:00-9:00 AM with subject
        createTimetableSlot(2, 2, 540, 600, null), // Tuesday 9:00-10:00 AM without subject
        createTimetableSlot(3, 3, 600, 660, 2), // Wednesday 10:00-11:00 AM with subject
      ];

      const result = filterAvailableBlocksByCalendar(slots, [], [], []);

      expect(result).toHaveLength(2);
      expect(result[0].day).toBe(1);
      expect(result[1].day).toBe(3);
    });

    it('should filter out slots that conflict with holidays', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Monday
        createTimetableSlot(2, 2, 540, 600), // Tuesday
        createTimetableSlot(3, 3, 600, 660), // Wednesday
      ];

      // Holiday on Wednesday (day 2 in converted system)
      const holidays: CalendarEvent[] = [
        createHoliday('2024-01-03'), // Wednesday, converts to day 2
      ];

      const result = filterAvailableBlocksByCalendar(slots, [], [], holidays);

      // Should filter out Wednesday slot due to holiday
      expect(result.length).toBeLessThan(3);
      expect(result.every((block) => block.day !== 2)).toBe(true);
    });

    it('should filter out slots that conflict with all-day events', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Day 1 8:00-9:00 AM
        createTimetableSlot(2, 1, 600, 660), // Day 1 10:00-11:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-02T00:00:00', '2024-01-02T23:59:59', true), // Tuesday converts to day 1
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);

      // All day 1 slots should be filtered out due to all-day event
      expect(result).toHaveLength(0);
    });

    it('should filter out slots that conflict with timed events', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Day 1 8:00-9:00 AM
        createTimetableSlot(2, 1, 540, 600), // Day 1 9:00-10:00 AM
        createTimetableSlot(3, 1, 600, 660), // Day 1 10:00-11:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-02T09:00:00.000Z', '2024-01-02T10:00:00.000Z', false), // 9:00-10:00 AM UTC event on day 1
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);

      // Should keep 8:00-9:00 and 10:00-11:00 slots, filter out 9:00-10:00
      expect(result).toHaveLength(2);
      expect(result.some((block) => block.startMin === 540 && block.endMin === 600)).toBe(false);
    });

    it('should handle partial overlaps correctly', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Day 1 8:00-9:00 AM
        createTimetableSlot(2, 1, 520, 580), // Day 1 8:40-9:40 AM (overlaps)
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-02T08:30:00.000Z', '2024-01-02T09:15:00.000Z', false), // 8:30-9:15 AM UTC event on day 1
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);

      // Both slots should be filtered out due to overlap
      expect(result).toHaveLength(0);
    });

    it('should preserve slots that do not conflict', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Monday 8:00-9:00 AM
        createTimetableSlot(2, 2, 540, 600), // Tuesday 9:00-10:00 AM
        createTimetableSlot(3, 3, 600, 660), // Wednesday 10:00-11:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-02T14:00:00', '2024-01-02T15:00:00', false), // Tuesday 2:00-3:00 PM
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);

      // All slots should be preserved as none conflict with the afternoon event
      expect(result).toHaveLength(3);
    });

    it('should handle multiple constraints simultaneously', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540, null), // Monday 8:00-9:00 AM (no subject)
        createTimetableSlot(2, 2, 540, 600, 1), // Tuesday 9:00-10:00 AM (has subject, holiday)
        createTimetableSlot(3, 3, 600, 660, 1), // Wednesday 10:00-11:00 AM (has subject, event conflict)
        createTimetableSlot(4, 4, 480, 540, 1), // Thursday 8:00-9:00 AM (has subject, no conflicts)
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-04T10:00:00.000Z', '2024-01-04T11:00:00.000Z', false), // Thursday event conflicts with day 3 slot
      ];

      const holidays: CalendarEvent[] = [
        createHoliday('2024-01-03'), // Wednesday holiday conflicts with day 2 slot
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], holidays);

      // Only Thursday slot should remain
      expect(result).toHaveLength(1);
      expect(result[0].day).toBe(4);
    });

    it('should return correct DailyBlock format', () => {
      const slots: TimetableSlot[] = [createTimetableSlot(1, 1, 480, 540, 5)];

      const result = filterAvailableBlocksByCalendar(slots, [], [], []);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        day: 1,
        slotId: 1,
        startMin: 480,
        endMin: 540,
        subjectId: 5,
      });
    });

    it('should handle edge case of event exactly matching slot time', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 540, 600), // Day 1 9:00-10:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-02T09:00:00.000Z', '2024-01-02T10:00:00.000Z', false), // Exact match on day 1
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);

      // Should filter out the exactly matching slot
      expect(result).toHaveLength(0);
    });
  });

  describe('scheduleBufferBlockPerDay', () => {
    let mockSchedule: ScheduleItem[];
    let mockBlocks: DailyBlock[];

    beforeEach(() => {
      mockSchedule = [
        { day: 1, slotId: 1, activityId: 101 },
        { day: 1, slotId: 2, activityId: 102 },
        { day: 2, slotId: 3, activityId: 103 },
      ];

      mockBlocks = [
        { day: 1, slotId: 1, startMin: 480, endMin: 540, subjectId: 1 },
        { day: 1, slotId: 2, startMin: 540, endMin: 600, subjectId: 2 },
        { day: 1, slotId: 4, startMin: 600, endMin: 660, subjectId: 3 }, // Free slot
        { day: 2, slotId: 3, startMin: 480, endMin: 540, subjectId: 1 },
        { day: 2, slotId: 5, startMin: 540, endMin: 600, subjectId: 2 }, // Free slot
      ];
    });

    it('should return original schedule when preserve is false', () => {
      const result = scheduleBufferBlockPerDay(mockSchedule, mockBlocks, false);

      expect(result).toEqual(mockSchedule);
    });

    it('should add buffer blocks when preserve is true and free slots available', () => {
      const result = scheduleBufferBlockPerDay(mockSchedule, mockBlocks, true);

      expect(result.length).toBeGreaterThan(mockSchedule.length);
      
      // Should include original schedule
      expect(result).toEqual(expect.arrayContaining(mockSchedule));
      
      // Should have buffer blocks (activityId: null) for each day
      const bufferBlocks = result.filter(item => item.activityId === null);
      expect(bufferBlocks.length).toBe(2); // One for each day

      // Day 1 should have buffer block in slot 4
      expect(bufferBlocks.some(block => block.day === 1 && block.slotId === 4)).toBe(true);
      
      // Day 2 should have buffer block in slot 5
      expect(bufferBlocks.some(block => block.day === 2 && block.slotId === 5)).toBe(true);
    });

    it('should replace last scheduled block when no free slots available', () => {
      // Create blocks where all slots are used
      const fullBlocks: DailyBlock[] = [
        { day: 1, slotId: 1, startMin: 480, endMin: 540, subjectId: 1 },
        { day: 1, slotId: 2, startMin: 540, endMin: 600, subjectId: 2 },
        { day: 2, slotId: 3, startMin: 480, endMin: 540, subjectId: 1 },
      ];

      const result = scheduleBufferBlockPerDay(mockSchedule, fullBlocks, true);

      // Should maintain same length but replace some activities with buffers
      expect(result.length).toBe(mockSchedule.length);
      
      // Should have buffer blocks
      const bufferBlocks = result.filter(item => item.activityId === null);
      expect(bufferBlocks.length).toBeGreaterThan(0);
    });

    it('should handle empty schedule', () => {
      const result = scheduleBufferBlockPerDay([], mockBlocks, true);

      // Should add buffer blocks for each day that has blocks
      expect(result.length).toBe(2); // Two days with blocks
      expect(result.every(item => item.activityId === null)).toBe(true);
    });

    it('should handle empty blocks', () => {
      const result = scheduleBufferBlockPerDay(mockSchedule, [], true);

      expect(result).toEqual(mockSchedule);
    });

    it('should group blocks by day correctly', () => {
      const mixedBlocks: DailyBlock[] = [
        { day: 3, slotId: 6, startMin: 480, endMin: 540, subjectId: 1 },
        { day: 1, slotId: 7, startMin: 660, endMin: 720, subjectId: 3 },
        { day: 3, slotId: 8, startMin: 540, endMin: 600, subjectId: 2 },
      ];

      const mixedSchedule: ScheduleItem[] = [
        { day: 3, slotId: 6, activityId: 301 },
      ];

      const result = scheduleBufferBlockPerDay(mixedSchedule, mixedBlocks, true);

      // Should add buffer blocks for both day 1 and day 3
      const bufferBlocks = result.filter(item => item.activityId === null);
      expect(bufferBlocks.some(block => block.day === 1)).toBe(true);
      expect(bufferBlocks.some(block => block.day === 3)).toBe(true);
    });

    it('should handle duplicate day entries correctly', () => {
      const duplicateSchedule: ScheduleItem[] = [
        { day: 1, slotId: 1, activityId: 101 },
        { day: 1, slotId: 2, activityId: 102 },
        { day: 1, slotId: 4, activityId: 104 }, // Using the "free" slot
      ];

      const result = scheduleBufferBlockPerDay(duplicateSchedule, mockBlocks, true);

      // When no free slots, should replace the last scheduled item for the day
      const day1Items = result.filter(item => item.day === 1);
      const day1BufferBlocks = day1Items.filter(item => item.activityId === null);
      
      expect(day1BufferBlocks.length).toBe(1);
    });
  });

  describe('generateWeeklySchedule', () => {
    let mockOptions: GenerateScheduleOptions;

    beforeEach(() => {
      mockOptions = {
        availableBlocks: [
          { day: 1, slotId: 1, startMin: 480, endMin: 540, subjectId: 1 },
          { day: 2, slotId: 2, startMin: 540, endMin: 600, subjectId: 2 },
        ],
        milestonePriorities: new Map([[1, 10], [2, 5]]),
        pacingStrategy: 'strict',
        preserveBuffer: true,
      };

      // Mock console.warn to avoid noise in test output
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return empty array and log warning (pending reimplementation)', async () => {
      const result = await generateWeeklySchedule(mockOptions);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'generateWeeklySchedule pending reimplementation with ETFO planning models'
      );
    });

    it('should handle different pacing strategies', async () => {
      const relaxedOptions = { ...mockOptions, pacingStrategy: 'relaxed' as const };
      const result = await generateWeeklySchedule(relaxedOptions);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle empty available blocks', async () => {
      const emptyOptions = { ...mockOptions, availableBlocks: [] };
      const result = await generateWeeklySchedule(emptyOptions);

      expect(result).toEqual([]);
    });

    it('should handle empty milestone priorities', async () => {
      const noPrioritiesOptions = { ...mockOptions, milestonePriorities: new Map() };
      const result = await generateWeeklySchedule(noPrioritiesOptions);

      expect(result).toEqual([]);
    });

    it('should handle buffer preservation settings', async () => {
      const noBufferOptions = { ...mockOptions, preserveBuffer: false };
      const result = await generateWeeklySchedule(noBufferOptions);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('generateSuggestions', () => {
    beforeEach(() => {
      // Mock console.warn to avoid noise in test output
      jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return empty array and log warning (pending reimplementation)', async () => {
      const result = await generateSuggestions();

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'generateSuggestions pending reimplementation with Activity Discovery service'
      );
    });

    it('should handle options with filters', async () => {
      const options = {
        filters: {
          subject: true,
          grade: true,
          difficulty: false,
        },
      };

      const result = await generateSuggestions(options);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle empty options', async () => {
      const result = await generateSuggestions({});

      expect(result).toEqual([]);
    });

    it('should handle undefined options', async () => {
      const result = await generateSuggestions(undefined);

      expect(result).toEqual([]);
    });

    it('should handle complex filter combinations', async () => {
      const complexOptions = {
        filters: {
          mathematics: true,
          science: false,
          language: true,
          grade1: true,
          grade2: false,
          grade3: true,
          indoor: true,
          outdoor: false,
          individual: true,
          group: true,
        },
      };

      const result = await generateSuggestions(complexOptions);

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work together - filter blocks then schedule buffers', () => {
      const slots: TimetableSlot[] = [
        { id: 1, day: 1, startMin: 480, endMin: 540, subjectId: 1 },
        { id: 2, day: 1, startMin: 540, endMin: 600, subjectId: 2 },
        { id: 3, day: 1, startMin: 600, endMin: 660, subjectId: 3 },
        { id: 4, day: 2, startMin: 480, endMin: 540, subjectId: 1 },
      ];

      const events: CalendarEvent[] = [
        {
          id: 1,
          title: 'Assembly',
          description: null,
          start: new Date('2024-01-02T09:00:00.000Z'), // Day 1, 9:00 AM
          end: new Date('2024-01-02T10:00:00.000Z'),   // Day 1, 10:00 AM
          allDay: false,
          eventType: 'ASSEMBLY',
          source: 'MANUAL',
          teacherId: 1,
          schoolId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const availableBlocks = filterAvailableBlocksByCalendar(slots, events, [], []);
      
      // Should filter out the conflicting slot (slot 2: 9:00-10:00 AM)
      expect(availableBlocks).toHaveLength(3);
      expect(availableBlocks.some(block => block.slotId === 2)).toBe(false);

      // Create a simple schedule
      const schedule: ScheduleItem[] = [
        { day: 1, slotId: 1, activityId: 101 },
        { day: 2, slotId: 4, activityId: 201 },
      ];

      // Add buffer blocks
      const withBuffers = scheduleBufferBlockPerDay(schedule, availableBlocks, true);

      expect(withBuffers.length).toBeGreaterThan(schedule.length);
      expect(withBuffers.some(item => item.activityId === null)).toBe(true);
    });

    it('should handle complex calendar filtering with buffer scheduling', () => {
      const slots: TimetableSlot[] = [
        { id: 1, day: 1, startMin: 480, endMin: 540, subjectId: 1 },
        { id: 2, day: 1, startMin: 540, endMin: 600, subjectId: 2 },
        { id: 3, day: 2, startMin: 480, endMin: 540, subjectId: 1 },
        { id: 4, day: 2, startMin: 540, endMin: 600, subjectId: 2 },
        { id: 5, day: 3, startMin: 480, endMin: 540, subjectId: 1 },
      ];

      const holidays: CalendarEvent[] = [
        {
          id: 2,
          title: 'Holiday',
          description: null,
          start: new Date('2024-01-03T00:00:00.000Z'), // Day 2 holiday
          end: new Date('2024-01-03T23:59:59.000Z'),
          allDay: true,
          eventType: 'HOLIDAY',
          source: 'MANUAL',
          teacherId: 1,
          schoolId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const availableBlocks = filterAvailableBlocksByCalendar(slots, [], [], holidays);
      
      // Should filter out day 2 blocks due to holiday
      expect(availableBlocks.some(block => block.day === 2)).toBe(false);
      expect(availableBlocks).toHaveLength(3); // Day 1 (2 blocks) + Day 3 (1 block)

      const schedule: ScheduleItem[] = [
        { day: 1, slotId: 1, activityId: 101 },
        { day: 3, slotId: 5, activityId: 301 },
      ];

      const withBuffers = scheduleBufferBlockPerDay(schedule, availableBlocks, true);

      // Should add buffer blocks for available days
      const bufferBlocks = withBuffers.filter(item => item.activityId === null);
      expect(bufferBlocks.length).toBe(2); // One for day 1, one for day 3
      expect(bufferBlocks.some(block => block.day === 2)).toBe(false); // No day 2 buffers
    });
  });

  describe('Edge Cases and Error Handling', () => {
    describe('filterAvailableBlocksByCalendar edge cases', () => {
      it('should handle malformed calendar events gracefully', () => {
        const slots: TimetableSlot[] = [
          { id: 1, day: 1, startMin: 480, endMin: 540, subjectId: 1 },
        ];

        const malformedEvents: CalendarEvent[] = [
          {
            id: 1,
            title: 'Bad Event',
            description: null,
            start: new Date('invalid-date'),
            end: new Date('invalid-date'),
            allDay: false,
            eventType: 'ASSEMBLY',
            source: 'MANUAL',
            teacherId: 1,
            schoolId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Should not throw error and should return available slots
        const result = filterAvailableBlocksByCalendar(slots, malformedEvents, [], []);
        expect(result).toHaveLength(1);
      });

      it('should handle events with end time before start time', () => {
        const slots: TimetableSlot[] = [
          { id: 1, day: 1, startMin: 480, endMin: 540, subjectId: 1 },
        ];

        const backwardsEvent: CalendarEvent[] = [
          {
            id: 1,
            title: 'Backwards Event',
            description: null,
            start: new Date('2024-01-02T10:00:00.000Z'),
            end: new Date('2024-01-02T09:00:00.000Z'), // End before start
            allDay: false,
            eventType: 'ASSEMBLY',
            source: 'MANUAL',
            teacherId: 1,
            schoolId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const result = filterAvailableBlocksByCalendar(slots, backwardsEvent, [], []);
        expect(result).toHaveLength(1); // Should still return the slot
      });

      it('should handle slots with zero duration', () => {
        const zeroSlots: TimetableSlot[] = [
          { id: 1, day: 1, startMin: 480, endMin: 480, subjectId: 1 }, // Zero duration
          { id: 2, day: 1, startMin: 540, endMin: 600, subjectId: 2 }, // Normal duration
        ];

        const result = filterAvailableBlocksByCalendar(zeroSlots, [], [], []);
        expect(result).toHaveLength(2); // Should include both slots
      });
    });

    describe('scheduleBufferBlockPerDay edge cases', () => {
      it('should handle schedule items with same day and slot', () => {
        const duplicateSchedule: ScheduleItem[] = [
          { day: 1, slotId: 1, activityId: 101 },
          { day: 1, slotId: 1, activityId: 102 }, // Duplicate slot
        ];

        const blocks: DailyBlock[] = [
          { day: 1, slotId: 1, startMin: 480, endMin: 540, subjectId: 1 },
          { day: 1, slotId: 2, startMin: 540, endMin: 600, subjectId: 2 },
        ];

        const result = scheduleBufferBlockPerDay(duplicateSchedule, blocks, true);
        
        // Should handle duplicates gracefully
        expect(result.length).toBeGreaterThanOrEqual(duplicateSchedule.length);
      });

      it('should handle negative day numbers', () => {
        const negativeSchedule: ScheduleItem[] = [
          { day: -1, slotId: 1, activityId: 101 },
        ];

        const negativeBlocks: DailyBlock[] = [
          { day: -1, slotId: 1, startMin: 480, endMin: 540, subjectId: 1 },
          { day: -1, slotId: 2, startMin: 540, endMin: 600, subjectId: 2 },
        ];

        const result = scheduleBufferBlockPerDay(negativeSchedule, negativeBlocks, true);
        
        expect(result.length).toBeGreaterThanOrEqual(1);
      });

      it('should handle very large arrays efficiently', () => {
        const largeSchedule: ScheduleItem[] = Array.from({ length: 1000 }, (_, i) => ({
          day: Math.floor(i / 10) + 1,
          slotId: (i % 10) + 1,
          activityId: i + 1000,
        }));

        const largeBlocks: DailyBlock[] = Array.from({ length: 1200 }, (_, i) => ({
          day: Math.floor(i / 12) + 1,
          slotId: (i % 12) + 1,
          startMin: 480 + (i % 12) * 60,
          endMin: 540 + (i % 12) * 60,
          subjectId: 1,
        }));

        const start = Date.now();
        const result = scheduleBufferBlockPerDay(largeSchedule, largeBlocks, true);
        const duration = Date.now() - start;

        expect(result.length).toBeGreaterThanOrEqual(largeSchedule.length);
        expect(duration).toBeLessThan(1000); // Should complete within 1 second
      });
    });
  });
});
