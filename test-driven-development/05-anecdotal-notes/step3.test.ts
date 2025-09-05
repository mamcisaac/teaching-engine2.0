/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 3: Notes need timestamps
 * 
 * Discovering we need to track when observations were made
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Step 3: Timestamped observations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should automatically timestamp when note is created', () => {
    // Discovering we need automatic timestamps
    function createNote(studentId: string, text: string) {
      return {
        studentId,
        text,
        timestamp: new Date()
      };
    }

    const now = new Date('2024-01-15T10:30:00');
    vi.setSystemTime(now);

    const note = createNote('student-emma', 'Excellent participation in French oral');
    expect(note.timestamp).toEqual(now);
  });

  it('should preserve chronological order of notes', () => {
    function createNote(studentId: string, text: string) {
      return {
        studentId,
        text,
        timestamp: new Date()
      };
    }

    const notes = [];
    
    vi.setSystemTime(new Date('2024-01-15T09:00:00'));
    notes.push(createNote('student-emma', 'Morning observation'));
    
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    notes.push(createNote('student-emma', 'Lunch observation'));
    
    vi.setSystemTime(new Date('2024-01-15T14:00:00'));
    notes.push(createNote('student-emma', 'Afternoon observation'));

    expect(notes[0].timestamp.getHours()).toBe(9);
    expect(notes[1].timestamp.getHours()).toBe(12);
    expect(notes[2].timestamp.getHours()).toBe(14);
    
    // Verify chronological order
    for (let i = 1; i < notes.length; i++) {
      expect(notes[i].timestamp.getTime()).toBeGreaterThan(notes[i-1].timestamp.getTime());
    }
  });

  it('should format timestamp for display', () => {
    function createNote(studentId: string, text: string) {
      const timestamp = new Date();
      return {
        studentId,
        text,
        timestamp,
        getDisplayTime() {
          return timestamp.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        }
      };
    }

    vi.setSystemTime(new Date('2024-01-15T14:30:00'));
    const note = createNote('student-emma', 'Observation');
    
    expect(note.getDisplayTime()).toBe('2:30 PM');
  });
});