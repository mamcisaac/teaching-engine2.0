import { apiClient as api } from '../../core/client';

export interface StartNextUnitResponse {
  success: boolean;
  message: string;
  data: {
    unitId: string;
    unitTitle: string;
    subject: string;
    lessonsScheduled: number;
    updates: Array<{
      lessonId: string;
      date: string;
      slotNumber: number;
    }>;
    dateRange: {
      start: string;
      end: string;
    };
  };
}


export interface ScheduleAllLessonsResponse {
  success: boolean;
  message: string;
  data: {
    totalLessonsScheduled: number;
    unitResults: Array<{
      unitId: string;
      unitTitle: string;
      subject: string;
      lessonsScheduled: number;
      dateRange: {
        start: string;
        end: string;
      };
    }>;
    summary: {
      startDate: string;
      endDate: string;
      totalTeachingDays: number;
      dateRange: string;
    };
  };
}

export interface SchedulingStats {
  total: number;
  scheduled: number;
  unscheduled: number;
  bySubject: Array<{
    subject: string;
    _count: {
      id: number;
    };
  }>;
  completionPercentage: number;
}

/**
 * Start scheduling the next unscheduled unit for a subject
 */
export async function startNextUnit(subject: string): Promise<StartNextUnitResponse> {
  const response = await api.post<StartNextUnitResponse>('/api/schedule/start-next-unit', {
    subject
  });
  return response.data;
}

/**
 * Schedule a specific unit by ID
 */
export async function scheduleUnit(unitId: string): Promise<StartNextUnitResponse> {
  const response = await api.post<StartNextUnitResponse>('/api/schedule/schedule-unit', {
    unitId
  });
  return response.data;
}

/**
 * Schedule all unscheduled lessons across all subjects
 */
export async function scheduleAllLessons(): Promise<ScheduleAllLessonsResponse> {
  const response = await api.post<ScheduleAllLessonsResponse>('/api/schedule/schedule-all-lessons');
  return response.data;
}

/**
 * Get current scheduling statistics
 */
export async function getSchedulingStats(): Promise<{ success: boolean; data: SchedulingStats }> {
  const response = await api.get<{ success: boolean; data: SchedulingStats }>('/api/schedule/stats');
  return response.data;
}

export interface CalendarSummaryData {
  totalDays: number;
  schoolDays: number;
  holidays: number;
  pdDays: number;
  startDate: string;
  endDate: string;
}

/**
 * Get school calendar summary
 */
export async function getCalendarSummary(): Promise<{ success: boolean; data: CalendarSummaryData }> {
  const response = await api.get<{ success: boolean; data: CalendarSummaryData }>('/api/schedule/calendar-summary');
  return response.data;
}