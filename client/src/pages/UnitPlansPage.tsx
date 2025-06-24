import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLongRangePlan, useLongRangePlans, useUnitPlans, useCreateUnitPlan, useUpdateUnitPlan } from '../hooks/useETFOPlanning';
import Dialog from '../components/Dialog';
import { Button } from '../components/ui/Button';
import RichTextEditor from '../components/RichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/Label';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function UnitPlansPage() {
  const { longRangePlanId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  
  // Fetch data
  const { data: longRangePlan } = useLongRangePlan(longRangePlanId || '');
  const { data: allLongRangePlans = [] } = useLongRangePlans();
  const { data: unitPlans = [], isLoading } = useUnitPlans(
    longRangePlanId ? { longRangePlanId } : {}
  );
  
  // Mutations
  const createUnit = useCreateUnitPlan();
  const updateUnit = useUpdateUnitPlan();
  
  // Form state with all ETFO-aligned fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bigIdeas: '',
    essentialQuestions: [''],
    startDate: '',
    endDate: '',
    estimatedHours: 20,
    assessmentPlan: '',
    successCriteria: [''],
    expectationIds: [] as string[],
    longRangePlanId: longRangePlanId || '',
    // Additional ETFO fields
    crossCurricularConnections: '',
    learningSkills: [] as string[],
    culminatingTask: '',
    keyVocabulary: [''],
    priorKnowledge: '',
    parentCommunicationPlan: '',
    fieldTripsAndGuestSpeakers: '',
    differentiationStrategies: {
      forStruggling: [''],
      forAdvanced: [''],
      forELL: [''],
      forIEP: [''],
    },
    indigenousPerspectives: '',
    environmentalEducation: '',
    socialJusticeConnections: '',
    technologyIntegration: '',
    communityConnections: '',
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up array fields
    const cleanedDifferentiation = {
      forStruggling: formData.differentiationStrategies.forStruggling.filter(s => s.trim()),
      forAdvanced: formData.differentiationStrategies.forAdvanced.filter(s => s.trim()),
      forELL: formData.differentiationStrategies.forELL.filter(s => s.trim()),
      forIEP: formData.differentiationStrategies.forIEP.filter(s => s.trim()),
    };
    
    // Only include longRangePlanId if we have one and it's provided in form data
    const data = {
      ...formData,
      ...(formData.longRangePlanId && { longRangePlanId: formData.longRangePlanId }),
      essentialQuestions: formData.essentialQuestions.filter(q => q.trim()),
      successCriteria: formData.successCriteria.filter(c => c.trim()),
      keyVocabulary: formData.keyVocabulary.filter(v => v.trim()),
      differentiationStrategies: cleanedDifferentiation,
    };
    
    if (editingUnit) {
      await updateUnit.mutateAsync({ id: editingUnit, ...data });
      setEditingUnit(null);
    } else {
      await createUnit.mutateAsync(data);
    }
    
    setIsCreateModalOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      bigIdeas: '',
      essentialQuestions: [''],
      startDate: '',
      endDate: '',
      estimatedHours: 20,
      assessmentPlan: '',
      successCriteria: [''],
      expectationIds: [],
      longRangePlanId: longRangePlanId || '',
      // Additional ETFO fields
      crossCurricularConnections: '',
      learningSkills: [],
      culminatingTask: '',
      keyVocabulary: [''],
      priorKnowledge: '',
      parentCommunicationPlan: '',
      fieldTripsAndGuestSpeakers: '',
      differentiationStrategies: {
        forStruggling: [''],
        forAdvanced: [''],
        forELL: [''],
        forIEP: [''],
      },
      indigenousPerspectives: '',
      environmentalEducation: '',
      socialJusticeConnections: '',
      technologyIntegration: '',
      communityConnections: '',
    });
  };
  
  const addEssentialQuestion = () => {
    setFormData({
      ...formData,
      essentialQuestions: [...formData.essentialQuestions, ''],
    });
  };
  
  const updateEssentialQuestion = (index: number, value: string) => {
    const updated = [...formData.essentialQuestions];
    updated[index] = value;
    setFormData({ ...formData, essentialQuestions: updated });
  };
  
  const removeEssentialQuestion = (index: number) => {
    setFormData({
      ...formData,
      essentialQuestions: formData.essentialQuestions.filter((_, i) => i !== index),
    });
  };
  
  const addSuccessCriteria = () => {
    setFormData({
      ...formData,
      successCriteria: [...formData.successCriteria, ''],
    });
  };
  
  const updateSuccessCriteria = (index: number, value: string) => {
    const updated = [...formData.successCriteria];
    updated[index] = value;
    setFormData({ ...formData, successCriteria: updated });
  };
  
  const removeSuccessCriteria = (index: number) => {
    setFormData({
      ...formData,
      successCriteria: formData.successCriteria.filter((_, i) => i !== index),
    });
  };
  
  const addKeyVocabulary = () => {
    setFormData({
      ...formData,
      keyVocabulary: [...formData.keyVocabulary, ''],
    });
  };
  
  const updateKeyVocabulary = (index: number, value: string) => {
    const updated = [...formData.keyVocabulary];
    updated[index] = value;
    setFormData({ ...formData, keyVocabulary: updated });
  };
  
  const removeKeyVocabulary = (index: number) => {
    setFormData({
      ...formData,
      keyVocabulary: formData.keyVocabulary.filter((_, i) => i !== index),
    });
  };
  
  const updateDifferentiationStrategy = (type: keyof typeof formData.differentiationStrategies, index: number, value: string) => {
    const updated = { ...formData.differentiationStrategies };
    updated[type][index] = value;
    setFormData({ ...formData, differentiationStrategies: updated });
  };
  
  const addDifferentiationStrategy = (type: keyof typeof formData.differentiationStrategies) => {
    const updated = { ...formData.differentiationStrategies };
    updated[type] = [...updated[type], ''];
    setFormData({ ...formData, differentiationStrategies: updated });
  };
  
  const removeDifferentiationStrategy = (type: keyof typeof formData.differentiationStrategies, index: number) => {
    const updated = { ...formData.differentiationStrategies };
    updated[type] = updated[type].filter((_, i) => i !== index);
    setFormData({ ...formData, differentiationStrategies: updated });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
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
              <p className="mt-2 text-gray-600">
                Manage unit plans across all long-range plans
              </p>
            )}
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Create Unit Plan
          </Button>
        </div>
      </div>
      
      {/* Unit Plans Grid */}
      {unitPlans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No unit plans yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start by creating your first unit plan for this long-range plan
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Unit Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {unitPlans.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {unit.estimatedHours || 0} hours
                  </span>
                </div>
                
                {unit.bigIdeas && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Big Ideas</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{unit.bigIdeas}</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-500 mb-4">
                  {new Date(unit.startDate).toLocaleDateString()} - {new Date(unit.endDate).toLocaleDateString()}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{unit._count?.lessonPlans || 0} lessons</span>
                    <span>{unit._count?.expectations || 0} expectations</span>
                  </div>
                  
                  {unit.progress && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {unit.progress.percentage}%
                      </div>
                      <div className="text-xs text-gray-500">complete</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/planner/units/${unit.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setEditingUnit(unit.id);
                      setFormData({
                        title: unit.title,
                        description: unit.description || '',
                        bigIdeas: unit.bigIdeas || '',
                        essentialQuestions: unit.essentialQuestions || [''],
                        startDate: unit.startDate.split('T')[0],
                        endDate: unit.endDate.split('T')[0],
                        estimatedHours: unit.estimatedHours || 20,
                        assessmentPlan: unit.assessmentPlan || '',
                        successCriteria: unit.successCriteria || [''],
                        expectationIds: unit.expectations?.map(e => e.expectation.id) || [],
                        longRangePlanId: unit.longRangePlanId,
                        // Additional ETFO fields (typed as any to handle missing properties)
                        crossCurricularConnections: (unit as any).crossCurricularConnections || '',
                        learningSkills: (unit as any).learningSkills || [],
                        culminatingTask: (unit as any).culminatingTask || '',
                        keyVocabulary: (unit as any).keyVocabulary || [''],
                        priorKnowledge: (unit as any).priorKnowledge || '',
                        parentCommunicationPlan: (unit as any).parentCommunicationPlan || '',
                        fieldTripsAndGuestSpeakers: (unit as any).fieldTripsAndGuestSpeakers || '',
                        differentiationStrategies: (unit as any).differentiationStrategies || {
                          forStruggling: [''],
                          forAdvanced: [''],
                          forELL: [''],
                          forIEP: [''],
                        },
                        indigenousPerspectives: (unit as any).indigenousPerspectives || '',
                        environmentalEducation: (unit as any).environmentalEducation || '',
                        socialJusticeConnections: (unit as any).socialJusticeConnections || '',
                        technologyIntegration: (unit as any).technologyIntegration || '',
                        communityConnections: (unit as any).communityConnections || '',
                      });
                      setIsCreateModalOpen(true);
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create/Edit Unit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <div className="p-6 max-w-5xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingUnit ? 'Edit Unit Plan' : 'Create Unit Plan'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="differentiation">Differentiation</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-4">
                {!longRangePlanId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Long-Range Plan *
                    </label>
                    <select
                      required
                      value={formData.longRangePlanId}
                      onChange={(e) => setFormData({ ...formData, longRangePlanId: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select a long-range plan...</option>
                      {allLongRangePlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title} - {plan.subject} Grade {plan.grade}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., Living Things in Our Environment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Brief overview of the unit..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>
              </TabsContent>
              
              <TabsContent value="planning" className="space-y-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Big Ideas
                  </label>
                  <RichTextEditor
                    value={formData.bigIdeas}
                    onChange={(value) => setFormData({ ...formData, bigIdeas: value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Essential Questions
                  </label>
                  <div className="space-y-2">
                    {formData.essentialQuestions.map((question, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => updateEssentialQuestion(index, e.target.value)}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter an essential question..."
                        />
                        <button
                          type="button"
                          onClick={() => removeEssentialQuestion(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEssentialQuestion}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      + Add Essential Question
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Success Criteria
                  </label>
                  <div className="space-y-2">
                    {formData.successCriteria.map((criteria, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={criteria}
                          onChange={(e) => updateSuccessCriteria(index, e.target.value)}
                          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Students will be able to..."
                        />
                        <button
                          type="button"
                          onClick={() => removeSuccessCriteria(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSuccessCriteria}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      + Add Success Criteria
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label>Key Vocabulary & Terminology</Label>
                  <div className="space-y-2 mt-2">
                    {formData.keyVocabulary.map((term, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={term}
                          onChange={(e) => updateKeyVocabulary(index, e.target.value)}
                          placeholder="Important term or concept..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyVocabulary(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyVocabulary}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Term
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Prior Knowledge Requirements</Label>
                  <Textarea
                    value={formData.priorKnowledge}
                    onChange={(e) => setFormData({ ...formData, priorKnowledge: e.target.value })}
                    placeholder="What should students already know before starting this unit?"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Culminating Task Description</Label>
                  <RichTextEditor
                    value={formData.culminatingTask}
                    onChange={(value) => setFormData({ ...formData, culminatingTask: value })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="assessment" className="space-y-6 mt-4">
                <div>
                  <Label>Assessment Plan</Label>
                  <RichTextEditor
                    value={formData.assessmentPlan}
                    onChange={(value) => setFormData({ ...formData, assessmentPlan: value })}
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
                      'Self-Regulation'
                    ].map((skill) => (
                      <label key={skill} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.learningSkills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                learningSkills: [...formData.learningSkills, skill]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                learningSkills: formData.learningSkills.filter(s => s !== skill)
                              });
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
                      Plan how you'll support diverse learners in this unit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>For Struggling Learners</Label>
                      <div className="space-y-2 mt-2">
                        {formData.differentiationStrategies.forStruggling.map((strategy, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={strategy}
                              onChange={(e) => updateDifferentiationStrategy('forStruggling', index, e.target.value)}
                              placeholder="Support strategy..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDifferentiationStrategy('forStruggling', index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
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
                              onChange={(e) => updateDifferentiationStrategy('forAdvanced', index, e.target.value)}
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
                              onChange={(e) => updateDifferentiationStrategy('forELL', index, e.target.value)}
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
                              onChange={(e) => updateDifferentiationStrategy('forIEP', index, e.target.value)}
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
                    onChange={(e) => setFormData({ ...formData, crossCurricularConnections: e.target.value })}
                    placeholder="How does this unit connect to other subject areas?"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Indigenous Perspectives</Label>
                  <Textarea
                    value={formData.indigenousPerspectives}
                    onChange={(e) => setFormData({ ...formData, indigenousPerspectives: e.target.value })}
                    placeholder="How will you incorporate Indigenous knowledge and perspectives?"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Environmental Education</Label>
                  <Textarea
                    value={formData.environmentalEducation}
                    onChange={(e) => setFormData({ ...formData, environmentalEducation: e.target.value })}
                    placeholder="Environmental learning opportunities in this unit..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Social Justice Connections</Label>
                  <Textarea
                    value={formData.socialJusticeConnections}
                    onChange={(e) => setFormData({ ...formData, socialJusticeConnections: e.target.value })}
                    placeholder="Equity and social justice themes..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Technology Integration</Label>
                  <Textarea
                    value={formData.technologyIntegration}
                    onChange={(e) => setFormData({ ...formData, technologyIntegration: e.target.value })}
                    placeholder="How will technology enhance learning in this unit?"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Community Connections</Label>
                  <Textarea
                    value={formData.communityConnections}
                    onChange={(e) => setFormData({ ...formData, communityConnections: e.target.value })}
                    placeholder="Local partnerships, field trips, guest speakers..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Parent Communication Plan</Label>
                  <Textarea
                    value={formData.parentCommunicationPlan}
                    onChange={(e) => setFormData({ ...formData, parentCommunicationPlan: e.target.value })}
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
                disabled={createUnit.isPending || updateUnit.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createUnit.isPending || updateUnit.isPending
                  ? 'Saving...'
                  : editingUnit
                  ? 'Update Unit Plan'
                  : 'Create Unit Plan'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}