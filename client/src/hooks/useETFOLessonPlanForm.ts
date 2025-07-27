import { useState, useCallback, useEffect } from 'react';

import { isArray, isString } from '../utils/typeGuards';

import { useAutoSave, useUnsavedChangesWarning } from './useAutoSave';

export interface LessonPlanFormData {
  title: string;
  titleFr: string;
  date: string;
  duration: number;
  mindsOn: string;
  mindsOnFr: string;
  action: string;
  actionFr: string;
  consolidation: string;
  consolidationFr: string;
  learningGoals: string;
  learningGoalsFr: string;
  materials: string[];
  grouping: string;
  accommodations: string[];
  modifications: string[];
  extensions: string[];
  assessmentType: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes: string;
  isSubFriendly: boolean;
  subNotes: string;
  expectationIds: string[];
}

const initialFormData: LessonPlanFormData = {
  title: '',
  titleFr: '',
  date: ((): string => {
    const isoString = new Date().toISOString();
    const parts = isoString.split('T');
    return parts.length > 0 ? parts[0] : isoString;
  })(),
  duration: 60,
  mindsOn: '',
  mindsOnFr: '',
  action: '',
  actionFr: '',
  consolidation: '',
  consolidationFr: '',
  learningGoals: '',
  learningGoalsFr: '',
  materials: [''],
  grouping: 'whole',
  accommodations: [''],
  modifications: [''],
  extensions: [''],
  assessmentType: 'formative',
  assessmentNotes: '',
  isSubFriendly: false,
  subNotes: '',
  expectationIds: [],
};

interface UseETFOLessonPlanFormProps {
  initialData?: Partial<LessonPlanFormData>;
  onSave?: (data: LessonPlanFormData) => Promise<void>;
  editingId?: string | null;
  unitPlanId?: string;
}

