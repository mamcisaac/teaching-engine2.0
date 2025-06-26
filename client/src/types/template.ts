export type TemplateType = 'UNIT_PLAN' | 'LESSON_PLAN';

export type TemplateCategory = 
  | 'BY_SUBJECT'
  | 'BY_GRADE' 
  | 'BY_THEME'
  | 'BY_SEASON'
  | 'BY_SKILL'
  | 'CUSTOM';

export interface TemplateAuthor {
  id: number;
  name: string;
}

export interface TemplateRating {
  id: string;
  userId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface TemplateVariation {
  id: string;
  templateId: string;
  name: string;
  nameFr?: string;
  description?: string;
  modificationNotes?: string;
  content: any;
  createdAt: string;
}

export interface UnitPlanContent {
  overview?: string;
  learningGoals?: string[];
  bigIdeas?: string;
  essentialQuestions?: string[];
  assessments?: Array<{
    type: string;
    description: string;
    timing?: string;
  }>;
  activities?: any[];
  successCriteria?: string[];
  keyVocabulary?: string[];
  crossCurricularConnections?: string;
  differentiationStrategies?: {
    forStruggling?: string[];
    forAdvanced?: string[];
    forELL?: string[];
    forIEP?: string[];
  };
  culminatingTask?: string;
  priorKnowledge?: string;
  parentCommunicationPlan?: string;
  fieldTripsAndGuestSpeakers?: string;
  indigenousPerspectives?: string;
  environmentalEducation?: string;
  socialJusticeConnections?: string;
  technologyIntegration?: string;
  communityConnections?: string;
}

export interface LessonPlanContent {
  objectives?: string[];
  materials?: string[];
  mindsOn?: string;
  action?: string;
  consolidation?: string;
  grouping?: string;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: string;
  assessmentNotes?: string;
  duration?: number;
}

export interface UnitStructure {
  phases?: Array<{
    name: string;
    description?: string;
    estimatedDays?: number;
    learningGoals?: string[];
  }>;
  resources?: Array<{
    title: string;
    type: string;
    url?: string;
    notes?: string;
  }>;
}

export interface LessonStructure {
  duration?: number;
  sections?: Array<{
    name: string;
    description: string;
    timeAllocation?: number;
    activities?: string[];
  }>;
}

export interface PlanTemplate {
  id: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  tags: string[];
  keywords: string[];
  isSystem: boolean;
  createdByUserId?: number;
  isPublic: boolean;
  content: UnitPlanContent | LessonPlanContent;
  estimatedWeeks?: number;
  unitStructure?: UnitStructure;
  estimatedMinutes?: number;
  lessonStructure?: LessonStructure;
  usageCount: number;
  lastUsedAt?: string;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  createdByUser?: TemplateAuthor;
  ratings?: TemplateRating[];
  variations?: TemplateVariation[];
  _count?: {
    ratings: number;
    variations: number;
  };
}

export interface TemplateSearchOptions {
  type?: TemplateType;
  category?: TemplateCategory;
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  isSystem?: boolean;
  isPublic?: boolean;
  createdByUserId?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'title' | 'usageCount' | 'averageRating' | 'createdAt' | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TemplateSearchResult {
  templates: PlanTemplate[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TemplateCreateData {
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  tags?: string[];
  keywords?: string[];
  isPublic?: boolean;
  content: UnitPlanContent | LessonPlanContent;
  estimatedWeeks?: number;
  unitStructure?: UnitStructure;
  estimatedMinutes?: number;
  lessonStructure?: LessonStructure;
}

export interface AppliedTemplateData {
  template: {
    id: string;
    title: string;
    type: string;
    content: any;
    unitStructure?: UnitStructure;
    lessonStructure?: LessonStructure;
    estimatedWeeks?: number;
    estimatedMinutes?: number;
  };
  appliedContent: any;
}

export interface TemplateFilterOptions {
  subjects: string[];
  grades: number[];
  categories: TemplateCategory[];
  tags: string[];
}

export interface TemplateFormData {
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  gradeMin?: number;
  gradeMax?: number;
  tags: string[];
  keywords: string[];
  isPublic: boolean;
  content: UnitPlanContent | LessonPlanContent;
  estimatedWeeks?: number;
  unitStructure?: UnitStructure;
  estimatedMinutes?: number;
  lessonStructure?: LessonStructure;
}

// Type guards
export function isUnitPlanTemplate(template: PlanTemplate): template is PlanTemplate & { content: UnitPlanContent } {
  return template.type === 'UNIT_PLAN';
}

export function isLessonPlanTemplate(template: PlanTemplate): template is PlanTemplate & { content: LessonPlanContent } {
  return template.type === 'LESSON_PLAN';
}

export function isUnitPlanContent(content: any): content is UnitPlanContent {
  return content && typeof content === 'object' && 
    (content.overview !== undefined || content.bigIdeas !== undefined || content.learningGoals !== undefined);
}

export function isLessonPlanContent(content: any): content is LessonPlanContent {
  return content && typeof content === 'object' && 
    (content.objectives !== undefined || content.mindsOn !== undefined || content.action !== undefined);
}

// Template categories for display
export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; description: string }> = {
  BY_SUBJECT: {
    label: 'By Subject',
    description: 'Organized by curriculum subject area'
  },
  BY_GRADE: {
    label: 'By Grade',
    description: 'Organized by grade level'
  },
  BY_THEME: {
    label: 'By Theme',
    description: 'Organized around thematic topics'
  },
  BY_SEASON: {
    label: 'By Season',
    description: 'Organized by time of year or seasons'
  },
  BY_SKILL: {
    label: 'By Skill',
    description: 'Focused on specific skills development'
  },
  CUSTOM: {
    label: 'Custom',
    description: 'User-created custom templates'
  }
};

// Template types for display
export const TEMPLATE_TYPES: Record<TemplateType, { label: string; description: string; icon: string }> = {
  UNIT_PLAN: {
    label: 'Unit Plan',
    description: 'Multi-week unit planning template',
    icon: '📚'
  },
  LESSON_PLAN: {
    label: 'Lesson Plan',
    description: 'Single lesson planning template',
    icon: '📝'
  }
};

// All types and functions are exported individually
// No default export needed