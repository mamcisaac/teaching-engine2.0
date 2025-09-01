export interface TreeNodeData {
  id: string;
  label: string;
  type: 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';
  data: any;
  children?: TreeNodeData[];
  hasChildren: boolean;
  progress?: {
    completed: number;
    total: number;
  };
}

export interface FlattenedNode extends TreeNodeData {
  level: number;
  isExpanded: boolean;
  isVisible: boolean;
  isSelected: boolean;
  isMultiSelected: boolean;
}