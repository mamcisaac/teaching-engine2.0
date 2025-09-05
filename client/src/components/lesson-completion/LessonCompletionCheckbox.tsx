/**
 * Lesson Completion Checkbox Component
 * CRITICAL: This is a controlled component - NO internal state or hooks
 * All state is managed by the parent component via props
 */

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LessonCompletionCheckboxProps {
  lessonId: string;
  isCompleted: boolean;
  onToggle: (lessonId: string, currentState: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  className?: string;
  'aria-label'?: string;
}

export const LessonCompletionCheckbox: React.FC<LessonCompletionCheckboxProps> = ({
  lessonId,
  isCompleted,
  onToggle,
  disabled = false,
  isLoading = false,
  error,
  className,
  'aria-label': ariaLabel = 'Mark lesson as complete'
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && !isLoading) {
      onToggle(lessonId, isCompleted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isLoading) {
        onToggle(lessonId, isCompleted);
      }
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className={cn('inline-flex items-center', className)}>
      <button
        type="button"
        role="checkbox"
        data-testid="completion-checkbox"
        aria-checked={isCompleted}
        aria-label={ariaLabel}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center',
          'w-11 h-11 min-w-[44px] min-h-[44px]', // Minimum touch target size
          'rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isCompleted ? 'checkbox--complete' : 'checkbox--incomplete',
          isLoading && 'checkbox--loading opacity-50 cursor-wait',
          error && 'checkbox--error',
          isDisabled && !isLoading && 'opacity-50 cursor-not-allowed',
          !isDisabled && !isLoading && 'cursor-pointer hover:bg-gray-100',
          // Focus styles
          'focus:ring-blue-500 checkbox--focused:ring-2 checkbox--focused:ring-blue-500',
          // Hover styles
          !isDisabled && 'hover:scale-110 checkbox--hover'
        )}
      >
        {isCompleted ? (
          <CheckCircle2
            className={cn(
              'w-6 h-6 transition-all duration-200',
              'text-green-600',
              isLoading && 'animate-pulse',
              'checkbox--animating'
            )}
            aria-hidden="true"
          />
        ) : (
          <Circle
            className={cn(
              'w-6 h-6 transition-all duration-200',
              'text-gray-400',
              !isDisabled && 'hover:text-gray-600',
              isLoading && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        )}

        {/* Loading spinner overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {/* Saving indicator */}
      {isLoading && (
        <div 
          data-testid="saving-indicator"
          className="ml-2 text-xs text-blue-600 flex items-center"
        >
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
          Saving...
        </div>
      )}

      {/* Error message */}
      {error && (
        <div 
          role="alert" 
          data-testid="error-message"
          className="ml-2 text-sm text-red-600"
        >
          Failed to save: {error}
        </div>
      )}

      {/* Screen reader live region for status updates */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isCompleted ? 'Lesson marked as complete' : 'Lesson not complete'}
      </div>
    </div>
  );
};

// Export a memoized version for performance
export default React.memo(LessonCompletionCheckbox);