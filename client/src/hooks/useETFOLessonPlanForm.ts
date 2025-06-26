import { useState, useCallback, useEffect } from 'react';
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
  date: new Date().toISOString().split('T')[0],
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
}: UseETFOLessonPlanFormProps = {}) {
  const [formData, setFormData] = useState<LessonPlanFormData>(() => ({
    ...initialFormData,
    ...initialData,
  }));

  // Auto-save functionality
  const autoSaveData = editingId ? formData : null;
  const { lastSaved, isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    data: autoSaveData,
    saveFn: async (data) => {
      if (editingId && data && onSave) {
        await onSave(data);
      }
    },
    enabled: !!editingId && !!autoSaveData && !!onSave,
    delay: 30000, // 30 seconds
  });

  useUnsavedChangesWarning(hasUnsavedChanges);

  // Update form data when initial data changes
  useEffect(() => {
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
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Array field handlers
  const addArrayItem = useCallback((field: keyof LessonPlanFormData, value: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value],
    }));
  }, []);

  const updateArrayItem = useCallback((
    field: keyof LessonPlanFormData,
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const array = [...(prev[field] as string[])];
      array[index] = value;
      return { ...prev, [field]: array };
    });
  }, []);

  const removeArrayItem = useCallback((field: keyof LessonPlanFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  }, []);

  // Form validation
  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }
    if (!formData.date) {
      errors.push('Date is required');
    }
    if (formData.duration < 15 || formData.duration > 300) {
      errors.push('Duration must be between 15 and 300 minutes');
    }
    if (!unitPlanId) {
      errors.push('Unit plan is required');
    }

    return { isValid: errors.length === 0, errors };
  }, [formData, unitPlanId]);

  // Clean form data for submission
  const getCleanFormData = useCallback((): LessonPlanFormData => {
    return {
      ...formData,
      materials: formData.materials.filter(m => m.trim()),
      accommodations: formData.accommodations.filter(a => a.trim()),
      modifications: formData.modifications.filter(m => m.trim()),
      extensions: formData.extensions.filter(e => e.trim()),
    };
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

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
    expectations?: Array<{ expectation: { id: string } }>;
  }) => {
    setFormData({
      title: lesson.title,
      titleFr: lesson.titleFr || '',
      date: lesson.date.split('T')[0],
      duration: lesson.duration,
      mindsOn: lesson.mindsOn || '',
      mindsOnFr: lesson.mindsOnFr || '',
      action: lesson.action || '',
      actionFr: lesson.actionFr || '',
      consolidation: lesson.consolidation || '',
      consolidationFr: lesson.consolidationFr || '',
      learningGoals: lesson.learningGoals || '',
      learningGoalsFr: lesson.learningGoalsFr || '',
      materials: lesson.materials || [''],
      grouping: lesson.grouping || 'whole',
      accommodations: lesson.accommodations || [''],
      modifications: lesson.modifications || [''],
      extensions: lesson.extensions || [''],
      assessmentType: lesson.assessmentType || 'formative',
      assessmentNotes: lesson.assessmentNotes || '',
      isSubFriendly: lesson.isSubFriendly,
      subNotes: lesson.subNotes || '',
      expectationIds: lesson.expectations?.map((e) => e.expectation.id) || [],
    });
  }, []);

  // AI suggestion handlers
  const applyAISuggestion = useCallback((type: string, content: string[]) => {
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
          materials: [...prev.materials.filter(m => m.trim()), ...content] 
        }));
        break;
      case 'assessments':
        setFormData(prev => ({ ...prev, assessmentNotes: content.join('\n\n') }));
        break;
    }
  }, []);

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
  }) => {
    setFormData(prev => ({
      ...prev,
      title: lessonPlan.title || prev.title,
      learningGoals: lessonPlan.learningGoals?.join('\n') || prev.learningGoals,
      mindsOn: lessonPlan.structure?.mindsOn?.activities?.join('\n\n') || prev.mindsOn,
      action: lessonPlan.structure?.handsOn?.activities?.join('\n\n') || prev.action,
      consolidation: lessonPlan.structure?.mindsOnReflection?.activities?.join('\n\n') || prev.consolidation,
      materials: lessonPlan.materials || prev.materials,
      duration: lessonPlan.duration || prev.duration,
    }));
  }, []);

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