/**
 * TRUE TDD: Lesson Completion Feature
 * Step 6: We need to know WHEN a lesson was completed
 * 
 * Growing from step 5, we discover we need timestamps
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

interface CompletionRecord {
  userId: number;
  lessonId: string;
  completedAt: Date | null;
}

class LessonCompletionTracker {
  private completions = new Map<string, CompletionRecord>();

  private getKey(userId: number, lessonId: string): string {
    return `${userId}:${lessonId}`;
  }

  markComplete(userId: number, lessonId: string): CompletionRecord {
    const record: CompletionRecord = {
      userId,
      lessonId,
      completedAt: new Date()
    };
    this.completions.set(this.getKey(userId, lessonId), record);
    return record;
  }

  markIncomplete(userId: number, lessonId: string): void {
    this.completions.delete(this.getKey(userId, lessonId));
  }

  getCompletion(userId: number, lessonId: string): CompletionRecord | null {
    return this.completions.get(this.getKey(userId, lessonId)) || null;
  }

  isComplete(userId: number, lessonId: string): boolean {
    return this.completions.has(this.getKey(userId, lessonId));
  }
}

describe('Step 6: Tracking completion timestamps', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should record when a lesson was completed', () => {
    const tracker = new LessonCompletionTracker();
    const now = new Date('2024-01-15T10:00:00Z');
    vi.setSystemTime(now);
    
    const record = tracker.markComplete(1, 'lesson-1');
    
    expect(record.completedAt).toEqual(now);
  });

  it('should return null timestamp for incomplete lessons', () => {
    const tracker = new LessonCompletionTracker();
    
    const record = tracker.getCompletion(1, 'lesson-1');
    
    expect(record).toBeNull();
  });

  it('should clear timestamp when marking incomplete', () => {
    const tracker = new LessonCompletionTracker();
    
    tracker.markComplete(1, 'lesson-1');
    tracker.markIncomplete(1, 'lesson-1');
    
    const record = tracker.getCompletion(1, 'lesson-1');
    expect(record).toBeNull();
  });
});