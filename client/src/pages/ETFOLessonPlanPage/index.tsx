import React from 'react';
import { useParams } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useAutoSave, useUnsavedChangesWarning } from '../../hooks/useAutoSave';
import {
  useUnitPlan,
  useETFOLessonPlans,
  useETFOLessonPlan,
  useCreateETFOLessonPlan,
  useUpdateETFOLessonPlan,
  useDeleteETFOLessonPlan,
  type UnitPlan,
} from '../../hooks/useETFOPlanning';
import { useTemplates } from '../../hooks/useTemplates';

// Import from modular barrel exports following printUtils.tsx pattern
import { LessonDetailView, LessonListView, LessonFormModal, TemplateSelectionModal } from './components';
import { 
  useETFOLessonPlanForm, 
  useTemplateIntegration, 
  useETFOModalState, 
  useETFOLessonPlanActions 
} from './hooks';
import { AUTO_SAVE_CONFIG, TEMPLATE_CONFIG, DIALOG_MESSAGES } from './utils';

/**
 * ETFO Lesson Plan Page - Main Component
 * 
 * A clean orchestrator component that coordinates all lesson plan operations
 * using modular hooks and components. This component has been refactored
 * following the successful printUtils.tsx pattern to provide:
 * 
 * - Modular directory structure with focused responsibilities
 * - Custom hooks for form handling, state management, and actions
 * - Clean barrel exports for maintainable imports
 * - Centralized constants and configuration
 * - Separation of concerns between UI and business logic
 * 
 * Key Features:
 * - Auto-save functionality for lesson plans
 * - Template integration for quick lesson creation
 * - Modal state management for create/edit/delete operations
 * - Responsive design with mobile optimization
 * - AI-assisted lesson planning capabilities
 * 
 * Architecture:
 * - Uses custom hooks for all state management and business logic
 * - Components are focused on presentation and user interaction
 * - Constants are centralized for easy maintenance
 * - Follows React best practices for performance and accessibility
 * 
 * @returns React component for the ETFO lesson planning interface
 */
export function ETFOLessonPlanPage(): React.ReactElement {
  const { unitId, lessonId } = useParams();
  
  // Validate required params
  if (!unitId) {
    throw new Error('Unit ID is required');
  }

  // Form management
  const formActions = useETFOLessonPlanForm();
  const { formData, setFormData, resetForm, updateFormData, populateFormFromLesson: _populateFormFromLesson, getCleanedFormData } = formActions;
  
  // Modal state management
  const modalState = useETFOModalState();
  const { isCreateModalOpen, isTemplateModalOpen, editingLesson, deleteConfirmId } = modalState;

  // Data fetching hooks
  const { data: unitPlan } = useUnitPlan(unitId);
  const { data: lessonPlans = [], isLoading: isLoadingLessons } = useETFOLessonPlans({ unitPlanId: unitId });
  const { data: selectedLesson } = useETFOLessonPlan(lessonId ?? '');

  // Mutation hooks
  const mutations = {
    createLesson: useCreateETFOLessonPlan(),
    updateLesson: useUpdateETFOLessonPlan(),
    deleteLesson: useDeleteETFOLessonPlan(),
  };

  // Template management
  const { data: lessonTemplatesResult } = useTemplates({
    type: TEMPLATE_CONFIG.DEFAULT_TYPE,
    subject: unitPlan?.longRangePlan?.subject,
    gradeMin: unitPlan?.longRangePlan?.grade,
    gradeMax: unitPlan?.longRangePlan?.grade,
    limit: TEMPLATE_CONFIG.FETCH_LIMIT,
  });
  const lessonTemplates = lessonTemplatesResult?.templates ?? [];

  const templateActions = useTemplateIntegration(formData, setFormData);
  const { handleApplyTemplate: _handleApplyTemplate, isApplyingTemplate } = templateActions;

  // Action handlers using our custom hook
  const actions = useETFOLessonPlanActions({
    unitId,
    lessonId,
    formData,
    modalState,
    formActions,
    mutations,
    templateActions,
  });
  
  // Auto-save functionality for existing lessons
  const autoSaveData = editingLesson ? formData : null;
  const { lastSaved, isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    data: autoSaveData,
    saveFn: async (data) => {
      if (editingLesson && data && unitId) {
        const cleanedData = getCleanedFormData(unitId);
        await mutations.updateLesson.mutateAsync({ id: editingLesson, data: cleanedData });
      }
    },
    enabled: Boolean(editingLesson && autoSaveData),
    delay: AUTO_SAVE_CONFIG.DELAY,
  });

  useUnsavedChangesWarning(hasUnsavedChanges);

  // If we're in detail mode (lessonId provided), show the detail view
  if (lessonId && selectedLesson) {
    return (
      <LessonDetailView
        lesson={selectedLesson}
        unitId={unitId}
        unitPlan={unitPlan}
        onEdit={() => {
 actions.handleLessonEdit(selectedLesson); 
}}
      />
    );
  }

  // List view when showing all lessons for a unit
  return (
    <>
      <LessonListView
        isLoadingLessons={isLoadingLessons}
        lessonPlans={lessonPlans}
        unitId={unitId}
        unitPlan={unitPlan}
        onCreateFromTemplate={modalState.openTemplateModal}
        onCreateLesson={actions.handleCreateNewLesson}
        onDeleteLesson={actions.handleDeleteConfirmation}
        onEditLesson={actions.handleLessonEdit}
      />

      {/* Create/Edit Lesson Modal */}
      <LessonFormModal
        createLesson={mutations.createLesson}
        editingLesson={editingLesson}
        formData={formData}
        hasUnsavedChanges={hasUnsavedChanges}
        isOpen={isCreateModalOpen}
        isSaving={isSaving}
        lastSaved={lastSaved}
        resetForm={resetForm}
        setFormData={setFormData}
        unitPlan={unitPlan as (UnitPlan & { [key: string]: unknown }) | undefined}
        updateFormData={updateFormData}
        updateLesson={mutations.updateLesson}
        onClose={modalState.closeCreateModal}
        onManualSave={editingLesson ? saveNow : undefined}
        onSubmit={actions.handleFormSubmit}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isApplyingTemplate={isApplyingTemplate}
        isOpen={isTemplateModalOpen}
        templates={lessonTemplates}
        unitPlan={unitPlan}
        onApplyTemplate={actions.handleTemplateApplication}
        onClose={modalState.closeTemplateModal}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={modalState.closeDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DIALOG_MESSAGES.DELETE_CONFIRMATION.TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {DIALOG_MESSAGES.DELETE_CONFIRMATION.DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{DIALOG_MESSAGES.DELETE_CONFIRMATION.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteConfirmId) {
                  void actions.handleLessonDelete(deleteConfirmId);
                }
              }}
            >
              {DIALOG_MESSAGES.DELETE_CONFIRMATION.CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Following printUtils.tsx pattern - re-export everything for external use
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';