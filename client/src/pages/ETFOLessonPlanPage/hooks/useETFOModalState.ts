import { useState } from 'react';

import type { LessonPlan } from '../types';

/**
 * Custom hook for managing modal states in the ETFO Lesson Plan Page
 * 
 * Centralizes all modal state management including create, edit, delete
 * confirmation, and template selection modals.
 */
export function useETFOModalState() {
  // Modal visibility states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Modal data states
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /**
   * Opens the create lesson modal
   */
  const openCreateModal = (): void => {
    setIsCreateModalOpen(true);
    setEditingLesson(null);
  };

  /**
   * Opens the edit lesson modal with lesson data
   */
  const openEditModal = (lessonId: string): void => {
    setEditingLesson(lessonId);
    setIsCreateModalOpen(true);
  };

  /**
   * Closes the create/edit modal and resets editing state
   */
  const closeCreateModal = (): void => {
    setIsCreateModalOpen(false);
    setEditingLesson(null);
  };

  /**
   * Opens the template selection modal
   */
  const openTemplateModal = (): void => {
    setIsTemplateModalOpen(true);
  };

  /**
   * Closes the template selection modal
   */
  const closeTemplateModal = (): void => {
    setIsTemplateModalOpen(false);
  };

  /**
   * Opens the delete confirmation dialog for a specific lesson
   */
  const openDeleteConfirm = (lessonId: string): void => {
    setDeleteConfirmId(lessonId);
  };

  /**
   * Closes the delete confirmation dialog
   */
  const closeDeleteConfirm = (): void => {
    setDeleteConfirmId(null);
  };

  /**
   * Closes all modals and resets all states
   */
  const closeAllModals = (): void => {
    setIsCreateModalOpen(false);
    setIsTemplateModalOpen(false);
    setEditingLesson(null);
    setDeleteConfirmId(null);
  };

  /**
   * Handles opening template modal and transitioning to create modal
   */
  const handleTemplateToCreate = (): void => {
    closeTemplateModal();
    openCreateModal();
  };

  return {
    // State values
    isCreateModalOpen,
    isTemplateModalOpen,
    editingLesson,
    deleteConfirmId,
    
    // Computed values
    isEditMode: editingLesson !== null,
    hasActiveModal: isCreateModalOpen || isTemplateModalOpen || deleteConfirmId !== null,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeCreateModal,
    openTemplateModal,
    closeTemplateModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    closeAllModals,
    handleTemplateToCreate,
  };
}

export type ETFOModalState = ReturnType<typeof useETFOModalState>;