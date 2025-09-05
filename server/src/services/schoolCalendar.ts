import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { format, parseISO } from 'date-fns';

interface ScheduleEntry {
  date: string;
  time: string;
  subject: string;
  lesson_id: string;
  title: string;
}

interface TeachingDay {
  date: string;
  dateObj: Date;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  subjects: string[];
}

interface SubjectRotation {
  slot1: string; // French
  slot2: string; // Math  
  slot3: string; // Science
  slot4: string; // Arts
  slot5: string; // Alternating Social Studies/Health
}

export class SchoolCalendarService {
  private teachingDays: TeachingDay[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;

    try {
      // Load Emily's yearly schedule
      const schedulePath = join(process.cwd(), 'emily-yearly-schedule.json');
      
      // CRITICAL FIX: Add validation for file existence
      if (!existsSync(schedulePath)) {
        throw new Error(`School calendar file not found: ${schedulePath}`);
      }
      
      const scheduleData: ScheduleEntry[] = JSON.parse(readFileSync(schedulePath, 'utf-8'));
      
      // Validate that we have data
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        throw new Error('School calendar file is empty or invalid');
      }

      // Extract unique teaching days and organize by subjects
      const dayMap = new Map<string, TeachingDay>();

      for (const entry of scheduleData) {
        if (!dayMap.has(entry.date)) {
          const dateObj = parseISO(entry.date);
          dayMap.set(entry.date, {
            date: entry.date,
            dateObj,
            dayOfWeek: dateObj.getDay() === 0 ? 7 : dateObj.getDay(), // Convert Sunday=0 to Sunday=7
            subjects: []
          });
        }
        
        const day = dayMap.get(entry.date)!;
        if (!day.subjects.includes(entry.subject)) {
          day.subjects.push(entry.subject);
        }
      }

      // Convert to sorted array
      this.teachingDays = Array.from(dayMap.values()).sort(
        (a, b) => a.dateObj.getTime() - b.dateObj.getTime()
      );
      
      // Validate we have a reasonable number of teaching days
      if (this.teachingDays.length < 180 || this.teachingDays.length > 200) {
        console.warn(`Unusual number of teaching days: ${this.teachingDays.length}`);
      }

      this.initialized = true;
      console.log(`📅 School calendar initialized: ${this.teachingDays.length} teaching days`);
    } catch (error) {
      console.error('CRITICAL: Failed to initialize school calendar:', error);
      // Set empty teaching days to prevent complete failure
      this.teachingDays = [];
      this.initialized = false;
      throw new Error(`School calendar initialization failed: ${error.message}`);
    }
  }

  /**
   * Get all teaching days for the school year
   */
  getTeachingDays(): TeachingDay[] {
    return [...this.teachingDays];
  }

  /**
   * Get teaching days within a date range
   */
  getTeachingDaysInRange(startDate: Date, endDate: Date): TeachingDay[] {
    return this.teachingDays.filter(day => 
      day.dateObj >= startDate && day.dateObj <= endDate
    );
  }

  /**
   * Get the next N teaching days starting from a specific date
   */
  getNextTeachingDays(startDate: Date, count: number): TeachingDay[] {
    const startIndex = this.teachingDays.findIndex(day => 
      day.dateObj >= startDate
    );
    
    if (startIndex === -1) return [];
    
    return this.teachingDays.slice(startIndex, startIndex + count);
  }

  /**
   * Get teaching day by date string (YYYY-MM-DD)
   */
  getTeachingDay(dateString: string): TeachingDay | undefined {
    return this.teachingDays.find(day => day.date === dateString);
  }

  /**
   * Check if a date is a valid teaching day
   */
  isTeachingDay(dateString: string): boolean {
    return this.getTeachingDay(dateString) !== undefined;
  }

  /**
   * Get the total number of teaching days
   */
  getTotalTeachingDays(): number {
    return this.teachingDays.length;
  }

  /**
   * Get teaching days for a specific subject's optimal scheduling
   * Based on Emily's daily pattern: 5 lessons per day with alternating subjects
   */
  getSchedulingPattern(): {
    dailySubjects: string[];
    alternatingSubjects: string[];
    totalDays: number;
  } {
    return {
      dailySubjects: [
        'Français (Immersion)',     // Slot 1: Daily (188 lessons)
        'Mathématiques',           // Slot 2: Daily (188 lessons)  
        'Sciences de la nature',   // Slot 3: Daily (188 lessons)
        'Arts visuels'            // Slot 4: Daily (188 lessons)
      ],
      alternatingSubjects: [
        'Sciences humaines',              // Slot 5: Every other day (~94 lessons)
        'Formation personnelle et sociale' // Slot 5: Every other day (~94 lessons)
      ],
      totalDays: this.teachingDays.length
    };
  }

  /**
   * Get dates for scheduling a specific number of lessons for a subject
   * with proper distribution across the school year
   */
  getSchedulingDates(subjectType: 'daily' | 'alternating', lessonCount: number): string[] {
    const dates: string[] = [];
    
    if (subjectType === 'daily') {
      // For daily subjects, use all teaching days up to lessonCount
      const availableDays = this.teachingDays.slice(0, Math.min(lessonCount, this.teachingDays.length));
      return availableDays.map(day => day.date);
    } else {
      // For alternating subjects, use every other day
      for (let i = 0; i < this.teachingDays.length && dates.length < lessonCount; i += 2) {
        dates.push(this.teachingDays[i].date);
      }
    }
    
    return dates;
  }

  /**
   * Get optimal distribution dates for a unit's lessons
   * Spreads lessons evenly across available teaching days
   */
  getUnitDistributionDates(unitLessonCount: number, subjectType: 'daily' | 'alternating'): string[] {
    const totalDays = subjectType === 'daily' ? this.teachingDays.length : Math.floor(this.teachingDays.length / 2);
    
    if (unitLessonCount >= totalDays) {
      // If we need more lessons than available days, use consecutive days
      return this.getSchedulingDates(subjectType, unitLessonCount);
    }

    // Calculate spacing to distribute lessons evenly
    const spacing = Math.floor(totalDays / unitLessonCount);
    const dates: string[] = [];
    
    const availableDays = subjectType === 'daily' 
      ? this.teachingDays 
      : this.teachingDays.filter((_, index) => index % 2 === 0);

    for (let i = 0; i < unitLessonCount && i * spacing < availableDays.length; i++) {
      const dayIndex = i * spacing;
      dates.push(availableDays[dayIndex].date);
    }
    
    return dates;
  }

  /**
   * Get school year summary
   */
  getSchoolYearSummary() {
    const startDay = this.teachingDays[0];
    const endDay = this.teachingDays[this.teachingDays.length - 1];
    
    return {
      startDate: startDay.date,
      endDate: endDay.date,
      totalTeachingDays: this.teachingDays.length,
      dateRange: `${format(startDay.dateObj, 'MMM d, yyyy')} - ${format(endDay.dateObj, 'MMM d, yyyy')}`,
      lessonsPerSubject: {
        daily: this.teachingDays.length,
        alternating: Math.floor(this.teachingDays.length / 2)
      }
    };
  }
}

// Export singleton instance
export const schoolCalendar = new SchoolCalendarService();