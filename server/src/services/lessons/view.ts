/**
 * View adapter for ETFOLessonPlan to provide computed fields
 * This adapter transforms database models to view models with derived fields
 * 
 * CRITICAL: This adapter is resilient and only uses fields that exist in Emily's DB
 * It uses feature detection to safely handle optional fields without assuming they exist
 */

import type { ETFOLessonPlan } from '@prisma/client';
import { logger } from '../../logger';

export type LessonStatus = 'PLANNED' | 'SCHEDULED' | 'TAUGHT' | 'SKIPPED' | 'RESCHEDULED';

// Enhanced LessonView type with French-first fields and parsed JSON
export type LessonView = {
  id: string;
  userId: number;
  unitPlanId?: string | null;

  // Labels
  title: string;             // titleFr || title || "Sans titre"
  subject?: string | null;
  grade?: number | null;
  language?: string | null;

  // Dates & scheduling
  date?: string | null;      // original ISO/string from DB
  duration?: number | null;
  lessonNumber?: number | null;
  slotNumber?: number | null;
  lessonType?: string | null;
  isScheduled?: number | boolean | null;

  // Three-part lesson
  learningGoals?: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;

  // Logistics
  materials?: string | null;
  grouping?: string | null;

  // Assessment
  assessmentType?: string | null;
  assessmentNotes?: string | null;

  // JSON pedagogy
  differentiation: string[];
  hooks: {
    vocabulary: string[];
    visualSupports: string[];
    movementBreaks: string[];
    other: string[];
  };
  reflectionActivities: string[];
  indigenousPerspectives: string[];

  // Supply
  isSubFriendly?: number | boolean | null;
  subNotes?: string | null;

  // Legacy computed fields
  computedStatus?: LessonStatus;
  scheduledDate?: string | null;

  // Curriculum expectations (preserved from database relations)
  expectations?: any;
};

// Helper to parse arrays from various formats
const parseArr = (val: unknown, fieldName?: string): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    try { 
      const j = JSON.parse(val); 
      if (Array.isArray(j)) return j.map(String).filter(Boolean);
    } catch (err) {
      if (fieldName) {
        logger.warn({ field: fieldName, error: err, sample: String(val).substring(0, 100) }, 
          'Failed to parse JSON array field, using text split fallback');
      }
    }
    return val.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
  }
  if (typeof val === 'object' && val !== null) {
    return Object.values(val as Record<string, unknown>).flat().map(String).filter(Boolean);
  }
  return [];
};

// Helper to parse engagement hooks
const parseHooks = (val: unknown, lessonId?: string) => {
  const empty = { vocabulary: [], visualSupports: [], movementBreaks: [], other: [] as string[] };
  if (!val) return empty;
  let obj: any = val;
  if (typeof val === 'string') { 
    try { 
      obj = JSON.parse(val); 
    } catch (err) { 
      logger.warn({ lessonId, error: err, sample: String(val).substring(0, 100) }, 
        'Failed to parse engagement hooks JSON, returning empty');
      return empty; 
    } 
  }
  return {
    vocabulary: parseArr(obj?.vocabulary, 'hooks.vocabulary'),
    visualSupports: parseArr(obj?.visualSupports, 'hooks.visualSupports'),
    movementBreaks: parseArr(obj?.movementBreaks, 'hooks.movementBreaks'),
    other: parseArr(obj?.other, 'hooks.other'),
  };
};

// Helper for French-first fallback
const frFirst = (fr?: string | null, en?: string | null, fallback = '—') =>
  (fr && fr.trim()) || (en && en.trim()) || fallback;

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
    id: String(row.id),
    userId: row.userId,
    unitPlanId: row.unitPlanId ?? null,

    title: frFirst(row.titleFr, row.title, 'Sans titre'),
    subject: row.subject ?? null,
    grade: row.grade ?? null,
    language: row.language ?? null,

    date: row.date ?? null,
    duration: row.duration ?? null,
    lessonNumber: row.lessonNumber ?? null,
    slotNumber: row.slotNumber ?? null,
    lessonType: row.lessonType ?? null,
    isScheduled: row.isScheduled ?? null,

    learningGoals: frFirst(row.learningGoalsFr, row.learningGoals, ''),
    mindsOn: frFirst(row.mindsOnFr, row.mindsOn, ''),
    action: frFirst(row.actionFr, row.action, ''),
    consolidation: frFirst(row.consolidationFr, row.consolidation, ''),

    materials: row.materials ?? null,
    grouping: row.grouping ?? null,

    assessmentType: row.assessmentType ?? null,
    assessmentNotes: row.assessmentNotes ?? null,

    differentiation: parseArr(row.differentiationStrategies, 'differentiationStrategies'),
    hooks: parseHooks(row.engagementHooks, String(row.id)),
    reflectionActivities: parseArr(row.reflectionActivities, 'reflectionActivities'),
    indigenousPerspectives: parseArr(row.indigenousPerspectives, 'indigenousPerspectives'),

    isSubFriendly: row.isSubFriendly ?? null,
    subNotes: row.subNotes ?? null,

    // Legacy computed fields
    scheduledDate,
    computedStatus,

    // Preserve expectations if they exist (from Prisma include)
    ...(row.expectations && { expectations: row.expectations })
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