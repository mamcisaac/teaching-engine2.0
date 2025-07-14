/**
 * Type definitions for template data operations
 */

// Base template data types
export interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  preferredLanguage: string | null;
}

export interface UserTemplateData {
  id: number;
  name: string | null;
  email: string;
  role: string;
  className: string;
  schoolName: string;
  schoolPhone?: string;
  classWebsite?: string;
  preferredLanguage: string | null;
}

export interface UserPreferences {
  className?: string;
  grade?: string;
  schoolName?: string;
  schoolPhone?: string;
  classWebsite?: string;
}

export interface Student {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  grade: string;
  active: boolean;
  goals?: StudentGoal[];
  reflections?: StudentReflection[];
}

export interface StudentGoal {
  id: number;
  studentId: number;
  description: string;
  active: boolean;
  createdAt: Date;
}

export interface StudentReflection {
  id: number;
  studentId: number;
  content: string;
  date: Date;
}

export interface LessonTemplateData {
  id: number;
  title: string;
  date: Date;
  subject: string;
  grade?: string;
  duration?: number;
  unit?: {
    title: string;
    week: number;
  } | null;
  learningGoals: string | null;
  materials: string | null;
  mindsOn: string | null;
  action: string | null;
  consolidation: string | null;
  grouping: string | null;
  assessmentType: string | null;
  assessmentNotes: string | null;
  accommodations: string | null;
  modifications: string | null;
  extensions: string | null;
  expectations?: ExpectationReference[];
}

export interface ExpectationReference {
  code: string;
  description: string;
  type: 'overall' | 'specific';
}

export interface CurriculumExpectation {
  id: number;
  code: string;
  description: string;
  grade: string;
  subject: string;
  strand: string;
  isActive: boolean;
}

export interface GroupedExpectations {
  overall: CurriculumExpectation[];
  specific: CurriculumExpectation[];
}

export interface AssessmentData {
  overall: unknown[];
  specific: unknown[];
}

export interface ReportPeriodData {
  name: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export interface AttendanceData {
  absent: number;
  late: number;
  present: number;
}

export interface SubjectSummary {
  subject: string;
  summary: string;
  highlights: string[];
}

export interface NewsletterData {
  lessons: LessonTemplateData[];
  subjectSummaries: SubjectSummary[];
  achievements: string[];
  upcomingEvents: unknown[];
  weekStart: Date;
  weekEnd: Date;
  openingMessage: string;
  nextWeekPreview: string[];
  parentInfo: {
    suggestions: string[];
  };
}

export interface DaybookEntry {
  id: number;
  userId: number;
  date: Date;
  notableAchievements: string | null;
}

// Database query filter types
export interface LessonFilterOptions {
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  subject?: string;
}

export interface StudentFilterOptions {
  studentId?: number;
  grade?: string;
}

export interface CurriculumFilterOptions {
  subjectId?: number;
  grade?: string;
  strand?: string;
}

export interface CustomDataFilters {
  periodName?: string;
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  totalDays?: number;
}

// Prisma query where clauses
export interface LessonWhereInput {
  userId: number;
  date?: {
    gte: Date;
    lte: Date;
  };
  subject?: string;
}

export interface StudentWhereInput {
  userId: number;
  active: boolean;
  id?: number;
  grade?: string;
}

export interface CurriculumWhereInput {
  isActive: boolean;
  subjectId?: number;
  grade?: string;
  strand?: string;
}