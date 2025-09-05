/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 7: Autosave behavior
 * 
 * Discovering we need automatic saving to prevent data loss
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Step 7: Autosave functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should trigger save after a delay', () => {
    // Discovering we need autosave
    class AutoSaveReflection {
      private pendingChanges: any = null;
      private saveTimer: any = null;
      private saved: any[] = [];

      updateReflection(data: any) {
        this.pendingChanges = data;
        
        // Clear existing timer
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }
        
        // Set new timer for 2 seconds
        this.saveTimer = setTimeout(() => {
          this.save();
        }, 2000);
      }

      save() {
        if (this.pendingChanges) {
          this.saved.push(this.pendingChanges);
          this.pendingChanges = null;
        }
      }

      getSaved() {
        return this.saved;
      }
    }

    const autoSave = new AutoSaveReflection();
    autoSave.updateReflection({ lessonId: 'lesson-1', note: 'First note' });
    
    expect(autoSave.getSaved()).toHaveLength(0); // Not saved yet
    
    vi.advanceTimersByTime(2000);
    expect(autoSave.getSaved()).toHaveLength(1); // Now saved
  });

  it('should debounce rapid changes', () => {
    class AutoSaveReflection {
      private pendingChanges: any = null;
      private saveTimer: any = null;
      private saved: any[] = [];
      private saveCount = 0;

      updateReflection(data: any) {
        this.pendingChanges = data;
        
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(() => {
          this.save();
        }, 2000);
      }

      save() {
        if (this.pendingChanges) {
          this.saved.push(this.pendingChanges);
          this.pendingChanges = null;
          this.saveCount++;
        }
      }

      getSaveCount() {
        return this.saveCount;
      }

      getLastSaved() {
        return this.saved[this.saved.length - 1];
      }
    }

    const autoSave = new AutoSaveReflection();
    
    // Rapid changes
    autoSave.updateReflection({ note: 'First' });
    vi.advanceTimersByTime(500);
    autoSave.updateReflection({ note: 'Second' });
    vi.advanceTimersByTime(500);
    autoSave.updateReflection({ note: 'Third' });
    vi.advanceTimersByTime(500);
    autoSave.updateReflection({ note: 'Final version' });
    
    // Should not have saved yet
    expect(autoSave.getSaveCount()).toBe(0);
    
    // Advance to trigger save
    vi.advanceTimersByTime(2000);
    
    // Should have saved only once with final version
    expect(autoSave.getSaveCount()).toBe(1);
    expect(autoSave.getLastSaved().note).toBe('Final version');
  });
});