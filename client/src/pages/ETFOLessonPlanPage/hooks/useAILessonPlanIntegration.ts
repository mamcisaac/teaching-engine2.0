import { useCallback } from 'react';

import type { ETFOLessonPlanFormData } from './useETFOLessonPlanForm';

interface AILessonPlan {
  title?: string;
  learningGoals?: string[];
  structure?: {
    mindsOn?: { activities?: string[] };
    handsOn?: { activities?: string[] };
    mindsOnReflection?: { activities?: string[] };
  };
  materials?: string[];
  duration?: number;
  mindsOn?: { activities: string[]; duration: number; materials: string[] };
  handsOn?: { activities: string[]; duration: number; materials: string[] };
  mindsOnReflection?: { activities: string[]; duration: number; materials: string[] };
}

interface ThreePartStructure {
  mindsOn: { activities: string[]; duration: number; materials: string[] };
  handsOn: { activities: string[]; duration: number; materials: string[] };
  mindsOnReflection: { activities: string[]; duration: number; materials: string[] };
}

export function useAILessonPlanIntegration(
  formData: ETFOLessonPlanFormData,
  setFormData: (data: ETFOLessonPlanFormData) => void,
) {
  const handleAISuggestionAccepted = useCallback(
    (type: string, content: string[]): void => {
      switch (type) {
        case 'mindson':
          setFormData({ ...formData, mindsOn: content.join('\n\n') });
          break;
        case 'handson':
          setFormData({ ...formData, action: content.join('\n\n') });
          break;
        case 'mindson_reflection':
          setFormData({ ...formData, consolidation: content.join('\n\n') });
          break;
        case 'materials': {
          const existingMaterials = formData.materials.filter((m) => m.trim());
          setFormData({ ...formData, materials: [...existingMaterials, ...content] });
          break;
        }
        case 'assessments':
          setFormData({ ...formData, assessmentNotes: content.join('\n\n') });
          break;
        default:
          // Unhandled suggestion type
      }
    },
    [formData, setFormData],
  );

  const handleAILessonGenerated = useCallback(
    (lessonPlan: AILessonPlan): void => {
      // Handle both the old interface and the new ThreePartStructure interface
      if ('mindsOn' in lessonPlan && 'handsOn' in lessonPlan && 'mindsOnReflection' in lessonPlan) {
        // ThreePartStructure format
        const structure = lessonPlan as ThreePartStructure;

        setFormData({
          ...formData,
          mindsOn: structure.mindsOn.activities.join('\n\n'),
          action: structure.handsOn.activities.join('\n\n'),
          consolidation: structure.mindsOnReflection.activities.join('\n\n'),
          materials: [
            ...new Set([
              ...structure.mindsOn.materials,
              ...structure.handsOn.materials,
              ...structure.mindsOnReflection.materials,
            ]),
          ],
          duration:
            structure.mindsOn.duration +
            structure.handsOn.duration +
            structure.mindsOnReflection.duration,
        });
      } else {
        // Legacy format
        setFormData({
          ...formData,
          title: lessonPlan.title ?? formData.title,
          learningGoals: lessonPlan.learningGoals?.join('\n') ?? formData.learningGoals,
          mindsOn: lessonPlan.structure?.mindsOn?.activities?.join('\n\n') ?? formData.mindsOn,
          action: lessonPlan.structure?.handsOn?.activities?.join('\n\n') ?? formData.action,
          consolidation: lessonPlan.structure?.mindsOnReflection?.activities?.join('\n\n') ?? formData.consolidation,
          materials: lessonPlan.materials ?? formData.materials,
          duration: lessonPlan.duration ?? formData.duration,
        });
      }
    },
    [formData, setFormData],
  );

  return {
    handleAISuggestionAccepted,
    handleAILessonGenerated,
  };
}