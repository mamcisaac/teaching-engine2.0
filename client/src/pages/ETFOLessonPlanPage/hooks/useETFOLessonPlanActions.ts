import { useNavigate } from 'react-router-dom';
import type { UseMutationResult } from '@tanstack/react-query';

import type { LessonPlan } from '../types';
import { NAVIGATION } from '../utils/constants';
import { logger } from '@/utils/logger';
import type { PlanTemplate } from '@/types/template';
import type { ETFOLessonPlan } from '@/hooks/useETFOPlanning';

import type { ETFOLessonPlanFormData } from './useETFOLessonPlanForm';
import type { ETFOModalState } from './useETFOModalState';

interface LessonPlanData extends ETFOLessonPlanFormData {
  unitPlanId: string;
}

interface UseETFOLessonPlanActionsProps {
  unitId: string;
  lessonId?: string;
  formData: ETFOLessonPlanFormData;
  modalState: ETFOModalState;
  formActions: {
    resetForm: () => void;
    populateFormFromLesson: (lesson: LessonPlan) => void;
    getCleanedFormData: (unitId: string) => LessonPlanData;
  };
  mutations: {
    createLesson: UseMutationResult<ETFOLessonPlan, Error, Partial<ETFOLessonPlan> & { expectationIds?: string[] }, unknown>;
    updateLesson: UseMutationResult<ETFOLessonPlan, Error, { id: string; data: Partial<ETFOLessonPlan> & { expectationIds?: string[] } }, unknown>;
    deleteLesson: UseMutationResult<unknown, Error, string, unknown>;
  };
  templateActions: {
    handleApplyTemplate: (template: PlanTemplate) => Promise<void>;
  };
}

/**
 * Custom hook for managing all lesson plan actions and event handlers
 * 
 * Centralizes all business logic for lesson plan operations including
 * create, update, delete, and template application.
 */
export function useETFOLessonPlanActions({
  unitId,
  lessonId,
  formData,
  modalState,
  formActions,
  mutations,
  templateActions,
}: UseETFOLessonPlanActionsProps) {
  const navigate = useNavigate();
  
  const { 
    editingLesson,
    closeCreateModal,
    closeDeleteConfirm,
    closeTemplateModal,
    openCreateModal,
    openEditModal,
    openDeleteConfirm,
    handleTemplateToCreate,
  } = modalState;
  
  const { resetForm, populateFormFromLesson, getCleanedFormData } = formActions;
  const { createLesson, updateLesson, deleteLesson } = mutations;
  const { handleApplyTemplate } = templateActions;

  /**
   * Handles form submission for both create and update operations
   */
  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const cleanedData = getCleanedFormData(unitId);

    try {
      if (editingLesson !== null) {
        // Update existing lesson
        await updateLesson.mutateAsync({ id: editingLesson, data: cleanedData });
      } else {
        // Create new lesson
        await createLesson.mutateAsync(cleanedData);
      }

      // Close modal and reset form
      closeCreateModal();
      resetForm();
    } catch (error) {
      // Error handling is typically managed by the mutation hooks
      logger.error('Failed to save lesson plan', {
        operation: editingLesson !== null ? 'update' : 'create',
        lessonId: editingLesson,
        unitId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
    }
  };

  /**
   * Handles lesson deletion with navigation logic
   */
  const handleLessonDelete = async (id: string): Promise<void> => {
    try {
      await deleteLesson.mutateAsync(id);
      closeDeleteConfirm();
      
      // Navigate back to lesson list if we're deleting the currently viewed lesson
      if (lessonId === id) {
        navigate(NAVIGATION.LESSON_LIST_PATH(unitId));
      }
    } catch (error) {
      // Error handling is typically managed by the mutation hooks
      logger.error('Failed to delete lesson plan', {
        operation: 'delete',
        lessonId: id,
        unitId,
        currentLessonId: lessonId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
    }
  };

  /**
   * Handles opening the edit modal and populating form data
   */
  const handleLessonEdit = (lesson: LessonPlan): void => {
    populateFormFromLesson(lesson);
    openEditModal(lesson.id);
  };

  /**
   * Handles template application and modal transitions
   */
  const handleTemplateApplication = async (template: PlanTemplate): Promise<void> => {
    try {
      await handleApplyTemplate(template);
      // Transition from template modal to create modal
      handleTemplateToCreate();
    } catch (error) {
      logger.error('Failed to apply template', {
        operation: 'applyTemplate',
        unitId,
        templateId: template?.id,
        templateName: template?.title,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      // Template modal stays open on error
    }
  };

  /**
   * Handles creating a new lesson (opens create modal)
   */
  const handleCreateNewLesson = (): void => {
    resetForm();
    openCreateModal();
  };

  /**
   * Handles creating from template (opens template modal)
   */
  const handleCreateFromTemplate = (): void => {
    closeTemplateModal();
  };

  /**
   * Handles canceling modal operations
   */
  const handleModalCancel = (): void => {
    closeCreateModal();
    resetForm();
  };

  /**
   * Generic delete confirmation handler
   */
  const handleDeleteConfirmation = (lessonId: string): void => {
    openDeleteConfirm(lessonId);
  };

  /**
   * Handles closing delete confirmation without action
   */
  const handleDeleteCancel = (): void => {
    closeDeleteConfirm();
  };

  return {
    // Form actions
    handleFormSubmit,
    handleModalCancel,
    
    // Lesson actions
    handleLessonEdit,
    handleLessonDelete,
    handleCreateNewLesson,
    handleCreateFromTemplate,
    
    // Template actions
    handleTemplateApplication,
    
    // Delete confirmation actions
    handleDeleteConfirmation,
    handleDeleteCancel,
    
    // Status checks
    isSubmitting: createLesson.isPending || updateLesson.isPending,
    isDeleting: deleteLesson.isPending,
  };
}

export type ETFOLessonPlanActions = ReturnType<typeof useETFOLessonPlanActions>;