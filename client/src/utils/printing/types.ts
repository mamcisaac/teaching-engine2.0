/**
 * Print Types Module
 * 
 * TypeScript interfaces and types for print templates.
 * Centralizes all type definitions used across the printing system.
 */

// Core curriculum expectation interface
export interface CurriculumExpectation {
  expectation: {
    code: string;
    description: string;
  };
}

// Differentiation strategies interface
export interface DifferentiationStrategies {
  forStruggling?: string[];
  forAdvanced?: string[];
  forELL?: string[];
  forIEP?: string[];
}

// Unit Plan interface
export interface UnitPlan {
  title: string;
  titleFr?: string;
  description?: string;
  bigIdeas?: string;
  essentialQuestions?: string[];
  successCriteria?: string[];
  assessmentPlan?: string;
  keyVocabulary?: string[];
  startDate: Date;
  endDate: Date;
  estimatedHours?: number;
  crossCurricularConnections?: string;
  learningSkills?: string[];
  differentiationStrategies?: DifferentiationStrategies;
  expectations?: CurriculumExpectation[];
}

// Lesson Plan interface
export interface LessonPlan {
  title: string;
  date: Date;
  duration: number;
  learningGoals?: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;
  materials?: string[];
  grouping?: string;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: string;
  assessmentNotes?: string;
  isSubFriendly?: boolean;
  subNotes?: string;
  expectations?: CurriculumExpectation[];
}

// ETFO School Info interface for blank templates
export interface ETFOSchoolInfo {
  schoolName?: string;
  teacherName?: string;
  grade?: string;
  subject?: string;
  academicYear?: string;
}

// Optional Long Range Plan reference
export interface LongRangePlan {
  title: string;
}

// Optional Unit Plan reference
export interface UnitPlanReference {
  title: string;
}

// Print document options
export interface PrintOptions {
  filename?: string;
  openInNewWindow?: boolean;
  autoDownload?: boolean;
}

// Template generation result
export interface TemplateResult {
  html: string;
  title: string;
  filename: string;
}

// Theme configuration for document styling
export interface DocumentTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

// Template types enum
export const TemplateType = {
  UNIT_PLAN: 'unit_plan',
  LESSON_PLAN: 'lesson_plan',
  LONG_RANGE_PLAN: 'long_range_plan',
  ETFO_UNIT_PLAN: 'etfo_unit_plan',
  ETFO_LESSON_PLAN: 'etfo_lesson_plan',
  ETFO_DAYBOOK: 'etfo_daybook',
  ETFO_WEEKLY_OVERVIEW: 'etfo_weekly_overview'
} as const;

export type TemplateType = typeof TemplateType[keyof typeof TemplateType];

// Document metadata interface
export interface DocumentMetadata {
  title: string;
  type: TemplateType;
  generatedDate: Date;
  author?: string;
  version?: string;
}

// Print-specific utility types
export type OptionalString = string | undefined | null;
export type OptionalStringArray = string[] | undefined | null;
export type OptionalDate = Date | undefined | null;
export type OptionalNumber = number | undefined | null;