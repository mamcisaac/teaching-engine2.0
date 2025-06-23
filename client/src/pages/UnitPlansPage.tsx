import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLongRangePlan, useUnitPlans, useCreateUnitPlan, useUpdateUnitPlan } from '../hooks/useETFOPlanning';
import Dialog from '../components/Dialog';
import { Button } from '../components/ui/Button';
import RichTextEditor from '../components/RichTextEditor';

export default function UnitPlansPage() {
  const { longRangePlanId } = useParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  
  // Fetch data
  const { data: longRangePlan } = useLongRangePlan(longRangePlanId || '');
  const { data: unitPlans = [], isLoading } = useUnitPlans({ 
    longRangePlanId: longRangePlanId 
  });
  
  // Mutations
  const createUnit = useCreateUnitPlan();
  const updateUnit = useUpdateUnitPlan();
  
  // Form state
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
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      longRangePlanId: longRangePlanId!,
      essentialQuestions: formData.essentialQuestions.filter(q => q.trim()),
      successCriteria: formData.successCriteria.filter(c => c.trim()),
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
          <Link to="/planner/long-range" className="hover:text-indigo-600">
            Long-Range Plans
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">
            {longRangePlan?.title || 'Unit Plans'}
          </span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unit Plans</h1>
            {longRangePlan && (
              <p className="mt-2 text-gray-600">
                {longRangePlan.subject} - Grade {longRangePlan.grade} - {longRangePlan.academicYear}
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
        <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingUnit ? 'Edit Unit Plan' : 'Create Unit Plan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-4">
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
            
            {/* Planning Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Planning Details</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Big Ideas
                  </label>
                  <RichTextEditor
                    value={formData.bigIdeas}
                    onChange={(value) => setFormData({ ...formData, bigIdeas: value })}
                    placeholder="Key concepts and enduring understandings..."
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
              </div>
            </div>
            
            {/* Assessment Plan */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Assessment Strategy</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Plan
                </label>
                <RichTextEditor
                  value={formData.assessmentPlan}
                  onChange={(value) => setFormData({ ...formData, assessmentPlan: value })}
                  placeholder="Describe assessment for, as, and of learning strategies..."
                />
              </div>
            </div>
            
            {/* TODO: Add Curriculum Expectations selector */}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
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