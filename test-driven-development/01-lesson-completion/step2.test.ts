/**
 * TRUE TDD: Lesson Completion Feature
 * Step 2: We need a function to track completion
 * 
 * Growing from step 1, we realize we need a way to change the status
 */

import { describe, it, expect } from 'vitest';

// The simplest function that could possibly work
function markLessonComplete(lessonId: string): { lessonId: string; completed: boolean } {
  // This will fail initially - that's the point of TDD
  throw new Error('Not implemented');
}

describe('Step 2: Marking a lesson as complete', () => {
  it('should mark a lesson as complete', () => {
    const result = markLessonComplete('lesson-1');
    expect(result.lessonId).toBe('lesson-1');
    expect(result.completed).toBe(true);
  });
});