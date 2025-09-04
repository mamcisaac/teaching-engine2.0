/**
 * TRUE TDD: Weekly Schedule Feature
 * Step 3: We can't have two lessons at the same time
 * 
 * Growing from step 2, we discover we need conflict detection
 */

import { describe, it, expect } from 'vitest';

interface ScheduledLesson {
  id: string;
  day: string;
  time: string;
}

class WeeklySchedule {
  private lessons: ScheduledLesson[] = [];

  addLesson(lesson: ScheduledLesson): void {
    // Check for conflicts
    const hasConflict = this.lessons.some(
      existing => existing.day === lesson.day && existing.time === lesson.time
    );
    
    if (hasConflict) {
      throw new Error('Time slot already occupied');
    }
    
    this.lessons.push(lesson);
  }

  getLessons(): ScheduledLesson[] {
    return [...this.lessons];
  }

  hasConflict(day: string, time: string): boolean {
    return this.lessons.some(
      lesson => lesson.day === day && lesson.time === time
    );
  }
}

describe('Step 3: Preventing scheduling conflicts', () => {
  it('should add a lesson to an empty schedule', () => {
    const schedule = new WeeklySchedule();
    
    schedule.addLesson({
      id: 'lesson-1',
      day: 'Monday',
      time: '09:00'
    });
    
    expect(schedule.getLessons()).toHaveLength(1);
  });

  it('should prevent adding a lesson to an occupied time slot', () => {
    const schedule = new WeeklySchedule();
    
    schedule.addLesson({
      id: 'lesson-1',
      day: 'Monday',
      time: '09:00'
    });
    
    expect(() => {
      schedule.addLesson({
        id: 'lesson-2',
        day: 'Monday',
        time: '09:00'
      });
    }).toThrow('Time slot already occupied');
  });

  it('should allow adding lessons to different time slots', () => {
    const schedule = new WeeklySchedule();
    
    schedule.addLesson({
      id: 'lesson-1',
      day: 'Monday',
      time: '09:00'
    });
    
    schedule.addLesson({
      id: 'lesson-2',
      day: 'Monday',
      time: '10:00'
    });
    
    expect(schedule.getLessons()).toHaveLength(2);
  });

  it('should check if a time slot has a conflict', () => {
    const schedule = new WeeklySchedule();
    
    schedule.addLesson({
      id: 'lesson-1',
      day: 'Monday',
      time: '09:00'
    });
    
    expect(schedule.hasConflict('Monday', '09:00')).toBe(true);
    expect(schedule.hasConflict('Monday', '10:00')).toBe(false);
    expect(schedule.hasConflict('Tuesday', '09:00')).toBe(false);
  });
});