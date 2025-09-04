/**
 * TRUE TDD: Lesson Completion Feature
 * Step 5: We need to unmark lessons (toggle functionality)
 * 
 * Growing from step 4, users need to undo completions
 */

import { describe, it, expect } from 'vitest';

class LessonCompletionTracker {
  private completions = new Map<string, boolean>();

  private getKey(userId: number, lessonId: string): string {
    return `${userId}:${lessonId}`;
  }

  markComplete(userId: number, lessonId: string): void {
    this.completions.set(this.getKey(userId, lessonId), true);
  }

  markIncomplete(userId: number, lessonId: string): void {
    this.completions.delete(this.getKey(userId, lessonId));
  }

  isComplete(userId: number, lessonId: string): boolean {
    return this.completions.get(this.getKey(userId, lessonId)) || false;
  }
}

describe('Step 5: Unmarking completed lessons', () => {
  it('should allow unmarking a completed lesson', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    expect(tracker.isComplete(1, 'lesson-1')).toBe(true);
    
    tracker.markIncomplete(1, 'lesson-1');
    expect(tracker.isComplete(1, 'lesson-1')).toBe(false);
  });

  it('should handle unmarking an already incomplete lesson', () => {
    const tracker = new LessonCompletionTracker();
    
    // Should not throw
    tracker.markIncomplete(1, 'lesson-1');
    expect(tracker.isComplete(1, 'lesson-1')).toBe(false);
  });
});