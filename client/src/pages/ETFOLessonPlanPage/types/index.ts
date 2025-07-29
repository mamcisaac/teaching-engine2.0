// Re-export types from the main API client for consistency
export type { 
  ETFOLessonPlan as LessonPlan,
  DaybookEntry,
  CurriculumExpectation,
  UnitPlan as UnitPlanType
} from '../../../hooks/useETFOPlanning';

// Legacy interfaces - kept for backward compatibility if needed
// These should be gradually migrated to use the main API types above
export interface LessonExpectation {
  expectation: {
    id?: string;
    code: string;
    description: string;
    strand: string;
  };
}

// AI-related types
export interface AILessonPlan {
  title?: string;
  learningGoals?: string[];
  structure?: {
    mindsOn?: { activities?: string[] };
    handsOn?: { activities?: string[] };
    mindsOnReflection?: { activities?: string[] };
  };
  materials?: string[];
  duration?: number;
  mindsOn?: { activities: string[]; duration: number; materials: string[] };
  handsOn?: { activities: string[]; duration: number; materials: string[] };
  mindsOnReflection?: { activities: string[]; duration: number; materials: string[] };
}

export interface ThreePartStructure {
  mindsOn: { activities: string[]; duration: number; materials: string[] };
  handsOn: { activities: string[]; duration: number; materials: string[] };
  mindsOnReflection: { activities: string[]; duration: number; materials: string[] };
}

// Array field handler interface
export interface ArrayFieldHandlers {
  add: () => void;
  update: (index: number, value: string) => void;
  remove: (index: number) => void;
}