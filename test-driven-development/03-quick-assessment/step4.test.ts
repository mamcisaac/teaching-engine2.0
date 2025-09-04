/**
 * TRUE TDD: Quick Assessment Feature
 * Step 4: We need to group students by achievement level
 * 
 * Growing from step 3, teachers need differentiation groups
 */

import { describe, it, expect } from 'vitest';

type AchievementLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

interface Assessment {
  studentId: number;
  level: AchievementLevel;
}

interface DifferentiationGroups {
  reteaching: number[];    // NOT_YET students
  support: number[];       // APPROACHING students
  independent: number[];   // MEETING students
  extension: number[];     // EXCEEDING students
}

class QuickAssessment {
  private assessments: Assessment[] = [];

  assessStudent(studentId: number, level: AchievementLevel): void {
    this.assessments = this.assessments.filter(a => a.studentId !== studentId);
    this.assessments.push({ studentId, level });
  }

  generateGroups(): DifferentiationGroups {
    const groups: DifferentiationGroups = {
      reteaching: [],
      support: [],
      independent: [],
      extension: []
    };

    this.assessments.forEach(assessment => {
      switch (assessment.level) {
        case 'NOT_YET':
          groups.reteaching.push(assessment.studentId);
          break;
        case 'APPROACHING':
          groups.support.push(assessment.studentId);
          break;
        case 'MEETING':
          groups.independent.push(assessment.studentId);
          break;
        case 'EXCEEDING':
          groups.extension.push(assessment.studentId);
          break;
      }
    });

    return groups;
  }
}

describe('Step 4: Generating differentiation groups', () => {
  it('should create empty groups when no assessments exist', () => {
    const assessment = new QuickAssessment();
    
    const groups = assessment.generateGroups();
    
    expect(groups.reteaching).toEqual([]);
    expect(groups.support).toEqual([]);
    expect(groups.independent).toEqual([]);
    expect(groups.extension).toEqual([]);
  });

  it('should group students by achievement level', () => {
    const assessment = new QuickAssessment();
    
    assessment.assessStudent(1, 'NOT_YET');
    assessment.assessStudent(2, 'NOT_YET');
    assessment.assessStudent(3, 'APPROACHING');
    assessment.assessStudent(4, 'MEETING');
    assessment.assessStudent(5, 'EXCEEDING');
    
    const groups = assessment.generateGroups();
    
    expect(groups.reteaching).toEqual([1, 2]);
    expect(groups.support).toEqual([3]);
    expect(groups.independent).toEqual([4]);
    expect(groups.extension).toEqual([5]);
  });

  it('should generate groups for a realistic class distribution', () => {
    const assessment = new QuickAssessment();
    
    // Typical distribution: 5 NOT_YET, 8 APPROACHING, 10 MEETING, 2 EXCEEDING
    for (let i = 1; i <= 5; i++) assessment.assessStudent(i, 'NOT_YET');
    for (let i = 6; i <= 13; i++) assessment.assessStudent(i, 'APPROACHING');
    for (let i = 14; i <= 23; i++) assessment.assessStudent(i, 'MEETING');
    for (let i = 24; i <= 25; i++) assessment.assessStudent(i, 'EXCEEDING');
    
    const groups = assessment.generateGroups();
    
    expect(groups.reteaching).toHaveLength(5);
    expect(groups.support).toHaveLength(8);
    expect(groups.independent).toHaveLength(10);
    expect(groups.extension).toHaveLength(2);
  });
});