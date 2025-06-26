import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import RichTextEditor from '../RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
// import { Textarea } from '../ui/Textarea';
import { Plus, Trash2 } from 'lucide-react';
import ExpectationSelector from '../planning/ExpectationSelector';
import { UnitPlan, CurriculumExpectation } from '../../hooks/useETFOPlanning';
import { InfoTooltip } from '../ui/Tooltip';
import BilingualTextInput from '../BilingualTextInput';
import { useLanguage } from '../../contexts/LanguageContext';

export interface LessonPlanFormData {
  title: string;
  titleFr?: string;
  unitPlanId: string;
  date: string;
  duration: number;
  // Three-part lesson structure (ETFO standard)
  mindsOn?: string;
  mindsOnFr?: string;
  action?: string;
  actionFr?: string;
  consolidation?: string;
  consolidationFr?: string;
  // Planning details
  learningGoals?: string;
  learningGoalsFr?: string;
  materials: string[];
  grouping?: string;
  // Differentiation
  accommodations: string[];
  modifications: string[];
  extensions: string[];
  // Assessment
  assessmentType?: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes?: string;
  assessmentNotesFr?: string;
  // Substitute teacher friendly
  isSubFriendly: boolean;
  subNotes?: string;
  subNotesFr?: string;
  // Expectations
  expectationIds: string[];
}

interface LessonPlanFormProps {
  initialData?: Partial<LessonPlanFormData>;
  unitPlan?: UnitPlan | null;
  allUnitPlans?: UnitPlan[];
  unitExpectations?: CurriculumExpectation[];
  onSubmit: (data: LessonPlanFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showUnitPlanSelector?: boolean;
}

export default function LessonPlanForm({
  initialData,
  unitPlan,
  allUnitPlans = [],
  unitExpectations = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  showUnitPlanSelector = false,
}: LessonPlanFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LessonPlanFormData>({
    title: '',
    titleFr: '',
    unitPlanId: unitPlan?.id || '',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    mindsOn: '',
    mindsOnFr: '',
    action: '',
    actionFr: '',
    consolidation: '',
    consolidationFr: '',
    learningGoals: '',
    learningGoalsFr: '',
    materials: [''],
    grouping: 'whole class',
    accommodations: [''],
    modifications: [''],
    extensions: [''],
    assessmentType: 'formative',
    assessmentNotes: '',
    assessmentNotesFr: '',
    isSubFriendly: true,
    subNotes: '',
    subNotesFr: '',
    expectationIds: [],
    ...initialData,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Array manipulation helpers
  const addMaterial = () => {
    setFormData({ ...formData, materials: [...formData.materials, ''] });
  };

  const updateMaterial = (index: number, value: string) => {
    const updated = [...formData.materials];
    updated[index] = value;
    setFormData({ ...formData, materials: updated });
  };

  const removeMaterial = (index: number) => {
    if (formData.materials.length > 1) {
      setFormData({
        ...formData,
        materials: formData.materials.filter((_, i) => i !== index),
      });
    }
  };

  const addAccommodation = () => {
    setFormData({ ...formData, accommodations: [...formData.accommodations, ''] });
  };

  const updateAccommodation = (index: number, value: string) => {
    const updated = [...formData.accommodations];
    updated[index] = value;
    setFormData({ ...formData, accommodations: updated });
  };

  const removeAccommodation = (index: number) => {
    if (formData.accommodations.length > 1) {
      setFormData({
        ...formData,
        accommodations: formData.accommodations.filter((_, i) => i !== index),
      });
    }
  };

  const addModification = () => {
    setFormData({ ...formData, modifications: [...formData.modifications, ''] });
  };

  const updateModification = (index: number, value: string) => {
    const updated = [...formData.modifications];
    updated[index] = value;
    setFormData({ ...formData, modifications: updated });
  };

  const removeModification = (index: number) => {
    if (formData.modifications.length > 1) {
      setFormData({
        ...formData,
        modifications: formData.modifications.filter((_, i) => i !== index),
      });
    }
  };

  const addExtension = () => {
    setFormData({ ...formData, extensions: [...formData.extensions, ''] });
  };

  const updateExtension = (index: number, value: string) => {
    const updated = [...formData.extensions];
    updated[index] = value;
    setFormData({ ...formData, extensions: updated });
  };

  const removeExtension = (index: number) => {
    if (formData.extensions.length > 1) {
      setFormData({
        ...formData,
        extensions: formData.extensions.filter((_, i) => i !== index),
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Lesson title is required';
    }

    if (!formData.unitPlanId) {
      newErrors.unitPlanId = 'Unit plan selection is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.expectationIds.length === 0) {
      newErrors.expectationIds = 'At least one curriculum expectation must be selected';
    }

    // Validate that at least one of the three lesson parts has content
    if (!formData.mindsOn?.trim() && !formData.action?.trim() && !formData.consolidation?.trim()) {
      newErrors.lessonStructure = 'At least one lesson component (Minds On, Action, or Consolidation) must have content';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Clean up empty array entries before submitting
      const cleanedData = {
        ...formData,
        materials: formData.materials.filter(m => m.trim() !== ''),
        accommodations: formData.accommodations.filter(a => a.trim() !== ''),
        modifications: formData.modifications.filter(m => m.trim() !== ''),
        extensions: formData.extensions.filter(e => e.trim() !== ''),
      };

      onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lesson-structure">Lesson Structure</TabsTrigger>
          <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="space-y-4">
              {showUnitPlanSelector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Plan *
                  </label>
                  <select
                    required
                    value={formData.unitPlanId}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPlanId: e.target.value })
                    }
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.unitPlanId ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a unit plan...</option>
                    {allUnitPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title}
                      </option>
                    ))}
                  </select>
                  {errors.unitPlanId && (
                    <p className="mt-1 text-sm text-red-600">{errors.unitPlanId}</p>
                  )}
                </div>
              )}

