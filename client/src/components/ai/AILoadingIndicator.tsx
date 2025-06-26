import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export interface AILoadingStep {
  id: string;
  description: string;
  duration?: number; // Expected duration in ms
}

export type AILoadingState = 'waiting' | 'processing' | 'completing' | 'success' | 'error';

interface AILoadingIndicatorProps {
  isOpen: boolean;
  onCancel?: () => void;
  state: AILoadingState;
  steps: readonly AILoadingStep[];
  currentStepId?: string;
  progress?: number; // 0-100
  title?: string;
  subtitle?: string;
  error?: string;
  successMessage?: string;
  canCancel?: boolean;
  autoCloseOnSuccess?: boolean;
  autoCloseDelay?: number; // ms
}

export function AILoadingIndicator({
  isOpen,
  onCancel,
  state,
  steps,
  currentStepId,
  progress = 0,
  title = 'AI Assistant',
  subtitle,
  error,
  successMessage,
  canCancel = true,
  autoCloseOnSuccess = true,
  autoCloseDelay = 2000,
}: AILoadingIndicatorProps) {
  const [localProgress, setLocalProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Auto-increment progress if not provided
  useEffect(() => {
    if (state === 'processing' && progress === 0) {
      const interval = setInterval(() => {
        setLocalProgress((prev) => {
          const increment = Math.random() * 2 + 0.5; // 0.5-2.5% per interval
          return Math.min(prev + increment, 85); // Cap at 85% until completion
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (progress > 0) {
      setLocalProgress(progress);
    }
  }, [state, progress]);

  // Track elapsed time
  useEffect(() => {
    if (state === 'processing') {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state]);

  // Auto-close on success
  useEffect(() => {
    if (state === 'success' && autoCloseOnSuccess && onCancel) {
      const timeout = setTimeout(() => {
        onCancel();
      }, autoCloseDelay);

      return () => clearTimeout(timeout);
    }
  }, [state, autoCloseOnSuccess, autoCloseDelay, onCancel]);

  // Reset progress when opening
  useEffect(() => {
    if (isOpen && state === 'waiting') {
      setLocalProgress(0);
      setElapsedTime(0);
    }
  }, [isOpen, state]);

  // Complete progress on success
  useEffect(() => {
    if (state === 'success' || state === 'completing') {
      setLocalProgress(100);
    }
  }, [state]);

  const currentStep = steps.find((step) => step.id === currentStepId);
  const currentStepIndex = currentStepId ? steps.findIndex((step) => step.id === currentStepId) : -1;
  const displayProgress = progress > 0 ? progress : localProgress;

  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  const getStateIcon = () => {
    switch (state) {
      case 'waiting':
        return <Loader2 className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completing':
        return <Loader2 className="h-5 w-5 text-green-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'waiting':
      case 'processing':
        return 'text-blue-600';
      case 'completing':
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (state) {
      case 'success':
      case 'completing':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-loading-title"
      aria-describedby="ai-loading-description"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStateIcon()}
            <div>
              <h3 
                id="ai-loading-title"
                className={cn('font-semibold', getStateColor())}
              >
                {title}
              </h3>
              {subtitle && (
                <p 
                  id="ai-loading-description"
                  className="text-sm text-gray-500"
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {canCancel && onCancel && state !== 'success' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              aria-label="Cancel AI generation"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {(state === 'processing' || state === 'completing' || state === 'success') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span 
                className="text-sm font-medium text-gray-700"
                aria-label={`Progress: ${Math.round(displayProgress)} percent complete`}
              >
                {Math.round(displayProgress)}%
              </span>
              {state === 'processing' && (
                <span 
                  className="text-xs text-gray-500"
                  aria-label={`Elapsed time: ${formatElapsedTime(elapsedTime)}`}
                >
                  {formatElapsedTime(elapsedTime)}
                </span>
              )}
            </div>
            <Progress 
              value={displayProgress} 
              className="h-2"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(displayProgress)}
              aria-valuetext={`${Math.round(displayProgress)}% complete${currentStep ? ` - ${currentStep.description}` : ''}`}
            >
              <div 
                className={cn('h-full transition-all duration-300', getProgressColor())}
                style={{ width: `${displayProgress}%` }}
              />
            </Progress>
            
            {/* Live region for progress announcements */}
            <div 
              aria-live="polite" 
              aria-atomic="true" 
              className="sr-only"
            >
              {state === 'processing' && currentStep && 
                `${currentStep.description} - ${Math.round(displayProgress)}% complete`
              }
              {state === 'success' && 'AI generation completed successfully'}
            </div>
          </div>
        )}

        {/* Error announcement - separate from progress bar */}
        {state === 'error' && (
          <div 
            aria-live="assertive" 
            aria-atomic="true" 
            className="sr-only"
          >
            AI generation failed{error ? `: ${error}` : ''}
          </div>
        )}

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-900">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-4">
              {currentStep.description}
            </p>
          </div>
        )}

        {/* Steps List */}
        {steps.length > 1 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Progress</h4>
            <div className="space-y-1">
              {steps.map((step, index) => {
                const isCompleted = currentStepIndex > index;
                const isCurrent = step.id === currentStepId;
                const isPending = currentStepIndex < index;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1 rounded text-xs',
                      {
                        'bg-green-50 text-green-700': isCompleted,
                        'bg-blue-50 text-blue-700': isCurrent,
                        'text-gray-500': isPending,
                      }
                    )}
                  >
                    <div
                      className={cn('w-1.5 h-1.5 rounded-full', {
                        'bg-green-500': isCompleted,
                        'bg-blue-500': isCurrent,
                        'bg-gray-300': isPending,
                      })}
                    />
                    <span className="truncate">{step.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Message */}
        {state === 'error' && error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {state === 'success' && successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Actions */}
        {(state === 'error' || state === 'success') && (
          <div className="flex justify-end gap-2">
            {state === 'error' && (
              <Button onClick={onCancel} variant="outline" size="sm">
                Close
              </Button>
            )}
            {state === 'success' && !autoCloseOnSuccess && (
              <Button onClick={onCancel} size="sm">
                Done
              </Button>
            )}
          </div>
        )}

        {/* Cancel Button for Processing */}
        {state === 'processing' && canCancel && onCancel && (
          <div className="flex justify-end mt-4">
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Preset configurations for common AI operations
export const AI_LOADING_PRESETS = {
  GENERATING_UNIT_PLAN: {
    title: 'Generating Unit Plan',
    subtitle: 'Creating comprehensive unit plan with AI assistance',
    steps: [
      { id: 'analyze', description: 'Analyzing curriculum expectations' },
      { id: 'generate', description: 'Generating big ideas and goals' },
      { id: 'structure', description: 'Structuring learning activities' },
      { id: 'finalize', description: 'Finalizing unit plan' },
    ],
  },
  GENERATING_LESSON_PLAN: {
    title: 'Generating Lesson Plan',
    subtitle: 'Creating detailed lesson plan with AI assistance',
    steps: [
      { id: 'context', description: 'Understanding lesson context' },
      { id: 'activities', description: 'Generating learning activities' },
      { id: 'materials', description: 'Suggesting materials and resources' },
      { id: 'assessment', description: 'Creating assessment strategies' },
    ],
  },
  CURRICULUM_ANALYSIS: {
    title: 'Analyzing Curriculum',
    subtitle: 'Processing curriculum expectations and standards',
    steps: [
      { id: 'parse', description: 'Parsing curriculum documents' },
      { id: 'extract', description: 'Extracting key expectations' },
      { id: 'categorize', description: 'Categorizing by subject and grade' },
      { id: 'index', description: 'Building searchable index' },
    ],
  },
} as const;