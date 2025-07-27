import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { apiClient } from '../api/core/client';
export interface AISuggestion {
  type: 'goals' | 'bigIdeas' | 'activities' | 'materials' | 'assessments' | 'reflections';
  suggestions: string[];
  rationale?: string;
}

interface LongRangeGoalsParams {
  subject: string;
  grade: number;
  termLength: number;
  focusAreas?: string[];
}

interface UnitBigIdeasParams {
  unitTitle: string;
  subject: string;
  grade: number;
  curriculumExpectations: string[];
  duration: number;
}

interface LessonActivitiesParams {
  lessonTitle: string;
  learningGoals: string[];
  subject: string;
  grade: number;
  duration: number;
  materials?: string[];
}

interface MaterialsListParams {
  activities: string[];
  subject: string;
  grade: number;
  classSize?: number;
}

interface AssessmentStrategiesParams {
  learningGoals: string[];
  activities: string[];
  subject: string;
  grade: number;
}

interface ReflectionPromptsParams {
  date: Date;
  activities: string[];
  subject: string;
  grade: number;
  previousReflections?: string[];
}

interface CurriculumAlignedParams {
  expectationIds: string[];
  suggestionType: 'activities' | 'assessments' | 'resources';
}

export function useAIPlanningAssistant(): {
  isGenerating: boolean;
  generateLongRangeGoals: UseMutationResult<AISuggestion, Error, LongRangeGoalsParams>;
  generateUnitBigIdeas: UseMutationResult<AISuggestion, Error, UnitBigIdeasParams>;
  generateLessonActivities: UseMutationResult<AISuggestion, Error, LessonActivitiesParams>;
  generateMaterialsList: UseMutationResult<AISuggestion, Error, MaterialsListParams>;
  generateAssessmentStrategies: UseMutationResult<AISuggestion, Error, AssessmentStrategiesParams>;
  generateReflectionPrompts: UseMutationResult<AISuggestion, Error, ReflectionPromptsParams>;
  getCurriculumAlignedSuggestions: UseMutationResult<string[], Error, CurriculumAlignedParams>;
} {
  const [isGenerating, setIsGenerating] = useState(false);

  // Long-range goals generation
  const generateLongRangeGoals = useMutation<AISuggestion, Error, LongRangeGoalsParams>({
    mutationFn: async (params: LongRangeGoalsParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/long-range/goals', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Unit big ideas generation
  const generateUnitBigIdeas = useMutation<AISuggestion, Error, UnitBigIdeasParams>({
    mutationFn: async (params: UnitBigIdeasParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/unit/big-ideas', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Lesson activities generation
  const generateLessonActivities = useMutation<AISuggestion, Error, LessonActivitiesParams>({
    mutationFn: async (params: LessonActivitiesParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/lesson/activities', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Materials list generation
  const generateMaterialsList = useMutation<AISuggestion, Error, MaterialsListParams>({
    mutationFn: async (params: MaterialsListParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/lesson/materials', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Assessment strategies generation
  const generateAssessmentStrategies = useMutation<AISuggestion, Error, AssessmentStrategiesParams>({
    mutationFn: async (params: AssessmentStrategiesParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/lesson/assessments', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Reflection prompts generation
  const generateReflectionPrompts = useMutation<AISuggestion, Error, ReflectionPromptsParams>({
    mutationFn: async (params: ReflectionPromptsParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/daybook/reflections', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  interface CurriculumResponse {
    suggestions: string[];
  }

  // Curriculum-aligned suggestions
  const getCurriculumAlignedSuggestions = useMutation<string[], Error, CurriculumAlignedParams>({
    mutationFn: async (params: CurriculumAlignedParams) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.post('/api/ai-planning/curriculum-aligned', params);
        const data = response.data as CurriculumResponse;
        return data.suggestions;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  return {
    isGenerating,
    generateLongRangeGoals,
    generateUnitBigIdeas,
    generateLessonActivities,
    generateMaterialsList,
    generateAssessmentStrategies,
    generateReflectionPrompts,
    getCurriculumAlignedSuggestions,
  };
}