import { useState } from 'react';

interface ETFOLessonPlanFormData {
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

const initialFormData: ETFOLessonPlanFormData = {
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

export function useETFOLessonPlanForm() {
  const [formData, setFormData] = useState<ETFOLessonPlanFormData>(initialFormData);

  const resetForm = (): void => {
    setFormData(initialFormData);
  };

  const updateFormData = (updates: Partial<ETFOLessonPlanFormData>): void => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const populateFormFromLesson = (lesson: any): void => {
    setFormData({
      title: lesson.title,
      titleFr: lesson.titleFr ?? '',
      date: (() => {
        const parts = lesson.date.split('T');
        return parts[0] ?? lesson.date;
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
      expectationIds: lesson.expectations?.map((e: any) => e.expectation.id).filter((id: any): id is string => id !== undefined) ?? [],
    });
  };

  const getCleanedFormData = (unitId: string) => ({
    ...formData,
    unitPlanId: unitId,
    materials: formData.materials.filter((m) => m.trim() !== ''),
    accommodations: formData.accommodations.filter((a) => a.trim() !== ''),
    modifications: formData.modifications.filter((m) => m.trim() !== ''),
    extensions: formData.extensions.filter((e) => e.trim() !== ''),
  });

  return {
    formData,
    setFormData,
    resetForm,
    updateFormData,
    populateFormFromLesson,
    getCleanedFormData,
  };
}

export type { ETFOLessonPlanFormData };