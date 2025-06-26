import React, { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useLongRangePlan,
  useLongRangePlans,
  useUnitPlans,
  useUnitPlan,
  useCreateUnitPlan,
  useUpdateUnitPlan,
  UnitPlan,
} from '../hooks/useETFOPlanning';
import { useCurriculumExpectations } from '../api';
import { useUnitPlanForm } from '../hooks/useUnitPlanForm';
// import { UnitPlanService } from '../services/unitPlanService';
import { useTemplates, useApplyTemplate } from '../hooks/useTemplates';
import { PlanTemplate, isUnitPlanTemplate, UnitPlanContent } from '../types/template';
import { PlanningErrorBoundary } from '../components/ErrorBoundaries';
import { LoadingSpinner, EmptyState } from '../components/LoadingStates';
import { UnitPlanCard } from '../components/unitPlans/UnitPlanCard';
import { UnitPlanOverviewTab } from '../components/unitPlans/UnitPlanOverviewTab';
import { UnitPlanPlanningTab } from '../components/unitPlans/UnitPlanPlanningTab';
import Dialog from '../components/Dialog';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
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
// Lazy load AI components for better performance
const AIUnitPlanPanel = lazy(() =>
  import('../components/ai/AIUnitPlanPanel').then((m) => ({ default: m.AIUnitPlanPanel })),
);
const WithAIErrorBoundary = lazy(() =>
  import('../components/ai/AIErrorBoundary').then((m) => ({ default: m.WithAIErrorBoundary })),
);
import { AutoSaveIndicator } from '../components/ui/AutoSaveIndicator';
import { MobileOptimizedForm } from '../components/ui/MobileOptimizedForm';
import { generateUnitPlanHTML, printHTML, downloadHTML } from '../utils/printUtils';
import { BlankTemplateQuickActions } from '../components/printing/BlankTemplatePrinter';
import { SafeHtmlRenderer } from '../utils/sanitization';
import RichTextEditor from '../components/RichTextEditor';
import { PlanAccessTracker } from '../components/planning/PlanAccessTracker';

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

