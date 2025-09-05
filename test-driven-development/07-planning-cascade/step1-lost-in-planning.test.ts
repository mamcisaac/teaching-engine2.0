/**
 * PERFECT TDD: Planning Cascade View  
 * Step 1 - "WHERE THE HELL IS THAT LESSON?"
 * 
 * Not "I need a tree structure"
 * But "Principal wants to observe my butterfly lesson TODAY and I can't find it"
 */

import { describe, it, expect } from 'vitest';
import './testHelpers'; // Load test helper functions

describe('🔴 RED: Principal walks in asking about my butterfly lesson', () => {
  it('should find ANY lesson by vague memory in under 5 seconds', () => {
    // Emily: "I know it had something about butterflies..."
    
    const startTime = Date.now();
    
    // This WILL FAIL - findLessonPanicking doesn't exist
    const results = findLessonPanicking('butterfly');
    
    const searchTime = Date.now() - startTime;
    
    expect(searchTime).toBeLessThan(5000);
    expect(results[0].title).toContain('butterfly');
    expect(results[0].whenIsProbablyScheduled).toBeDefined(); // "Maybe next Tuesday?"
    expect(results[0].whatUnitIsItIn).toBeDefined(); // "Life cycles unit"
    expect(results[0].didIAlreadyTeachIt).toBeDefined(); // "No, coming up"
  });
});

describe('🔴 RED: "Show me your year at a glance" says evaluator', () => {
  it('should show EVERYTHING on one screen without scrolling', () => {
    // This WILL FAIL - getYearAtGlance doesn't exist
    const view = getYearAtGlance();
    
    // 195 days × 5 lessons = 975 lessons
    expect(view.totalLessons).toBe(975);
    expect(view.displayHeight).toBeLessThan(window.innerHeight); // Fits on screen!
    expect(view.isReadable).toBe(true); // Not microscopic
    expect(view.showsGaps).toBe(true); // Red flags for missing plans
  });
});

describe('🔴 RED: "You taught addition before number sense?!"', () => {
  it('should flag prerequisite violations in curriculum sequence', () => {
    // This WILL FAIL - validateCurriculumSequence doesn't exist  
    const issues = validateCurriculumSequence();
    
    expect(issues.prerequisiteViolations).toBeDefined();
    expect(issues.example).toContain('Teaching multiplication before addition');
    expect(issues.suggestion).toContain('Reorder units 3 and 4');
  });
});

describe('🔴 RED: Report cards due tomorrow, what haven\'t I covered?', () => {
  it('should panic-highlight uncovered expectations by reporting period', () => {
    const tomorrow = new Date('2024-11-15'); // Report cards due
    
    // This WILL FAIL - getPanicCoverageGaps doesn't exist
    const gaps = getPanicCoverageGaps(tomorrow);
    
    expect(gaps.mustTeachToday).toBeDefined(); // "These 3 MUST be done"
    expect(gaps.canFudgeOnReportCard).toBeDefined(); // "Say 'emerging'"
    expect(gaps.parentWillNotice).toBeDefined(); // "Skip counting - parents drill this"
  });
});

describe('🔴 RED: Supply teacher needs my plans for tomorrow', () => {
  it('should generate supply-teacher-proof plan in 30 seconds', () => {
    const startTime = Date.now();
    
    // This WILL FAIL - generateSupplyPlan doesn't exist
    const plan = generateSupplyPlan('tomorrow');
    
    const genTime = Date.now() - startTime;
    
    expect(genTime).toBeLessThan(30000); // 30 seconds
    expect(plan.includes('DO NOT attempt science experiment')).toBe(true);
    expect(plan.includes('Worksheets in top drawer')).toBe(true);
    expect(plan.includes('Call office if: Emma, Liam, or Jackson')).toBe(true);
    expect(plan.noTechnology).toBe(true); // They won't know passwords
  });
});

describe('🔴 RED: "Why did you skip the Indigenous Peoples unit?"', () => {
  it('should visually show WHY units were moved/skipped/delayed', () => {
    // This WILL FAIL - getScheduleJustifications doesn't exist
    const reasons = getScheduleJustifications();
    
    expect(reasons['Indigenous Peoples unit']).toBe('Waiting for Elder visit Nov 20');
    expect(reasons['Rocks and Minerals']).toBe('No materials until January budget');
    expect(reasons['Dairy Farm visit']).toBe('Moved due to Sarahs milk allergy');
  });
});

/**
 * THIS is real planning cascade needs:
 * - PANIC SEARCH when principal appears
 * - AT-A-GLANCE for evaluations
 * - SEQUENCE VALIDATION for curriculum police
 * - GAP PANIC for report cards
 * - SUPPLY GENERATION when you're sick
 * - JUSTIFICATION for every deviation
 * 
 * Not "display a tree structure"
 * 
 * Commit: "test: [RED] planning cascade panic requirements"
 */