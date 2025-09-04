/**
 * TRUE TDD: Quick Assessment Feature
 * Step 2: We need to assess a student
 * 
 * Growing from step 1, we need to record assessments
 */

import { describe, it, expect } from 'vitest';

type AchievementLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

function assessStudent(studentId: number, level: AchievementLevel) {
  return {
    studentId,
    level
  };
}

describe('Step 2: Assessing a student', () => {
  it('should record a student assessment', () => {
    const assessment = assessStudent(1, 'MEETING');
    
    expect(assessment.studentId).toBe(1);
    expect(assessment.level).toBe('MEETING');
  });

  it('should accept all four achievement levels', () => {
    const levels: AchievementLevel[] = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
    
    levels.forEach(level => {
      const assessment = assessStudent(1, level);
      expect(assessment.level).toBe(level);
    });
  });
});