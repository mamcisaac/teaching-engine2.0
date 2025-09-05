/**
 * TRUE TDD: Anecdotal Notes & Conference Log
 * Step 6: Auto-save functionality
 * 
 * Discovering we need automatic saving to prevent data loss during circulation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Step 6: Auto-save for anecdotal notes', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should auto-save after 2 seconds of no typing', () => {
    // Discovering we need auto-save during classroom circulation
    class AutoSaveNotes {
      private draft: string = '';
      private savedNotes: any[] = [];
      private saveTimer: any = null;
      private studentId: string | null = null;

      startNote(studentId: string) {
        this.studentId = studentId;
        this.draft = '';
      }

      updateDraft(text: string) {
        this.draft = text;
        
        // Clear existing timer
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }
        
        // Set new timer for 2 seconds
        if (this.draft.length > 0) {
          this.saveTimer = setTimeout(() => {
            this.autoSave();
          }, 2000);
        }
      }

      autoSave() {
        if (this.draft && this.studentId) {
          this.savedNotes.push({
            studentId: this.studentId,
            text: this.draft,
            timestamp: new Date(),
            autoSaved: true
          });
        }
      }

      getSavedNotes() {
        return this.savedNotes;
      }
    }

    const autoSave = new AutoSaveNotes();
    autoSave.startNote('student-emma');
    autoSave.updateDraft('Needs support with');
    
    expect(autoSave.getSavedNotes()).toHaveLength(0);
    
    vi.advanceTimersByTime(2000);
    
    expect(autoSave.getSavedNotes()).toHaveLength(1);
    expect(autoSave.getSavedNotes()[0].text).toBe('Needs support with');
    expect(autoSave.getSavedNotes()[0].autoSaved).toBe(true);
  });

  it('should handle offline queue for syncing later', () => {
    class OfflineNoteQueue {
      private onlineStatus = true;
      private queue: any[] = [];
      private synced: any[] = [];

      setOnlineStatus(status: boolean) {
        this.onlineStatus = status;
        if (status) {
          this.syncQueue();
        }
      }

      saveNote(studentId: string, text: string) {
        const note = {
          studentId,
          text,
          timestamp: new Date(),
          synced: false
        };

        if (this.onlineStatus) {
          note.synced = true;
          this.synced.push(note);
        } else {
          this.queue.push(note);
        }

        return note;
      }

      syncQueue() {
        while (this.queue.length > 0) {
          const note = this.queue.shift();
          note.synced = true;
          this.synced.push(note);
        }
      }

      getQueueLength() {
        return this.queue.length;
      }

      getSyncedNotes() {
        return this.synced;
      }
    }

    const offlineQueue = new OfflineNoteQueue();
    
    // Save note while online
    offlineQueue.saveNote('student-emma', 'First observation');
    expect(offlineQueue.getSyncedNotes()).toHaveLength(1);
    
    // Go offline
    offlineQueue.setOnlineStatus(false);
    
    // Save notes while offline
    offlineQueue.saveNote('student-liam', 'Second observation');
    offlineQueue.saveNote('student-sarah', 'Third observation');
    
    expect(offlineQueue.getQueueLength()).toBe(2);
    expect(offlineQueue.getSyncedNotes()).toHaveLength(1); // Still just the first
    
    // Come back online
    offlineQueue.setOnlineStatus(true);
    
    // Queue should be synced
    expect(offlineQueue.getQueueLength()).toBe(0);
    expect(offlineQueue.getSyncedNotes()).toHaveLength(3);
  });
});