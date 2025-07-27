
import {
  Plus,
  Sparkles,
  Printer,
  Download,
  Save,
  RefreshCw,
  Trash2,
  BookTemplate,
} from 'lucide-react';
import React, { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';

import { useCurriculumExpectations } from '../api/domains/curriculum';
import { Dialog } from '../components/Dialog';
import { PlanningErrorBoundary } from '../components/ErrorBoundaries';
import { EmptyState } from '../components/LoadingStates';
import { OptimizedUnitPlanCard, LoadingSkeleton } from '../components/performance';
import { PlanAccessTracker } from '../components/planning/PlanAccessTracker';
import { BlankTemplateQuickActions } from '../components/printing/BlankTemplatePrinter';
import { RichTextEditor } from '../components/RichTextEditor';
import { AutoSaveIndicator } from '../components/ui/AutoSaveIndicator';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { MobileOptimizedForm } from '../components/ui/MobileOptimizedForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/Textarea';
import { UnitPlanOverviewTab } from '../components/unitPlans/UnitPlanOverviewTab';
import { UnitPlanPlanningTab } from '../components/unitPlans/UnitPlanPlanningTab';
import type { UnitPlan } from '../hooks/useETFOPlanning';
import {
  useLongRangePlan,
  useLongRangePlans,
  useUnitPlans,
  useUnitPlan,
  useCreateUnitPlan,
  useUpdateUnitPlan
} from '../hooks/useETFOPlanning';
import { useTemplates, useApplyTemplate } from '../hooks/useTemplates';
import type { UnitPlanFormData } from '../hooks/useUnitPlanForm';
import { useUnitPlanForm } from '../hooks/useUnitPlanForm';
import type { PlanTemplate, UnitPlanContent } from '../types/template';
// import { UnitPlanService } from '../services/unitPlanService';
import { isUnitPlanTemplate } from '../types/template';
import { logger } from '../utils/logger';
import { generateUnitPlanHTML, printHTML, downloadHTML } from '../utils/printUtils';
import { SafeHtmlRenderer } from '../utils/sanitization';

// Lazy load AI components for better performance
const AIUnitPlanPanel = lazy(() =>
  import('../components/ai/AIUnitPlanPanel').then((m) => ({ default: m.AIUnitPlanPanel })),
);
const WithAIErrorBoundary = lazy(() =>
  import('../components/ai/AIErrorBoundary').then((m) => ({ default: m.WithAIErrorBoundary })),
);
// Extended UnitPlan type with all ETFO fields
interface ExtendedUnitPlan extends UnitPlan {
  crossCurricularConnections?: string;
  learningSkills?: string[];
  culminatingTask?: string;
  keyVocabulary?: string[];
  priorKnowledge?: string;
  parentCommunicationPlan?: string;
  fieldTripsAndGuestSpeakers?: string;
  differentiationStrategies?: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  indigenousPerspectives?: string;
  environmentalEducation?: string;
  socialJusticeConnections?: string;
  technologyIntegration?: string;
  communityConnections?: string;
}

export default function UnitPlansPage(): React.ReactElement {
  const { longRangePlanId, unitId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);

  // Fetch data
  const { data: longRangePlan } = useLongRangePlan(longRangePlanId || '');
  const { data: allLongRangePlans = [] } = useLongRangePlans();
  const { data: unitPlans = [], isLoading } = useUnitPlans(
    longRangePlanId ? { longRangePlanId } : {},
  );
  const { data: selectedUnit } = useUnitPlan(unitId || '');

  // Curriculum expectations for AI assistance
  const { data: curriculumExpectations = [] } = useCurriculumExpectations({
    grade: longRangePlan?.grade,
    // Note: longRangePlan.subject is a string but hook expects subjectId as number
    // This needs to be resolved by either changing the LongRangePlan schema
    // or adding a subject name to ID mapping
  });

  // Mutations
  const createUnit = useCreateUnitPlan();
  const updateUnit = useUpdateUnitPlan();

  // Template-related hooks
  const { data: unitTemplatesResult } = useTemplates({
    type: 'UNIT_PLAN',
    subject: longRangePlan?.subject,
    gradeMin: longRangePlan?.grade,
    gradeMax: longRangePlan?.grade,
    limit: 20,
  });
  const applyTemplate = useApplyTemplate();

  const unitTemplates = unitTemplatesResult?.templates ?? [];

  // Form management with custom hook
  const {
    formData,
    updateField,
    addArrayItem,
    updateArrayItem,
    removeArrayItem,
    updateDifferentiationStrategy,
    addDifferentiationStrategy,
    removeDifferentiationStrategy,
    validateForm,
    getCleanFormData,
    resetForm,
    loadUnitPlan,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
  } = useUnitPlanForm({
    longRangePlanId,
    editingId: editingUnit,
    onSave: async (data) => {
      if (!editingUnit= null) {
        await updateUnit.mutateAsync({ id: editingUnit, ...data });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const { isValid, errors } = validateForm();
    if (!isValid) {
      logger.error('Form validation errors:', errors);
      return;
    }

    const cleanData = getCleanFormData();

    if (!editingUnit= null) {
      await updateUnit.mutateAsync({ id: editingUnit, ...cleanData });
      setEditingUnit(null);
    } else {
      await createUnit.mutateAsync(cleanData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  // AI suggestion handlers
  const handleAISuggestionAccepted = (type: string, content: string[]): void => {
    switch (type) {
      case 'bigIdeas':
        updateField('bigIdeas', content.join('\n\n'));
        break;
      case 'essentialQuestions':
        updateField('essentialQuestions', content);
        break;
      case 'activities': {
        // Add to description or a specific activities field if available
        const currentDesc = formData.description;
        const activitiesText =
          `\n\nSuggested Activities:\n${  content.map((a, _index) => `• ${a}`).join('\n')}`;
        updateField('description', currentDesc + activitiesText);
        break;
      }
      case 'vocabulary': {
        const existingVocab = formData.keyVocabulary.filter((v) => v.trim());
        updateField('keyVocabulary', [...existingVocab, ...content]);
        break;
      }
      default:
      // Unhandled suggestion type
    }
  };

  const handleAIUnitGenerated = (unitPlan: {
    title?: string;
    description?: string;
    bigIdeas?: string[];
    learningGoals?: string[];
    vocabulary?: string[];
  }): void => {
    updateField('title', unitPlan.title ?? formData.title);
    updateField('description', unitPlan.description ?? formData.description);
    updateField('bigIdeas', unitPlan.bigIdeas?.join('\n\n') ?? formData.bigIdeas);
    updateField('essentialQuestions', unitPlan.learningGoals ?? formData.essentialQuestions);
    updateField('keyVocabulary', unitPlan.vocabulary ?? formData.keyVocabulary);
  };

  const handleEditUnit = (unit: UnitPlan): void => {
    setEditingUnit(unit.id);
    // Convert UnitPlan to the form data structure
    const formDataUnit = {
      ...unit,
      differentiationStrategies: {
        forStruggling: unit.differentiationStrategies?.forStruggling ?? [],
        forAdvanced: unit.differentiationStrategies?.forAdvanced ?? [],
        forELL: unit.differentiationStrategies?.forELL ?? [],
        forIEP: unit.differentiationStrategies?.forIEP ?? [],
      },
    };
    loadUnitPlan({ ...formDataUnit, expectationIds: [] } as UnitPlanFormData);
    setIsCreateModalOpen(true);
  };

  const handleApplyTemplate = async (template: PlanTemplate): Promise<void> => {
    try {
      const applied = await applyTemplate.mutateAsync({ id: template.id });

      if (isUnitPlanTemplate(template) && applied.appliedContent) {
        // Pre-populate form with template data
        const templateContent = applied.appliedContent as UnitPlanContent;
        updateField('title', '');
        updateField('description', templateContent.overview || '');
        updateField('bigIdeas', templateContent.bigIdeas || '');
        updateField('essentialQuestions', templateContent.essentialQuestions ?? []);
        updateField('keyVocabulary', templateContent.keyVocabulary ?? []);
        updateField(
          'assessmentPlan',
          templateContent.assessments ? JSON.stringify(templateContent.assessments) : '',
        );
        updateField('successCriteria', templateContent.successCriteria ?? []);
        updateField('crossCurricularConnections', templateContent.crossCurricularConnections || '');
        // Handle differentiationStrategies which might have different structure in template
        const diffStrategies = templateContent.differentiationStrategies;
        if (diffStrategies && typeof diffStrategies === 'object') {
          updateField('differentiationStrategies', {
            forStruggling: Array.isArray(diffStrategies.forStruggling)
              ? diffStrategies.forStruggling
              : [],
            forAdvanced: Array.isArray(diffStrategies.forAdvanced)
              ? diffStrategies.forAdvanced
              : [],
            forELL: Array.isArray(diffStrategies.forELL) ? diffStrategies.forELL : [],
            forIEP: Array.isArray(diffStrategies.forIEP) ? diffStrategies.forIEP : [],
          });
        } else {
          updateField('differentiationStrategies', {
            forStruggling: [],
            forAdvanced: [],
            forELL: [],
            forIEP: [],
          });
        }
        updateField('culminatingTask', templateContent.culminatingTask || '');
        updateField('priorKnowledge', templateContent.priorKnowledge || '');
        updateField('parentCommunicationPlan', templateContent.parentCommunicationPlan || '');
        updateField('fieldTripsAndGuestSpeakers', templateContent.fieldTripsAndGuestSpeakers || '');
        updateField('indigenousPerspectives', templateContent.indigenousPerspectives || '');
        updateField('environmentalEducation', templateContent.environmentalEducation || '');
        updateField('socialJusticeConnections', templateContent.socialJusticeConnections || '');
        updateField('technologyIntegration', templateContent.technologyIntegration || '');
        updateField('communityConnections', templateContent.communityConnections || '');

        // Set estimated duration if available
        if (template.estimatedWeeks && template.estimatedWeeks > 0) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + template.estimatedWeeks * 7);
          updateField('startDate', startDate.toISOString().split('T')[0]);
          updateField('endDate', endDate.toISOString().split('T')[0]);
          updateField('estimatedHours', template.estimatedWeeks * 5); // Assume 5 hours per week
        }
      }

      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
      setIsCreateModalOpen(true);
    } catch (_error) {
      logger.error('Failed to apply template:', _error);
    }
  };

  if (isLoading ) {
    return (
      <PlanningErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <LoadingSkeleton className="mb-4" lines={2} variant="text" />
            <LoadingSkeleton height="40px" width="200px" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, _index) => (
              <LoadingSkeleton key={_index} variant="card" />
            ))}
          </div>
        </div>
      </PlanningErrorBoundary>
    );
  }

  // Detail view for a specific unit
  if (unitId && selectedUnit) {
    const unit = selectedUnit as ExtendedUnitPlan;
    return (
      <PlanAccessTracker planType="unit">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link className="hover:text-indigo-600" to="/planner/long-range">
              Long-Range Plans
            </Link>
