/**
 * TRUE TDD: Individual Student Progress Dashboard
 * Step 2: Student assessment data
 * 
 * Discovering we need to track assessments for individual students
 */

import { describe, it, expect } from 'vitest';

describe('Step 2: Student assessment tracking', () => {
  it('should track assessment for a student', () => {
    // Discovering we need student-expectation assessments
    function createAssessment(
      studentId: string,
      expectation: string,
      level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING'
    ) {
      return {
        studentId,
        expectation,
        level
      };
    }

    const assessment = createAssessment(
      'student-emma',
      'Counting to 20',
      'MEETING'
    );

    expect(assessment.studentId).toBe('student-emma');
    expect(assessment.expectation).toBe('Counting to 20');
    expect(assessment.level).toBe('MEETING');
  });

  it('should track multiple assessments per student', () => {
    function createAssessment(
      studentId: string,
      expectation: string,
      level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING'
    ) {
      return {
        studentId,
        expectation,
        level
      };
    }

    const assessments = [
      createAssessment('student-emma', 'Counting to 20', 'EXCEEDING'),
      createAssessment('student-emma', 'Letter formation', 'APPROACHING'),
      createAssessment('student-emma', 'French oral communication', 'MEETING'),
      createAssessment('student-emma', 'Skip counting by 2s', 'NOT_YET')
    ];

    const emmaAssessments = assessments.filter(a => a.studentId === 'student-emma');
    expect(emmaAssessments).toHaveLength(4);
  });

  it('should categorize assessments into strengths and growth areas', () => {
    type Level = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
    
    interface Assessment {
      expectation: string;
      level: Level;
    }

    function categorizeAssessments(assessments: Assessment[]) {
      const strengths = assessments.filter(a => 
        a.level === 'MEETING' || a.level === 'EXCEEDING'
      );
      const growthAreas = assessments.filter(a => 
        a.level === 'NOT_YET' || a.level === 'APPROACHING'
      );

      return { strengths, growthAreas };
    }

    const assessments: Assessment[] = [
      { expectation: 'Counting to 20', level: 'EXCEEDING' },
      { expectation: 'Letter formation', level: 'APPROACHING' },
      { expectation: 'French oral communication', level: 'MEETING' },
      { expectation: 'Skip counting by 2s', level: 'NOT_YET' }
    ];

    const { strengths, growthAreas } = categorizeAssessments(assessments);

    expect(strengths).toHaveLength(2);
    expect(strengths[0].expectation).toBe('Counting to 20');
    expect(strengths[1].expectation).toBe('French oral communication');

    expect(growthAreas).toHaveLength(2);
    expect(growthAreas[0].expectation).toBe('Letter formation');
    expect(growthAreas[1].expectation).toBe('Skip counting by 2s');
  });
});