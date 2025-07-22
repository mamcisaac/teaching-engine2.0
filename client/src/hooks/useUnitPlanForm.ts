import { useState, useCallback, useEffect } from 'react';

import { useAutoSave, useUnsavedChangesWarning } from './useAutoSave';

export interface UnitPlanFormData {
  title: string;
  description: string;
  bigIdeas: string;
  essentialQuestions: string[];
  startDate: string;
  endDate: string;
  estimatedHours: number;
  assessmentPlan: string;
  successCriteria: string[];
  expectationIds: string[];
  longRangePlanId: string;
  // Additional ETFO fields
  crossCurricularConnections: string;
  learningSkills: string[];
  culminatingTask: string;
  keyVocabulary: string[];
  priorKnowledge: string;
  parentCommunicationPlan: string;
  fieldTripsAndGuestSpeakers: string;
  differentiationStrategies: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  indigenousPerspectives: string;
  environmentalEducation: string;
  socialJusticeConnections: string;
  technologyIntegration: string;
  communityConnections: string;
}

const initialFormData: UnitPlanFormData = {
  title: '',
  description: '',
  bigIdeas: '',
  essentialQuestions: [''],
  startDate: '',
  endDate: '',
  estimatedHours: 20,
  assessmentPlan: '',
  successCriteria: [''],
  expectationIds: [],
  longRangePlanId: '',
  crossCurricularConnections: '',
  learningSkills: [],
  culminatingTask: '',
  keyVocabulary: [''],
  priorKnowledge: '',
  parentCommunicationPlan: '',
  fieldTripsAndGuestSpeakers: '',
  differentiationStrategies: {
    forStruggling: [''],
    forAdvanced: [''],
    forELL: [''],
    forIEP: [''],
  },
  indigenousPerspectives: '',
  environmentalEducation: '',
  socialJusticeConnections: '',
  technologyIntegration: '',
  communityConnections: '',
};

interface UseUnitPlanFormProps {
  initialData?: Partial<UnitPlanFormData>;
  onSave?: (data: UnitPlanFormData) => Promise<void>;
  editingId?: string | null;
  longRangePlanId?: string;
}

