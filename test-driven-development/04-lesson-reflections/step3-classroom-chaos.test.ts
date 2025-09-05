/**
 * PERFECT TDD: Per-Lesson Quick Reflections
 * Step 3 - REAL CLASSROOM CHAOS
 * 
 * This is where academic TDD meets Grade 1 reality.
 * These tests DISCOVER requirements from actual teaching chaos.
 */

import { describe, it, expect } from 'vitest';

describe('🔴 RED: The fire alarm went off mid-lesson', () => {
  it('should handle interrupted lessons', () => {
    // Emily was teaching math when RIIIIIING!
    const record = recordLesson('math-lesson-monday');
    
    // This WILL FAIL - we haven't thought about interruptions
    expect(record.wasInterrupted).toBeDefined();
    expect(record.reasonForInterruption).toBeDefined();
  });
});

describe('🔴 RED: I got pulled out for an emergency parent call', () => {
  it('should handle substitute taking over mid-lesson', () => {
    const record = recordLesson('reading-tuesday');
    
    // This WILL FAIL - we haven't considered handoffs
    expect(record.handedOffToSupply).toBeDefined();
    expect(record.handoffNotes).toBeDefined();
  });
});

describe('🔴 RED: Three kids had meltdowns simultaneously', () => {
  it('should let me record classroom management took precedence', () => {
    const record = recordLesson('science-wednesday');
    
    // This WILL FAIL - we only track "went well" as binary
    expect(record.actuallyHappened).toBeDefined();
    expect(record.whyItDidntHappen).toBeDefined();
  });
});

describe('🔴 RED: I taught it but forgot to record it until Friday', () => {
  it('should handle retroactive recording', () => {
    // It's Friday, Emily remembers Monday's lesson
    const record = recordLesson('monday-math');
    
    // This WILL FAIL - no timestamp tracking
    expect(record.taughtOn).toBeDefined();
    expect(record.recordedOn).toBeDefined();
    expect(record.daysLate).toBeDefined();
  });
});

describe('🔴 RED: The iPad died while I was typing my reflection', () => {
  it('should not lose my half-typed reflection', () => {
    const record = recordLesson('thursday-french');
    
    // Start typing reflection
    record.startReflection('The kids really struggled with...');
    
    // DEVICE DIES HERE
    // ... time passes ...
    // Emily gets iPad charged, opens app
    
    // This WILL FAIL - we have no draft saving
    const recovered = recoverDraft('thursday-french');
    expect(recovered.draftText).toBe('The kids really struggled with...');
    expect(recovered.lastSavedAt).toBeDefined();
  });
});

/**
 * THESE ARE REAL.
 * 
 * Emily faces these EVERY WEEK.
 * Our pristine TDD examples don't account for:
 * - Fire drills
 * - Vomit incidents  
 * - iPad batteries dying
 * - Supply teachers taking over
 * - Recording things days late
 * - Lessons that never happened due to chaos
 * 
 * Commit: "test: [RED] discover real classroom chaos requirements"
 */