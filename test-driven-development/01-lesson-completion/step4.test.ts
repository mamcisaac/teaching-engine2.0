/**
 * TRUE TDD: Lesson Completion Feature
 * Step 4: We need to check completion status
 * 
 * Growing from step 3, we need to query if a lesson is complete
 */

import { describe, it, expect } from 'vitest';

// We're discovering we need a completion tracker
class LessonCompletionTracker {
  markComplete(userId: number, lessonId: string): void {
    throw new Error('Not implemented');
  }

  isComplete(userId: number, lessonId: string): boolean {
    throw new Error('Not implemented');
  }
}

describe('Step 4: Checking completion status', () => {
  it('should return false for uncompleted lessons', () => {
    const tracker = new LessonCompletionTracker();
    
    const isComplete = tracker.isComplete(1, 'lesson-1');
    expect(isComplete).toBe(false);
  });

  it('should return true after marking complete', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    const isComplete = tracker.isComplete(1, 'lesson-1');
    
    expect(isComplete).toBe(true);
  });

  it('should track multiple lessons independently', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    
    expect(tracker.isComplete(1, 'lesson-1')).toBe(true);
    expect(tracker.isComplete(1, 'lesson-2')).toBe(false);
  });
});