/**
 * PERFECT TDD: Per-Lesson Quick Reflections
 * Step 1 - GREEN PHASE: Minimal code to pass
 * 
 * RULE: Write the ABSOLUTE MINIMUM to make the test pass.
 * Not what you think you'll need. Just enough to go green.
 */

import { describe, it, expect } from 'vitest';

// The MINIMAL implementation - just enough to pass
function recordLesson(lessonId: string) {
  return lessonId; // That's it. Test wants "defined", we give defined.
}

describe('🟢 GREEN: I need to remember how my lesson went', () => {
  it('should let me record that a lesson happened', () => {
    const record = recordLesson('math-lesson-monday');
    expect(record).toBeDefined();
  });
});

/**
 * Now it passes! But this implementation is stupid.
 * That's FINE. That's TDD.
 * 
 * Commit with: "feat: [GREEN] minimal lesson recording"
 * 
 * Next: Write another failing test that forces us to improve.
 */