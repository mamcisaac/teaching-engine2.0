import { type UseQueryResult } from '@tanstack/react-query';

export interface ActivitySuggestion {
  activityId: number;
  title: string;
  milestoneTitle: string;
  subject: string;
  linkedOutcomes: string[];
  coverageStatus: 'covers_uncovered' | 'general' | 'already_covered';
}

export interface OutcomeCoverage {
  outcomeId: string;
  code: string;
  description: string;
  subject: string;
  domain: string | null;
  grade: number;
  isCovered: boolean;
  coveredBy: Array<{
    id: number;
    title: string;
  }>;
}

export type OutcomeCoverageResult = UseQueryResult<OutcomeCoverage[], unknown>;
