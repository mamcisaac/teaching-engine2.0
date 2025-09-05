/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 4: Notes can have lesson context
 * 
 * Discovering we need to track which lesson the observation occurred during
 */

import { describe, it, expect } from 'vitest';

describe('Step 4: Lesson context for notes', () => {
  it('should optionally associate note with a lesson', () => {
    // Discovering we need optional lesson context
    function createNote(
      studentId: string, 
      text: string,
      lessonId?: string
    ) {
      return {
        studentId,
        text,
        lessonId: lessonId || null,
        timestamp: new Date()
      };
    }

    const noteWithLesson = createNote(
      'student-emma', 
      'Great participation',
      'french-oral-lesson-5'
    );
    const noteWithoutLesson = createNote(
      'student-emma',
      'Helped classmate during recess'
    );

    expect(noteWithLesson.lessonId).toBe('french-oral-lesson-5');
    expect(noteWithoutLesson.lessonId).toBeNull();
  });

  it('should auto-populate lesson context when created during lesson', () => {
    // Simulating lesson context
    const currentLesson = {
      id: 'math-patterns-3',
      subject: 'Mathematics',
      title: 'Growing Patterns'
    };

    function createNoteInLessonContext(
      studentId: string,
      text: string,
      context?: { lessonId: string; subject: string }
    ) {
      return {
        studentId,
        text,
        lessonId: context?.lessonId || null,
        subject: context?.subject || null,
        timestamp: new Date()
      };
    }

    const note = createNoteInLessonContext(
      'student-emma',
      'Recognized pattern quickly',
      { lessonId: currentLesson.id, subject: currentLesson.subject }
    );

    expect(note.lessonId).toBe('math-patterns-3');
    expect(note.subject).toBe('Mathematics');
  });

  it('should group notes by lesson for review', () => {
    function createNote(studentId: string, text: string, lessonId?: string) {
      return {
        studentId,
        text,
        lessonId: lessonId || null,
        timestamp: new Date()
      };
    }

    const notes = [
      createNote('student-emma', 'Struggled with pronunciation', 'french-1'),
      createNote('student-liam', 'Excellent accent', 'french-1'),
      createNote('student-sarah', 'Needs support', 'french-1'),
      createNote('student-emma', 'Quick mental math', 'math-1'),
      createNote('student-emma', 'Playground incident', null)
    ];

    const frenchLessonNotes = notes.filter(n => n.lessonId === 'french-1');
    expect(frenchLessonNotes).toHaveLength(3);
    
    const mathLessonNotes = notes.filter(n => n.lessonId === 'math-1');
    expect(mathLessonNotes).toHaveLength(1);
    
    const nonLessonNotes = notes.filter(n => n.lessonId === null);
    expect(nonLessonNotes).toHaveLength(1);
  });
});