/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 3: Reflections can have notes
 * 
 * Discovering we need to capture teacher observations
 */

import { describe, it, expect } from 'vitest';

describe('Step 3: Adding notes to reflections', () => {
  it('should be able to add a note to a reflection', () => {
    // Discovering we need notes field
    function createReflection(lessonId: string, status: '👍' | '👌' | '👎', note?: string) {
      return {
        lessonId,
        status,
        note: note || null
      };
    }

    const reflection = createReflection('lesson-1', '👎', 'Students struggled with skip counting');
    expect(reflection.note).toBe('Students struggled with skip counting');
  });

  it('should allow reflections without notes', () => {
    function createReflection(lessonId: string, status: '👍' | '👌' | '👎', note?: string) {
      return {
        lessonId,
        status,
        note: note || null
      };
    }

    const reflection = createReflection('lesson-1', '👍');
    expect(reflection.note).toBeNull();
  });

  it('should handle long observation notes', () => {
    function createReflection(lessonId: string, status: '👍' | '👌' | '👎', note?: string) {
      return {
        lessonId,
        status,
        note: note || null
      };
    }

    const longNote = 'Emma and Liam grasped the concept quickly. ' +
      'Sarah needed extra support with pattern recognition. ' +
      'Consider using more manipulatives tomorrow for hands-on learning.';
    
    const reflection = createReflection('lesson-1', '👌', longNote);
    expect(reflection.note).toBe(longNote);
    expect(reflection.note.length).toBeGreaterThan(100);
  });
});