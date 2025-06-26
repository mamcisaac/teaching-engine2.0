import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TutorialOverlayProps } from '../../types/help';
import { Button } from '../ui/Button';
// import { clsx } from 'clsx';

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isActive,
  currentStep,
  tutorial,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  progress
}) => {
  const _highlightRef = useRef<HTMLDivElement>(null);

  // Highlight target element
  useEffect(() => {
    if (!isActive || !currentStep?.targetElement) return;

    const targetElement = document.querySelector(currentStep.targetElement);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight class
      targetElement.classList.add('tutorial-highlight');
      
      return () => {
        targetElement.classList.remove('tutorial-highlight');
      };
    }
  }, [isActive, currentStep]);

  if (!isActive || !currentStep || !tutorial) {
    return null;
  }

  const isLastStep = progress >= 100;
  const isFirstStep = progress === 0;

  return createPortal(
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tutorial card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tutorial.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Step {Math.floor(progress / (100 / tutorial.steps.length)) + 1} of {tutorial.steps.length}
              </p>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="sr-only">Skip tutorial</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">
            {currentStep.title}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {currentStep.description}
          </p>

          {/* Action hint */}
          {currentStep.action && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {currentStep.action === 'click' && (
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                    </svg>
                  )}
                  {currentStep.action === 'input' && (
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  {currentStep.action === 'scroll' && (
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    {currentStep.action === 'click' && 'Click the highlighted element'}
                    {currentStep.action === 'input' && 'Enter information in the highlighted field'}
                    {currentStep.action === 'scroll' && 'Scroll to see the highlighted area'}
                    {currentStep.action === 'wait' && 'Wait for the action to complete'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Optional step indicator */}
          {currentStep.optional && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Optional step:</span> You can skip this if needed.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onSkip}
              size="sm"
            >
              Skip Tutorial
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={onPrevious}
                disabled={isFirstStep}
                size="sm"
              >
                Previous
              </Button>
              
              {isLastStep ? (
                <Button
                  variant="primary"
                  onClick={onComplete}
                  size="sm"
                >
                  Complete
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={onNext}
                  size="sm"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add tutorial highlight styles if not already present */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          animation: tutorial-pulse 2s infinite;
        }
        
        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </>,
    document.body
  );
};