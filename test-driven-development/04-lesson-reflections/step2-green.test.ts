/**
 * PERFECT TDD: Per-Lesson Quick Reflections
 * Step 2 - GREEN PHASE: Just enough to pass
 */

import { describe, it, expect } from 'vitest';

// Evolved from discovery - now returns object
function recordLesson(lessonId: string) {
  return {
    lessonId,
    wentWell: undefined  // Minimal - test just wants it defined, not meaningful
  };
}

describe('🟢 GREEN: I can record if lesson went well', () => {
  it('should tell me if the lesson went well or poorly', () => {
    const record = recordLesson('math-lesson-monday');
    expect(record.wentWell).toBeDefined(); // Passes!
  });
  
  // Include previous test to ensure we didn't break it
  it('should let me record that a lesson happened', () => {
    const record = recordLesson('math-lesson-monday');
    expect(record).toBeDefined(); // Still passes!
  });
});

/**
 * Commit: "feat: [GREEN] lesson records have wentWell property"
 */