export default function UnitPlansPage() {
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
    subject: longRangePlan?.subject,
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

  const unitTemplates = unitTemplatesResult?.templates || [];

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
      if (editingUnit) {
        await updateUnit.mutateAsync({ id: editingUnit, ...data });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();
    if (!isValid) {
      console.error('Form validation errors:', errors);
      return;
    }

    const cleanData = getCleanFormData();

    if (editingUnit) {
      await updateUnit.mutateAsync({ id: editingUnit, ...cleanData });
      setEditingUnit(null);
    } else {
      await createUnit.mutateAsync(cleanData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  // AI suggestion handlers
  const handleAISuggestionAccepted = (type: string, content: string[]) => {
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
          '\n\nSuggested Activities:\n' + content.map((a) => `• ${a}`).join('\n');
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
  }) => {
    updateField('title', unitPlan.title || formData.title);
    updateField('description', unitPlan.description || formData.description);
    updateField('bigIdeas', unitPlan.bigIdeas?.join('\n\n') || formData.bigIdeas);
    updateField('essentialQuestions', unitPlan.learningGoals || formData.essentialQuestions);
    updateField('keyVocabulary', unitPlan.vocabulary || formData.keyVocabulary);
  };

  const handleEditUnit = (unit: UnitPlan) => {
    setEditingUnit(unit.id);
    // Convert UnitPlan to the form data structure
    const formDataUnit = {
      ...unit,
      differentiationStrategies: {
        forStruggling: unit.differentiationStrategies?.forStruggling || [],
        forAdvanced: unit.differentiationStrategies?.forAdvanced || [],
        forELL: unit.differentiationStrategies?.forELL || [],
        forIEP: unit.differentiationStrategies?.forIEP || [],
      },
    };
    loadUnitPlan(formDataUnit as ExtendedUnitPlan);
    setIsCreateModalOpen(true);
  };

  const handleApplyTemplate = async (template: PlanTemplate) => {
    try {
      const applied = await applyTemplate.mutateAsync({ id: template.id });

      if (isUnitPlanTemplate(template) && applied.appliedContent) {
        // Pre-populate form with template data
        const templateContent = applied.appliedContent as UnitPlanContent;
        updateField('title', '');
        updateField('description', templateContent.overview || '');
        updateField('bigIdeas', templateContent.bigIdeas || '');
        updateField('essentialQuestions', templateContent.essentialQuestions || []);
        updateField('keyVocabulary', templateContent.keyVocabulary || []);
        updateField(
          'assessmentPlan',
          templateContent.assessments ? JSON.stringify(templateContent.assessments) : '',
        );
        updateField('successCriteria', templateContent.successCriteria || []);
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
        if (template.estimatedWeeks) {
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
    } catch (error) {
      console.error('Failed to apply template:', error);
    }
  };

  if (isLoading) {
    return (
      <PlanningErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" message="Loading unit plans..." />
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
            <Link to="/planner/long-range" className="hover:text-indigo-600">
              Long-Range Plans
            </Link>
            <span>›</span>
            <Link to="/planner/units" className="hover:text-indigo-600">
              Unit Plans
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">{unit.title}</span>
          </div>

          {/* Unit Detail Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{unit.title}</h1>
                  {unit.titleFr && <p className="text-sm text-gray-600 mt-1">{unit.titleFr}</p>}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>
                      {new Date(unit.startDate).toLocaleDateString()} -{' '}
                      {new Date(unit.endDate).toLocaleDateString()}
                    </span>
                    <span>{unit.estimatedHours || 0} hours</span>
                    <span>{unit._count?.lessonPlans || 0} lessons</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      printHTML(
                        generateUnitPlanHTML({
                          ...unit,
                          startDate: new Date(unit.startDate),
                          endDate: new Date(unit.endDate),
                        }),
                        `${unit.title}-unit-plan`,
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadHTML(
                        generateUnitPlanHTML({
                          ...unit,
                          startDate: new Date(unit.startDate),
                          endDate: new Date(unit.endDate),
                        }),
                        `${unit.title}-unit-plan`,
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Link to={`/planner/units/${unitId}/lessons`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      View Lessons
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => handleEditUnit(unit)}>
                    Edit Unit
                  </Button>
                </div>
              </div>
            </div>

            {/* Unit Detail Content */}
            <div className="p-6 space-y-6">
              {unit.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{unit.description}</p>
                </div>
              )}

              {unit.bigIdeas && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Big Ideas</h3>
                  <SafeHtmlRenderer html={unit.bigIdeas} className="prose max-w-none" />
                </div>
              )}

              {unit.essentialQuestions && unit.essentialQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Questions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {unit.essentialQuestions.map((question, index) => (
                      <li key={index} className="text-gray-700">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {unit.successCriteria && unit.successCriteria.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Criteria</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {unit.successCriteria.map((criteria, index) => (
                      <li key={index} className="text-gray-700">
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {unit.assessmentPlan && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Plan</h3>
                  <SafeHtmlRenderer html={unit.assessmentPlan} className="prose max-w-none" />
                </div>
              )}

              {unit.keyVocabulary && unit.keyVocabulary.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Vocabulary</h3>
                  <div className="flex flex-wrap gap-2">
                    {unit.keyVocabulary.map((term, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ETFO-specific sections */}
              {unit.crossCurricularConnections && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cross-Curricular Connections
                  </h3>
                  <p className="text-gray-700">{unit.crossCurricularConnections}</p>
                </div>
              )}

              {/* Differentiation Strategies */}
              {unit.differentiationStrategies && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Differentiation Strategies
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {unit.differentiationStrategies?.forStruggling &&
                      unit.differentiationStrategies.forStruggling.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">For Struggling Learners</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {unit.differentiationStrategies.forStruggling.map(
                                (strategy, index) => (
                                  <li key={index}>{strategy}</li>
                                ),
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {unit.differentiationStrategies?.forAdvanced &&
                      unit.differentiationStrategies.forAdvanced.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">For Advanced Learners</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {unit.differentiationStrategies.forAdvanced.map((strategy, index) => (
                                <li key={index}>{strategy}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {unit.differentiationStrategies?.forELL &&
                      unit.differentiationStrategies.forELL.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">For English Language Learners</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {unit.differentiationStrategies.forELL.map((strategy, index) => (
                                <li key={index}>{strategy}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                    {unit.differentiationStrategies?.forIEP &&
                      unit.differentiationStrategies.forIEP.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">For Students with IEPs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {unit.differentiationStrategies.forIEP.map((strategy, index) => (
                                <li key={index}>{strategy}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </div>
              )}

              {/* Curriculum Expectations */}
              {unit.expectations && unit.expectations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Curriculum Expectations
                  </h3>
                  <div className="grid gap-2">
                    {unit.expectations.map(({ expectation }) => (
                      <div key={expectation.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-sm">{expectation.code}</span>
                            <p className="text-sm text-gray-700 mt-1">{expectation.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">{expectation.strand}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Summary */}
              {unit.progress && (
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-base">Progress Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completion</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {unit.progress.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 bg-indigo-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${unit.progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {unit.progress.completed} of {unit.progress.total} lessons completed
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PlanAccessTracker>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          {longRangePlanId ? (
            <>
              <Link to="/planner/long-range" className="hover:text-indigo-600">
                Long-Range Plans
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">
                {longRangePlan?.title || 'Unit Plans'}
              </span>
            </>
          ) : (
            <>
              <Link to="/curriculum" className="hover:text-indigo-600">
                Curriculum Expectations
              </Link>
              <span>›</span>
              <Link to="/planner/long-range" className="hover:text-indigo-600">
                Long-Range Plans
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">All Unit Plans</span>
            </>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {longRangePlanId ? 'Unit Plans' : 'All Unit Plans'}
            </h1>
            {longRangePlan ? (
              <p className="mt-2 text-gray-600">
                {longRangePlan.subject} - Grade {longRangePlan.grade} - {longRangePlan.academicYear}
              </p>
            ) : (
              <p className="mt-2 text-gray-600">Manage unit plans across all long-range plans</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <BlankTemplateQuickActions
              templateType="unit"
              schoolInfo={{
                grade: longRangePlan ? `Grade ${longRangePlan.grade}` : '',
                subject: longRangePlan?.subject || '',
                academicYear: longRangePlan?.academicYear || '',
              }}
            />
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <BookTemplate className="h-4 w-4" />
              Create from Template
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Unit Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Unit Plans Grid */}
      <PlanningErrorBoundary>
        {unitPlans.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            title="No unit plans yet"
            description="Start by creating your first unit plan for this long-range plan"
            action={
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Unit Plan
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {unitPlans.map((unit) => (
              <UnitPlanCard key={unit.id} unit={unit} onEdit={handleEditUnit} />
            ))}
          </div>
        )}
      </PlanningErrorBoundary>

      {/* Create/Edit Unit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <div className="p-6 max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingUnit ? 'Edit Unit Plan' : 'Create Unit Plan'}
            </h3>
            {editingUnit && (
              <div className="flex items-center gap-2">
                <AutoSaveIndicator
                  lastSaved={lastSaved}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onManualSave={saveNow}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={saveNow}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="flex items-center gap-2"
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
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ai-assistant" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="planning">Planning</TabsTrigger>
                  <TabsTrigger value="assessment">Assessment</TabsTrigger>
                  <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-4">
                  <UnitPlanOverviewTab
                    formData={formData}
                    updateField={updateField}
                    longRangePlanId={longRangePlanId}
                    allLongRangePlans={allLongRangePlans}
                  />
                </TabsContent>

                <TabsContent value="ai-assistant" className="space-y-6 mt-4">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading AI Assistant...</span>
                      </div>
                    }
                  >
                    <WithAIErrorBoundary>
                      <AIUnitPlanPanel
                        unitTitle={formData.title}
                        subject={longRangePlan?.subject || ''}
                        grade={longRangePlan?.grade || 1}
                        duration={2} // Default 2 weeks
                        curriculumExpectations={curriculumExpectations
                          .filter((exp) => formData.expectationIds.includes(exp.id))
                          .map((exp) => ({
                            id: exp.id,
                            code: exp.code,
                            description: exp.description,
                            strand: exp.strand,
                          }))}
                        onSuggestionAccepted={handleAISuggestionAccepted}
                        onUnitGenerated={handleAIUnitGenerated}
                        className="w-full"
                      />
                    </WithAIErrorBoundary>
                  </Suspense>
                </TabsContent>

                <TabsContent value="planning" className="space-y-6 mt-4">
                  <UnitPlanPlanningTab
                    formData={formData}
                    updateField={updateField}
                    addArrayItem={addArrayItem}
                    updateArrayItem={updateArrayItem}
                    removeArrayItem={removeArrayItem}
                    longRangePlan={longRangePlan}
                  />
                </TabsContent>

                <TabsContent value="assessment" className="space-y-6 mt-4">
                  <div>
                    <Label>Assessment Plan</Label>
                    <RichTextEditor
                      value={formData.assessmentPlan}
                      onChange={(value) => updateField('assessmentPlan', value)}
                    />
                  </div>

                  <div>
                    <Label>Learning Skills & Work Habits Focus</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[
                        'Responsibility',
                        'Organization',
                        'Independent Work',
                        'Collaboration',
                        'Initiative',
                        'Self-Regulation',
                      ].map((skill) => (
                        <label key={skill} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.learningSkills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField('learningSkills', [...formData.learningSkills, skill]);
                              } else {
                                updateField(
                                  'learningSkills',
                                  formData.learningSkills.filter((s) => s !== skill),
                                );
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="differentiation" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Differentiation Strategies</CardTitle>
                      <CardDescription>
                        Plan how you&apos;ll support diverse learners in this unit
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>For Struggling Learners</Label>
                        <div className="space-y-2 mt-2">
                          {formData.differentiationStrategies.forStruggling.map(
                            (strategy, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={strategy}
                                  onChange={(e) =>
                                    updateDifferentiationStrategy(
                                      'forStruggling',
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Support strategy..."
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeDifferentiationStrategy('forStruggling', index)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ),
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDifferentiationStrategy('forStruggling')}
                          >
                            Add Strategy
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>For Advanced Learners</Label>
                        <div className="space-y-2 mt-2">
                          {formData.differentiationStrategies.forAdvanced.map((strategy, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={strategy}
                                onChange={(e) =>
                                  updateDifferentiationStrategy(
                                    'forAdvanced',
                                    index,
                                    e.target.value,
                                  )
                                }
                                placeholder="Extension strategy..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDifferentiationStrategy('forAdvanced', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDifferentiationStrategy('forAdvanced')}
                          >
                            Add Strategy
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>For English Language Learners</Label>
                        <div className="space-y-2 mt-2">
                          {formData.differentiationStrategies.forELL.map((strategy, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={strategy}
                                onChange={(e) =>
                                  updateDifferentiationStrategy('forELL', index, e.target.value)
                                }
                                placeholder="Language support strategy..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDifferentiationStrategy('forELL', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDifferentiationStrategy('forELL')}
                          >
                            Add Strategy
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label>For Students with IEPs</Label>
                        <div className="space-y-2 mt-2">
                          {formData.differentiationStrategies.forIEP.map((strategy, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={strategy}
                                onChange={(e) =>
                                  updateDifferentiationStrategy('forIEP', index, e.target.value)
                                }
                                placeholder="IEP accommodation..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDifferentiationStrategy('forIEP', index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addDifferentiationStrategy('forIEP')}
                          >
                            Add Strategy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="connections" className="space-y-6 mt-4">
                  <div>
                    <Label>Cross-Curricular Connections</Label>
                    <Textarea
                      value={formData.crossCurricularConnections}
                      onChange={(e) => updateField('crossCurricularConnections', e.target.value)}
                      placeholder="How does this unit connect to other subject areas?"
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Indigenous Perspectives</Label>
                    <Textarea
                      value={formData.indigenousPerspectives}
                      onChange={(e) => updateField('indigenousPerspectives', e.target.value)}
                      placeholder="How will you incorporate Indigenous knowledge and perspectives?"
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Environmental Education</Label>
                    <Textarea
                      value={formData.environmentalEducation}
                      onChange={(e) => updateField('environmentalEducation', e.target.value)}
                      placeholder="Environmental learning opportunities in this unit..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Social Justice Connections</Label>
                    <Textarea
                      value={formData.socialJusticeConnections}
                      onChange={(e) => updateField('socialJusticeConnections', e.target.value)}
                      placeholder="Equity and social justice themes..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Technology Integration</Label>
                    <Textarea
                      value={formData.technologyIntegration}
                      onChange={(e) => updateField('technologyIntegration', e.target.value)}
                      placeholder="How will technology enhance learning in this unit?"
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Community Connections</Label>
                    <Textarea
                      value={formData.communityConnections}
                      onChange={(e) => updateField('communityConnections', e.target.value)}
                      placeholder="Local partnerships, field trips, guest speakers..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Parent Communication Plan</Label>
                    <Textarea
                      value={formData.parentCommunicationPlan}
                      onChange={(e) => updateField('parentCommunicationPlan', e.target.value)}
                      placeholder="How will you communicate unit goals and progress to families?"
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingUnit(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUnit.isPending || updateUnit.isPending || isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {createUnit.isPending || updateUnit.isPending || isSaving
                    ? 'Saving...'
                    : editingUnit
                      ? 'Update Unit Plan'
                      : 'Create Unit Plan'}
                </Button>
              </div>
            </form>
          </MobileOptimizedForm>
        </div>
      </Dialog>

      {/* Template Selection Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Choose a Unit Plan Template</h3>
          </div>

          {unitTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <BookTemplate className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
              <p className="text-gray-600">
                {longRangePlan
                  ? `No unit plan templates found for Grade ${longRangePlan.grade} ${longRangePlan.subject}.`
                  : 'No unit plan templates available at this time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Select a template to get started with your unit plan. Templates provide
                pre-structured content that you can customize.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {unitTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{template.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.category} • Grade {template.gradeMin}
                            {template.gradeMax &&
                              template.gradeMax !== template.gradeMin &&
                              `-${template.gradeMax}`}
                            {template.estimatedWeeks && ` • ${template.estimatedWeeks} weeks`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <span className="text-sm">
                            {template.averageRating?.toFixed(1) || '—'}
                          </span>
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags && template.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Used {template.usageCount || 0} times</span>
                        <span>By {template.createdByUser?.name || 'Anonymous'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsTemplateModalOpen(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedTemplate || applyTemplate.isPending}
              onClick={() => selectedTemplate && handleApplyTemplate(selectedTemplate)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {applyTemplate.isPending ? 'Loading...' : 'Use This Template'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
