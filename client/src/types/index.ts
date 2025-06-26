// Common types used across the application

export interface Subject {
  id: number;
  name: string;
}

// Re-export ETFO planning types from hooks
export type { 
  ETFOLessonPlan, 
  UnitPlan, 
  LongRangePlan, 
  CurriculumExpectation,
  DaybookEntry,
  ETFOLessonPlanResource,
  UnitPlanResource
} from '../hooks/useETFOPlanning';



export interface OralRoutineTemplate {
  id: number;
  title: string;
  titleEn?: string | null;
  titleFr?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  // Legacy outcomes removed - replaced with CurriculumExpectation model
  user: {
    id: number;
    name: string;
  };
  _count?: {
    dailyRoutines: number;
  };
  [key: string]: unknown;
}

export interface DailyOralRoutine {
  id: number;
  date: string;
  templateId: number;
  completed: boolean;
  notes?: string | null;
  participation?: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  template: OralRoutineTemplate;
  user: {
    id: number;
    name: string;
  };
}

export interface OralRoutineStats {
  totalRoutines: number;
  completedRoutines: number;
  completionRate: number;
  averageParticipation: number | null;
}




export interface MaterialList {
  id: number;
  weekStart: string;
  items: string[];
  prepared: boolean;
}



export interface TimetableSlot {
  id: number;
  day: number;
  startMin: number;
  endMin: number;
  subjectId?: number | null;
  subject?: Subject | null;
}

export interface DailyPlanItem {
  id: number;
  startMin: number;
  endMin: number;
  slotId?: number | null;
  notes?: string | null;
}

export interface DailyPlan {
  id: number;
  date: string;
  lessonPlanId: number;
  items: DailyPlanItem[];
}

export interface Newsletter {
  id: number;
  title: string;
  content: string;
  rawDraft?: string | null;
  polishedDraft?: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface TeacherPreferencesInput {
  teachingStyles: string[];
  pacePreference: string;
  prepTime: number;
  subPlanContacts?: Record<string, string>;
  subPlanProcedures?: string;
}

export interface Notification {
  id: number;
  message: string;
  type?: string;
  dueDate?: string;
  read: boolean;
  createdAt: string;
}

export interface YearPlanEntry {
  id: number;
  teacherId: number;
  entryType: 'UNIT' | 'ASSESSMENT' | 'EVENT';
  title: string;
  start: string;
  end: string;
  colorCode?: string | null;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  eventType: 'PD_DAY' | 'ASSEMBLY' | 'TRIP' | 'HOLIDAY' | 'CUSTOM';
  source: 'MANUAL' | 'ICAL_FEED' | 'SYSTEM';
}




export interface ThematicUnit {
  id: number;
  title: string;
  titleEn?: string | null;
  titleFr?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  startDate: string;
  endDate: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  // Legacy outcomes removed - replaced with CurriculumExpectation model
  // Legacy activities removed - replaced with ETFO lesson plan structure
  user?: {
    id: number;
    name: string;
  };
  [key: string]: unknown;
}

export interface CognatePair {
  id: number;
  wordFr: string;
  wordEn: string;
  notes?: string | null;
  userId: number;
  createdAt: string;
  // Legacy linked outcomes and activities removed
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CognateInput {
  wordFr: string;
  wordEn: string;
  notes?: string;
  // Legacy links removed
  userId: number;
}

export interface MediaResource {
  id: number;
  userId: number;
  title: string;
  filePath: string;
  fileType: 'image' | 'pdf' | 'video' | 'audio';
  fileSize?: number | null;
  mimeType?: string | null;
  tags: string[];
  // Legacy linked outcomes and activities removed
  createdAt: string;
  updatedAt: string;
}

export interface MediaResourceInput {
  title: string;
  tags?: string[];
  // Legacy link IDs removed
}

export interface ParentMessage {
  id: number;
  userId: number;
  title: string;
  timeframe: string;
  contentFr: string;
  contentEn: string;
  // Legacy linked outcomes and activities removed
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface ParentMessageInput {
  title: string;
  timeframe: string;
  contentFr: string;
  contentEn: string;
  // Legacy link IDs removed
}

export interface ReflectionJournalEntry {
  id: number;
  userId: number;
  date: string;
  content: string;
  themeId?: number | null;
  theme?: ThematicUnit | null;
  // Legacy outcomes removed
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
}


export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
  userId: number;
  parentContacts: ParentContact[];
  artifacts?: StudentArtifact[];
  reflections?: StudentReflection[];
  parentSummaries?: ParentSummary[];
  goals?: StudentGoal[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    artifacts: number;
    reflections: number;
    parentSummaries: number;
  };
  user?: {
    id: number;
    name: string;
  };
  // Legacy name field for backward compatibility
  name?: string;
}

export interface ReflectionInput {
  date: string;
  content: string;
  // Legacy outcome IDs removed
  themeId?: number;
}

export interface ReflectionUpdate {
  date?: string;
  content?: string;
  // Legacy outcome IDs removed
  themeId?: number | null;
}

export interface StudentGoal {
  id: number;
  studentId: number;
  text: string;
  // Legacy outcome ID removed
  themeId?: number | null;
  createdAt: string;
  status: 'active' | 'completed' | 'abandoned';
  // Legacy outcome removed
  theme?: ThematicUnit | null;
  student?: Student;
}

export interface StudentReflection {
  id: number;
  studentId: number;
  date?: string;
  content?: string; // New field for parent communication reflections
  text?: string | null; // Legacy field for goal-based reflections
  emoji?: string | null;
  voicePath?: string | null;
  // Legacy outcome ID removed
  themeId?: number | null;
  createdAt: string;
  // Legacy outcome removed
  theme?: ThematicUnit | null;
  student?: Student;
}

export interface TeacherReflection {
  id: number;
  content: string;
  // Legacy outcome ID removed
  userId: number;
  createdAt: string;
  updatedAt: string;
  // Legacy outcome removed
  user?: {
    id: number;
    name: string;
  };
}

export interface TeacherReflectionInput {
  content: string;
  // Legacy outcome ID removed
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  grade: number;
  parentContacts?: Array<{ name: string; email: string }>;
  // Legacy name field for backward compatibility
  name?: string;
}

export interface StudentGoalInput {
  text: string;
  // Legacy outcome ID removed
  themeId?: number;
  status?: 'active' | 'completed' | 'abandoned';
}

export interface StudentReflectionInput {
  date?: string;
  text?: string;
  emoji?: string;
  voicePath?: string;
  // Legacy outcome ID removed
  themeId?: number;
}

export interface ParentContact {
  id: number;
  name: string;
  email: string;
  studentId: number;
}

export interface StudentArtifact {
  id: number;
  studentId: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  outcomeIds: string;
  createdAt: string;
}

export interface ParentSummary {
  id: number;
  studentId: number;
  dateFrom: string;
  dateTo: string;
  focus: string;
  contentFr: string;
  contentEn: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentSummaryGeneration {
  french: string;
  english: string;
}

export interface GenerateParentSummaryRequest {
  studentId: number;
  from: string;
  to: string;
  focus?: string[];
}

export interface SaveParentSummaryRequest {
  studentId: number;
  dateFrom: string;
  dateTo: string;
  focus?: string[];
  contentFr: string;
  contentEn: string;
  isDraft?: boolean;
}
