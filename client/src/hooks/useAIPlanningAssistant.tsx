import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api';

export interface AISuggestion {
  type: 'goals' | 'bigIdeas' | 'activities' | 'materials' | 'assessments' | 'reflections';
  suggestions: string[];
  rationale?: string;
}

export function useAIPlanningAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Long-range goals generation
  const generateLongRangeGoals = useMutation({
    mutationFn: async (params: {
      subject: string;
      grade: number;
      termLength: number;
      focusAreas?: string[];
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/long-range/goals', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Unit big ideas generation
  const generateUnitBigIdeas = useMutation({
    mutationFn: async (params: {
      unitTitle: string;
      subject: string;
      grade: number;
      curriculumExpectations: string[];
      duration: number;
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/unit/big-ideas', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Lesson activities generation
  const generateLessonActivities = useMutation({
    mutationFn: async (params: {
      lessonTitle: string;
      learningGoals: string[];
      subject: string;
      grade: number;
      duration: number;
      materials?: string[];
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/lesson/activities', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Materials list generation
  const generateMaterialsList = useMutation({
    mutationFn: async (params: {
      activities: string[];
      subject: string;
      grade: number;
      classSize?: number;
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/lesson/materials', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Assessment strategies generation
  const generateAssessmentStrategies = useMutation({
    mutationFn: async (params: {
      learningGoals: string[];
      activities: string[];
      subject: string;
      grade: number;
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/lesson/assessments', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Reflection prompts generation
  const generateReflectionPrompts = useMutation({
    mutationFn: async (params: {
      date: Date;
      activities: string[];
      subject: string;
      grade: number;
      previousReflections?: string[];
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/daybook/reflections', params);
        return response.data as AISuggestion;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Curriculum-aligned suggestions
  const getCurriculumAlignedSuggestions = useMutation({
    mutationFn: async (params: {
      expectationIds: string[];
      suggestionType: 'activities' | 'assessments' | 'resources';
    }) => {
      setIsGenerating(true);
      try {
        const response = await api.post('/api/ai-planning/curriculum-aligned', params);
        return response.data.suggestions as string[];
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