/**
 * TRUE TDD: Per-Lesson Quick Reflections
 * Step 6: Need to store and retrieve reflections
 * 
 * Discovering we need persistence - memory/storage of reflections
 */

import { describe, it, expect } from 'vitest';

describe('Step 6: Storing and retrieving reflections', () => {
  it('should store a reflection and retrieve it', () => {
    // Discovering we need a storage mechanism
    class ReflectionTracker {
      private reflections = new Map<string, any>();

      addReflection(
        teacherId: number,
        lessonId: string,
        status: '👍' | '👌' | '👎',
        note?: string
      ) {
        const key = `${teacherId}-${lessonId}`;
        const reflection = {
          teacherId,
          lessonId,
          status,
          note: note || null,
          createdAt: new Date()
        };
        this.reflections.set(key, reflection);
        return reflection;
      }

      getReflection(teacherId: number, lessonId: string) {
        const key = `${teacherId}-${lessonId}`;
        return this.reflections.get(key) || null;
      }
    }

    const tracker = new ReflectionTracker();
    tracker.addReflection(1, 'lesson-1', '👍', 'Great engagement!');
    
    const retrieved = tracker.getReflection(1, 'lesson-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved.status).toBe('👍');
    expect(retrieved.note).toBe('Great engagement!');
  });

  it('should update existing reflection', () => {
    class ReflectionTracker {
      private reflections = new Map<string, any>();

      addReflection(
        teacherId: number,
        lessonId: string,
        status: '👍' | '👌' | '👎',
        note?: string
      ) {
        const key = `${teacherId}-${lessonId}`;
        const existing = this.reflections.get(key);
        
        const reflection = {
          teacherId,
          lessonId,
          status,
          note: note || null,
          createdAt: existing?.createdAt || new Date(),
          updatedAt: existing ? new Date() : null
        };
        
        this.reflections.set(key, reflection);
        return reflection;
      }

      getReflection(teacherId: number, lessonId: string) {
        const key = `${teacherId}-${lessonId}`;
        return this.reflections.get(key) || null;
      }
    }

    const tracker = new ReflectionTracker();
    tracker.addReflection(1, 'lesson-1', '👌');
    tracker.addReflection(1, 'lesson-1', '👍', 'Improved on second attempt');
    
    const reflection = tracker.getReflection(1, 'lesson-1');
    expect(reflection.status).toBe('👍');
    expect(reflection.note).toBe('Improved on second attempt');
    expect(reflection.updatedAt).not.toBeNull();
  });
});