              <div>
                <BilingualTextInput
                  label={t('lesson_plan') + ' ' + t('title')}
                  valueEn={formData.title}
                  valueFr={formData.titleFr || ''}
                  onChangeEn={(value) => setFormData({ ...formData, title: value })}
                  onChangeFr={(value) => setFormData({ ...formData, titleFr: value })}
                  placeholderEn="Enter lesson title..."
                  placeholderFr="Entrez le titre de la leçon..."
                  required={true}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    required
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 0 })
                    }
                    className={errors.duration ? 'border-red-500' : ''}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="grouping">Grouping Strategy</Label>
                  <select
                    id="grouping"
                    value={formData.grouping || ''}
                    onChange={(e) => setFormData({ ...formData, grouping: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="whole class">Whole Class</option>
                    <option value="small group">Small Group</option>
                    <option value="pairs">Pairs</option>
                    <option value="individual">Individual</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <BilingualTextInput
                  label={t('learning_goals')}
                  valueEn={formData.learningGoals || ''}
                  valueFr={formData.learningGoalsFr || ''}
                  onChangeEn={(value) => setFormData({ ...formData, learningGoals: value })}
                  onChangeFr={(value) => setFormData({ ...formData, learningGoalsFr: value })}
                  placeholderEn="What will students learn in this lesson?"
                  placeholderFr="Que vont apprendre les élèves dans cette leçon?"
                  multiline={true}
                  rows={3}
                />
              </div>

              <div>
                <Label>Materials & Resources</Label>
                <div className="space-y-2 mt-2">
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        value={material}
                        onChange={(e) => updateMaterial(index, e.target.value)}
                        placeholder="Required material or resource..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                        disabled={formData.materials.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </div>
              </div>

              <div>
                <ExpectationSelector
                  selectedIds={formData.expectationIds}
                  onChange={(ids) => setFormData({ ...formData, expectationIds: ids })}
                  grade={unitPlan?.longRangePlan?.grade}
                  subject={unitPlan?.longRangePlan?.subject}
                  label="Curriculum Expectations *"
                  placeholder="Select expectations for this lesson..."
                  className={errors.expectationIds ? 'border-red-500' : ''}
                />
                {errors.expectationIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.expectationIds}</p>
                )}
                {errors.lessonStructure && (
                  <p className="mt-1 text-sm text-red-600">{errors.lessonStructure}</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lesson-structure" className="space-y-6 mt-4">
          <div className="space-y-6">
            <div>
              <Label>Minds On (Introduction/Hook)</Label>
              <RichTextEditor
                value={formData.mindsOn || ''}
                onChange={(value) => setFormData({ ...formData, mindsOn: value })}
              />
            </div>

            <div>
              <Label>Minds On (French)</Label>
              <RichTextEditor
                value={formData.mindsOnFr || ''}
                onChange={(value) => setFormData({ ...formData, mindsOnFr: value })}
              />
            </div>

            <div>
              <Label>Action (Main Learning Activities)</Label>
              <RichTextEditor
                value={formData.action || ''}
                onChange={(value) => setFormData({ ...formData, action: value })}
              />
            </div>

            <div>
              <Label>Action (French)</Label>
              <RichTextEditor
                value={formData.actionFr || ''}
                onChange={(value) => setFormData({ ...formData, actionFr: value })}
              />
            </div>

            <div>
              <Label>Consolidation (Closure/Assessment)</Label>
              <RichTextEditor
                value={formData.consolidation || ''}
                onChange={(value) => setFormData({ ...formData, consolidation: value })}
              />
            </div>

            <div>
              <Label>Consolidation (French)</Label>
              <RichTextEditor
                value={formData.consolidationFr || ''}
                onChange={(value) => setFormData({ ...formData, consolidationFr: value })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="differentiation" className="space-y-6 mt-4">
          <div>
            <Label>Accommodations</Label>
            <p className="text-sm text-gray-600 mb-2">
              Changes to how students access learning (without changing expectations)
            </p>
            <div className="space-y-2">
              {formData.accommodations.map((accommodation, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={accommodation}
                    onChange={(e) => updateAccommodation(index, e.target.value)}
                    placeholder="Accommodation strategy..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccommodation(index)}
                    disabled={formData.accommodations.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAccommodation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Accommodation
              </Button>
            </div>
          </div>

          <div>
            <Label>Modifications</Label>
            <p className="text-sm text-gray-600 mb-2">
              Changes to curriculum expectations or learning goals
            </p>
            <div className="space-y-2">
              {formData.modifications.map((modification, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={modification}
                    onChange={(e) => updateModification(index, e.target.value)}
                    placeholder="Modification strategy..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModification(index)}
                    disabled={formData.modifications.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addModification}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Modification
              </Button>
            </div>
          </div>

          <div>
            <Label>Extensions</Label>
            <p className="text-sm text-gray-600 mb-2">
              Additional challenges for students who finish early or need enrichment
            </p>
            <div className="space-y-2">
              {formData.extensions.map((extension, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={extension}
                    onChange={(e) => updateExtension(index, e.target.value)}
                    placeholder="Extension activity..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExtension(index)}
                    disabled={formData.extensions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExtension}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Extension
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6 mt-4">
          <div>
            <div className="flex items-center">
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <InfoTooltip content="Choose the primary purpose of assessment for this lesson. You can use multiple types throughout the lesson." />
            </div>
            <select
              id="assessmentType"
              value={formData.assessmentType || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                assessmentType: e.target.value as 'diagnostic' | 'formative' | 'summative' 
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-2"
            >
              <option value="diagnostic">Diagnostic - Assessment FOR Learning (Before/Beginning)</option>
              <option value="formative">Formative - Assessment AS Learning (During)</option>
              <option value="summative">Summative - Assessment OF Learning (After/End)</option>
            </select>
            <div className="mt-2 text-sm text-gray-600">
              {formData.assessmentType === 'diagnostic' && (
                <p className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <strong>Diagnostic Assessment:</strong> Used at the beginning to determine what students already know and identify learning needs. 
                  <br /><strong>Examples:</strong> KWL charts, pre-tests, class discussions, entrance tickets, thumbs up/down checks
                </p>
              )}
              {formData.assessmentType === 'formative' && (
                <p className="bg-green-50 p-3 rounded-md border border-green-200">
                  <strong>Formative Assessment:</strong> Ongoing assessment during learning to provide feedback and adjust teaching. Students actively assess their own learning.
                  <br /><strong>Examples:</strong> Exit tickets, peer feedback, self-reflection journals, mini-whiteboards, think-pair-share, observation checklists
                </p>
              )}
              {formData.assessmentType === 'summative' && (
                <p className="bg-purple-50 p-3 rounded-md border border-purple-200">
                  <strong>Summative Assessment:</strong> Used at the end to evaluate student achievement of learning goals and assign grades.
                  <br /><strong>Examples:</strong> Unit tests, final projects, presentations, portfolios, performance tasks, end-of-term assignments
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <Label>Success Criteria & Assessment Strategies</Label>
              <InfoTooltip content="Clear, specific statements that describe what success looks like. Written in student-friendly language starting with 'I can...'" />
            </div>
            <BilingualTextInput
              label=""
              valueEn={formData.assessmentNotes || ''}
              valueFr={formData.assessmentNotesFr || ''}
              onChangeEn={(value) => setFormData({ ...formData, assessmentNotes: value })}
              onChangeFr={(value) => setFormData({ ...formData, assessmentNotesFr: value })}
              placeholderEn="Success Criteria (I can statements):
• I can identify the main idea of a text
• I can use evidence from the text to support my answer
• I can work cooperatively with my group

Assessment Strategies:
• Observation during group work
• Exit ticket with key question
• Self-assessment checklist"
              placeholderFr="Critères de réussite (Je peux...):
• Je peux identifier l'idée principale d'un texte
• Je peux utiliser des preuves du texte
• Je peux travailler en coopération

Stratégies d'évaluation:
• Observation pendant le travail de groupe
• Billet de sortie avec question clé
• Liste d'auto-évaluation"
              multiline={true}
              rows={6}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include both success criteria and the specific assessment strategies you&apos;ll use to gather evidence of learning.
            </p>
          </div>

          <div>
            <Label>Substitute Teacher Ready</Label>
            <div className="mt-2 space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isSubFriendly}
                  onChange={(e) => setFormData({ ...formData, isSubFriendly: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">This lesson is suitable for a substitute teacher</span>
              </label>

              {formData.isSubFriendly && (
                <div>
                  <BilingualTextInput
                    label="Notes for Substitute Teacher"
                    valueEn={formData.subNotes || ''}
                    valueFr={formData.subNotesFr || ''}
                    onChangeEn={(value) => setFormData({ ...formData, subNotes: value })}
                    onChangeFr={(value) => setFormData({ ...formData, subNotesFr: value })}
                    placeholderEn="Special instructions, classroom management tips, or additional context for a substitute teacher..."
                    placeholderFr="Instructions spéciales, conseils de gestion de classe, ou contexte additionnel pour un suppléant..."
                    multiline={true}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Lesson Plan' : 'Create Lesson Plan'}
        </Button>
      </div>
    </form>
  );
}