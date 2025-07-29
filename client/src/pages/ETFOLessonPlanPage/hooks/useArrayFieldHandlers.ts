import { useCallback } from 'react';

import type { ETFOLessonPlanFormData } from './useETFOLessonPlanForm';

interface ArrayFieldHandlers {
  add: () => void;
  update: (index: number, value: string) => void;
  remove: (index: number) => void;
}

export function useArrayFieldHandlers(
  formData: ETFOLessonPlanFormData,
  setFormData: (data: ETFOLessonPlanFormData) => void,
) {
  const createArrayHandlers = useCallback(
    (fieldName: keyof Pick<ETFOLessonPlanFormData, 'materials' | 'accommodations' | 'modifications' | 'extensions'>): ArrayFieldHandlers => ({
      add: () => {
        const currentArray = formData[fieldName];
        setFormData({ ...formData, [fieldName]: [...currentArray, ''] });
      },
      update: (index: number, value: string) => {
        const currentArray = formData[fieldName];
        const updated = [...currentArray];
        updated[index] = value;
        setFormData({ ...formData, [fieldName]: updated });
      },
      remove: (index: number) => {
        const currentArray = formData[fieldName];
        setFormData({
          ...formData,
          [fieldName]: currentArray.filter((_, i) => i !== index),
        });
      },
    }),
    [formData, setFormData],
  );

  const materialsHandlers = createArrayHandlers('materials');
  const accommodationsHandlers = createArrayHandlers('accommodations');
  const modificationsHandlers = createArrayHandlers('modifications');
  const extensionsHandlers = createArrayHandlers('extensions');

  return {
    materials: materialsHandlers,
    accommodations: accommodationsHandlers,
    modifications: modificationsHandlers,
    extensions: extensionsHandlers,
  };
}