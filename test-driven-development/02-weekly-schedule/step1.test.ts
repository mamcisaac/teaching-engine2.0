/**
 * TRUE TDD: Weekly Schedule Feature
 * Step 1: The simplest possible test
 * 
 * We need to represent lessons in a weekly schedule
 */

import { describe, it, expect } from 'vitest';

describe('Step 1: A lesson exists in time', () => {
  it('should have a day of the week', () => {
    const lesson = {
      day: 'Monday'
    };
    
    expect(lesson.day).toBe('Monday');
  });

  it('should have a time', () => {
    const lesson = {
      day: 'Monday',
      time: '09:00'
    };
    
    expect(lesson.time).toBe('09:00');
  });
});