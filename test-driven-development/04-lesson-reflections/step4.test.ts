/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 4: Reflections are teacher-specific
 * 
 * Discovering we need user context - reflections belong to specific teachers
 */

import { describe, it, expect } from 'vitest';

describe('Step 4: Teacher-specific reflections', () => {
  it('should track which teacher made the reflection', () => {
    // Discovering we need teacher context
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
        note: note || null
      };
    }

    const reflection = createReflection(1, 'lesson-1', '👍');
    expect(reflection.teacherId).toBe(1);
  });

  it('should allow different teachers to reflect on same lesson', () => {
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
        note: note || null
      };
    }

    const teacher1Reflection = createReflection(1, 'lesson-1', '👍', 'Went great!');
    const teacher2Reflection = createReflection(2, 'lesson-1', '👎', 'Need more time');

    expect(teacher1Reflection.teacherId).toBe(1);
    expect(teacher1Reflection.status).toBe('👍');
    expect(teacher2Reflection.teacherId).toBe(2);
    expect(teacher2Reflection.status).toBe('👎');
  });
});