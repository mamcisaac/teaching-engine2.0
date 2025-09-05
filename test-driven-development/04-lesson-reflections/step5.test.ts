/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 5: Reflections need timestamps
 * 
 * Discovering we need to know when reflections were made
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Step 5: Timestamped reflections', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should track when a reflection was created', () => {
    // Discovering we need timestamps
    function createReflection(
      teacherId: number,
      lessonId: string,
      status: '👍' | '👌' | '👎',
      note?: string
    ) {
      return {
        teacherId,
        lessonId,
        status,
        note: note || null,
        createdAt: new Date()
      };
    }

    const now = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(now);

    const reflection = createReflection(1, 'lesson-1', '👍');
    expect(reflection.createdAt).toEqual(now);
  });

  it('should track when a reflection was last updated', () => {
    function createReflection(
      teacherId: number,
      lessonId: string,
      status: '👍' | '👌' | '👎',
      note?: string
    ) {
      return {
        teacherId,
        lessonId,
        status,
        note: note || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const createTime = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(createTime);
    
    const reflection = createReflection(1, 'lesson-1', '👌');
    
    // Simulate an update later
    const updateTime = new Date('2024-01-15T15:00:00');
    vi.setSystemTime(updateTime);
    
    reflection.status = '👍';
    reflection.note = 'Actually went better than expected';
    reflection.updatedAt = new Date();

    expect(reflection.createdAt).toEqual(createTime);
    expect(reflection.updatedAt).toEqual(updateTime);
    expect(reflection.updatedAt.getTime()).toBeGreaterThan(reflection.createdAt.getTime());
  });
});