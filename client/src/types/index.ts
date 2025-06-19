// Common types used across the application

export interface Subject {
  id: number;
  name: string;
  milestones: Milestone[];
}

export interface Outcome {
  id: string;
  subject: string;
  grade: number;
  code: string;
  description: string;
  domain?: string | null;
}

export interface SmartGoal {
  id: number;
  outcomeId: string;
  milestoneId?: number | null;
  description: string;
  targetDate: string;
  targetValue: number;
  observedValue?: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  outcome: {
    id: string;
    code: string;
    description: string;
    subject: string;
    grade: number;
  };
  milestone?: {
    id: number;
    title: string;
  } | null;
  user: {
    id: number;
    name: string;
  };
}

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
  outcomes: Array<{
    outcome: {
      id: string;
      code: string;
      description: string;
      subject: string;
      grade: number;
    };
  }>;
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

export interface Milestone {
  id: number;
  title: string;
  subjectId: number;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  activities: Activity[];
  subject?: Subject;
  outcomes?: Array<{ outcome: Outcome }>;
  standardCodes?: string[];
}

export interface Activity {
  id: number;
  title: string;
  milestoneId: number;
  completedAt?: string | null;
  tags?: string[];
  durationMins?: number;
  materialsText?: string | null;
  milestone?: {
    id: number;
    subjectId: number;
    subject?: {
      id: number;
      name: string;
    };
  };
  outcomes?: Array<{
    outcome: Outcome;
  }>;
  cognatePairs?: Array<{
    cognatePair: {
      id: number;
      wordFr: string;
      wordEn: string;
      notes?: string | null;
    };
  }>;
}

export interface Resource {
  id: number;
  filename: string;
  url: string;
  type: string;
  size: number;
  activityId?: number | null;
  createdAt: string;
}

export interface MaterialList {
  id: number;
  weekStart: string;
  items: string[];
  prepared: boolean;
}

export interface WeeklyScheduleItem {
  id: number;
  day: number;
  slotId: number;
  activityId: number;
  activity: Activity;
  slot?: TimetableSlot;
}

export interface LessonPlan {
  id: number;
  weekStart: string;
  schedule: WeeklyScheduleItem[];
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
  activityId?: number | null;
  activity?: Activity | null;
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

export interface CompleteActivityResponse {
  activity: Activity;
  showNotePrompt: boolean;
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

export interface Note {
  id: number;
  content: string;
  public: boolean;
  activityId?: number | null;
  dailyPlanId?: number | null;
  createdAt: string;
}

export interface NoteDetail extends Note {
  activity?:
    | (Activity & {
        milestone: Milestone & { subject: Subject };
      })
    | null;
}

export interface NoteInput {
  content: string;
  type?: 'private' | 'public';
  activityId?: number;
  dailyPlanId?: number;
  milestoneId?: number;
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
  outcomes?: Array<{
    outcome: {
      id: string;
      code: string;
      description: string;
      subject: string;
      grade: number;
      domain?: string | null;
    };
  }>;
  activities?: Array<{
    activity: {
      id: number;
      title: string;
      titleEn?: string | null;
      titleFr?: string | null;
      tags?: string[];
      durationMins?: number | null;
      milestone?: {
        id: number;
        title: string;
        subject?: {
          id: number;
          name: string;
          nameEn?: string | null;
          nameFr?: string | null;
        };
      };
    };
  }>;
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
  linkedOutcomes?: Array<{
    outcome: {
      id: string;
      code: string;
      description: string;
      subject: string;
      grade: number;
      domain?: string | null;
    };
  }>;
  linkedActivities?: Array<{
    activity: {
      id: number;
      title: string;
      titleEn?: string | null;
      titleFr?: string | null;
      milestone?: {
        id: number;
        title: string;
        subject?: {
          id: number;
          name: string;
        };
      };
    };
  }>;
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
  linkedOutcomes?: string[];
  linkedActivities?: number[];
  userId: number;
}

export interface AssessmentTemplate {
  id: number;
  title: string;
  type: 'oral' | 'reading' | 'writing' | 'mixed';
  description?: string | null;
  outcomeIds: string[];
  rubricCriteria?: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  results?: AssessmentResult[];
  lastResult?: AssessmentResult | null;
  totalResults?: number;
}

export interface AssessmentResult {
  id: number;
  templateId: number;
  date: string;
  groupScore?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  template?: {
    title: string;
    type: string;
    outcomeIds: string[];
  };
}

export interface AssessmentInput {
  title: string;
  type: 'oral' | 'reading' | 'writing' | 'mixed';
  description?: string;
  outcomeIds: string[];
  rubricCriteria?: string;
}

export interface AssessmentResultInput {
  templateId: number;
  date: string;
  groupScore?: number;
  notes?: string;
}

export interface OutcomeAssessmentData {
  outcomeId: string;
  assessmentCount: number;
  totalResults: number;
  averageScore: number;
  lastAssessmentDate: string | null;
  assessments: Array<{
    id: number;
    title: string;
    type: string;
    resultCount: number;
    averageScore: number;
    lastResult: AssessmentResult | null;
  }>;
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
  linkedOutcomes?: Array<{
    outcome: Outcome;
  }>;
  linkedActivities?: Array<{
    activity: Activity;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResourceInput {
  title: string;
  tags?: string[];
  linkedOutcomeIds?: string[];
  linkedActivityIds?: number[];
}

export interface ParentMessage {
  id: number;
  userId: number;
  title: string;
  timeframe: string;
  contentFr: string;
  contentEn: string;
  linkedOutcomes?: Array<{
    outcome: Outcome;
  }>;
  linkedActivities?: Array<{
    activity: Activity;
  }>;
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
  linkedOutcomeIds?: string[];
  linkedActivityIds?: number[];
}

export interface ReflectionJournalEntry {
  id: number;
  userId: number;
  date: string;
  content: string;
  themeId?: number | null;
  theme?: ThematicUnit | null;
  assessmentId?: number | null;
  assessment?: (AssessmentResult & { template?: AssessmentTemplate }) | null;
  outcomes?: Array<{
    outcome: Outcome;
  }>;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface ReflectionInput {
  date: string;
  content: string;
  outcomeIds?: string[];
  themeId?: number;
  assessmentId?: number;
}

export interface ReflectionUpdate {
  date?: string;
  content?: string;
  outcomeIds?: string[];
  themeId?: number | null;
  assessmentId?: number | null;
}
