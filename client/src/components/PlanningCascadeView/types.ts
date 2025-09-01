export type CascadeItemType = 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';

export interface CascadeSelection {
  type: CascadeItemType;
  id: string;
  data: any; // Flexible data structure for different types
}

export interface TreeNode {
  id: string;
  label: string;
  type: CascadeItemType;
  data: any;
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