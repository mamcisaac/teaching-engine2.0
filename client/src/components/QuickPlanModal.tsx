import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Clock,
  BookOpen,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Save,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { apiClient } from '../api/core/client';
import { useUnitPlans, useCreateETFOLessonPlan } from '../hooks/useETFOPlanning';
import { cn } from '../utils/cn';

interface QuickPlanData {
  title: string;
  titleFr: string;
  duration: number;
  date: string;
  unitPlanId: string | null;
  learningGoals: string;
  learningGoalsFr: string;
  mindsOn: string;
  mindsOnFr: string;
  action: string;
  actionFr: string;
  consolidation: string;
  consolidationFr: string;
  materials: string[];
  assessmentNotes: string;
  differentiationStrategies: {
    forStruggling: string[];
    forAdvanced: string[];
    forELL: string[];
    forIEP: string[];
  };
  expectations: string[];
}

interface Props {
  expectationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (lessonId: string) => void;
}

export function QuickPlanModal({ expectationId, isOpen, onClose, onSuccess }: Props): React.ReactElement | null {
  const navigate = useNavigate();
  const [step, setStep] = useState<'preview' | 'customize' | 'confirm'>('preview');
  const [planData, setPlanData] = useState<QuickPlanData | null>(null);
  const [customizations, setCustomizations] = useState<Partial<QuickPlanData>>({});
  
  // Fetch unit plans for selection
  const { data: unitPlans = [] } = useUnitPlans({});
  
  // Create lesson plan mutation
  const createLessonMutation = useCreateETFOLessonPlan();

  // Generate quick plan
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/curriculum-coverage/quick-plan', {
        expectationId,
        date: new Date().toISOString().split('T')[0],
      });
      return response.data.data as QuickPlanData;
    },
    onSuccess: (data) => {
      setPlanData(data);
      setCustomizations({});
    },
    onError: () => {
      toast.error('Failed to generate quick plan');
      onClose();
    },
  });

  // Fetch expectation details
  const { data: expectation } = useQuery({
    queryKey: ['expectation', expectationId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/curriculum-expectations/${expectationId}`);
      return response.data;
    },
    enabled: isOpen && !!expectationId,
  });

  // Generate plan when modal opens
  useEffect(() => {
    if (isOpen && expectationId && !planData) {
      generatePlanMutation.mutate();
    }
  }, [isOpen, expectationId]);

  // Handle customization
  const updateCustomization = (field: keyof QuickPlanData, value: any): void => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Create the lesson
  const handleCreateLesson = async (): Promise<void> => {
    if (!planData) return;

    const finalData = {
      ...planData,
      ...customizations,
    };

    try {
      const result = await createLessonMutation.mutateAsync(finalData);
      toast.success('Lesson plan created successfully!');
      
      if (onSuccess) {
        onSuccess(result.id);
      }
      
      // Navigate to the lesson view
      navigate(`/planner/lesson/${result.id}`);
      onClose();
    } catch (error) {
      toast.error('Failed to create lesson plan');
    }
  };

  // Handle quick create (skip customization)
  const handleQuickCreate = (): void => {
    setStep('confirm');
    handleCreateLesson();
  };

  // Handle save as template
  const handleSaveAsTemplate = (): void => {
    if (!planData) return;
    
    const templateData = {
      ...planData,
      ...customizations,
    };
    
    // Store in localStorage for now
    const templates = JSON.parse(localStorage.getItem('quickPlanTemplates') || '[]');
    templates.push({
      id: Date.now().toString(),
      name: templateData.title,
      data: templateData,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('quickPlanTemplates', JSON.stringify(templates));
    
    toast.success('Template saved successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                Quick Lesson Plan Generator
              </h2>
              {expectation && (
                <p className="text-sm text-gray-600 mt-1">
                  For expectation: {expectation.code} - {expectation.subject}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center p-4 border-b bg-gray-50">
            <div className="flex items-center gap-8">
              <div className={cn(
                "flex items-center gap-2",
                step === 'preview' ? "text-indigo-600 font-semibold" : "text-gray-400"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  step === 'preview' ? "bg-indigo-600 text-white" : "bg-gray-300"
                )}>
                  1
                </div>
                Preview
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={cn(
                "flex items-center gap-2",
                step === 'customize' ? "text-indigo-600 font-semibold" : "text-gray-400"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  step === 'customize' ? "bg-indigo-600 text-white" : "bg-gray-300"
                )}>
                  2
                </div>
                Customize
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className={cn(
                "flex items-center gap-2",
                step === 'confirm' ? "text-indigo-600 font-semibold" : "text-gray-400"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  step === 'confirm' ? "bg-indigo-600 text-white" : "bg-gray-300"
                )}>
                  3
                </div>
                Confirm
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
            {generatePlanMutation.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your lesson plan...</p>
                </div>
              </div>
            ) : planData ? (
              <>
                {step === 'preview' && (
                  <div className="space-y-6">
                    {/* Lesson Overview */}
                    <div className="bg-indigo-50 rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-3">Lesson Overview</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Title</p>
                          <p className="font-medium">{planData.title}</p>
                          <p className="text-sm text-gray-500 italic">{planData.titleFr}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {planData.duration} minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Goals */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Learning Goals
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-gray-700">{planData.learningGoals}</p>
                        <p className="text-gray-600 italic text-sm">{planData.learningGoalsFr}</p>
                      </div>
                    </div>

                    {/* Lesson Structure */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Lesson Structure</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-medium mb-1">Minds On (10 min)</h4>
                          <p className="text-gray-700 text-sm">{planData.mindsOn}</p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium mb-1">Action (25 min)</h4>
                          <p className="text-gray-700 text-sm">{planData.action}</p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-medium mb-1">Consolidation (10 min)</h4>
                          <p className="text-gray-700 text-sm">{planData.consolidation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Materials */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Materials Needed
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {planData.materials.map((material, index) => (
                          <Badge key={index} variant="outline">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Differentiation */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Differentiation Strategies
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">For Struggling Learners</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {planData.differentiationStrategies.forStruggling.map((strategy, index) => (
                              <li key={index}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <h4 className="font-medium text-sm mb-2">For Advanced Learners</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {planData.differentiationStrategies.forAdvanced.map((strategy, index) => (
                              <li key={index}>• {strategy}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'customize' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            defaultValue={planData.title}
                            onChange={(e) => updateCustomization('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            defaultValue={planData.duration}
                            onChange={(e) => updateCustomization('duration', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Unit Plan Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link to Unit Plan (Optional)
                      </label>
                      <select
                        defaultValue={planData.unitPlanId || ''}
                        onChange={(e) => updateCustomization('unitPlanId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">No unit plan selected</option>
                        {unitPlans.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Learning Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Learning Goals
                      </label>
                      <textarea
                        defaultValue={planData.learningGoals}
                        onChange={(e) => updateCustomization('learningGoals', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Assessment Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assessment Notes
                      </label>
                      <textarea
                        defaultValue={planData.assessmentNotes}
                        onChange={(e) => updateCustomization('assessmentNotes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Save as Template Option */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Save as Template</h4>
                          <p className="text-sm text-gray-600">
                            Save this lesson structure for future use
                          </p>
                        </div>
                        <button
                          onClick={handleSaveAsTemplate}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Save className="h-4 w-4 inline mr-1" />
                          Save Template
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 'confirm' && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Ready to Create!</h3>
                    <p className="text-gray-600 mb-8">
                      Your lesson plan is ready to be created. Click below to finalize.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                      <AlertCircle className="h-5 w-5 text-yellow-600 inline mr-2" />
                      <span className="text-sm text-yellow-800">
                        This will create a new lesson plan that covers expectation {expectation?.code}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              {step === 'preview' && (
                <>
                  <button
                    onClick={handleQuickCreate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Quick Create
                  </button>
                  <button
                    onClick={() => setStep('customize')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Customize
                  </button>
                </>
              )}
              
              {step === 'customize' && (
                <>
                  <button
                    onClick={() => setStep('preview')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Continue
                  </button>
                </>
              )}
              
              {step === 'confirm' && (
                <>
                  <button
                    onClick={() => setStep('customize')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateLesson}
                    disabled={createLessonMutation.isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {createLessonMutation.isLoading ? 'Creating...' : 'Create Lesson Plan'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}