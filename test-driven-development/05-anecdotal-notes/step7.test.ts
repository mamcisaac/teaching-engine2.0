/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 7: Viewing note history
 * 
 * Discovering we need to view all observations for a student chronologically
 */

import { describe, it, expect } from 'vitest';

describe('Step 7: Student observation history', () => {
  it('should retrieve all notes for a specific student', () => {
    // Discovering we need note retrieval by student
    class StudentNoteHistory {
      private notes: any[] = [];

      addNote(studentId: string, text: string, timestamp: Date) {
        this.notes.push({ studentId, text, timestamp });
      }

      getStudentNotes(studentId: string) {
        return this.notes
          .filter(n => n.studentId === studentId)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
    }

    const history = new StudentNoteHistory();
    
    history.addNote('student-emma', 'Day 1 observation', new Date('2024-01-01'));
    history.addNote('student-liam', 'Liam observation', new Date('2024-01-02'));
    history.addNote('student-emma', 'Day 3 observation', new Date('2024-01-03'));
    history.addNote('student-emma', 'Day 2 observation', new Date('2024-01-02'));

    const emmaNotes = history.getStudentNotes('student-emma');
    
    expect(emmaNotes).toHaveLength(3);
    expect(emmaNotes[0].text).toBe('Day 1 observation');
    expect(emmaNotes[1].text).toBe('Day 2 observation');
    expect(emmaNotes[2].text).toBe('Day 3 observation');
  });

  it('should filter notes by date range', () => {
    class StudentNoteHistory {
      private notes: any[] = [];

      addNote(studentId: string, text: string, timestamp: Date) {
        this.notes.push({ studentId, text, timestamp });
      }

      getNotesInRange(studentId: string, startDate: Date, endDate: Date) {
        return this.notes
          .filter(n => 
            n.studentId === studentId &&
            n.timestamp >= startDate &&
            n.timestamp <= endDate
          )
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }
    }

    const history = new StudentNoteHistory();
    
    // Add notes across multiple weeks
    history.addNote('student-emma', 'Week 1', new Date('2024-01-08'));
    history.addNote('student-emma', 'Week 2 - Monday', new Date('2024-01-15'));
    history.addNote('student-emma', 'Week 2 - Wednesday', new Date('2024-01-17'));
    history.addNote('student-emma', 'Week 3', new Date('2024-01-22'));

    const weekTwoNotes = history.getNotesInRange(
      'student-emma',
      new Date('2024-01-15'),
      new Date('2024-01-19')
    );
    
    expect(weekTwoNotes).toHaveLength(2);
    expect(weekTwoNotes[0].text).toBe('Week 2 - Monday');
    expect(weekTwoNotes[1].text).toBe('Week 2 - Wednesday');
  });

  it('should search notes by keyword', () => {
    class StudentNoteSearch {
      private notes: any[] = [];

      addNote(studentId: string, text: string, timestamp: Date) {
        this.notes.push({ studentId, text, timestamp });
      }

      searchNotes(studentId: string, keyword: string) {
        const lowerKeyword = keyword.toLowerCase();
        return this.notes.filter(n => 
          n.studentId === studentId &&
          n.text.toLowerCase().includes(lowerKeyword)
        );
      }
    }

    const search = new StudentNoteSearch();
    
    search.addNote('student-emma', 'Struggling with phonics', new Date());
    search.addNote('student-emma', 'Great at math today', new Date());
    search.addNote('student-emma', 'Needs support with phonics sounds', new Date());
    search.addNote('student-emma', 'Excellent reading comprehension', new Date());

    const phonicsNotes = search.searchNotes('student-emma', 'phonics');
    
    expect(phonicsNotes).toHaveLength(2);
    expect(phonicsNotes[0].text).toContain('phonics');
    expect(phonicsNotes[1].text).toContain('phonics');
  });
});