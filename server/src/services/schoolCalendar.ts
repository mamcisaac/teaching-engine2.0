import { readFile } from 'fs/promises';
import { join } from 'path';
import { access } from 'fs/promises';

import { format, parseISO } from 'date-fns';

import { logger } from '../logger';

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

// Unused interface - removed to fix TypeScript warnings

export class SchoolCalendarService {
  private teachingDays: TeachingDay[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // No initialization at construction time
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      // Load Emily's yearly schedule
      const schedulePath = join(process.cwd(), 'emily-yearly-schedule.json');
      
      // Check file existence with async method
      try {
        await access(schedulePath);
      } catch {
        throw new Error(`School calendar file not found: ${schedulePath}`);
      }
      
      // Use async file reading
      const fileContent = await readFile(schedulePath, 'utf-8');
      const scheduleData: ScheduleEntry[] = JSON.parse(fileContent);
      
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
        logger.warn(`Unusual number of teaching days: ${this.teachingDays.length}`);
      }

      this.initialized = true;
      logger.info(`📅 School calendar initialized: ${this.teachingDays.length} teaching days`);
    } catch (error) {
      logger.error('CRITICAL: Failed to initialize school calendar:', error instanceof Error ? error.message : String(error));
      // Set empty teaching days to prevent complete failure
      this.teachingDays = [];
      this.initialized = false;
      throw new Error(`School calendar initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensure service is initialized before use with proper locking
   */
  private async ensureInitialized() {
    if (this.initialized) return;
    
    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }
    
    await this.initPromise;
  }

  /**
   * Get all teaching days for the school year
   */
  async getTeachingDays(): Promise<TeachingDay[]> {
    await this.ensureInitialized();
    return [...this.teachingDays];
  }

  /**
   * Get teaching days within a date range
   */
  async getTeachingDaysInRange(startDate: Date, endDate: Date): Promise<TeachingDay[]> {
    await this.ensureInitialized();
    return this.teachingDays.filter(day => 
      day.dateObj >= startDate && day.dateObj <= endDate
    );
  }

  /**
   * Get the next N teaching days starting from a specific date
   */
  async getNextTeachingDays(startDate: Date, count: number): Promise<TeachingDay[]> {
    await this.ensureInitialized();
    const startIndex = this.teachingDays.findIndex(day => 
      day.dateObj >= startDate
    );
    
    if (startIndex === -1) return [];
    
    return this.teachingDays.slice(startIndex, startIndex + count);
  }

  /**
   * Get teaching day by date string (YYYY-MM-DD)
   */
  async getTeachingDay(dateString: string): Promise<TeachingDay | undefined> {
    await this.ensureInitialized();
    return this.teachingDays.find(day => day.date === dateString);
  }

  /**
   * Check if a date is a valid teaching day
   */
  async isTeachingDay(dateString: string): Promise<boolean> {
    const day = await this.getTeachingDay(dateString);
    return day !== undefined;
  }

  /**
   * Get the total number of teaching days
   */
  async getTotalTeachingDays(): Promise<number> {
    await this.ensureInitialized();
    return this.teachingDays.length;
  }

  /**
   * Get teaching days for a specific subject's optimal scheduling
   * Based on Emily's daily pattern: 5 lessons per day with alternating subjects
   */
  async getSchedulingPattern(): Promise<{
    dailySubjects: string[];
    alternatingSubjects: string[];
    totalDays: number;
  }> {
    await this.ensureInitialized();
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
  async getSchedulingDates(subjectType: 'daily' | 'alternating', lessonCount: number): Promise<string[]> {
    await this.ensureInitialized();
    const dates: string[] = [];
    
    if (subjectType === 'daily') {
      // For daily subjects, use all teaching days up to lessonCount
      const availableDays = this.teachingDays.slice(0, Math.min(lessonCount, this.teachingDays.length));
      return availableDays.map(day => day.date);
    } else {
      // For alternating subjects, use every other day
      for (let i = 0; i < this.teachingDays.length && dates.length < lessonCount; i += 2) {
        dates.push(this.teachingDays[i]?.date || '');
      }
    }
    
    return dates;
  }

  /**
   * Get optimal distribution dates for a unit's lessons
   * Spreads lessons evenly across available teaching days
   */
  async getUnitDistributionDates(unitLessonCount: number, subjectType: 'daily' | 'alternating'): Promise<string[]> {
    await this.ensureInitialized();
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
      dates.push(availableDays[dayIndex]?.date || '');
    }
    
    return dates;
  }

  /**
   * Get school year summary
   */
  async getSchoolYearSummary() {
    await this.ensureInitialized();
    const startDay = this.teachingDays[0];
    const endDay = this.teachingDays[this.teachingDays.length - 1];
    
    if (!startDay || !endDay) {
      return {
        startDate: '',
        endDate: '',
        totalTeachingDays: 0,
        dateRange: 'No teaching days available',
        lessonsPerSubject: {
          daily: 0,
          alternating: 0
        }
      };
    }
    
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

// Lazy singleton pattern - no work at import time
let schoolCalendarInstance: SchoolCalendarService | null = null;

export function getSchoolCalendar(): SchoolCalendarService {
  if (!schoolCalendarInstance) {
    schoolCalendarInstance = new SchoolCalendarService();
  }
  return schoolCalendarInstance;
}

// Export named for cleaner imports
export const schoolCalendar = getSchoolCalendar;