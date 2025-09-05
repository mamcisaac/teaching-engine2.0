/**
 * TRUE TDD: Individual Student Progress Dashboard
 * Step 4: Recent assessment notes
 * 
 * Discovering we need to include recent observation notes in summaries
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Step 4: Including recent notes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should track assessment notes with timestamps', () => {
    // Discovering we need timestamped notes
    function createAssessmentNote(
      studentId: string,
      note: string,
      date: Date = new Date()
    ) {
      return {
        studentId,
        note,
        date
      };
    }

    const now = new Date('2024-10-15T14:00:00');
    vi.setSystemTime(now);

    const note = createAssessmentNote(
      'student-emma',
      'Improving in reading comprehension'
    );

    expect(note.studentId).toBe('student-emma');
    expect(note.note).toBe('Improving in reading comprehension');
    expect(note.date).toEqual(now);
  });

  it('should get the most recent N notes', () => {
    interface AssessmentNote {
      studentId: string;
      note: string;
      date: Date;
    }

    class StudentNotes {
      private notes: AssessmentNote[] = [];

      addNote(studentId: string, note: string, date: Date) {
        this.notes.push({ studentId, note, date });
      }

      getRecentNotes(studentId: string, count: number): AssessmentNote[] {
        return this.notes
          .filter(n => n.studentId === studentId)
          .sort((a, b) => b.date.getTime() - a.date.getTime()) // Most recent first
          .slice(0, count);
      }
    }

    const notes = new StudentNotes();
    
    notes.addNote('student-emma', 'Note 1', new Date('2024-10-01'));
    notes.addNote('student-emma', 'Note 2', new Date('2024-10-05'));
    notes.addNote('student-emma', 'Note 3', new Date('2024-10-10'));
    notes.addNote('student-emma', 'Note 4', new Date('2024-10-15'));
    notes.addNote('student-emma', 'Note 5', new Date('2024-10-20'));
    notes.addNote('student-liam', 'Other student', new Date('2024-10-20'));

    const recentNotes = notes.getRecentNotes('student-emma', 3);

    expect(recentNotes).toHaveLength(3);
    expect(recentNotes[0].note).toBe('Note 5'); // Most recent
    expect(recentNotes[1].note).toBe('Note 4');
    expect(recentNotes[2].note).toBe('Note 3');
  });

  it('should format notes for parent report', () => {
    interface AssessmentNote {
      note: string;
      date: Date;
    }

    function formatNotesForReport(notes: AssessmentNote[]): string {
      if (notes.length === 0) {
        return 'No recent assessment notes.';
      }

      const formatted = notes.map(n => {
        const dateStr = n.date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `• "${n.note}" (${dateStr})`;
      });

      return `Recent Notes:\n${formatted.join('\n')}`;
    }

    const notes: AssessmentNote[] = [
      { note: 'Improving in reading comprehension', date: new Date('2024-10-15') },
      { note: 'Great participation in math', date: new Date('2024-10-10') },
      { note: 'Needs support with writing', date: new Date('2024-10-05') }
    ];

    const formatted = formatNotesForReport(notes);

    expect(formatted).toContain('Recent Notes:');
    expect(formatted).toContain('• "Improving in reading comprehension" (Oct 15)');
    expect(formatted).toContain('• "Great participation in math" (Oct 10)');
    expect(formatted).toContain('• "Needs support with writing" (Oct 5)');
  });
});