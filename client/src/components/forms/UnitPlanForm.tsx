import { Plus, Trash2, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useLanguage } from '../../contexts/LanguageContext';
import type { LongRangePlan, CurriculumExpectation } from '../../hooks/useETFOPlanning';
import { AIUnitPlanPanel } from '../ai/AIUnitPlanPanel';
import { BilingualTextInput } from '../BilingualTextInput';
import { ExpectationSelector } from '../planning/ExpectationSelector';
import { RichTextEditor } from '../RichTextEditor';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/Textarea';
import { InfoTooltip } from '../ui/Tooltip';

// Extended UnitPlan type with all ETFO fields including bilingual support
export interface UnitPlanFormData {
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  bigIdeas: string;
  bigIdeasFr?: string;
  essentialQuestions: string[];
  essentialQuestionsFr?: string[];
  startDate: string;
  endDate: string;
  estimatedHours: number;
  assessmentPlan: string;
  assessmentPlanFr?: string;
  successCriteria: string[];
  successCriteriaFr?: string[];
  expectationIds: string[];
  longRangePlanId: string;
  // Additional ETFO fields
  crossCurricularConnections: string;
  crossCurricularConnectionsFr?: string;
  learningSkills: string[];
  learningSkillsFr?: string[];
  culminatingTask: string;
  culminatingTaskFr?: string;
  keyVocabulary: string[];
  keyVocabularyFr?: string[];
  priorKnowledge: string;
  priorKnowledgeFr?: string;
  parentCommunicationPlan: string;
  parentCommunicationPlanFr?: string;
  fieldTripsAndGuestSpeakers: string;
  fieldTripsAndGuestSpeakersFr?: string;
  differentiationStrategies: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  differentiationStrategiesFr?: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  indigenousPerspectives: string;
  indigenousPerspectivesFr?: string;
  environmentalEducation: string;
  environmentalEducationFr?: string;
  socialJusticeConnections: string;
  socialJusticeConnectionsFr?: string;
  technologyIntegration: string;
  technologyIntegrationFr?: string;
  communityConnections: string;
  communityConnectionsFr?: string;
}

