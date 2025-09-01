export type CascadeItemType = 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';

// Define specific data types for each cascade item with flexibility for additional properties
export interface CurriculumData {
  id: string;
  name: string;
  code?: string;
  description?: string;
  descriptionFr?: string;
  grade?: number;
  subject?: string;
  strand?: string;
  coverage?: {
    totalUnits: number;
    completedUnits: number;
    totalLessons: number;
    completedLessons: number;
  };
  [key: string]: unknown; // Allow additional properties
}

export interface LRPData {
  id: string;
  name: string;
  title?: string;
  titleFr?: string;
  description?: string;
  theme?: string;
  themes?: string[];
  startDate?: string;
  endDate?: string;
  unitCount?: number;
  subject?: string;
  academicYear?: string;
  goals?: string[];
  progress?: {
    totalUnits: number;
    completedUnits: number;
    totalLessons: number;
    completedLessons: number;
  };
  [key: string]: unknown;
}

export interface UnitData {
  id: string;
  name: string;
  title?: string;
  titleFr?: string;
  description?: string;
  theme?: string;
  weeks?: number;
  lessonCount?: number;
  hoursAllocated?: number;
  estimatedHours?: number;
  startDate?: string;
  endDate?: string;
  bigIdeas?: string[];
  essentialQuestions?: string[];
  progress?: {
    totalLessons: number;
    completedLessons: number;
  };
  [key: string]: unknown;
}

export interface LessonData {
  id: string;
  title: string;
  titleFr?: string;
  subject?: string;
  duration?: number;
  isComplete?: boolean;
  [key: string]: unknown;
}

export interface DaybookData {
  id: string;
  date: string;
  whatWorked?: string;
  whatDidntWork?: string;
  [key: string]: unknown;
}

export type CascadeData = CurriculumData | LRPData | UnitData | LessonData | DaybookData;

export interface CascadeSelection {
  type: CascadeItemType;
  id: string;
  data: CascadeData;
}

export interface TreeNode {
  id: string;
  label: string;
  type: CascadeItemType;
  data: CascadeData;
  children?: TreeNode[];
  hasChildren: boolean;
  isExpanded?: boolean;
  progress?: {
    completed: number;
    total: number;
  };
}

export interface CascadeMetrics {
  totalExpectations: number;
  totalLRPs: number;
  totalUnits: number;
  completedLessons: number;
  totalLessons: number;
}

export interface CascadeFilters {
  academicYear?: string;
  subject?: string;
  grade?: number;
}