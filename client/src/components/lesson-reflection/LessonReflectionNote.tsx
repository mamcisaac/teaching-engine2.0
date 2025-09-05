/**
 * Note input with autosave for lesson reflections
 * Debounced autosave with visual feedback
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface LessonReflectionNoteProps {
  value: string;
  onChange: (note: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isError?: boolean;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  className?: string;
  showSaveIndicator?: boolean;
}

export const LessonReflectionNote: React.FC<LessonReflectionNoteProps> = ({
  value,
  onChange,
  onSave,
  isSaving = false,
  isError = false,
  placeholder = 'Quick notes about this lesson (optional)...',
  maxLength = 500,
  rows = 2,
  disabled = false,
  className,
  showSaveIndicator = true
}) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success indicator briefly after save
  useEffect(() => {
    if (!isSaving && lastSaved && !isError) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSaving, lastSaved, isError]);

  // Update last saved time when saving completes
  useEffect(() => {
    if (!isSaving && !isError) {
      setLastSaved(new Date());
    }
  }, [isSaving, isError]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + S to manually save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm',
            'border rounded-lg resize-none',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            isError && 'border-red-500 focus:ring-red-500',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-50',
            !disabled && !isError && 'border-gray-300 hover:border-gray-400'
          )}
          aria-label="Lesson reflection notes"
          aria-invalid={isError}
          aria-describedby={showSaveIndicator ? 'save-status' : undefined}
        />
        
        {/* Character count */}
        {maxLength && (
          <div className={cn(
            'absolute bottom-2 right-2 text-xs text-gray-400',
            value.length > maxLength * 0.9 && 'text-orange-500',
            value.length >= maxLength && 'text-red-500'
          )}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Save status indicator */}
      {showSaveIndicator && (
        <div
          id="save-status"
          className="flex items-center gap-2 mt-1 min-h-[20px]"
        >
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          
          {showSuccess && !isSaving && !isError && (
            <div className="flex items-center gap-1 text-xs text-green-600 animate-fade-in">
              <Check className="w-3 h-3" />
              <span>Saved</span>
            </div>
          )}
          
          {isError && !isSaving && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>Failed to save</span>
            </div>
          )}
          
          {!isSaving && !showSuccess && !isError && value.length > 0 && (
            <div className="text-xs text-gray-400">
              Press Cmd+S to save manually
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonReflectionNote;