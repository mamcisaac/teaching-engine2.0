import type { UseMutationResult } from '@tanstack/react-query';
import { Sparkles, RefreshCw, Save } from 'lucide-react';
import React from 'react';

import { Dialog } from '../../../components/Dialog';
import { AutoSaveIndicator } from '../../../components/ui/AutoSaveIndicator';
import { Button } from '../../../components/ui/Button';
import { MobileOptimizedForm } from '../../../components/ui/MobileOptimizedForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import type { UnitPlan, ETFOLessonPlan } from '../../../hooks/useETFOPlanning';
import { useAILessonPlanIntegration } from '../hooks/useAILessonPlanIntegration';
import { useArrayFieldHandlers } from '../hooks/useArrayFieldHandlers';
import type { ETFOLessonPlanFormData } from '../hooks/useETFOLessonPlanForm';

// Tab components
import { AIAssistantTab } from './tabs/AIAssistantTab';
import { AssessmentTab } from './tabs/AssessmentTab';
import { DifferentiationTab } from './tabs/DifferentiationTab';
import { MaterialsTab } from './tabs/MaterialsTab';
import { OverviewTab } from './tabs/OverviewTab';
import { ThreePartLessonTab } from './tabs/ThreePartLessonTab';

// Create a type that satisfies both UnitPlan and OverviewTab's requirements
type UnitPlanWithIndexSignature = UnitPlan & {
  [key: string]: unknown;
};

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLesson: string | null;
  formData: ETFOLessonPlanFormData;
  setFormData: (data: ETFOLessonPlanFormData) => void;
  updateFormData: (updates: Partial<ETFOLessonPlanFormData>) => void;
  resetForm: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  unitPlan?: UnitPlanWithIndexSignature;
  createLesson: UseMutationResult<ETFOLessonPlan, Error, Partial<ETFOLessonPlan> & { expectationIds?: string[] }, unknown>;
  updateLesson: UseMutationResult<ETFOLessonPlan, Error, { id: string; data: Partial<ETFOLessonPlan> & { expectationIds?: string[] } }, unknown>;
  // Auto-save related props
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  onManualSave?: () => void;
}

export function LessonFormModal({
  isOpen,
  onClose,
  editingLesson,
  formData,
  setFormData,
  updateFormData,
  resetForm,
  onSubmit,
  unitPlan,
  createLesson,
  updateLesson,
  hasUnsavedChanges = false,
  isSaving = false,
  lastSaved = null,
  onManualSave,
}: LessonFormModalProps): React.ReactElement {
  // Array field handlers
  const arrayHandlers = useArrayFieldHandlers(formData, setFormData);

  // AI integration
  const { handleAISuggestionAccepted, handleAILessonGenerated } = useAILessonPlanIntegration(
    formData,
    setFormData,
  );

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="p-3 sm:p-6 w-full max-w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingLesson !== null ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
          </h3>
          {editingLesson !== null && onManualSave && (
            <div className="flex items-center gap-2">
              <AutoSaveIndicator
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
                lastSaved={lastSaved}
                onManualSave={onManualSave}
              />
              <Button
                className="flex items-center gap-2"
                disabled={isSaving || !hasUnsavedChanges}
                size="sm"
                type="button"
                variant="outline"
                onClick={onManualSave}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        <MobileOptimizedForm>
          <form onSubmit={onSubmit}>
            <Tabs className="space-y-4" defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger className="gap-2" value="ai-assistant">
                  <Sparkles className="h-4 w-4" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="three-part">Three-Part Lesson</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab
                  formData={formData}
                  unitPlan={unitPlan}
                  updateFormData={updateFormData}
                />
              </TabsContent>

              <TabsContent value="ai-assistant">
                <AIAssistantTab
                  formData={formData}
                  unitPlan={unitPlan}
                  onLessonGenerated={handleAILessonGenerated}
                  onSuggestionAccepted={handleAISuggestionAccepted}
                />
              </TabsContent>

              <TabsContent value="three-part">
                <ThreePartLessonTab
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </TabsContent>

              <TabsContent value="materials">
                <MaterialsTab
                  materials={formData.materials}
                  onAdd={arrayHandlers.materials.add}
                  onRemove={arrayHandlers.materials.remove}
                  onUpdate={arrayHandlers.materials.update}
                />
              </TabsContent>

              <TabsContent value="differentiation">
                <DifferentiationTab
                  accommodations={formData.accommodations}
                  accommodationsHandlers={arrayHandlers.accommodations}
                  extensions={formData.extensions}
                  extensionsHandlers={arrayHandlers.extensions}
                  modifications={formData.modifications}
                  modificationsHandlers={arrayHandlers.modifications}
                />
              </TabsContent>

              <TabsContent value="assessment">
                <AssessmentTab
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={createLesson.isPending || updateLesson.isPending || isSaving}
                type="submit"
              >
                {createLesson.isPending || updateLesson.isPending || isSaving
                  ? 'Saving...'
                  : editingLesson !== null
                    ? 'Update Lesson Plan'
                    : 'Create Lesson Plan'}
              </Button>
            </div>
          </form>
        </MobileOptimizedForm>
      </div>
    </Dialog>
  );
}