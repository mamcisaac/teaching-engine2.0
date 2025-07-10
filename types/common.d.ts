// Common type definitions to eliminate unsafe any usage

export interface RequestBody {
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ExpectationRelation {
  expectation: {
    id: string;
  };
}

export interface PlanCount {
  unitPlans?: number;
  lessonPlans?: number;
}

export interface PlanWithCount {
  id: string;
  title?: string;
  date?: string;
  _count?: PlanCount;
  daybookEntry?: { id: string } | null;
}

export interface ParentInfo {
  id?: string;
  title?: string;
  subject?: string;
  grade?: string;
  longRangePlan?: {
    subject?: string;
    grade?: string;
  };
}