/**
 * Quick Note Entry component for anecdotal observations
 * Issue #318: Mobile-optimized text input with auto-save
 * 
 * Features:
 * - 2-second debounced auto-save
 * - Mobile-friendly large text area
 * - Character counter
 * - Auto-context pre-filling
 * - Visual save indicators
 */

import { Loader2, Check, AlertCircle, StickyNote } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useAnecdotalNotes } from '../../hooks/useAnecdotalNotes';
import type { NoteContext } from '../../utils/anecdotalNotes';
import { cn } from '../../utils/cn';

interface QuickNoteEntryProps {
  studentId: string;
  studentName?: string;
  context?: NoteContext;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
  onSave?: (note: string) => void;
  compact?: boolean;
  autoFocus?: boolean;
}

export const QuickNoteEntry: React.FC<QuickNoteEntryProps> = ({
  studentId,
  studentName,
  context,
  placeholder = "Quick observation about this student...",
  maxLength = 1000,
  rows = 3,
  className,
  onSave,
  compact = false,
  autoFocus = false
}) => {
  const { 
    localNote, 
    setNote, 
    saveNote, 
    isSaving, 
    isError, 
    canSave 
  } = useAnecdotalNotes({ studentId, autoSave: true });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newText = e.target.value;
    setNote(newText, context);
  };

  const handleManualSave = (): void => {
    if (canSave(localNote)) {
      saveNote(localNote, studentId, context);
      onSave?.(localNote);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Cmd/Ctrl + Enter to manually save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleManualSave();
    }
  };

  const contextString = context?.lessonTitle || context?.subject;
  const characterCount = localNote.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount >= maxLength;

  return (
    <div className={cn(
      'bg-white border rounded-lg',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-medium text-gray-700">
              Quick Note
              {studentName && <span className="text-blue-600 ml-1">• {studentName}</span>}
            </h4>
          </div>
          {contextString && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {contextString}
            </span>
          )}
        </div>
      )}

      {/* Form with proper accessibility */}
      <form onSubmit={(e) => { e.preventDefault(); handleManualSave(); }}>
        <label 
          htmlFor={`note-input-${studentId}`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Quick Note{studentName && ` for ${studentName}`}
        </label>
        
        <div className="relative">
          <textarea
            id={`note-input-${studentId}`}
            value={localNote}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={compact ? Math.max(2, rows - 1) : rows}
            autoFocus={autoFocus}
            inputMode="text"
            enterKeyHint="done"
            className={cn(
              'w-full px-3 py-3 text-base', // Larger text for mobile
              'border rounded-lg resize-none',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'placeholder-gray-400',
              // Mobile optimizations
              'touch-manipulation', // Better touch handling
              'min-h-[60px]', // Minimum touch target size
              // Better mobile viewport handling
              'focus:ring-offset-0', // Remove focus ring offset on mobile
              isError && 'border-red-500 focus:ring-red-500',
              isOverLimit && 'border-orange-500 focus:ring-orange-500',
              'border-gray-300 hover:border-gray-400'
            )}
            aria-invalid={isError}
            aria-describedby={`help-${studentId} status-${studentId} count-${studentId}`}
            required
          />

          {/* Character count - positioned over textarea */}
          <div 
            id={`count-${studentId}`}
            className={cn(
              'absolute bottom-2 right-2 text-xs px-2 py-1 rounded',
              'bg-white/80 backdrop-blur-sm border',
              isNearLimit ? 'text-orange-600 border-orange-200' : 'text-gray-500 border-gray-200',
              isOverLimit && 'text-red-600 border-red-200'
            )}
            aria-label={`${characterCount} of ${maxLength} characters used`}
          >
            {characterCount}/{maxLength}
          </div>
        </div>
      </form>

      {/* Save status indicator with proper accessibility */}
      <div
        id={`status-${studentId}`}
        className={cn(
          'flex items-center justify-between mt-2 min-h-[20px]',
          compact && 'text-xs'
        )}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-1 text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Saving...</span>
            </div>
          )}
          
          {showSuccess && !isSaving && !isError && (
            <div className="flex items-center gap-1 text-green-600 animate-fade-in">
              <Check className="w-3 h-3" />
              <span className="text-xs">Auto-saved</span>
            </div>
          )}
          
          {isError && !isSaving && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">Failed to save</span>
            </div>
          )}
        </div>

        {/* Manual save hint */}
        {!compact && !isSaving && !showSuccess && !isError && localNote.length > 0 && (
          <button
            onClick={handleManualSave}
            disabled={!canSave(localNote)}
            className={cn(
              'text-xs px-2 py-1 rounded transition-colors',
              canSave(localNote)
                ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            )}
          >
            Cmd+Enter to save
          </button>
        )}
      </div>

      {/* Help text and context info */}
      <div 
        id={`help-${studentId}`}
        className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500"
      >
        {context && !compact && (
          <div className="mb-1">
            {context.date && `${context.date.toLocaleString()} • `}
            {contextString && `${contextString} • `}
          </div>
        )}
        <div>
          Auto-saves after 2 seconds • Use Cmd+Enter to save immediately
        </div>
      </div>
    </div>
  );
};

export default QuickNoteEntry;