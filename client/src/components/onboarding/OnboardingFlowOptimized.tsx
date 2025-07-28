import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';

import { useOnboarding } from '../../contexts/OnboardingContext';

// Utility to check if a string is non-empty
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

import { OnboardingHighlight } from './OnboardingHighlight';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingTooltip } from './OnboardingTooltip';

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Loading fallback for lazy components
const OnboardingLoadingFallback = (): React.ReactElement => (
  <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

export function OnboardingFlowOptimized(): React.ReactElement | null {
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
    if (!currentStep) {
      setHighlightPosition(null);
      return;
    }
    
    if (!isNonEmptyString(currentStep.targetElement)) {
      setHighlightPosition(null);
      return;
    }

    const updatePosition = (): void => {
      // currentStep is guaranteed to be non-null here due to the early return above
      if (!isNonEmptyString(currentStep.targetElement)) {
        setHighlightPosition(null);
        return;
      }
      
      const element = document.querySelector(currentStep.targetElement);
      if (!element) {
        setHighlightPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const padding = currentStep.highlightPadding ?? 8;

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
    if (!currentStep) {
      return;
    }
    
    if (!isNonEmptyString(currentStep.targetElement) || currentStep.requiresAction !== true) {
      return;
    }

    const handleClick = (e: MouseEvent): void => {
      // currentStep is guaranteed to be non-null here due to the early return above
      if (!isNonEmptyString(currentStep.targetElement)) {
        return;
      }
      const element = document.querySelector(currentStep.targetElement);
      if (element && element.contains(e.target as Node)) {
        nextStep();
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
 document.removeEventListener('click', handleClick); 
};
  }, [currentStep, nextStep]);

  if (!isOnboardingActive || !currentStep) {
return null;
}

  const isCenter = currentStep.position === 'center' || currentStep.targetElement === undefined || currentStep.targetElement === '';

  return createPortal(
    <Suspense fallback={<OnboardingLoadingFallback />}>
      <AnimatePresence>
        <div ref={overlayRef} className="fixed inset-0 z-[9999]">
          {/* Dark overlay with spotlight */}
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={(e) => {
              // Allow clicking through to highlighted element
              if (highlightPosition && currentStep.requiresAction === true) {
                e.stopPropagation();
              }
            }}
          >
            {/* Spotlight cutout */}
            {highlightPosition ? (
              <OnboardingHighlight highlightPosition={highlightPosition} />
            ) : null}
          </motion.div>

          {/* Tooltip */}
          <OnboardingTooltip
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            currentStep={currentStep}
            isCenter={isCenter}
            nextStep={nextStep}
            previousStep={previousStep}
            progress={progress}
            skipOnboarding={skipOnboarding}
            state={state}
            tooltipPosition={tooltipPosition}
          />

          {/* Completion message */}
          {state.currentFlow !== null && 
            state.currentFlow.completionMessage !== null && state.currentFlow.completionMessage !== '' &&
            state.currentStepIndex === state.currentFlow.steps.length - 1 ? (
              <OnboardingProgress completionMessage={state.currentFlow.completionMessage || ''} />
            ) : null}
        </div>
      </AnimatePresence>
    </Suspense>,
    document.body,
  );
}