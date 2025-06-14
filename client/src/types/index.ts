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
