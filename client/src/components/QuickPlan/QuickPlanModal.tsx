import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { cn } from '../../utils/cn';
import { useQuickPlan, type TemplatePreference } from '../../hooks/useQuickPlan';
import { QuickPlanPreview } from './QuickPlanPreview';
import { QuickPlanCustomizer } from './QuickPlanCustomizer';

interface Props {
  expectationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (lessonId: string) => void;
}

export function QuickPlanModal({ expectationId, isOpen, onClose, onSuccess }: Props): React.ReactElement | null {
  const navigate = useNavigate();
  
  const {
    step,
    planData,
    customizations,
    isGenerating,
    isCreating,
    expectation,
    setStep,
    generatePlan,
    updateCustomization,
    createLesson,
    saveAsTemplate,
  } = useQuickPlan({
    expectationId,
    onSuccess: (lessonId) => {
      if (onSuccess) {
        onSuccess(lessonId);
      }
      navigate(`/planner/lesson/${lessonId}`);
      onClose();
    },
  });

  const handleQuickCreate = async (): Promise<void> => {
    setStep('confirm');
    await createLesson();
  };

  const handleRegenerateWithPreference = (preference: TemplatePreference): void => {
    generatePlan({ templatePreference: preference });
  };

  const handleApplyTemplate = (templateData: any): void => {
    // Apply template data as customizations
    Object.entries(templateData).forEach(([key, value]) => {
      updateCustomization(key as any, value);
    });
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
                Smart Lesson Plan Generator
              </h2>
              {expectation && (
                <p className="text-sm text-gray-600 mt-1">
                  For expectation: {expectation.code} - {expectation.subject}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {planData && (
                <button
                  onClick={() => generatePlan()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Regenerate plan"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center p-4 border-b bg-gray-50">
            <div className="flex items-center gap-8">
              <StepIndicator
                number={1}
                label="Preview"
                isActive={step === 'preview'}
                isCompleted={step === 'customize' || step === 'confirm'}
              />
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <StepIndicator
                number={2}
                label="Customize"
                isActive={step === 'customize'}
                isCompleted={step === 'confirm'}
              />
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <StepIndicator
                number={3}
                label="Confirm"
                isActive={step === 'confirm'}
                isCompleted={false}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your lesson plan...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Using smart templates optimized for Grade 1 French Immersion
                  </p>
                </div>
              </div>
            ) : planData ? (
              <>
                {step === 'preview' && (
                  <QuickPlanPreview planData={planData} expectation={expectation} />
                )}

                {step === 'customize' && (
                  <QuickPlanCustomizer
                    planData={planData}
                    customizations={customizations}
                    onUpdate={updateCustomization}
                    onSaveTemplate={saveAsTemplate}
                    onApplyTemplate={handleApplyTemplate}
                    onRegenerateWithPreference={handleRegenerateWithPreference}
                  />
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
                    {planData.metadata && (
                      <div className="mt-6 text-sm text-gray-500">
                        Generated using: {planData.metadata.method === 'ai-enhanced' ? 'AI-Enhanced' : 'Smart'} templates
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Unable to generate lesson plan. Please try again.</p>
              </div>
            )}
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
              {step === 'preview' && planData && (
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
                    onClick={createLesson}
                    disabled={isCreating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Lesson Plan'}
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

// Step indicator component
function StepIndicator({ 
  number, 
  label, 
  isActive, 
  isCompleted 
}: { 
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}): React.ReactElement {
  return (
    <div className={cn(
      "flex items-center gap-2",
      isActive ? "text-indigo-600 font-semibold" : "text-gray-400"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
        isCompleted ? "bg-green-500 text-white" :
        isActive ? "bg-indigo-600 text-white" : 
        "bg-gray-300"
      )}>
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          number
        )}
      </div>
      {label}
    </div>
  );
}