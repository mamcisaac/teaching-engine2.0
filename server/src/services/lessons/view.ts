/**
 * View adapter for ETFOLessonPlan to provide computed fields
 * This adapter transforms database models to view models with derived fields
 * 
 * CRITICAL: This adapter is resilient and only uses fields that exist in Emily's DB
 * It uses feature detection to safely handle optional fields without assuming they exist
 */

import type { ETFOLessonPlan } from '@prisma/client';

export type LessonStatus = 'PLANNED' | 'SCHEDULED' | 'TAUGHT' | 'SKIPPED' | 'RESCHEDULED';

export interface LessonView extends ETFOLessonPlan {
  computedStatus?: LessonStatus;
  scheduledDate?: string | null;
}

/**
 * Transform a database lesson into a view model with computed fields
 * Uses runtime feature detection to safely derive status from available fields
 * ALWAYS falls back to 'PLANNED' if signals aren't present
 */
export function toLessonView(lesson: ETFOLessonPlan): LessonView {
  // Cast to any for safe runtime feature detection
  const row = lesson as any;
  
  // Start with the safest default
  let computedStatus: LessonStatus = 'PLANNED';
  
  // Only use fields we've confirmed exist in Emily's database
  // Check for scheduled signals (isScheduled and date both exist in DB)
  if (row.isScheduled && row.date) {
    // Only mark as scheduled if date is in the future
    try {
      const schedDate = new Date(row.date);
      if (schedDate > new Date()) {
        computedStatus = 'SCHEDULED';
      }
    } catch {
      // If date parsing fails, stay with PLANNED
    }
  }
  
  // Compute scheduledDate from existing fields
  // Use the 'date' field which exists in Emily's DB
  const scheduledDate = row.date ? 
    (typeof row.date === 'string' ? row.date : new Date(row.date).toISOString()) : 
    null;

  return {
    ...lesson,
    scheduledDate,
    computedStatus
  };
}

/**
 * Transform multiple lessons into view models
 */
export function toLessonViews(lessons: ETFOLessonPlan[]): LessonView[] {
  return lessons.map(toLessonView);
}

/**
 * Get a display-friendly status label
 */
export function getStatusLabel(status: LessonStatus): string {
  const labels: Record<LessonStatus, string> = {
    PLANNED: 'Planned',
    SCHEDULED: 'Scheduled',
    TAUGHT: 'Taught',
    SKIPPED: 'Skipped',
    RESCHEDULED: 'Rescheduled'
  };
  return labels[status] || status;
}

/**
 * Get a status color for UI display
 */
export function getStatusColor(status: LessonStatus): string {
  const colors: Record<LessonStatus, string> = {
    PLANNED: 'gray',
    SCHEDULED: 'blue',
    TAUGHT: 'green',
    SKIPPED: 'orange',
    RESCHEDULED: 'yellow'
  };
  return colors[status] || 'gray';
}