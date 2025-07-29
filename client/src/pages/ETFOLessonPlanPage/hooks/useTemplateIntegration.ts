import { useCallback } from 'react';

import { useApplyTemplate } from '../../../hooks/useTemplates';
import { isLessonPlanTemplate } from '../../../types/template';
import type { PlanTemplate, LessonPlanContent } from '../../../types/template';
import { logger } from '../../../utils/logger';

import type { ETFOLessonPlanFormData } from './useETFOLessonPlanForm';

export function useTemplateIntegration(
  formData: ETFOLessonPlanFormData,
  setFormData: (data: ETFOLessonPlanFormData) => void,
) {
  const applyTemplate = useApplyTemplate();

  const handleApplyTemplate = useCallback(
    async (template: PlanTemplate): Promise<void> => {
      try {
        const applied = await applyTemplate.mutateAsync({ id: template.id });

        if (isLessonPlanTemplate(template)) {
          // Pre-populate form with template data
          const templateContent = applied.appliedContent as LessonPlanContent;
          setFormData({
            ...formData,
            title: '',
            titleFr: '',
            duration: templateContent.duration ?? 60,
            learningGoals: '',
            learningGoalsFr: '',
            mindsOn: templateContent.mindsOn ?? '',
            mindsOnFr: '',
            action: templateContent.action ?? '',
            actionFr: '',
            consolidation: templateContent.consolidation ?? '',
            consolidationFr: '',
            materials: templateContent.materials ?? [''],
            grouping: templateContent.grouping ?? 'whole',
            accommodations: templateContent.accommodations ?? [''],
            modifications: templateContent.modifications ?? [''],
            extensions: templateContent.extensions ?? [''],
            assessmentType: (templateContent.assessmentType as 'diagnostic' | 'formative' | 'summative' | undefined) ?? 'formative',
            assessmentNotes: templateContent.assessmentNotes ?? '',
            isSubFriendly: false,
            subNotes: '',
            expectationIds: formData.expectationIds, // Keep existing expectation IDs
          });
        }
      } catch (error) {
        logger.error('Failed to apply template:', error);
        throw error;
      }
    },
    [formData, setFormData, applyTemplate],
  );

  return {
    handleApplyTemplate,
    isApplyingTemplate: applyTemplate.isPending,
  };
}