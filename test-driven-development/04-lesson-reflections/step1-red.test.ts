/**
 * PERFECT TDD: Per-Lesson Quick Reflections
 * Step 1 - RED PHASE: Write a failing test
 * 
 * RULE: This test MUST FAIL when first written.
 * No implementation exists yet. We're discovering what we need.
 */

import { describe, it, expect } from 'vitest';

describe('🔴 RED: I need to remember how my lesson went', () => {
  it('should let me record that a lesson happened', () => {
    // As Emily teaching Grade 1, I just finished my math lesson
    // I need to record SOMETHING about how it went
    
    // This WILL FAIL - recordLesson doesn't exist
    const record = recordLesson('math-lesson-monday');
    
    // I just need to know I recorded it
    expect(record).toBeDefined();
  });
});

/**
 * STOP HERE.
 * 
 * Run this test. It MUST fail with:
 * "ReferenceError: recordLesson is not defined"
 * 
 * This is GOOD. This is the RED phase.
 * 
 * DO NOT write implementation yet.
 * DO NOT import anything.
 * DO NOT fix this test.
 * 
 * Commit this failing test with message: "test: [RED] need to record lesson happened"
 * 
 * ONLY after committing the red test should you move to step1-green.test.ts
 */