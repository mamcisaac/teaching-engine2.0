import { format, parse } from 'date-fns';
import type { LessonPlan } from '@shared/types';

export interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleConflict {
  lesson1: LessonPlan & { timeSlot: TimeSlot };
  lesson2: LessonPlan & { timeSlot: TimeSlot };
  type: 'overlap' | 'same-time';
  severity: 'high' | 'medium' | 'low';
}

export interface ScheduleSummary {
  totalLessons: number;
  totalHours: number;
  lessonsPerDay: Record<number, number>;
}

export class TimeSlotManager {
  // Parse time slot from lesson materials
  static parseTimeSlot(lesson: LessonPlan): TimeSlot | null {
    if (!lesson.materials) return null;
    
    try {
      const materials = JSON.parse(lesson.materials);
      if (materials.timeSlot) {
        return materials.timeSlot;
      }
    } catch {
      return null;
    }
    
    return null;
  }

  // Check if two lessons have conflicting time slots
  static hasConflict(lesson1: LessonPlan, lesson2: LessonPlan): boolean {
    const slot1 = this.parseTimeSlot(lesson1);
    const slot2 = this.parseTimeSlot(lesson2);
    
    if (!slot1 || !slot2) return false;
    if (slot1.dayOfWeek !== slot2.dayOfWeek) return false;
    
    const start1 = parse(slot1.startTime, 'HH:mm', new Date());
    const end1 = parse(slot1.endTime, 'HH:mm', new Date());
    const start2 = parse(slot2.startTime, 'HH:mm', new Date());
    const end2 = parse(slot2.endTime, 'HH:mm', new Date());
    
    // Check for overlap
    return (start1 < end2 && end1 > start2);
  }

  // Find all conflicts in a set of lessons
  static findConflicts(lessons: LessonPlan[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const lessonsWithSlots = lessons.filter(l => this.parseTimeSlot(l));
    
    for (let i = 0; i < lessonsWithSlots.length; i++) {
      for (let j = i + 1; j < lessonsWithSlots.length; j++) {
        if (this.hasConflict(lessonsWithSlots[i], lessonsWithSlots[j])) {
          const slot1 = this.parseTimeSlot(lessonsWithSlots[i])!;
          const slot2 = this.parseTimeSlot(lessonsWithSlots[j])!;
          
          const isSameTime = slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime;
          
          conflicts.push({
            lesson1: { ...lessonsWithSlots[i], timeSlot: slot1 },
            lesson2: { ...lessonsWithSlots[j], timeSlot: slot2 },
            type: isSameTime ? 'same-time' : 'overlap',
            severity: isSameTime ? 'high' : 'medium'
          });
        }
      }
    }
    
    return conflicts;
  }

  // Get available time slots for a day
  static getAvailableSlots(dayOfWeek: number, lessons: LessonPlan[]): TimeSlot[] {
    const occupiedSlots = lessons
      .map(l => this.parseTimeSlot(l))
      .filter((slot): slot is TimeSlot => slot !== null && slot.dayOfWeek === dayOfWeek);
    
    const allSlots: TimeSlot[] = [];
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
    
    for (const time of times) {
      const endTime = format(
        new Date(`2000-01-01T${time}`).getTime() + 45 * 60000,
        'HH:mm'
      );
      
      const slot: TimeSlot = {
        dayOfWeek,
        startTime: time,
        endTime
      };
      
      // Check if slot is occupied
      const isOccupied = occupiedSlots.some(occupied => 
        occupied.startTime === slot.startTime
      );
      
      if (!isOccupied) {
        allSlots.push(slot);
      }
    }
    
    return allSlots;
  }

  // Move a lesson to a new time slot
  static moveLesson(lesson: LessonPlan, newSlot: TimeSlot): LessonPlan {
    const materials = lesson.materials ? JSON.parse(lesson.materials) : {};
    materials.timeSlot = newSlot;
    
    return {
      ...lesson,
      materials: JSON.stringify(materials)
    };
  }

  // Get a summary of the weekly schedule
  static getScheduleSummary(lessons: LessonPlan[]): ScheduleSummary {
    const lessonsPerDay: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    let totalHours = 0;
    
    lessons.forEach(lesson => {
      const slot = this.parseTimeSlot(lesson);
      if (slot) {
        lessonsPerDay[slot.dayOfWeek] = (lessonsPerDay[slot.dayOfWeek] || 0) + 1;
        
        const start = parse(slot.startTime, 'HH:mm', new Date());
        const end = parse(slot.endTime, 'HH:mm', new Date());
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });
    
    return {
      totalLessons: lessons.length,
      totalHours,
      lessonsPerDay
    };
  }

  // Validate a time slot
  static isValidTimeSlot(slot: TimeSlot): boolean {
    // Check day of week
    if (slot.dayOfWeek < 1 || slot.dayOfWeek > 7) return false;
    
    // Check time format (HH:mm)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) return false;
    
    // Check that end time is after start time
    const start = parse(slot.startTime, 'HH:mm', new Date());
    const end = parse(slot.endTime, 'HH:mm', new Date());
    
    return end > start;
  }

  // Format a time slot for display
  static formatTimeSlot(slot: TimeSlot, use24Hour = false): string {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[slot.dayOfWeek];
    
    if (use24Hour) {
      return `${dayName} ${slot.startTime} - ${slot.endTime}`;
    }
    
    // Convert to 12-hour format
    const formatTime = (time: string) => {
      const date = parse(time, 'HH:mm', new Date());
      return format(date, 'h:mm a');
    };
    
    return `${dayName} ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
  }
}