import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type AssessmentLevel = 'good' | 'okay' | 'needs_work';

interface QuickAssessmentProps {
  lessonId: string;
  value?: string | null;
  notes?: string | null;
}

const MAX_NOTES = 1000;

const LABELS = {
  good: { label: 'Good', emoji: '👍' },
  okay: { label: 'Okay', emoji: '👌' },
  needs_work: { label: 'Needs Work', emoji: '👎' }
} as const;

const isValidAssessmentLevel = (value: unknown): value is AssessmentLevel => {
  return value === 'good' || value === 'okay' || value === 'needs_work';
};

const getButtonClass = (level: AssessmentLevel, selected: boolean): string => {
  if (selected) {
    switch(level) {
      case 'good': return 'bg-green-500 hover:bg-green-600 text-white shadow-md';
      case 'okay': return 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md';
      case 'needs_work': return 'bg-red-500 hover:bg-red-600 text-white shadow-md';
    }
  }
  return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
};

export function QuickAssessment({ lessonId, value, notes }: QuickAssessmentProps) {
  // Core state
  const [assessment, setAssessment] = useState<AssessmentLevel | null>(() => 
    isValidAssessmentLevel(value) ? value : null
  );
  const [assessmentNotes, setAssessmentNotes] = useState(notes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Separate UI state that persists until explicitly cleared
  const [error, setError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  
  // Timer refs - WITH THE BUG FIXED
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const savedTimeoutRef = useRef<NodeJS.Timeout>();
  
  const queryClient = useQueryClient();

  // React Query mutation
  const mutation = useMutation({
    mutationFn: async ({ quickAssessment, quickAssessmentNotes }: { 
      quickAssessment: AssessmentLevel | null; 
      quickAssessmentNotes: string 
    }) => {
      const res = await fetch(`/api/etfo-lesson-plans/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quickAssessment, quickAssessmentNotes })
      });
      
      if (!res.ok) {
        const errorMessage = 
          res.status === 401 ? 'Session expired - please refresh' :
          res.status === 404 ? 'Lesson not found' :
          res.status >= 500 ? 'Server error - will retry' :
          'Failed to save';
        throw new Error(errorMessage);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans', lessonId] });
      // Only clear hasUnsavedChanges on success
      setHasUnsavedChanges(false);
      setError(null); // Clear error on success
      setShowSaved(true);
      
      // Clear existing timeout and hide saved message after 2 seconds
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 2000);
    },
    onError: (err: Error) => {
      // Set error but DON'T clear hasUnsavedChanges - user's changes are still unsaved!
      const message = err.message || 'Failed to save';
      setError(message);
      // hasUnsavedChanges remains true - important for data preservation
    }
  });

  // Debounced save effect
  useEffect(() => {
    // Only save if there's an assessment AND unsaved changes
    if (!assessment || !hasUnsavedChanges) return;

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      mutation.mutate({ 
        quickAssessment: assessment, 
        quickAssessmentNotes: assessmentNotes 
      });
    }, 500);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [assessment, assessmentNotes, hasUnsavedChanges]);

  // Cleanup on unmount - FIXED THE BUG
  useEffect(() => {
    return () => {
      clearTimeout(savedTimeoutRef.current);
      clearTimeout(saveTimeoutRef.current); // <- Fixed: now uses correct ref
    };
  }, []);

  // Smart prop sync - only when completely safe
  useEffect(() => {
    // Only sync when:
    // - No unsaved changes
    // - Not currently saving
    // - No error present (don't disrupt user context during error state)
    if (!hasUnsavedChanges && !mutation.isPending && !error) {
      const newAssessment = isValidAssessmentLevel(value) ? value : null;
      setAssessment(newAssessment);
      setAssessmentNotes(notes || '');
    }
  }, [value, notes, hasUnsavedChanges, mutation.isPending, error]);

  // Check for empty lessonId
  if (!lessonId || (typeof lessonId === 'string' && !lessonId.trim())) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded" />;
  }

  const handleAssessmentChange = (level: AssessmentLevel) => {
    setAssessment(level);
    setHasUnsavedChanges(true);
    setError(null); // Clear error on new user action
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAssessmentNotes(e.target.value);
    setHasUnsavedChanges(true);
    setError(null); // Clear error on new user action
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2" role="group" aria-label="Lesson assessment">
        {(Object.keys(LABELS) as AssessmentLevel[]).map((level) => {
          const selected = assessment === level;
          const { label, emoji } = LABELS[level];
          
          return (
            <button
              key={level}
              onClick={() => handleAssessmentChange(level)}
              disabled={mutation.isPending}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${getButtonClass(level, selected)}
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
              aria-pressed={selected}
              aria-label={`Rate lesson as ${label}`}
            >
              <span className="mr-2" aria-hidden="true">{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {assessment && (
        <>
          <textarea
            value={assessmentNotes}
            onChange={handleNotesChange}
            placeholder="Optional notes about this lesson..."
            disabled={mutation.isPending}
            maxLength={MAX_NOTES}
            className={`
              w-full p-3 border rounded-lg resize-none transition-colors
              ${error ? 'border-red-300' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:cursor-not-allowed
            `}
            rows={3}
            aria-label="Assessment notes"
            aria-invalid={!!error}
            aria-describedby={error ? 'assessment-error' : undefined}
          />
          {assessmentNotes.length > 0 && (
            <div className="text-xs text-right text-gray-400">
              <span className={assessmentNotes.length > MAX_NOTES * 0.9 ? 'text-orange-500 font-medium' : ''}>
                {assessmentNotes.length}/{MAX_NOTES}
              </span>
            </div>
          )}
        </>
      )}

      {/* Status container - always rendered to prevent layout shift */}
      <div className="min-h-[24px]" aria-live="polite" aria-atomic="true">
        {mutation.isPending && <div className="text-sm text-gray-500">Saving...</div>}
        {showSaved && !mutation.isPending && <div className="text-sm text-green-600">✓ Saved</div>}
        {error && !mutation.isPending && (
          <div id="assessment-error" className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}