// Planning-specific types
export interface LessonPlan {
  id?: number;
  weekStart: string;
  lessons: LessonPlanLesson[];
  theme?: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LessonPlanLesson {
  id?: number;
  subject: string;
  date: string;
  objectives: string[];
  activities: string[];
  materials: string[];
  assessment?: string;
  notes?: string;
}

export interface PlannerSuggestion {
  id: number;
  type: 'activity' | 'resource' | 'assessment';
  subject: string;
  title: string;
  description: string;
  materials?: string[];
  duration?: number;
  gradeLevel?: string;
  tags?: string[];
}