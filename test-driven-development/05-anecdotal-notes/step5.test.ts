/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 5: Quick note entry optimization
 * 
 * Discovering we need fast, minimal-friction note entry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Step 5: Quick note entry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should create note with minimal required information', () => {
    // Discovering we need quick entry with just student and text
    class QuickNoteEntry {
      createQuickNote(studentId: string, text: string) {
        if (!studentId || !text || text.trim().length === 0) {
          return null;
        }
        
        return {
          studentId,
          text: text.trim(),
          timestamp: new Date(),
          lessonId: null  // Can be added later
        };
      }
    }

    const quickNote = new QuickNoteEntry();
    const note = quickNote.createQuickNote('student-emma', '  Needs phonics support  ');
    
    expect(note).not.toBeNull();
    expect(note?.text).toBe('Needs phonics support'); // Trimmed
    expect(note?.timestamp).toBeDefined();
  });

  it('should measure note entry speed', () => {
    class QuickNoteTimer {
      private startTime: Date | null = null;
      
      startEntry() {
        this.startTime = new Date();
      }
      
      completeEntry(studentId: string, text: string) {
        if (!this.startTime) return null;
        
        const endTime = new Date();
        const durationMs = endTime.getTime() - this.startTime.getTime();
        
        return {
          studentId,
          text,
          timestamp: endTime,
          entryDurationSeconds: durationMs / 1000
        };
      }
    }

    const timer = new QuickNoteTimer();
    
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));
    timer.startEntry();
    
    // Simulate 8 seconds to type note
    vi.advanceTimersByTime(8000);
    
    const note = timer.completeEntry('student-emma', 'Struggling with /ou/ sound');
    
    expect(note?.entryDurationSeconds).toBe(8);
    expect(note?.entryDurationSeconds).toBeLessThan(10); // Goal: under 10 seconds
  });

  it('should support keyboard shortcuts for common phrases', () => {
    class QuickNoteShortcuts {
      private shortcuts: Map<string, string> = new Map([
        ['!wp', 'Working well with peers'],
        ['!help', 'Needs additional support with'],
        ['!exc', 'Excellent work on'],
        ['!str', 'Struggling with'],
        ['!imp', 'Showing improvement in']
      ]);
      
      expandShortcuts(text: string): string {
        let expanded = text;
        this.shortcuts.forEach((fullText, shortcut) => {
          expanded = expanded.replace(shortcut, fullText);
        });
        return expanded;
      }
      
      createNote(studentId: string, text: string) {
        return {
          studentId,
          text: this.expandShortcuts(text),
          timestamp: new Date()
        };
      }
    }

    const shortcuts = new QuickNoteShortcuts();
    
    const note1 = shortcuts.createNote('student-emma', '!str phonics');
    expect(note1.text).toBe('Struggling with phonics');
    
    const note2 = shortcuts.createNote('student-liam', '!exc !wp during group project');
    expect(note2.text).toBe('Excellent work on Working well with peers during group project');
  });
});