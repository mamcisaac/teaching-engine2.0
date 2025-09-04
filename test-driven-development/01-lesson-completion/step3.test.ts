/**
 * TRUE TDD: Lesson Completion Feature
 * Step 3: We need to track WHO completed the lesson
 * 
 * Growing from step 2, we realize completions are user-specific
 */

import { describe, it, expect } from 'vitest';

// Now we discover we need user context
function markLessonCompleteForUser(
  userId: number,
  lessonId: string
): { userId: number; lessonId: string; completed: boolean } {
  // Still not implemented - RED phase
  throw new Error('Not implemented');
}

describe('Step 3: Completions are user-specific', () => {
  it('should track which user completed the lesson', () => {
    const result = markLessonCompleteForUser(1, 'lesson-1');
    
    expect(result.userId).toBe(1);
    expect(result.lessonId).toBe('lesson-1');
    expect(result.completed).toBe(true);
  });

  it('should allow different users to have different completion status', () => {
    const user1Result = markLessonCompleteForUser(1, 'lesson-1');
    const user2Result = markLessonCompleteForUser(2, 'lesson-1');
    
    // At this point we're discovering we need some kind of storage
    // But we're not assuming what kind - that comes later
    expect(user1Result.userId).not.toBe(user2Result.userId);
  });
});