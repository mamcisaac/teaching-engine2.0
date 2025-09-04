/**
 * TRUE TDD: Lesson Completion Feature
 * Step 7: We need progress tracking
 * 
 * Growing from step 6, teachers need to see their daily progress
 */

import { describe, it, expect } from 'vitest';

class LessonCompletionTracker {
  private completions = new Set<string>();

  private getKey(userId: number, lessonId: string): string {
    return `${userId}:${lessonId}`;
  }

  markComplete(userId: number, lessonId: string): void {
    this.completions.add(this.getKey(userId, lessonId));
  }

  markIncomplete(userId: number, lessonId: string): void {
    this.completions.delete(this.getKey(userId, lessonId));
  }

  getProgress(userId: number, lessonIds: string[]): { completed: number; total: number; percentage: number } {
    const completed = lessonIds.filter(lessonId => 
      this.completions.has(this.getKey(userId, lessonId))
    ).length;

    const total = lessonIds.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }
}

describe('Step 7: Calculating completion progress', () => {
  it('should calculate 0% progress when no lessons are complete', () => {
    const tracker = new LessonCompletionTracker();
    
    const progress = tracker.getProgress(1, ['lesson-1', 'lesson-2', 'lesson-3']);
    
    expect(progress).toEqual({
      completed: 0,
      total: 3,
      percentage: 0
    });
  });

  it('should calculate correct progress for partially completed lessons', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    tracker.markComplete(1, 'lesson-3');
    
    const progress = tracker.getProgress(1, ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4']);
    
    expect(progress).toEqual({
      completed: 2,
      total: 4,
      percentage: 50
    });
  });

  it('should calculate 100% when all lessons are complete', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    tracker.markComplete(1, 'lesson-2');
    
    const progress = tracker.getProgress(1, ['lesson-1', 'lesson-2']);
    
    expect(progress).toEqual({
      completed: 2,
      total: 2,
      percentage: 100
    });
  });

  it('should handle empty lesson list', () => {
    const tracker = new LessonCompletionTracker();
    
    const progress = tracker.getProgress(1, []);
    
    expect(progress).toEqual({
      completed: 0,
      total: 0,
      percentage: 0
    });
  });
});