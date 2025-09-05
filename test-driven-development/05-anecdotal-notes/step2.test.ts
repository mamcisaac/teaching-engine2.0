/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 2: Notes are associated with students
 * 
 * Discovering we need to link notes to specific students
 */

import { describe, it, expect } from 'vitest';

describe('Step 2: Student-specific notes', () => {
  it('should associate a note with a student', () => {
    // Discovering we need student association
    function createNote(studentId: string, text: string) {
      return {
        studentId,
        text
      };
    }

    const note = createNote('student-emma', 'Needs extra support with phonics');
    expect(note.studentId).toBe('student-emma');
    expect(note.text).toBe('Needs extra support with phonics');
  });

  it('should handle notes for multiple students', () => {
    function createNote(studentId: string, text: string) {
      return {
        studentId,
        text
      };
    }

    const emmaNote = createNote('student-emma', 'Great progress in reading');
    const liamNote = createNote('student-liam', 'Excellent problem solving');
    const sarahNote = createNote('student-sarah', 'Helping peers with math');

    expect(emmaNote.studentId).toBe('student-emma');
    expect(liamNote.studentId).toBe('student-liam');
    expect(sarahNote.studentId).toBe('student-sarah');
  });

  it('should support multiple notes per student', () => {
    function createNote(studentId: string, text: string) {
      return {
        studentId,
        text
      };
    }

    const notes = [
      createNote('student-emma', 'Morning: Struggled with new vocabulary'),
      createNote('student-emma', 'Afternoon: Breakthrough moment in math'),
      createNote('student-emma', 'Recess: Resolved conflict independently')
    ];

    const emmaNotes = notes.filter(n => n.studentId === 'student-emma');
    expect(emmaNotes).toHaveLength(3);
  });
});