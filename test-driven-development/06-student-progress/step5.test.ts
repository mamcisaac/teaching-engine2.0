/**
 * TRUE TDD: Individual Student Progress Dashboard
 * Step 5: Complete progress report
 * 
 * Discovering we need to combine all elements into a full report
 */

import { describe, it, expect } from 'vitest';

describe('Step 5: Complete progress report generation', () => {
  it('should generate a complete student progress report', () => {
    // Discovering we need a complete report structure
    interface StudentReport {
      studentName: string;
      grade: string;
      reportDate: Date;
      strengths: string[];
      growthAreas: string[];
      recentNotes: { note: string; date: string }[];
      teacherName: string;
    }

    function generateProgressReport(report: StudentReport): string {
      const header = `Student Progress Report\n` +
        `Name: ${report.studentName}\n` +
        `Grade: ${report.grade}\n` +
        `Date: ${report.reportDate.toLocaleDateString()}\n` +
        `Teacher: ${report.teacherName}\n\n`;

      const strengths = report.strengths.length > 0
        ? `Strengths:\n${report.strengths.map(s => `• ${s}`).join('\n')}`
        : 'Strengths: Still developing assessed skills';

      const growth = report.growthAreas.length > 0
        ? `Growth Areas:\n${report.growthAreas.map(g => `• ${g}`).join('\n')}`
        : 'Growth Areas: Meeting all assessed expectations';

      const notes = report.recentNotes.length > 0
        ? `Recent Observations:\n${report.recentNotes.map(n => `• "${n.note}" (${n.date})`).join('\n')}`
        : 'Recent Observations: No recent notes';

      return `${header}${strengths}\n\n${growth}\n\n${notes}`;
    }

    const report: StudentReport = {
      studentName: 'Emma Johnson',
      grade: 'Grade 1',
      reportDate: new Date('2024-10-15'),
      strengths: ['French oral communication', 'Counting to 20'],
      growthAreas: ['Letter formation', 'Skip counting by 2s'],
      recentNotes: [
        { note: 'Improving in reading comprehension', date: 'Oct 15' },
        { note: 'Great participation today', date: 'Oct 10' }
      ],
      teacherName: 'Emily McIsaac'
    };

    const generated = generateProgressReport(report);

    expect(generated).toContain('Student Progress Report');
    expect(generated).toContain('Name: Emma Johnson');
    expect(generated).toContain('Grade: Grade 1');
    expect(generated).toContain('Teacher: Emily McIsaac');
    expect(generated).toContain('• French oral communication');
    expect(generated).toContain('• Letter formation');
    expect(generated).toContain('"Improving in reading comprehension"');
  });

  it('should handle empty data gracefully', () => {
    interface StudentReport {
      studentName: string;
      grade: string;
      reportDate: Date;
      strengths: string[];
      growthAreas: string[];
      recentNotes: { note: string; date: string }[];
      teacherName: string;
    }

    function generateProgressReport(report: StudentReport): string {
      const header = `Student Progress Report\n` +
        `Name: ${report.studentName}\n` +
        `Grade: ${report.grade}\n` +
        `Date: ${report.reportDate.toLocaleDateString()}\n` +
        `Teacher: ${report.teacherName}\n\n`;

      const strengths = report.strengths.length > 0
        ? `Strengths:\n${report.strengths.map(s => `• ${s}`).join('\n')}`
        : 'Strengths: Assessment in progress';

      const growth = report.growthAreas.length > 0
        ? `Growth Areas:\n${report.growthAreas.map(g => `• ${g}`).join('\n')}`
        : 'Growth Areas: Assessment in progress';

      const notes = report.recentNotes.length > 0
        ? `Recent Observations:\n${report.recentNotes.map(n => `• "${n.note}" (${n.date})`).join('\n')}`
        : 'Recent Observations: None recorded yet';

      return `${header}${strengths}\n\n${growth}\n\n${notes}`;
    }

    const emptyReport: StudentReport = {
      studentName: 'New Student',
      grade: 'Grade 1',
      reportDate: new Date('2024-10-15'),
      strengths: [],
      growthAreas: [],
      recentNotes: [],
      teacherName: 'Emily McIsaac'
    };

    const generated = generateProgressReport(emptyReport);

    expect(generated).toContain('Strengths: Assessment in progress');
    expect(generated).toContain('Growth Areas: Assessment in progress');
    expect(generated).toContain('Recent Observations: None recorded yet');
  });
});