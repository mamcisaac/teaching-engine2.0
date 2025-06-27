import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingFlow() {
  const {
    isOnboardingActive,
    currentStep,
    progress,
    nextStep,
    previousStep,
    skipOnboarding,
    canGoBack,
    canGoForward,
    state,
  } = useOnboarding();

  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update highlight position when step changes
  useEffect(() => {
    if (!currentStep?.targetElement) {
      setHighlightPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = currentStep.targetElement
        ? document.querySelector(currentStep.targetElement)
        : null;
      if (!element) {
        setHighlightPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding || 8;

      setHighlightPosition({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding + window.scrollX,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      let top = rect.top + window.scrollY;
      let left = rect.left + window.scrollX;

      switch (currentStep.position) {
        case 'top':
          top -= tooltipHeight + 20;
          left += rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top += rect.height + 20;
          left += rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top += rect.height / 2 - tooltipHeight / 2;
          left -= tooltipWidth + 20;
          break;
        case 'right':
          top += rect.height / 2 - tooltipHeight / 2;
          left += rect.width + 20;
          break;
        default:
          // Center
          top = window.innerHeight / 2 - tooltipHeight / 2 + window.scrollY;
          left = window.innerWidth / 2 - tooltipWidth / 2 + window.scrollX;
      }

      // Keep tooltip within viewport
      const viewportPadding = 20;
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - tooltipWidth - viewportPadding),
      );
      top = Math.max(viewportPadding + window.scrollY, top);

      setTooltipPosition({ top, left });
    };

    updatePosition();

    // Update on scroll or resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStep]);

  // Handle element click if required
  useEffect(() => {
    if (!currentStep?.targetElement || !currentStep.requiresAction) return;

    const handleClick = (e: MouseEvent) => {
      const element = document.querySelector(currentStep.targetElement!);
      if (element && element.contains(e.target as Node)) {
        nextStep();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [currentStep, nextStep]);

  if (!isOnboardingActive || !currentStep) return null;

  const isCenter = currentStep.position === 'center' || !currentStep.targetElement;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]" ref={overlayRef}>
        {/* Dark overlay with spotlight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={(e) => {
            // Allow clicking through to highlighted element
            if (highlightPosition && currentStep?.requiresAction) {
              e.stopPropagation();
            }
          }}
        >
          {/* Spotlight cutout */}
          {highlightPosition && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bg-transparent"
              style={{
                top: highlightPosition.top,
                left: highlightPosition.left,
                width: highlightPosition.width,
                height: highlightPosition.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
          className={`absolute bg-white rounded-lg shadow-2xl p-6 max-w-md ${
            isCenter ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''
          }`}
          style={
            isCenter
              ? {}
              : {
                  top: tooltipPosition.top,
                  left: tooltipPosition.left,
                  width: '400px',
                }
          }
        >
          {/* Close button */}
          {currentStep.showSkip && (
            <button
              onClick={skipOnboarding}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Step {state.currentStepIndex + 1} of {state.currentFlow?.steps.length || 0}
              </span>
              {state.currentFlow?.estimatedTime && (
                <span className="text-sm text-gray-500">
                  ~{state.currentFlow.estimatedTime} min
                </span>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentStep.title}</h3>
                <p className="text-gray-600 leading-relaxed">{currentStep.description}</p>
              </div>
            </div>

            {/* Action hint */}
            {currentStep.requiresAction && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
                <p className="font-medium">Action required:</p>
                <p>
                  {currentStep.action === 'click' && 'Click the highlighted element to continue'}
                  {currentStep.action === 'input' && 'Fill in the required information'}
                  {currentStep.action === 'hover' && 'Hover over the highlighted element'}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {canGoBack && (
                  <Button variant="ghost" size="sm" onClick={previousStep} className="gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                {currentStep.showSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="text-gray-500"
                  >
                    {currentStep.skipButtonText || 'Skip tour'}
                  </Button>
                )}
              </div>

              {!currentStep.requiresAction && (
                <Button
                  onClick={nextStep}
                  size="sm"
                  className="gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep.nextButtonText || 'Next'}
                  {canGoForward && <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Completion message */}
        {state.currentFlow?.completionMessage &&
          state.currentStepIndex === state.currentFlow.steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
            >
              <p className="text-green-800 font-medium">{state.currentFlow.completionMessage}</p>
            </motion.div>
          )}
      </div>
    </AnimatePresence>,
    document.body,
  );
}
