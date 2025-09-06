/**
 * Planning Cascade Types
 * Hierarchical curriculum planning from year to individual lessons
 */

export type PlanningLevel = 'year' | 'term' | 'unit' | 'week' | 'lesson';
export type PanicLevel = 'calm' | 'mild' | 'moderate' | 'high' | 'extreme';

export interface CascadeNode {
  id: string;
  type: PlanningLevel;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  subject: string;
  grade: number;
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  completionPercentage: number;
  children?: CascadeNode[];
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface LessonPlan {
  id: string;
  name: string;
  subject: string;
  grade: number;
  date: Date;
  duration: number;
  objectives: string[];
  activities: string[];
  materials: string[];
  assessment: string[];
  differentiation?: string[];
  homework?: string;
  notes?: string;
  unitId: string;
  weekId?: string;
  sequenceNumber: number;
  status: 'planned' | 'taught' | 'skipped' | 'rescheduled';
  panicLevel?: PanicLevel;
}

export interface YearPlan {
  id: string;
  year: string;
  grade: number;
  subjects: SubjectPlan[];
  totalWeeks: number;
  startDate: Date;
  endDate: Date;
  holidays: Holiday[];
  pdDays: Date[];
}

export interface SubjectPlan {
  id: string;
  subject: string;
  totalHours: number;
  terms: TermPlan[];
  curriculum: CurriculumExpectation[];
  yearlyObjectives: string[];
}

export interface TermPlan {
  id: string;
  termNumber: 1 | 2 | 3;
  name: string;
  startDate: Date;
  endDate: Date;
  units: UnitPlan[];
  assessments: Assessment[];
}

export interface UnitPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in hours
  weeks: WeekPlan[];
  objectives: string[];
  keyQuestions: string[];
  culminatingTask?: string;
  resources: string[];
  crossCurricular?: string[];
}

export interface WeekPlan {
  id: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  lessons: LessonPlan[];
  theme?: string;
  notes?: string;
}

export interface Holiday {
  name: string;
  startDate: Date;
  endDate: Date;
  type: 'holiday' | 'break' | 'pd_day' | 'other';
}

export interface Assessment {
  id: string;
  type: 'formative' | 'summative' | 'diagnostic';
  name: string;
  date: Date;
  weight?: number;
  description: string;
}

export interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
  subject: string;
  grade: number;
  strand?: string;
  subcategory?: string;
  covered: boolean;
  lessonIds: string[];
}

export interface PlanningPanic {
  level: PanicLevel;
  message: string;
  missingLessons: string[];
  uncoveredExpectations: string[];
  schedulingConflicts: string[];
  suggestions: string[];
}

export interface CascadeFilter {
  subjects?: string[];
  grades?: number[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: ('planned' | 'in_progress' | 'completed' | 'blocked')[];
  searchTerm?: string;
}

export interface CascadeViewOptions {
  collapsed: Set<string>;
  showCompleted: boolean;
  showBlocked: boolean;
  highlightOverdue: boolean;
  view: 'tree' | 'calendar' | 'list' | 'gantt';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'missing_lesson' | 'duplicate_lesson' | 'time_conflict' | 'missing_expectation' | 'sequence_gap';
  message: string;
  affectedItems: string[];
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  type: 'unbalanced_coverage' | 'rushed_unit' | 'sparse_assessment' | 'missing_differentiation';
  message: string;
  affectedItems: string[];
  suggestion?: string;
}

export interface CascadeStatistics {
  totalLessons: number;
  completedLessons: number;
  upcomingLessons: number;
  overdueItems: number;
  coveragePercentage: number;
  bySubject: {
    [subject: string]: {
      planned: number;
      completed: number;
      coverage: number;
    };
  };
  panicAreas: PlanningPanic[];
}

export interface TeacherPreferences {
  defaultLessonDuration: number;
  preferredPlanningView: 'tree' | 'calendar' | 'list' | 'gantt';
  autoSchedule: boolean;
  bufferTime: number; // minutes between lessons
  maxLessonsPerDay: number;
  preferredAssessmentFrequency: 'weekly' | 'biweekly' | 'monthly';
}

export interface ImportOptions {
  source: 'csv' | 'json' | 'planboard' | 'manual';
  overwriteExisting: boolean;
  mergeStrategy: 'replace' | 'append' | 'smart_merge';
  validateBeforeImport: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json' | 'csv';
  includeCompleted: boolean;
  includeCurriculum: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  groupBy: 'subject' | 'week' | 'unit' | 'none';
}