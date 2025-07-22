
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { ReactElement} from 'react';
import React, { useState, cloneElement } from 'react';

import type { OnboardingStep, OnboardingState } from '../../contexts/OnboardingContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

// Original hover tooltip interface
interface HoverTooltipProps {
  id: string;
  title: string;
  content: string;
  children: ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
  actionText?: string;
  onAction?: () => void;
}

// Flow tooltip interface (for OnboardingFlow)
interface FlowTooltipProps {
  currentStep: OnboardingStep;
  state: OnboardingState;
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
  skipOnboarding: () => void;
  previousStep: () => void;
  nextStep: () => void;
  tooltipPosition: { top: number; left: number };
  isCenter: boolean;
}

// Combined props type
type OnboardingTooltipProps = HoverTooltipProps | FlowTooltipProps;

// Type guard to check which props type we have
function isFlowTooltipProps(props: OnboardingTooltipProps): props is FlowTooltipProps {
  return 'currentStep' in props;
}

export function OnboardingTooltip(props: OnboardingTooltipProps): React.ReactElement {
  // If this is being used in the flow, render the flow tooltip
  if (isFlowTooltipProps(props)) {
    return <FlowTooltip {...props} />;
  }

  // Otherwise, render the hover tooltip
  return <HoverTooltip {...props} />;
}

// Flow tooltip component
function FlowTooltip({
  currentStep,
  state,
  progress,
  canGoBack,
  canGoForward,
  skipOnboarding,
  previousStep,
  nextStep,
  tooltipPosition,
  isCenter,
}: FlowTooltipProps): JSX.Element {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`absolute bg-white rounded-lg shadow-2xl p-6 max-w-md ${
        isCenter ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''
      }`}
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
      style={
        isCenter
          ? {}
          : {
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              width: '400px',
            }
      }
      transition={{ delay: 0.2 }}
    >
      {/* Close button */}
      {currentStep.showSkip === true ? (
        <button
          aria-label="Skip onboarding"
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={skipOnboarding}
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Step {state.currentStepIndex + 1} of {state.currentFlow?.steps.length ?? 0}
          </span>
          {(state.currentFlow?.estimatedTime != null && state.currentFlow.estimatedTime !== 0) ? (
            <span className="text-sm text-gray-500">
              ~{state.currentFlow.estimatedTime} min
            </span>
          ) : null}
        </div>
        <Progress className="h-2" value={progress} />
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
        {currentStep.requiresAction === true ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
            <p className="font-medium">Action required:</p>
            <p>
              {currentStep.action === 'click' && 'Click the highlighted element to continue'}
              {currentStep.action === 'input' && 'Fill in the required information'}
              {currentStep.action === 'hover' && 'Hover over the highlighted element'}
            </p>
          </div>
        ) : null}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {canGoBack ? (
              <Button aria-label="Click button" onClick={previousStep}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            ) : null}
            {currentStep.showSkip === true ? (
              <Button
                className="text-gray-500"
                onClick={skipOnboarding}
                size="sm"
                variant="ghost"
              >
                {currentStep.skipButtonText ?? 'Skip tour'}
              </Button>
            ) : null}
          </div>

          {currentStep.requiresAction !== true ? (
            <Button
              className="gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={nextStep}
              size="sm"
            >
              {currentStep.nextButtonText ?? 'Next'}
              {canGoForward ? <ChevronRight className="h-4 w-4" /> : null}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

// Hover tooltip component
function HoverTooltip({
  id: _id,
  title,
  content,
  children,
  position = 'top',
  showOnce = true,
  delay = 1000,
  actionText,
  onAction,
}: HoverTooltipProps): React.ReactElement {
  const { state } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Don't show if onboarding is active or user isn't new
  if (state.currentFlow || !state.isFirstTimeUser) {
    return children;
  }

  // Don't show if already dismissed or shown (when showOnce is true)
  if (isDismissed || (showOnce && hasBeenShown)) {
    return children;
  }

  const handleMouseEnter = (): void => {
    if (hasBeenShown && showOnce) {
return;
}

    setTimeout(() => {
      setIsVisible(true);
      setHasBeenShown(true);
    }, delay);
  };

  const handleMouseLeave = (): void => {
    setIsVisible(false);
  };

  const handleDismiss = (): void => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const getTooltipStyles = (): string => {
    const base = 'absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72';

    switch (position) {
      case 'top':
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return base;
    }
  };

  const getArrowStyles = (): string => {
    const base = 'absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45';

    switch (position) {
      case 'top':
        return `${base} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
      case 'bottom':
        return `${base} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`;
      case 'left':
        return `${base} -right-1.5 top-1/2 -translate-y-1/2 border-l-0 border-b-0`;
      case 'right':
        return `${base} -left-1.5 top-1/2 -translate-y-1/2 border-r-0 border-t-0`;
      default:
        return base;
    }
  };

  return (
    <div className="relative inline-block">
      {cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        className: `${(children.props as { className?: string }).className ?? ''} ${isVisible ? 'z-40' : ''}`,
      })}

      <AnimatePresence>
        {isVisible ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={getTooltipStyles()}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            onMouseEnter={(): void => {
 setIsVisible(true); 
}}
            onMouseLeave={handleMouseLeave}
            transition={{ duration: 0.2 }}
          >
            {/* Arrow */}
            <div className={getArrowStyles()} />

            {/* Close button */}
            <button
              aria-label="Dismiss tooltip"
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
                </div>
              </div>

              {(actionText != null && actionText !== '' && onAction != null) ? (
                <button
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={() => {
                    onAction();
                    handleDismiss();
                  }}
                >
                  {actionText} →
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
