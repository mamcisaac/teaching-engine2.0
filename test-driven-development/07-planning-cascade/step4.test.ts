/**
 * TRUE TDD: Planning Cascade View
 * Step 4: Curriculum expectation tracking
 * 
 * Discovering we need to track which expectations are covered
 */

import { describe, it, expect } from 'vitest';

describe('Step 4: Tracking curriculum expectations', () => {
  it('should associate expectations with lessons', () => {
    // Discovering we need expectation tracking
    interface Lesson {
      id: string;
      title: string;
      expectations: string[];
    }

    const lesson: Lesson = {
      id: 'lesson-1',
      title: 'Counting to 20',
      expectations: ['MATH.1.NS.1', 'MATH.1.NS.2']
    };

    expect(lesson.expectations).toHaveLength(2);
    expect(lesson.expectations).toContain('MATH.1.NS.1');
  });

  it('should highlight lessons covering a specific expectation', () => {
    interface Lesson {
      id: string;
      title: string;
      expectations: string[];
    }

    function findLessonsWithExpectation(
      lessons: Lesson[], 
      expectationId: string
    ): Lesson[] {
      return lessons.filter(l => l.expectations.includes(expectationId));
    }

    const lessons: Lesson[] = [
      { id: 'l1', title: 'Counting', expectations: ['MATH.1.NS.1', 'MATH.1.NS.2'] },
      { id: 'l2', title: 'Patterns', expectations: ['MATH.1.PA.1'] },
      { id: 'l3', title: 'Skip Counting', expectations: ['MATH.1.NS.2', 'MATH.1.NS.3'] },
      { id: 'l4', title: 'Shapes', expectations: ['MATH.1.GE.1'] }
    ];

    const lessonsWithNS2 = findLessonsWithExpectation(lessons, 'MATH.1.NS.2');
    
    expect(lessonsWithNS2).toHaveLength(2);
    expect(lessonsWithNS2[0].id).toBe('l1');
    expect(lessonsWithNS2[1].id).toBe('l3');
  });

  it('should identify uncovered expectations', () => {
    interface Lesson {
      id: string;
      expectations: string[];
    }

    function findUncoveredExpectations(
      allExpectations: string[],
      lessons: Lesson[]
    ): string[] {
      const covered = new Set<string>();
      
      lessons.forEach(lesson => {
        lesson.expectations.forEach(exp => covered.add(exp));
      });

      return allExpectations.filter(exp => !covered.has(exp));
    }

    const allExpectations = [
      'MATH.1.NS.1', 
      'MATH.1.NS.2', 
      'MATH.1.NS.3',
      'MATH.1.PA.1',
      'MATH.1.GE.1'
    ];

    const lessons: Lesson[] = [
      { id: 'l1', expectations: ['MATH.1.NS.1', 'MATH.1.NS.2'] },
      { id: 'l2', expectations: ['MATH.1.PA.1'] }
    ];

    const uncovered = findUncoveredExpectations(allExpectations, lessons);
    
    expect(uncovered).toHaveLength(2);
    expect(uncovered).toContain('MATH.1.NS.3');
    expect(uncovered).toContain('MATH.1.GE.1');
  });

  it('should calculate coverage percentage', () => {
    interface CoverageStats {
      total: number;
      covered: number;
      percentage: number;
    }

    function calculateCoverage(
      allExpectations: string[],
      coveredExpectations: Set<string>
    ): CoverageStats {
      const covered = allExpectations.filter(exp => coveredExpectations.has(exp)).length;
      
      return {
        total: allExpectations.length,
        covered,
        percentage: Math.round((covered / allExpectations.length) * 100)
      };
    }

    const allExpectations = ['EXP1', 'EXP2', 'EXP3', 'EXP4', 'EXP5'];
    const covered = new Set(['EXP1', 'EXP2', 'EXP4']);

    const stats = calculateCoverage(allExpectations, covered);
    
    expect(stats.total).toBe(5);
    expect(stats.covered).toBe(3);
    expect(stats.percentage).toBe(60);
  });
});