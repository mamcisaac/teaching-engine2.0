/**
 * TRUE TDD: Quick Assessment Feature
 * Step 3: We need to assess multiple students quickly
 * 
 * Growing from step 2, teachers have 25 students to assess
 */

import { describe, it, expect } from 'vitest';

type AchievementLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

interface Assessment {
  studentId: number;
  level: AchievementLevel;
}

class QuickAssessment {
  private assessments: Assessment[] = [];

  assessStudent(studentId: number, level: AchievementLevel): void {
    // Remove any existing assessment for this student
    this.assessments = this.assessments.filter(a => a.studentId !== studentId);
    
    // Add new assessment
    this.assessments.push({ studentId, level });
  }

  getAssessment(studentId: number): Assessment | undefined {
    return this.assessments.find(a => a.studentId === studentId);
  }

  getAllAssessments(): Assessment[] {
    return [...this.assessments];
  }

  getCount(): number {
    return this.assessments.length;
  }
}

describe('Step 3: Assessing multiple students', () => {
  it('should assess multiple students', () => {
    const assessment = new QuickAssessment();
    
    assessment.assessStudent(1, 'MEETING');
    assessment.assessStudent(2, 'APPROACHING');
    assessment.assessStudent(3, 'EXCEEDING');
    
    expect(assessment.getCount()).toBe(3);
  });

  it('should retrieve a specific student assessment', () => {
    const assessment = new QuickAssessment();
    
    assessment.assessStudent(1, 'MEETING');
    assessment.assessStudent(2, 'NOT_YET');
    
    expect(assessment.getAssessment(1)?.level).toBe('MEETING');
    expect(assessment.getAssessment(2)?.level).toBe('NOT_YET');
  });

  it('should update assessment if student is assessed again', () => {
    const assessment = new QuickAssessment();
    
    assessment.assessStudent(1, 'NOT_YET');
    expect(assessment.getAssessment(1)?.level).toBe('NOT_YET');
    
    assessment.assessStudent(1, 'APPROACHING');
    expect(assessment.getAssessment(1)?.level).toBe('APPROACHING');
    expect(assessment.getCount()).toBe(1); // Still just one student
  });

  it('should handle 25 students (a full class)', () => {
    const assessment = new QuickAssessment();
    
    // Assess 25 students
    for (let i = 1; i <= 25; i++) {
      const level: AchievementLevel = i <= 5 ? 'NOT_YET' : 
                                      i <= 13 ? 'APPROACHING' : 
                                      i <= 23 ? 'MEETING' : 
                                      'EXCEEDING';
      assessment.assessStudent(i, level);
    }
    
    expect(assessment.getCount()).toBe(25);
  });
});