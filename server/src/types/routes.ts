/**
 * Type definitions for route handler data parameters
 */

// Common types
export interface ExpectationData {
  expectationId: string;
  coverage?: string;
}

export interface ResourceData {
  id?: string;
  title: string;
  type: string;
  url?: string;
  content?: string;
}

// Daybook Entry Types
export interface DaybookEntryCreateData {
  date: string | Date;
  lessonPlanId?: string;
  whatWorked?: string;
  whatDidntWork?: string;
  nextSteps?: string;
  classEngagement?: string;
  commonChallenges?: string;
  notableAchievements?: string;
  notes?: string;
  privateNotes?: string;
  whatWorkedFr?: string;
  whatDidntWorkFr?: string;
  nextStepsFr?: string;
  notesFr?: string;
  overallRating?: number;
  wouldReuseLesson?: boolean;
  expectations?: ExpectationData[];
}

export type DaybookEntryUpdateData = Partial<DaybookEntryCreateData>

// ETFO Lesson Plan Types
export interface ETFOLessonPlanCreateData {
  title: string;
  date: string | Date;
  unitPlanId: string;
  duration?: number;

  // Three-part lesson structure
  mindsOn?: string;
  mindsOnFr?: string;
  action?: string;
  actionFr?: string;
  consolidation?: string;
  consolidationFr?: string;

  // Planning details
  learningGoals?: string;
  learningGoalsFr?: string;
  materials?: string[];
  grouping?: string;

  // Bilingual support
  titleFr?: string;

  // Differentiation
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];

  // Assessment
  assessmentType?: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes?: string;

  // Substitute teacher support
  isSubFriendly?: boolean;
  subNotes?: string;

  // Curriculum expectations
  expectationIds?: string[];
}

export type ETFOLessonPlanUpdateData = Partial<ETFOLessonPlanCreateData>

// Unit Plan Types
export interface UnitPlanCreateData {
  title: string;
  longRangePlanId: string;
  description?: string;
  bigIdeas?: string;
  essentialQuestions?: string[];

  // Timeline
  startDate: string | Date;
  endDate: string | Date;
  estimatedHours?: number;

  // Bilingual support
  titleFr?: string;
  descriptionFr?: string;
  bigIdeasFr?: string;

  // Assessment
  assessmentPlan?: string;
  successCriteria?: string[];

  // ETFO-aligned fields
  crossCurricularConnections?: string;
  learningSkills?: string[];
  culminatingTask?: string;
  keyVocabulary?: string[];
  priorKnowledge?: string;
  parentCommunicationPlan?: string;
  fieldTripsAndGuestSpeakers?: string;
  differentiationStrategies?: string[];
  indigenousPerspectives?: string;
  environmentalEducation?: string;
  socialJusticeConnections?: string;
  technologyIntegration?: string;
  communityConnections?: string;

  // Relationships
  expectations?: ExpectationData[];
  expectationIds?: string[];
  resources?: ResourceData[];
}

export type UnitPlanUpdateData = Partial<UnitPlanCreateData>

// Substitute Plan Types
export interface SubstitutePlanCreateData {
  title: string;
  dateFor: string | Date;
  gradeLevel: string;
  subject: string;
  duration?: number;

  // Plan content
  objectives?: string;
  materials?: string;
  activities?: string;
  notes?: string;

  // Bilingual support
  titleFr?: string;
  objectivesFr?: string;
  materialsFr?: string;
  activitiesFr?: string;
  notesFr?: string;

  // Metadata
  isActive?: boolean;
  difficulty?: number;

  // Emergency contact info
  emergencyContacts?: string;
  classroomManagement?: string;
  importantNotes?: string;
}

export type SubstitutePlanUpdateData = Partial<SubstitutePlanCreateData>

// Template Types
export interface TemplateCreateData {
  title: string;
  type: string;
  category: string;
  subject: string;
  gradeMin: number;
  gradeMax: number;

  // Content
  description?: string;
  content?: string;

  // Bilingual support
  titleFr?: string;
  descriptionFr?: string;
  contentFr?: string;

  // Metadata
  isSystem?: boolean;
  tags?: string[];

  // Template-specific fields
  templateData?: Record<string, unknown>;
}

export type TemplateUpdateData = Partial<TemplateCreateData>

// Cache Types
export interface CacheData {
  key: string;
  value: unknown;
  ttl?: number;
  category?: 'user' | 'api' | 'curriculum' | 'static';
}

// Dashboard Metrics Types
export interface DashboardMetricsData {
  hits?: number;
  misses?: number;
  period?: string;
  metric?: string;
}

// AI Service Types
export interface AIServiceRequestData {
  request: string;
  title?: string;
  date?: string | Date;
  planType?: string;
  existingContent?: unknown;
}

// Curriculum Export Types
export interface CurriculumExportData {
  expectations?: unknown[];
  format?: string;
  options?: Record<string, unknown>;
}

// Curriculum Import Types
export interface CurriculumImportData {
  exportOptions?: Record<string, unknown>;
  searchOptions?: Record<string, unknown>;
}

// Curriculum Search Types
export interface CurriculumSearchData {
  query?: string;
  filters?: Record<string, unknown>;
  results?: string[];
}
