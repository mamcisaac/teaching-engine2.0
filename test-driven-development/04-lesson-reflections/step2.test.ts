/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 2: We can set a reflection status
 * 
 * Discovering we need behavior - the ability to set a status
 */

import { describe, it, expect } from 'vitest';

describe('Step 2: Setting reflection status', () => {
  it('should be able to set a reflection status', () => {
    // Discovering we need a function
    function setReflectionStatus(lessonId: string, status: '👍' | '👌' | '👎') {
      return {
        lessonId,
        status
      };
    }

    const reflection = setReflectionStatus('lesson-1', '👍');
    expect(reflection.lessonId).toBe('lesson-1');
    expect(reflection.status).toBe('👍');
  });

  it('should accept different status values', () => {
    function setReflectionStatus(lessonId: string, status: '👍' | '👌' | '👎') {
      return {
        lessonId,
        status
      };
    }

    const success = setReflectionStatus('lesson-1', '👍');
    const mixed = setReflectionStatus('lesson-2', '👌');
    const reteach = setReflectionStatus('lesson-3', '👎');

    expect(success.status).toBe('👍');
    expect(mixed.status).toBe('👌');
    expect(reteach.status).toBe('👎');
  });
});