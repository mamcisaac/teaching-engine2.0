/**
 * PERFECT TDD: Per-Lesson Quick Reflections
 * Step 2 - RED PHASE: Discover we need more than just ID
 * 
 * Through USING our minimal implementation, we discover it's not enough.
 */

import { describe, it, expect } from 'vitest';

// Our minimal implementation from step 1
function recordLesson(lessonId: string) {
  return lessonId;
}

describe('🔴 RED: Wait, I need to know HOW the lesson went', () => {
  it('should tell me if the lesson went well or poorly', () => {
    const record = recordLesson('math-lesson-monday');
    
    // This WILL FAIL - our function just returns the ID
    // We're DISCOVERING we need more information
    expect(record.wentWell).toBeDefined();
  });
});

/**
 * Run this. It fails with:
 * "TypeError: Cannot read property 'wentWell' of undefined"
 * or similar.
 * 
 * GOOD! We discovered our implementation is insufficient.
 * 
 * Commit: "test: [RED] need to track if lesson went well"
 */