export function useUnitPlanForm({
  initialData,
  onSave,
  editingId,
  longRangePlanId,
}: UseUnitPlanFormProps = {}): {
  formData: UnitPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<UnitPlanFormData>>;
  updateField: <K extends keyof UnitPlanFormData>(field: K, value: UnitPlanFormData[K]) => void;
  addArrayItem: (field: keyof UnitPlanFormData, value?: string) => void;
  updateArrayItem: (field: keyof UnitPlanFormData, index: number, value: string) => void;
  removeArrayItem: (field: keyof UnitPlanFormData, index: number) => void;
  updateDifferentiationStrategy: (type: keyof UnitPlanFormData['differentiationStrategies'], index: number, value: string) => void;
  addDifferentiationStrategy: (type: keyof UnitPlanFormData['differentiationStrategies']) => void;
  removeDifferentiationStrategy: (type: keyof UnitPlanFormData['differentiationStrategies'], index: number) => void;
  validateForm: () => { isValid: boolean; errors: string[] };
  getCleanFormData: () => UnitPlanFormData;
  resetForm: () => void;
  loadUnitPlan: (unit: UnitPlanFormData) => void;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveNow: () => Promise<void>;
} {
  const [formData, setFormData] = useState<UnitPlanFormData>(() => ({
    ...initialFormData,
    ...initialData,
    longRangePlanId: ((): string => {
      if (longRangePlanId != null && longRangePlanId !== '') {
        return longRangePlanId;
      }
      if (initialData?.longRangePlanId != null && initialData.longRangePlanId !== '') {
        return initialData.longRangePlanId;
      }
      return '';
    })(),
  }));

  // Auto-save functionality
  const autoSaveData = (editingId != null && editingId !== '') ? formData : null;
  const { lastSaved, isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    data: autoSaveData,
    saveFn: async (data) => {
      if ((editingId != null && editingId !== '') && data != null && onSave != null) {
        await onSave(data);
      }
    },
    enabled: (editingId != null && editingId !== '') && autoSaveData !== null && (onSave != null),
    delay: 30000, // 30 seconds
  });

  useUnsavedChangesWarning(hasUnsavedChanges);

  // Update form data when initial data changes
  useEffect(() => {
    return () => { // Cleanup
    };

    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Field update handlers
  const updateField = useCallback(<K extends keyof UnitPlanFormData>(
    field: K,
    value: UnitPlanFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Array field handlers
  const addArrayItem = useCallback((field: keyof UnitPlanFormData, value = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value],
    }));
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateArrayItem = useCallback((
    field: keyof UnitPlanFormData,
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const array = [...(prev[field] as string[])];
      array[index] = value;
      return { ...prev, [field]: array };
    });
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const removeArrayItem = useCallback((field: keyof UnitPlanFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Differentiation strategy handlers
  const updateDifferentiationStrategy = useCallback((
    type: keyof UnitPlanFormData['differentiationStrategies'],
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const updated = { ...prev.differentiationStrategies };
      updated[type][index] = value;
      return { ...prev, differentiationStrategies: updated };
    });
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addDifferentiationStrategy = useCallback((
    type: keyof UnitPlanFormData['differentiationStrategies']
  ) => {
    setFormData(prev => {
      const updated = { ...prev.differentiationStrategies };
      updated[type] = [...updated[type], ''];
      return { ...prev, differentiationStrategies: updated };
    });
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const removeDifferentiationStrategy = useCallback((
    type: keyof UnitPlanFormData['differentiationStrategies'],
    index: number
  ) => {
    setFormData(prev => {
      const updated = { ...prev.differentiationStrategies };
      updated[type] = updated[type].filter((_, i) => i !== index);
      return { ...prev, differentiationStrategies: updated };
    });
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Form validation
  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    if (!formData.startDate) {
      errors.push('Start date is required');
    }
    if (!formData.endDate) {
      errors.push('End date is required');
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.push('End date must be after start date');
    }
    if ((formData.longRangePlanId == null || formData.longRangePlanId === '') && (longRangePlanId == null || longRangePlanId === '')) {
      errors.push('Long-range plan is required');
    }

    return { isValid: errors.length === 0, errors };
  }, [formData, longRangePlanId]);

  // Clean form data for submission
  const getCleanFormData = useCallback((): UnitPlanFormData => ({
      ...formData,
      essentialQuestions: formData.essentialQuestions.filter(q => q.trim()),
      successCriteria: formData.successCriteria.filter(c => c.trim()),
      keyVocabulary: formData.keyVocabulary.filter(v => v.trim()),
      differentiationStrategies: {
        forStruggling: formData.differentiationStrategies.forStruggling.filter(s => s.trim()),
        forAdvanced: formData.differentiationStrategies.forAdvanced.filter(s => s.trim()),
        forELL: formData.differentiationStrategies.forELL.filter(s => s.trim()),
        forIEP: formData.differentiationStrategies.forIEP.filter(s => s.trim()),
      },
    }), [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      ...initialFormData,
      longRangePlanId: longRangePlanId ?? '',
    });
  }, [longRangePlanId]);

  // Load unit plan data into form
  const loadUnitPlan = useCallback((unit: {
    title: string;
    description?: string;
    bigIdeas?: string;
    essentialQuestions?: string[];
    startDate: string;
    endDate: string;
    estimatedHours?: number;
    assessmentPlan?: string;
    successCriteria?: string[];
    expectations?: { expectation: { id: string } }[];
    longRangePlanId: string;
    crossCurricularConnections?: string;
    learningSkills?: string[];
    culminatingTask?: string;
    keyVocabulary?: string[];
    priorKnowledge?: string;
    parentCommunicationPlan?: string;
    fieldTripsAndGuestSpeakers?: string;
    differentiationStrategies?: {
      forStruggling: string[];
      forAdvanced: string[];
      forELL: string[];
      forIEP: string[];
    };
    indigenousPerspectives?: string;
    environmentalEducation?: string;
    socialJusticeConnections?: string;
    technologyIntegration?: string;
    communityConnections?: string;
  }) => {
    setFormData({
      title: unit.title,
      description: unit.description ?? '',
      bigIdeas: unit.bigIdeas ?? '',
      essentialQuestions: unit.essentialQuestions ?? [''],
      startDate: ((): string => {
        const [dateOnly] = unit.startDate.split('T');
        return dateOnly;
      })(),
      endDate: ((): string => {
        const [dateOnly] = unit.endDate.split('T');
        return dateOnly;
      })(),
      estimatedHours: unit.estimatedHours ?? 20,
      assessmentPlan: unit.assessmentPlan ?? '',
      successCriteria: unit.successCriteria ?? [''],
      expectationIds: unit.expectations?.map((e) => e.expectation.id) ?? [],
      longRangePlanId: unit.longRangePlanId,
      crossCurricularConnections: unit.crossCurricularConnections ?? '',
      learningSkills: unit.learningSkills ?? [],
      culminatingTask: unit.culminatingTask ?? '',
      keyVocabulary: unit.keyVocabulary ?? [''],
      priorKnowledge: unit.priorKnowledge ?? '',
      parentCommunicationPlan: unit.parentCommunicationPlan ?? '',
      fieldTripsAndGuestSpeakers: unit.fieldTripsAndGuestSpeakers ?? '',
      differentiationStrategies: unit.differentiationStrategies ?? {
        forStruggling: [''],
        forAdvanced: [''],
        forELL: [''],
        forIEP: [''],
      },
      indigenousPerspectives: unit.indigenousPerspectives ?? '',
      environmentalEducation: unit.environmentalEducation ?? '',
      socialJusticeConnections: unit.socialJusticeConnections ?? '',
      technologyIntegration: unit.technologyIntegration ?? '',
      communityConnections: unit.communityConnections ?? '',
    });
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    formData,
    setFormData,
    updateField,
    addArrayItem,
    updateArrayItem,
    removeArrayItem,
    updateDifferentiationStrategy,
    addDifferentiationStrategy,
    removeDifferentiationStrategy,
    validateForm,
    getCleanFormData,
    resetForm,
    loadUnitPlan,
    // Auto-save state
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
  };
}