interface UnitPlanFormProps {
  initialData?: Partial<UnitPlanFormData>;
  longRangePlan?: LongRangePlan | null;
  allLongRangePlans?: LongRangePlan[];
  curriculumExpectations?: CurriculumExpectation[];
  onSubmit: (data: UnitPlanFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showLongRangePlanSelector?: boolean;
}

export function UnitPlanForm({
  initialData,
  longRangePlan,
  allLongRangePlans = [],
  curriculumExpectations = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  showLongRangePlanSelector = false,
}: UnitPlanFormProps): React.ReactElement {
  const { t } = useLanguage();
  const [_showBilingualFields, _setShowBilingualFields] = useState(false);
  
  const [formData, setFormData] = useState<UnitPlanFormData>({
    title: '',
    titleFr: '',
    description: '',
    descriptionFr: '',
    bigIdeas: '',
    bigIdeasFr: '',
    essentialQuestions: [''],
    essentialQuestionsFr: [''],
    startDate: '',
    endDate: '',
    estimatedHours: 20,
    assessmentPlan: '',
    assessmentPlanFr: '',
    successCriteria: [''],
    successCriteriaFr: [''],
    expectationIds: [],
    longRangePlanId: longRangePlan?.id ?? '',
    // Additional ETFO fields
    crossCurricularConnections: '',
    crossCurricularConnectionsFr: '',
    learningSkills: [],
    learningSkillsFr: [],
    culminatingTask: '',
    culminatingTaskFr: '',
    keyVocabulary: [''],
    keyVocabularyFr: [''],
    priorKnowledge: '',
    priorKnowledgeFr: '',
    parentCommunicationPlan: '',
    parentCommunicationPlanFr: '',
    fieldTripsAndGuestSpeakers: '',
    fieldTripsAndGuestSpeakersFr: '',
    differentiationStrategies: {
      forStruggling: [''],
      forAdvanced: [''],
      forELL: [''],
      forIEP: [''],
    },
    differentiationStrategiesFr: {
      forStruggling: [''],
      forAdvanced: [''],
      forELL: [''],
      forIEP: [''],
    },
    indigenousPerspectives: '',
    indigenousPerspectivesFr: '',
    environmentalEducation: '',
    environmentalEducationFr: '',
    socialJusticeConnections: '',
    socialJusticeConnectionsFr: '',
    technologyIntegration: '',
    technologyIntegrationFr: '',
    communityConnections: '',
    communityConnectionsFr: '',
    ...initialData,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    return () => { // Cleanup
    };

    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Array manipulation helpers
  const addEssentialQuestion = (): void => {
    setFormData({ ...formData, essentialQuestions: [...formData.essentialQuestions, ''] });
  };

  const updateEssentialQuestion = (index: number, value: string): void => {
    const updated = [...formData.essentialQuestions];
    updated[index] = value;
    setFormData({ ...formData, essentialQuestions: updated });
  };

  const removeEssentialQuestion = (index: number): void => {
    if (formData.essentialQuestions.length > 1) {
      setFormData({
        ...formData,
        essentialQuestions: formData.essentialQuestions.filter((_, i) => i !== index),
      });
    }
  };

  const addSuccessCriteria = (): void => {
    setFormData({ ...formData, successCriteria: [...formData.successCriteria, ''] });
  };

  const updateSuccessCriteria = (index: number, value: string): void => {
    const updated = [...formData.successCriteria];
    updated[index] = value;
    setFormData({ ...formData, successCriteria: updated });
  };

  const removeSuccessCriteria = (index: number): void => {
    if (formData.successCriteria.length > 1) {
      setFormData({
        ...formData,
        successCriteria: formData.successCriteria.filter((_, i) => i !== index),
      });
    }
  };

  const addKeyVocabulary = (): void => {
    setFormData({ ...formData, keyVocabulary: [...formData.keyVocabulary, ''] });
  };

  const updateKeyVocabulary = (index: number, value: string): void => {
    const updated = [...formData.keyVocabulary];
    updated[index] = value;
    setFormData({ ...formData, keyVocabulary: updated });
  };

  const removeKeyVocabulary = (index: number): void => {
    if (formData.keyVocabulary.length > 1) {
      setFormData({
        ...formData,
        keyVocabulary: formData.keyVocabulary.filter((_, i) => i !== index),
      });
    }
  };

  // Differentiation strategy helpers
  const addDifferentiationStrategy = (category: keyof typeof formData.differentiationStrategies): void => {
    setFormData({
      ...formData,
      differentiationStrategies: {
        ...formData.differentiationStrategies,
        [category]: [...formData.differentiationStrategies[category], ''],
      },
    });
  };

  const updateDifferentiationStrategy = (
    category: keyof typeof formData.differentiationStrategies,
    index: number,
    value: string
  ): void => {
    const updated = [...formData.differentiationStrategies[category]];
    updated[index] = value;
    setFormData({
      ...formData,
      differentiationStrategies: {
        ...formData.differentiationStrategies,
        [category]: updated,
      },
    });
  };

  const removeDifferentiationStrategy = (
    category: keyof typeof formData.differentiationStrategies,
    index: number
  ): void => {
    if (formData.differentiationStrategies[category].length > 1) {
      setFormData({
        ...formData,
        differentiationStrategies: {
          ...formData.differentiationStrategies,
          [category]: formData.differentiationStrategies[category].filter((_, i) => i !== index),
        },
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Unit title is required';
    }

    if (!formData.longRangePlanId) {
      newErrors.longRangePlanId = 'Long-range plan selection is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.expectationIds.length === 0) {
      newErrors.expectationIds = 'At least one curriculum expectation must be selected';
    }

    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (validateForm()) {
      // Clean up empty array entries before submitting
      const cleanedData = {
        ...formData,
        essentialQuestions: formData.essentialQuestions.filter(q => q.trim() !== ''),
        successCriteria: formData.successCriteria.filter(c => c.trim() !== ''),
        keyVocabulary: formData.keyVocabulary.filter(v => v.trim() !== ''),
        differentiationStrategies: {
          forStruggling: formData.differentiationStrategies.forStruggling.filter(s => s.trim() !== ''),
          forAdvanced: formData.differentiationStrategies.forAdvanced.filter(s => s.trim() !== ''),
          forELL: formData.differentiationStrategies.forELL.filter(s => s.trim() !== ''),
          forIEP: formData.differentiationStrategies.forIEP.filter(s => s.trim() !== ''),
        },
      };

      onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger className="gap-2" value="ai-assistant">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6 mt-4" value="overview">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-4">
              {showLongRangePlanSelector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Long-Range Plan *
                  </label>
                  <select
                    required
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.longRangePlanId ? 'border-red-500' : ''
                    }`}
                    value={formData.longRangePlanId}
                    onChange={(e) => {
 setFormData({ ...formData, longRangePlanId: e.target.value }); 
}
                    }
                  >
                    <option value="">Select a long-range plan...</option>
                    {allLongRangePlans.map((plan, _index) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title} - {plan.subject} Grade {plan.grade}
                      </option>
                    ))}
                  </select>
                  {errors.longRangePlanId && (
                    <p className="mt-1 text-sm text-red-600">{errors.longRangePlanId}</p>
                  )}
                </div>
              )}

              <div>
                <BilingualTextInput
                  required
                  label={`${t('unit_plan')  } ${  t('title')}`}
                  placeholderEn="Enter unit title..."
                  placeholderFr="Entrez le titre de l'unité..."
                  valueEn={formData.title}
                  valueFr={formData.titleFr ?? ''}
                  onChangeEn={(value) => {
 setFormData({ ...formData, title: value }); 
}}
                  onChangeFr={(value) => {
 setFormData({ ...formData, titleFr: value }); 
}}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    required
                    className={errors.startDate ? 'border-red-500' : ''}
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
 setFormData({ ...formData, startDate: e.target.value }); 
}}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    required
                    className={errors.endDate ? 'border-red-500' : ''}
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
 setFormData({ ...formData, endDate: e.target.value }); 
}}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    className={errors.estimatedHours ? 'border-red-500' : ''}
                    id="estimatedHours"
                    min="1"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => {
 setFormData({ ...formData, estimatedHours: parseInt(e.target.value, 10) || 0 }); 
}
                    }
                  />
                  {errors.estimatedHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
                  )}
                </div>
              </div>

              <div>
                <BilingualTextInput
                  multiline
                  label={t('description')}
                  placeholderEn="Provide an overview of what this unit will cover..."
                  placeholderFr="Fournissez un aperçu de ce que cette unité couvrira..."
                  rows={3}
                  valueEn={formData.description}
                  valueFr={formData.descriptionFr ?? ''}
                  onChangeEn={(value) => {
 setFormData({ ...formData, description: value }); 
}}
                  onChangeFr={(value) => {
 setFormData({ ...formData, descriptionFr: value }); 
}}
                />
              </div>
            </div>
          </div>

          {/* Big Ideas */}
          <div>
            <Label htmlFor="input">Big Ideas & Enduring Understandings</Label>
            <RichTextEditor
              value={formData.bigIdeas}
              onChange={(value) => {
 setFormData({ ...formData, bigIdeas: value }); 
}}
            />
          </div>

          {/* Essential Questions */}
          <div>
            <Label htmlFor="input">Essential Questions</Label>
            <div className="space-y-2 mt-2">
              {formData.essentialQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="What is an essential question that will guide learning?"
                    type="text"
                    value={question}
                    onChange={(e) => {
 updateEssentialQuestion(index, e.target.value); 
}}
                  />
                  <Button
                    disabled={formData.essentialQuestions.length === 1}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
 removeEssentialQuestion(index); 
}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                className="w-full"
                size="sm"
                type="button"
                variant="outline"
                onClick={addEssentialQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6 mt-4" value="ai-assistant">
          <AIUnitPlanPanel
            className="w-full"
            curriculumExpectations={curriculumExpectations
              .filter(exp => formData.expectationIds.includes(exp.id))
              .map(exp => ({
                id: exp.id,
                code: exp.code,
                description: exp.description,
                strand: exp.strand,
              }))}
            duration={2}
            grade={longRangePlan?.grade || 1}
            subject={longRangePlan?.subject ?? ''}
            unitTitle={formData.title}
            onSuggestionAccepted={(type, content) => {
              // Handle AI suggestions
              switch (type) {
                case 'bigIdeas':
                  setFormData({ ...formData, bigIdeas: content.join('\n\n') });
                  break;
                case 'essentialQuestions':
                  setFormData({ ...formData, essentialQuestions: content });
                  break;
                case 'vocabulary': {
                  const existingVocab = formData.keyVocabulary.filter(v => v.trim());
                  setFormData({ ...formData, keyVocabulary: [...existingVocab, ...content] });
                  break;
                }
              }
            }}
            onUnitGenerated={(plan) => {
              setFormData({
                ...formData,
                title: plan.title || formData.title,
                bigIdeas: plan.bigIdeas.join('\n\n') || formData.bigIdeas,
                essentialQuestions: plan.learningGoals || formData.essentialQuestions,
              });
            }}
          />
        </TabsContent>

        <TabsContent className="space-y-6 mt-4" value="planning">
          <div>
            <Label htmlFor="input">Key Vocabulary</Label>
            <div className="space-y-2 mt-2">
              {formData.keyVocabulary.map((term, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Important term or concept..."
                    type="text"
                    value={term}
                    onChange={(e) => {
 updateKeyVocabulary(index, e.target.value); 
}}
                  />
                  <Button
                    disabled={formData.keyVocabulary.length === 1}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
 removeKeyVocabulary(index); 
}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                className="w-full"
                size="sm"
                type="button"
                variant="outline"
                onClick={addKeyVocabulary}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Term
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="input">Prior Knowledge Requirements</Label>
            <Textarea
              className="mt-2"
              placeholder="What should students already know before starting this unit?"
              rows={3}
              value={formData.priorKnowledge}
              onChange={(e) => {
 setFormData({ ...formData, priorKnowledge: e.target.value }); 
}}
            />
          </div>

          <div>
            <ExpectationSelector
              className={errors.expectationIds ? 'border-red-500' : ''}
              grade={longRangePlan?.grade}
              label="Curriculum Expectations *"
              placeholder="Select curriculum expectations for this unit..."
              selectedIds={formData.expectationIds}
              subject={longRangePlan?.subject}
              onChange={(ids) => {
 setFormData({ ...formData, expectationIds: ids }); 
}}
            />
            {errors.expectationIds && (
              <p className="mt-1 text-sm text-red-600">{errors.expectationIds}</p>
            )}
          </div>

          <div>
            <Label htmlFor="input">Culminating Task Description</Label>
            <RichTextEditor
              value={formData.culminatingTask}
              onChange={(value) => {
 setFormData({ ...formData, culminatingTask: value }); 
}}
            />
          </div>
        </TabsContent>

        <TabsContent className="space-y-6 mt-4" value="assessment">
          <div>
            <div className="flex items-center">
              <Label htmlFor="input">Assessment Plan</Label>
              <InfoTooltip content="Describe how you will assess student learning throughout the unit. Include diagnostic, formative, and summative assessments." />
            </div>
            <RichTextEditor
              placeholder="Include a mix of assessment types:

Diagnostic Assessment (Beginning of Unit):
• Pre-assessment activity to gauge prior knowledge
• Student self-assessment survey
• Class discussion to identify misconceptions

Formative Assessment (Throughout Unit):
• Daily exit tickets
• Peer feedback on draft work
• Teacher observations with anecdotal notes
• Student reflection journals
• Mini-quizzes for understanding checks

Summative Assessment (End of Unit):
• Culminating project with rubric
• Unit test covering key concepts
• Performance task demonstrating skills
• Portfolio of student work"
              value={formData.assessmentPlan}
              onChange={(value) => {
 setFormData({ ...formData, assessmentPlan: value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Learning Skills & Work Habits Focus</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                'Responsibility',
                'Organization',
                'Independent Work',
                'Collaboration',
                'Initiative',
                'Self-Regulation',
              ].map((skill, _index) => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    checked={formData.learningSkills.includes(skill)}
                    className="rounded"
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          learningSkills: [...formData.learningSkills, skill],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          learningSkills: formData.learningSkills.filter((s) => s !== skill),
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Label htmlFor="input">Success Criteria</Label>
              <InfoTooltip content="Clear statements that describe what students will know and be able to do by the end of the unit. Use student-friendly 'I can' statements." />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Write success criteria as &quot;I can&quot; statements that students can understand and use for self-assessment.
            </p>
            <div className="space-y-2 mt-2">
              {formData.successCriteria.map((criteria, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="I can explain how ecosystems work together..."
                    type="text"
                    value={criteria}
                    onChange={(e) => {
 updateSuccessCriteria(index, e.target.value); 
}}
                  />
                  <Button
                    disabled={formData.successCriteria.length === 1}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
 removeSuccessCriteria(index); 
}}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                className="w-full"
                size="sm"
                type="button"
                variant="outline"
                onClick={addSuccessCriteria}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Success Criteria
              </Button>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Examples of good success criteria:</strong><br />
                • I can identify the parts of an ecosystem<br />
                • I can explain how energy flows through a food chain<br />
                • I can create a diagram showing relationships in an ecosystem<br />
                • I can use scientific vocabulary when discussing ecosystems
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6 mt-4" value="differentiation">
          {Object.entries(formData.differentiationStrategies).map(([category, strategies]) => (
            <div key={category}>
              <Label htmlFor="input">
                {category === 'forStruggling' && 'Supports for Struggling Learners'}
                {category === 'forAdvanced' && 'Extensions for Advanced Learners'}
                {category === 'forELL' && 'Supports for English Language Learners'}
                {category === 'forIEP' && 'Accommodations for Students with IEPs'}
              </Label>
              <div className="space-y-2 mt-2">
                {strategies.map((strategy, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter differentiation strategy..."
                      type="text"
                      value={strategy}
                      onChange={(e) => {
 updateDifferentiationStrategy(
                          category as keyof typeof formData.differentiationStrategies,
                          index,
                          e.target.value
                        ); 
}
                      }
                    />
                    <Button
                      disabled={strategies.length === 1}
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() => {
 removeDifferentiationStrategy(
                          category as keyof typeof formData.differentiationStrategies,
                          index
                        ); 
}
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  className="w-full"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
 addDifferentiationStrategy(
                      category as keyof typeof formData.differentiationStrategies
                    ); 
}
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Strategy
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent className="space-y-6 mt-4" value="connections">
          <div>
            <Label htmlFor="input">Cross-Curricular Connections</Label>
            <Textarea
              className="mt-2"
              placeholder="How does this unit connect to other subject areas?"
              rows={3}
              value={formData.crossCurricularConnections}
              onChange={(e) => {
 setFormData({ ...formData, crossCurricularConnections: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Indigenous Perspectives</Label>
            <Textarea
              className="mt-2"
              placeholder="How will Indigenous knowledge and perspectives be integrated?"
              rows={3}
              value={formData.indigenousPerspectives}
              onChange={(e) => {
 setFormData({ ...formData, indigenousPerspectives: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Environmental Education</Label>
            <Textarea
              className="mt-2"
              placeholder="How will environmental learning be integrated?"
              rows={3}
              value={formData.environmentalEducation}
              onChange={(e) => {
 setFormData({ ...formData, environmentalEducation: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Social Justice Connections</Label>
            <Textarea
              className="mt-2"
              placeholder="How will equity and social justice themes be addressed?"
              rows={3}
              value={formData.socialJusticeConnections}
              onChange={(e) => {
 setFormData({ ...formData, socialJusticeConnections: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Technology Integration</Label>
            <Textarea
              className="mt-2"
              placeholder="How will technology be used to enhance learning?"
              rows={3}
              value={formData.technologyIntegration}
              onChange={(e) => {
 setFormData({ ...formData, technologyIntegration: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Community Connections</Label>
            <Textarea
              className="mt-2"
              placeholder="How will local partnerships and community connections be utilized?"
              rows={3}
              value={formData.communityConnections}
              onChange={(e) => {
 setFormData({ ...formData, communityConnections: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Parent Communication Plan</Label>
            <Textarea
              className="mt-2"
              placeholder="How will families be kept informed and engaged?"
              rows={3}
              value={formData.parentCommunicationPlan}
              onChange={(e) => {
 setFormData({ ...formData, parentCommunicationPlan: e.target.value }); 
}}
            />
          </div>

          <div>
            <Label htmlFor="input">Field Trips & Guest Speakers</Label>
            <Textarea
              className="mt-2"
              placeholder="What community experiences will enhance learning?"
              rows={3}
              value={formData.fieldTripsAndGuestSpeakers}
              onChange={(e) => {
 setFormData({ ...formData, fieldTripsAndGuestSpeakers: e.target.value }); 
}}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
        {onCancel && (
          <Button aria-label="Click button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : initialData ? 'Update Unit Plan' : 'Create Unit Plan'}
        </Button>
      </div>
    </form>
  );
}