/**
 * TRUE TDD: Weekly Schedule Feature
 * Step 2: We need to move lessons to different times
 * 
 * Growing from step 1, we discover we need to reschedule
 */

import { describe, it, expect } from 'vitest';

interface ScheduledLesson {
  id: string;
  day: string;
  time: string;
}

function rescheduleLesson(
  lesson: ScheduledLesson, 
  newDay: string, 
  newTime: string
): ScheduledLesson {
  return {
    ...lesson,
    day: newDay,
    time: newTime
  };
}

describe('Step 2: Rescheduling a lesson', () => {
  it('should move a lesson to a new time slot', () => {
    const lesson: ScheduledLesson = {
      id: 'lesson-1',
      day: 'Monday',
      time: '09:00'
    };
    
    const rescheduled = rescheduleLesson(lesson, 'Tuesday', '10:00');
    
    expect(rescheduled.day).toBe('Tuesday');
    expect(rescheduled.time).toBe('10:00');
    expect(rescheduled.id).toBe('lesson-1'); // ID remains the same
  });
});