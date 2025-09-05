/**
 * Combined panel for quick lesson reflections
 * Status selector + note field with autosave
 */

import { MessageSquare } from 'lucide-react';
import React from 'react';

import type { ReflectionStatus } from '../../hooks/useLessonReflection';
import { useLessonReflection } from '../../hooks/useLessonReflection';
import { cn } from '../../utils/cn';

import { LessonReflectionNote } from './LessonReflectionNote';
import { LessonReflectionStatus } from './LessonReflectionStatus';

interface QuickReflectionPanelProps {
  lessonId: string;
  lessonTitle?: string;
  compact?: boolean;
  className?: string;
  onReflectionChange?: (hasReflection: boolean) => void;
}

export const QuickReflectionPanel: React.FC<QuickReflectionPanelProps> = ({
  lessonId,
  lessonTitle,
  compact = false,
  className,
  onReflectionChange
}) => {
  const {
    reflection,
    localNote,
    isLoading,
    isSaving,
    isError,
    setStatus,
    setNote,
    save
  } = useLessonReflection({ lessonId });

  React.useEffect(() => {
    // Notify parent when reflection exists
    onReflectionChange?.(!!reflection?.status || localNote.length > 0);
  }, [reflection?.status, localNote, onReflectionChange]);

  if (isLoading) {
    return (
      <div className={cn('p-3 bg-gray-50 rounded-lg animate-pulse', className)}>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border rounded-lg',
      compact ? 'p-2' : 'p-3',
      className
    )}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700">
            Quick Reflection
            {lessonTitle && <span className="text-gray-400 ml-1">• {lessonTitle}</span>}
          </h4>
        </div>
      )}

      {/* Status selector */}
      <div className={cn('flex items-center gap-3', compact ? 'mb-2' : 'mb-3')}>
        <div className="text-sm text-gray-600">
          How did it go?
        </div>
        <LessonReflectionStatus
          value={reflection?.status as ReflectionStatus}
          onChange={setStatus}
          size={compact ? 'sm' : 'md'}
          showLabels={!compact}
        />
      </div>

      {/* Note input */}
      <LessonReflectionNote
        value={localNote}
        onChange={setNote}
        onSave={save}
        isSaving={isSaving}
        isError={isError}
        rows={compact ? 2 : 3}
        placeholder={
          compact 
            ? 'Quick notes...' 
            : 'What worked? What didn\'t? Notes for next time...'
        }
        showSaveIndicator={!compact}
      />

      {/* Summary stats if reflection exists */}
      {reflection && !compact && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          Last updated: {new Date(reflection.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default QuickReflectionPanel;