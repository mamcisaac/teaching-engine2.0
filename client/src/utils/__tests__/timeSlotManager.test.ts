import { describe, it, expect } from 'vitest';
import { TimeSlotManager } from '../timeSlotManager';
import type { LessonPlan } from '@shared/types';

describe('TimeSlotManager', () => {
  const createMockLesson = (
    id: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): LessonPlan => ({
    id,
    title: `Lesson ${id}`,
    subject: 'mathematics',
    grade_level: '1',
    duration_minutes: 45,
    date: '2024-01-01',
    materials: JSON.stringify({
      timeSlot: { dayOfWeek, startTime, endTime }
    }),
    status: 'planned' as const
  });

  describe('hasConflict', () => {
    it('detects conflicts for overlapping time slots on same day', () => {
      const lesson1 = createMockLesson('1', 1, '09:00', '09:45');
      const lesson2 = createMockLesson('2', 1, '09:30', '10:15');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(true);
    });

    it('returns false for non-overlapping time slots on same day', () => {
      const lesson1 = createMockLesson('1', 1, '09:00', '09:45');
      const lesson2 = createMockLesson('2', 1, '10:00', '10:45');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(false);
    });

    it('returns false for lessons on different days', () => {
      const lesson1 = createMockLesson('1', 1, '09:00', '09:45');
      const lesson2 = createMockLesson('2', 2, '09:00', '09:45');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(false);
    });

    it('detects edge case conflicts (exact same time)', () => {
      const lesson1 = createMockLesson('1', 1, '09:00', '09:45');
      const lesson2 = createMockLesson('2', 1, '09:00', '09:45');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(true);
    });

    it('handles adjacent time slots correctly', () => {
      const lesson1 = createMockLesson('1', 1, '09:00', '09:45');
      const lesson2 = createMockLesson('2', 1, '09:45', '10:30');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(false);
    });

    it('returns false for lessons without time slots', () => {
      const lesson1: LessonPlan = {
        id: '1',
        title: 'Lesson 1',
        subject: 'mathematics',
        grade_level: '1',
        duration_minutes: 45,
        date: '2024-01-01',
        status: 'planned'
      };
      const lesson2 = createMockLesson('2', 1, '09:00', '09:45');

      expect(TimeSlotManager.hasConflict(lesson1, lesson2)).toBe(false);
    });
  });

  describe('findConflicts', () => {
    it('finds all conflicts in a set of lessons', () => {
      const lessons = [
        createMockLesson('1', 1, '09:00', '09:45'),
        createMockLesson('2', 1, '09:30', '10:15'),
        createMockLesson('3', 1, '10:00', '10:45'),
        createMockLesson('4', 2, '09:00', '09:45')
      ];

      const conflicts = TimeSlotManager.findConflicts(lessons);

      expect(conflicts).toHaveLength(2);
      expect(conflicts[0]).toMatchObject({
        lesson1: expect.objectContaining({ id: '1' }),
        lesson2: expect.objectContaining({ id: '2' })
      });
      expect(conflicts[1]).toMatchObject({
        lesson1: expect.objectContaining({ id: '2' }),
        lesson2: expect.objectContaining({ id: '3' })
      });
    });

    it('returns empty array when no conflicts exist', () => {
      const lessons = [
        createMockLesson('1', 1, '09:00', '09:45'),
        createMockLesson('2', 1, '10:00', '10:45'),
        createMockLesson('3', 2, '09:00', '09:45')
      ];

      const conflicts = TimeSlotManager.findConflicts(lessons);

      expect(conflicts).toHaveLength(0);
    });

    it('categorizes conflict severity correctly', () => {
      const lessons = [
        createMockLesson('1', 1, '09:00', '09:45'),
        createMockLesson('2', 1, '09:00', '09:45'), // Same time - high severity
        createMockLesson('3', 1, '09:30', '10:15')  // Overlap - medium severity
      ];

      const conflicts = TimeSlotManager.findConflicts(lessons);

      const sameTimeConflict = conflicts.find(
        c => c.lesson1.id === '1' && c.lesson2.id === '2'
      );
      const overlapConflict = conflicts.find(
        c => c.lesson1.id === '1' && c.lesson2.id === '3'
      );

      expect(sameTimeConflict?.type).toBe('same-time');
      expect(sameTimeConflict?.severity).toBe('high');
      expect(overlapConflict?.type).toBe('overlap');
      expect(overlapConflict?.severity).toBe('medium');
    });
  });

  describe('getAvailableSlots', () => {
    it('returns available time slots for a day', () => {
      const lessons = [
        createMockLesson('1', 1, '09:00', '09:45'),
        createMockLesson('2', 1, '11:00', '11:45')
      ];

      const available = TimeSlotManager.getAvailableSlots(1, lessons);

      expect(available).toContainEqual({
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '10:45'
      });
      expect(available).toContainEqual({
        dayOfWeek: 1,
        startTime: '13:00',
        endTime: '13:45'
      });
    });

    it('returns all slots when no lessons exist', () => {
      const available = TimeSlotManager.getAvailableSlots(1, []);

      expect(available.length).toBeGreaterThan(0);
      expect(available[0]).toMatchObject({
        dayOfWeek: 1,
        startTime: expect.any(String),
        endTime: expect.any(String)
      });
    });

    it('excludes lunch time from available slots', () => {
      const available = TimeSlotManager.getAvailableSlots(1, []);

      const lunchSlot = available.find(
        slot => slot.startTime === '12:00' || slot.startTime === '12:15'
      );

      expect(lunchSlot).toBeUndefined();
    });
  });

  describe('moveLesson', () => {
    it('moves a lesson to a new time slot', () => {
      const lesson = createMockLesson('1', 1, '09:00', '09:45');
      const newSlot = { dayOfWeek: 2, startTime: '10:00', endTime: '10:45' };

      const movedLesson = TimeSlotManager.moveLesson(lesson, newSlot);

      const materials = JSON.parse(movedLesson.materials || '{}');
      expect(materials.timeSlot).toEqual(newSlot);
    });

    it('preserves other lesson properties when moving', () => {
      const lesson = createMockLesson('1', 1, '09:00', '09:45');
      const newSlot = { dayOfWeek: 2, startTime: '10:00', endTime: '10:45' };

      const movedLesson = TimeSlotManager.moveLesson(lesson, newSlot);

      expect(movedLesson.id).toBe(lesson.id);
      expect(movedLesson.title).toBe(lesson.title);
      expect(movedLesson.subject).toBe(lesson.subject);
    });
  });

  describe('getScheduleSummary', () => {
    it('generates a summary of the weekly schedule', () => {
      const lessons = [
        createMockLesson('1', 1, '09:00', '09:45'),
        createMockLesson('2', 1, '10:00', '10:45'),
        createMockLesson('3', 2, '09:00', '09:45'),
        createMockLesson('4', 3, '09:00', '09:45'),
        createMockLesson('5', 3, '10:00', '10:45')
      ];

      const summary = TimeSlotManager.getScheduleSummary(lessons);

      expect(summary.totalLessons).toBe(5);
      expect(summary.lessonsPerDay[1]).toBe(2);
      expect(summary.lessonsPerDay[2]).toBe(1);
      expect(summary.lessonsPerDay[3]).toBe(2);
      expect(summary.lessonsPerDay[4]).toBe(0);
      expect(summary.lessonsPerDay[5]).toBe(0);
      expect(summary.totalHours).toBeCloseTo(3.75, 2);
    });

    it('handles empty schedule', () => {
      const summary = TimeSlotManager.getScheduleSummary([]);

      expect(summary.totalLessons).toBe(0);
      expect(summary.totalHours).toBe(0);
      Object.values(summary.lessonsPerDay).forEach(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('isValidTimeSlot', () => {
    it('validates correct time slots', () => {
      const slot = { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' };
      expect(TimeSlotManager.isValidTimeSlot(slot)).toBe(true);
    });

    it('rejects invalid day of week', () => {
      const slot = { dayOfWeek: 0, startTime: '09:00', endTime: '09:45' };
      expect(TimeSlotManager.isValidTimeSlot(slot)).toBe(false);
    });

    it('rejects invalid time format', () => {
      const slot = { dayOfWeek: 1, startTime: '9:00', endTime: '09:45' };
      expect(TimeSlotManager.isValidTimeSlot(slot)).toBe(false);
    });

    it('rejects end time before start time', () => {
      const slot = { dayOfWeek: 1, startTime: '10:00', endTime: '09:45' };
      expect(TimeSlotManager.isValidTimeSlot(slot)).toBe(false);
    });
  });

  describe('formatTimeSlot', () => {
    it('formats time slot for display', () => {
      const slot = { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' };
      const formatted = TimeSlotManager.formatTimeSlot(slot);

      expect(formatted).toBe('Monday 9:00 AM - 9:45 AM');
    });

    it('handles 24-hour format', () => {
      const slot = { dayOfWeek: 2, startTime: '14:00', endTime: '14:45' };
      const formatted = TimeSlotManager.formatTimeSlot(slot, true);

      expect(formatted).toBe('Tuesday 14:00 - 14:45');
    });
  });

  describe('parseTimeSlot', () => {
    it('parses time slot from lesson materials', () => {
      const lesson = createMockLesson('1', 1, '09:00', '09:45');
      const slot = TimeSlotManager.parseTimeSlot(lesson);

      expect(slot).toEqual({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '09:45'
      });
    });

    it('returns null for lessons without time slots', () => {
      const lesson: LessonPlan = {
        id: '1',
        title: 'Lesson 1',
        subject: 'mathematics',
        grade_level: '1',
        duration_minutes: 45,
        date: '2024-01-01',
        status: 'planned'
      };

      const slot = TimeSlotManager.parseTimeSlot(lesson);
      expect(slot).toBeNull();
    });

    it('handles invalid JSON in materials', () => {
      const lesson: LessonPlan = {
        id: '1',
        title: 'Lesson 1',
        subject: 'mathematics',
        grade_level: '1',
        duration_minutes: 45,
        date: '2024-01-01',
        materials: 'invalid json',
        status: 'planned'
      };

      const slot = TimeSlotManager.parseTimeSlot(lesson);
      expect(slot).toBeNull();
    });
  });
});