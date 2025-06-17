import { describe, it, expect } from '@jest/globals';
import { filterAvailableBlocksByCalendar } from '../../src/services/planningEngine';
import type { TimetableSlot, CalendarEvent, Holiday } from '@teaching-engine/database';

describe('PlanningEngine Unit Tests', () => {
  describe('filterAvailableBlocksByCalendar', () => {
    const createTimetableSlot = (id: number, day: number, startMin: number, endMin: number, subjectId: number | null = 1): TimetableSlot => ({
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

    const createHoliday = (date: string): Holiday => ({
      id: 1,
      date: new Date(date),
      name: 'Test Holiday',
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

      // Holiday on Tuesday (day 2)
      const holidays: Holiday[] = [
        createHoliday('2024-01-02'), // Assuming this is a Tuesday
      ];

      const result = filterAvailableBlocksByCalendar(slots, [], [], holidays);
      
      // Should filter out Tuesday slot due to holiday
      expect(result.length).toBeLessThan(3);
      expect(result.every(block => block.day !== 2)).toBe(true);
    });

    it('should filter out slots that conflict with all-day events', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Monday 8:00-9:00 AM
        createTimetableSlot(2, 1, 600, 660), // Monday 10:00-11:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-01T00:00:00', '2024-01-01T23:59:59', true), // All-day Monday event
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);
      
      // All Monday slots should be filtered out due to all-day event
      expect(result).toHaveLength(0);
    });

    it('should filter out slots that conflict with timed events', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Monday 8:00-9:00 AM
        createTimetableSlot(2, 1, 540, 600), // Monday 9:00-10:00 AM
        createTimetableSlot(3, 1, 600, 660), // Monday 10:00-11:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-01T09:00:00', '2024-01-01T10:00:00', false), // 9:00-10:00 AM event
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);
      
      // Should keep 8:00-9:00 and 10:00-11:00 slots, filter out 9:00-10:00
      expect(result).toHaveLength(2);
      expect(result.some(block => block.startMin === 540 && block.endMin === 600)).toBe(false);
    });

    it('should handle partial overlaps correctly', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540), // Monday 8:00-9:00 AM
        createTimetableSlot(2, 1, 520, 580), // Monday 8:40-9:40 AM (overlaps)
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-01T08:30:00', '2024-01-01T09:15:00', false), // 8:30-9:15 AM event
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
        createCalendarEvent('2024-01-03T10:00:00', '2024-01-03T11:00:00', false), // Wednesday event
      ];

      const holidays: Holiday[] = [
        createHoliday('2024-01-02'), // Tuesday holiday
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], holidays);
      
      // Only Thursday slot should remain
      expect(result).toHaveLength(1);
      expect(result[0].day).toBe(4);
    });

    it('should return correct DailyBlock format', () => {
      const slots: TimetableSlot[] = [
        createTimetableSlot(1, 1, 480, 540, 5),
      ];

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
        createTimetableSlot(1, 1, 540, 600), // Monday 9:00-10:00 AM
      ];

      const events: CalendarEvent[] = [
        createCalendarEvent('2024-01-01T09:00:00', '2024-01-01T10:00:00', false), // Exact match
      ];

      const result = filterAvailableBlocksByCalendar(slots, events, [], []);
      
      // Should filter out the exactly matching slot
      expect(result).toHaveLength(0);
    });
  });
});