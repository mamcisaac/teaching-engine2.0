import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';
import { useCreateETFOLessonPlan } from './useETFOPlanning';

export interface QuickPlanData {
  title: string;
  titleFr: string;
  duration: number;
  date: string;
  unitPlanId: string | null;
  learningGoals: string;
  learningGoalsFr: string;
  mindsOn: string;
  mindsOnFr: string;
  action: string;
  actionFr: string;
  consolidation: string;
  consolidationFr: string;
  materials: string[];
  assessmentNotes: string;
  differentiationStrategies: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  expectations: string[];
  metadata?: {
    generatedAt: string;
    method: 'ai-enhanced' | 'smart-template';
    templatePreference?: string;
    expectationCode: string;
    expectationSubject: string;
  };
}

export type QuickPlanStep = 'preview' | 'customize' | 'confirm';
export type TemplatePreference = 'engaging' | 'structured' | 'creative' | 'balanced';

interface UseQuickPlanOptions {
  expectationId: string;
  onSuccess?: (lessonId: string) => void;
}

interface UseQuickPlanReturn {
  // State
  step: QuickPlanStep;
  planData: QuickPlanData | null;
  customizations: Partial<QuickPlanData>;
  isGenerating: boolean;
  isCreating: boolean;
  expectation: any;
  
  // Actions
  setStep: (step: QuickPlanStep) => void;
  generatePlan: (options?: { useAI?: boolean; templatePreference?: TemplatePreference }) => void;
  updateCustomization: (field: keyof QuickPlanData, value: any) => void;
  createLesson: () => Promise<void>;
  saveAsTemplate: () => void;
  reset: () => void;
}

export function useQuickPlan({ expectationId, onSuccess }: UseQuickPlanOptions): UseQuickPlanReturn {
  const [step, setStep] = useState<QuickPlanStep>('preview');
  const [planData, setPlanData] = useState<QuickPlanData | null>(null);
  const [customizations, setCustomizations] = useState<Partial<QuickPlanData>>({});
  
  const createLessonMutation = useCreateETFOLessonPlan();

  // Fetch expectation details
  const { data: expectation } = useQuery({
    queryKey: ['expectation', expectationId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/curriculum-expectations/${expectationId}`);
      return response.data;
    },
    enabled: !!expectationId,
  });

  // Generate quick plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async (options?: { useAI?: boolean; templatePreference?: TemplatePreference }) => {
      const response = await apiClient.post('/api/curriculum-coverage/quick-plan', {
        expectationId,
        date: new Date().toISOString().split('T')[0],
        useAI: options?.useAI || false,
        templatePreference: options?.templatePreference || 'balanced',
      });
      return response.data.data as QuickPlanData;
    },
    onSuccess: (data) => {
      setPlanData(data);
      setCustomizations({});
      setStep('preview');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to generate quick plan';
      toast.error(message);
    },
  });

  // Update customization
  const updateCustomization = (field: keyof QuickPlanData, value: any): void => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create the lesson
  const createLesson = async (): Promise<void> => {
    if (!planData) {
      toast.error('No plan data available');
      return;
    }

    const finalData = {
      ...planData,
      ...customizations,
    };

    try {
      const result = await createLessonMutation.mutateAsync(finalData);
      toast.success('Lesson plan created successfully!');
      
      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create lesson plan';
      toast.error(message);
      throw error;
    }
  };

  // Save as template in localStorage
  const saveAsTemplate = (): void => {
    if (!planData) {
      toast.error('No plan data to save');
      return;
    }
    
    const templateData = {
      ...planData,
      ...customizations,
    };
    
    try {
      const templates = JSON.parse(localStorage.getItem('quickPlanTemplates') || '[]');
      const newTemplate = {
        id: Date.now().toString(),
        name: templateData.title,
        subject: expectation?.subject || 'Unknown',
        grade: expectation?.grade || 1,
        data: templateData,
        createdAt: new Date().toISOString(),
      };
      
      templates.push(newTemplate);
      
      // Keep only last 20 templates
      if (templates.length > 20) {
        templates.shift();
      }
      
      localStorage.setItem('quickPlanTemplates', JSON.stringify(templates));
      toast.success('Template saved successfully!');
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  // Reset state
  const reset = (): void => {
    setStep('preview');
    setPlanData(null);
    setCustomizations({});
  };

  // Auto-generate on mount if expectationId is provided
  useEffect(() => {
    if (expectationId && !planData && !generatePlanMutation.isLoading) {
      generatePlanMutation.mutate();
    }
  }, [expectationId]);

  return {
    // State
    step,
    planData,
    customizations,
    isGenerating: generatePlanMutation.isLoading,
    isCreating: createLessonMutation.isLoading,
    expectation,
    
    // Actions
    setStep,
    generatePlan: generatePlanMutation.mutate,
    updateCustomization,
    createLesson,
    saveAsTemplate,
    reset,
  };
}

// Helper hook to get saved templates
export function useQuickPlanTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quickPlanTemplates');
      if (saved) {
        setTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  const deleteTemplate = (id: string): void => {
    try {
      const updated = templates.filter(t => t.id !== id);
      localStorage.setItem('quickPlanTemplates', JSON.stringify(updated));
      setTemplates(updated);
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const applyTemplate = (templateId: string): QuickPlanData | null => {
    const template = templates.find(t => t.id === templateId);
    return template?.data || null;
  };

  return {
    templates,
    deleteTemplate,
    applyTemplate,
  };
}