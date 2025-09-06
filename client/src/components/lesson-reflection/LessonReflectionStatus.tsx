/**
 * Quick status selector for lesson reflections
 * Three emoji buttons: 👍 (success), 👌 (mixed), 👎 (reteach)
 */

import React from 'react';

import type { ReflectionStatus } from '../../hooks/useLessonReflection';
import { cn } from '../../utils/cn';

interface LessonReflectionStatusProps {
  value?: ReflectionStatus;
  onChange: (status: ReflectionStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
}

const statusOptions: Array<{
  value: ReflectionStatus;
  label: string;
  description: string;
  colorClass: string;
}> = [
  {
    value: '👍',
    label: 'Great!',
    description: 'Students understood well',
    colorClass: 'hover:bg-green-50 data-[selected=true]:bg-green-100 data-[selected=true]:ring-2 data-[selected=true]:ring-green-500'
  },
  {
    value: '👌',
    label: 'Mixed',
    description: 'Some got it, some didn\'t',
    colorClass: 'hover:bg-yellow-50 data-[selected=true]:bg-yellow-100 data-[selected=true]:ring-2 data-[selected=true]:ring-yellow-500'
  },
  {
    value: '👎',
    label: 'Reteach',
    description: 'Needs more work',
    colorClass: 'hover:bg-red-50 data-[selected=true]:bg-red-100 data-[selected=true]:ring-2 data-[selected=true]:ring-red-500'
  }
];

export const LessonReflectionStatus: React.FC<LessonReflectionStatusProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  className,
  showLabels = false
}) => {
  const sizeClasses = {
    sm: 'text-xl p-1.5',
    md: 'text-2xl p-2',
    lg: 'text-3xl p-3'
  };

  const handleKeyDown = (e: React.KeyboardEvent, status: ReflectionStatus) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onChange(status);
      }
    }
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-2',
        className
      )}
      role="radiogroup"
      aria-label="Lesson reflection status"
    >
      {statusOptions.map((option) => (
        <div
          key={option.value}
          className="flex flex-col items-center gap-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={value === option.value}
            aria-label={option.description}
            data-selected={value === option.value}
            onClick={() => !disabled && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
            disabled={disabled}
            className={cn(
              'rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              sizeClasses[size],
              option.colorClass,
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'cursor-pointer'
            )}
            title={option.description}
          >
            <span role="img" aria-label={option.label}>
              {option.value}
            </span>
          </button>
          {showLabels && (
            <span className={cn(
              'text-xs text-gray-600',
              value === option.value && 'font-semibold'
            )}>
              {option.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