export function useETFOLessonPlanForm({
  initialData,
  onSave,
  editingId,
  unitPlanId,
}: UseETFOLessonPlanFormProps = {}): {
  formData: LessonPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<LessonPlanFormData>>;
  updateField: <K extends keyof LessonPlanFormData>(field: K, value: LessonPlanFormData[K]) => void;
  addArrayItem: (field: keyof LessonPlanFormData, value?: string) => void;
  updateArrayItem: (field: keyof LessonPlanFormData, index: number, value: string) => void;
  removeArrayItem: (field: keyof LessonPlanFormData, index: number) => void;
  validateForm: () => { isValid: boolean; errors: string[] };
  getCleanFormData: () => LessonPlanFormData;
  resetForm: () => void;
  loadLessonPlan: (lesson: LessonPlanFormData) => void;
  applyAISuggestion: (type: string, content: string[]) => void;
  applyAILessonPlan: (lessonPlan: {
    title?: string;
    learningGoals?: string[];
    structure?: {
      mindsOn?: { activities?: string[] };
      handsOn?: { activities?: string[] };
      mindsOnReflection?: { activities?: string[] };
    };
    materials?: string[];
    duration?: number;
  }) => void;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveNow: () => Promise<void>;
} {
  const [formData, setFormData] = useState<LessonPlanFormData>(() => ({
    ...initialFormData,
    ...initialData,
  }));

  // Auto-save functionality
  const autoSaveData = editingId !== null && editingId !== '' ? formData : null;
  const { lastSaved, isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    data: autoSaveData,
    saveFn: async (data) => {
      if (editingId !== null && editingId !== '' && data && onSave) {
        await onSave(data);
      }
    },
    enabled: editingId !== null && editingId !== '' && !!autoSaveData && !!onSave,
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
  const updateField = useCallback(<K extends keyof LessonPlanFormData>(
    field: K,
    value: LessonPlanFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [])

  // Array field handlers
  const addArrayItem = useCallback((field: keyof LessonPlanFormData, value = ''): void => {
    setFormData(prev => ({
      ...prev,
      [field]: isArray(prev[field]) ? [...prev[field], value] : [value],
    }));
  }, [])

  const updateArrayItem = useCallback((
    field: keyof LessonPlanFormData,
    index: number,
    value: string
  ): void => {
    setFormData(prev => {
      const currentArray = prev[field];
      if (!isArray(currentArray)) return prev;
      const array = [...currentArray];
      if (index >= 0 && index < array.length) {
        array[index] = value;
      }
      return { ...prev, [field]: array };
    });
  }, [])

  const removeArrayItem = useCallback((field: keyof LessonPlanFormData, index: number): void => {
    setFormData(prev => ({
      ...prev,
      [field]: isArray(prev[field]) ? prev[field].filter((_, i) => i !== index) : [],
    }));
  }, [])

  // Form validation
  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (formData.title.trim() === '') {
      errors.push('Title is required');
    }
    if (!formData.date) {
      errors.push('Date is required');
    }
    if (formData.duration < 15 || formData.duration > 300) {
      errors.push('Duration must be between 15 and 300 minutes');
    }
    if (unitPlanId === undefined || unitPlanId === '') {
      errors.push('Unit plan is required');
    }

    return { isValid: errors.length === 0, errors };
  }, [formData, unitPlanId]);

  // Clean form data for submission
  const getCleanFormData = useCallback((): LessonPlanFormData => ({
      ...formData,
      materials: formData.materials.filter(m => m.trim() !== ''),
      accommodations: formData.accommodations.filter(a => a.trim() !== ''),
      modifications: formData.modifications.filter(m => m.trim() !== ''),
      extensions: formData.extensions.filter(e => e.trim() !== ''),
    }), [formData]);

  // Reset form
  const resetForm = useCallback((): void => {
    setFormData(initialFormData);
  }, [])

  // Load lesson plan data into form
  const loadLessonPlan = useCallback((lesson: {
    title: string;
    titleFr?: string;
    date: string;
    duration: number;
    mindsOn?: string;
    mindsOnFr?: string;
    action?: string;
    actionFr?: string;
    consolidation?: string;
    consolidationFr?: string;
    learningGoals?: string;
    learningGoalsFr?: string;
    materials?: string[];
    grouping?: string;
    accommodations?: string[];
    modifications?: string[];
    extensions?: string[];
    assessmentType?: 'diagnostic' | 'formative' | 'summative';
    assessmentNotes?: string;
    isSubFriendly: boolean;
    subNotes?: string;
    expectations?: { expectation: { id: string } }[];
  }): void => {
    setFormData({
      title: lesson.title,
      titleFr: lesson.titleFr ?? '',
      date: ((): string => {
        if (isString(lesson.date) === false) return '';
        const parts = lesson.date.split('T');
        return parts.length > 0 ? parts[0] : lesson.date;
      })(),
      duration: lesson.duration,
      mindsOn: lesson.mindsOn ?? '',
      mindsOnFr: lesson.mindsOnFr ?? '',
      action: lesson.action ?? '',
      actionFr: lesson.actionFr ?? '',
      consolidation: lesson.consolidation ?? '',
      consolidationFr: lesson.consolidationFr ?? '',
      learningGoals: lesson.learningGoals ?? '',
      learningGoalsFr: lesson.learningGoalsFr ?? '',
      materials: lesson.materials ?? [''],
      grouping: lesson.grouping ?? 'whole',
      accommodations: lesson.accommodations ?? [''],
      modifications: lesson.modifications ?? [''],
      extensions: lesson.extensions ?? [''],
      assessmentType: lesson.assessmentType ?? 'formative',
      assessmentNotes: lesson.assessmentNotes ?? '',
      isSubFriendly: lesson.isSubFriendly,
      subNotes: lesson.subNotes ?? '',
      expectationIds: isArray(lesson.expectations) 
        ? lesson.expectations
            .filter(e => typeof e === 'object' && 'expectation' in e && 'id' in e.expectation)
            .map((e) => String((e.expectation as { id: unknown }).id))
        : [],
    });
  }, [])

  // AI suggestion handlers
  const applyAISuggestion = useCallback((type: string, content: string[]): void => {
    switch (type) {
      case 'mindson':
        setFormData(prev => ({ ...prev, mindsOn: content.join('\n\n') }));
        break;
      case 'handson':
        setFormData(prev => ({ ...prev, action: content.join('\n\n') }));
        break;
      case 'mindson_reflection':
        setFormData(prev => ({ ...prev, consolidation: content.join('\n\n') }));
        break;
      case 'materials':
        setFormData(prev => ({ 
          ...prev, 
          materials: [
            ...(isArray(prev.materials) ? prev.materials.filter(m => isString(m) && m.trim() !== '') : []),
            ...(isArray(content) ? content.filter(c => isString(c)) : [])
          ] 
        }));
        break;
      case 'assessments':
        setFormData(prev => ({ ...prev, assessmentNotes: content.join('\n\n') }));
        break;
    }
  }, [])

  const applyAILessonPlan = useCallback((lessonPlan: {
    title?: string;
    learningGoals?: string[];
    structure?: {
      mindsOn?: { activities?: string[] };
      handsOn?: { activities?: string[] };
      mindsOnReflection?: { activities?: string[] };
    };
    materials?: string[];
    duration?: number;
  }): void => {
    setFormData((prev): LessonPlanFormData => ({
      ...prev,
      title: lessonPlan.title ?? prev.title,
      learningGoals: lessonPlan.learningGoals?.join('\n') ?? prev.learningGoals,
      mindsOn: lessonPlan.structure?.mindsOn?.activities?.join('\n\n') ?? prev.mindsOn,
      action: lessonPlan.structure?.handsOn?.activities?.join('\n\n') ?? prev.action,
      consolidation: lessonPlan.structure?.mindsOnReflection?.activities?.join('\n\n') ?? prev.consolidation,
      materials: lessonPlan.materials ?? prev.materials,
      duration: lessonPlan.duration ?? prev.duration,
    }));
  }, [])

  return {
    formData,
    setFormData,
    updateField,
    addArrayItem,
    updateArrayItem,
    removeArrayItem,
    validateForm,
    getCleanFormData,
    resetForm,
    loadLessonPlan,
    applyAISuggestion,
    applyAILessonPlan,
    // Auto-save state
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
  };
}