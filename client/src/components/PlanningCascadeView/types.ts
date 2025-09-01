import type { 
  CurriculumExpectation,
  CascadeLRP,
  CascadeUnit,
  CascadeLesson,
  DaybookEntry
} from '../../hooks/usePlanningCascade';

export type CascadeItemType = 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';

export interface CascadeSelection {
  type: CascadeItemType;
  id: string;
  data: CurriculumExpectation | CascadeLRP | CascadeUnit | CascadeLesson | DaybookEntry;
  path?: string[]; // Breadcrumb path
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