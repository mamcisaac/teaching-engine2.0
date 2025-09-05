/**
 * TRUE TDD: Individual Student Progress Dashboard
 * Step 3: Generate text summaries
 * 
 * Discovering we need to create parent-friendly text summaries
 */

import { describe, it, expect } from 'vitest';

describe('Step 3: Text summary generation', () => {
  it('should generate a simple strengths summary', () => {
    // Discovering we need text generation
    function generateStrengthsSummary(strengths: string[]): string {
      if (strengths.length === 0) {
        return 'Still developing assessed skills.';
      }
      if (strengths.length === 1) {
        return `Strength: ${strengths[0]}.`;
      }
      return `Strengths: ${strengths.join(', ')}.`;
    }

    expect(generateStrengthsSummary([])).toBe('Still developing assessed skills.');
    expect(generateStrengthsSummary(['Counting to 20'])).toBe('Strength: Counting to 20.');
    expect(generateStrengthsSummary(['Counting to 20', 'Letter recognition']))
      .toBe('Strengths: Counting to 20, Letter recognition.');
  });

  it('should generate a growth areas summary', () => {
    function generateGrowthSummary(growthAreas: string[]): string {
      if (growthAreas.length === 0) {
        return 'Meeting all assessed expectations.';
      }
      if (growthAreas.length === 1) {
        return `Growth area: ${growthAreas[0]}.`;
      }
      return `Growth areas: ${growthAreas.join(', ')}.`;
    }

    expect(generateGrowthSummary([])).toBe('Meeting all assessed expectations.');
    expect(generateGrowthSummary(['Skip counting'])).toBe('Growth area: Skip counting.');
    expect(generateGrowthSummary(['Skip counting', 'Letter formation']))
      .toBe('Growth areas: Skip counting, Letter formation.');
  });

  it('should generate a complete student summary', () => {
    interface StudentProgress {
      studentName: string;
      strengths: string[];
      growthAreas: string[];
    }

    function generateStudentSummary(progress: StudentProgress): string {
      const strengthsText = progress.strengths.length > 0
        ? `Strengths: ${progress.strengths.join(', ')}`
        : 'Still developing assessed skills';
      
      const growthText = progress.growthAreas.length > 0
        ? `Growth Areas: ${progress.growthAreas.join(', ')}`
        : 'Meeting all assessed expectations';

      return `${progress.studentName}'s Progress:\n\n${strengthsText}.\n\n${growthText}.`;
    }

    const emmaProgress = {
      studentName: 'Emma',
      strengths: ['French oral communication', 'Counting to 20'],
      growthAreas: ['Letter formation', 'Skip counting by 2s']
    };

    const summary = generateStudentSummary(emmaProgress);
    
    expect(summary).toContain("Emma's Progress");
    expect(summary).toContain('Strengths: French oral communication, Counting to 20');
    expect(summary).toContain('Growth Areas: Letter formation, Skip counting by 2s');
  });
});