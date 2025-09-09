/**
 * Unit tests for toLessonView adapter
 * Tests resilient status derivation from Emily's database fields
 */

import { describe, it, expect } from '@jest/globals';
import { toLessonView } from '../../src/services/lessons/view';

// Use any type to decouple from Prisma types in unit tests
type Row = any;

// Base lesson with confirmed fields from Emily's DB
const baseLesson: Row = {
  id: 'test-lesson-1',
  userId: 23,
  unitPlanId: 'test-unit-1',
  title: 'Sample Lesson',
  titleFr: 'Leçon échantillon',
  date: new Date('2025-09-15T09:00:00Z'),
  duration: 45,
  lessonNumber: 1,
  slotNumber: 1,
  createdAt: new Date('2025-09-01T12:00:00Z'),
  updatedAt: new Date('2025-09-01T12:00:00Z'),
};

describe('toLessonView adapter', () => {
  it('defaults to PLANNED when no status or scheduling signals exist', () => {
    const result = toLessonView(baseLesson);
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('uses existing status field when present and valid', () => {
    const lesson = { ...baseLesson, status: 'SCHEDULED' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('SCHEDULED');
  });

  it('validates status field and falls back to PLANNED for invalid values', () => {
    const lesson = { ...baseLesson, status: 'INVALID_STATUS' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('derives TAUGHT when taughtDate is present', () => {
    const lesson = { ...baseLesson, taughtDate: new Date('2025-09-15T14:00:00Z') };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('TAUGHT');
  });

  it('derives SKIPPED when skippedReason is present', () => {
    const lesson = { ...baseLesson, skippedReason: 'Snow day' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('SKIPPED');
  });

  it('derives SCHEDULED when scheduledDate is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const lesson = { ...baseLesson, scheduledDate: futureDate };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('SCHEDULED');
  });

  it('stays PLANNED when scheduledDate is in the past', () => {
    const pastDate = new Date('2020-01-01');
    const lesson = { ...baseLesson, scheduledDate: pastDate };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('handles nullish and missing fields without throwing', () => {
    const lessonWithNulls = {
      ...baseLesson,
      status: null,
      taughtDate: null,
      scheduledDate: null,
      skippedReason: null,
    };
    const result = toLessonView(lessonWithNulls);
    expect(result.computedStatus).toBeDefined();
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('handles empty string status gracefully', () => {
    const lesson = { ...baseLesson, status: '' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('handles invalid date strings gracefully', () => {
    const lesson = { ...baseLesson, scheduledDate: 'invalid-date' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('PLANNED');
  });

  it('preserves all original lesson fields', () => {
    const lesson = { 
      ...baseLesson, 
      customField: 'custom-value',
      anotherField: 123 
    };
    const result = toLessonView(lesson);
    
    // Check original fields are preserved
    expect(result.id).toBe(lesson.id);
    expect(result.userId).toBe(lesson.userId);
    expect(result.title).toBe(lesson.title);
    expect(result.customField).toBe('custom-value');
    expect(result.anotherField).toBe(123);
  });

  it('prioritizes status field over derived status when both exist', () => {
    const lesson = {
      ...baseLesson,
      status: 'TAUGHT',
      scheduledDate: new Date('2030-01-01'), // Future date would suggest SCHEDULED
    };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('TAUGHT'); // Status field takes precedence
  });

  it('handles all valid status values', () => {
    const statuses = ['PLANNED', 'SCHEDULED', 'TAUGHT', 'SKIPPED', 'RESCHEDULED'];
    statuses.forEach(status => {
      const lesson = { ...baseLesson, status };
      const result = toLessonView(lesson);
      expect(result.computedStatus).toBe(status);
    });
  });

  it('handles empty skippedReason as not skipped', () => {
    const lesson = { ...baseLesson, skippedReason: '' };
    const result = toLessonView(lesson);
    expect(result.computedStatus).toBe('PLANNED');
  });
});