/**
 * Quick Note Button for student rows
 * Issue #318: One-click access to anecdotal note entry
 * 
 * Features:
 * - Prominent "Quick Note" button
 * - Modal popup with QuickNoteEntry
 * - Context pre-filling from lesson/page
 * - Mobile-optimized interaction
 */

import { StickyNote, X, Plus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import type { NoteContext } from '../../utils/anecdotalNotes';
import { cn } from '../../utils/cn';

import { QuickNoteEntry } from './QuickNoteEntry';

interface QuickNoteButtonProps {
  studentId: string;
  studentName: string;
  context?: NoteContext;
  variant?: 'button' | 'icon' | 'compact';
  className?: string;
  onNoteSaved?: (note: string) => void;
}

export const QuickNoteButton: React.FC<QuickNoteButtonProps> = ({
  studentId,
  studentName,
  context,
  variant = 'button',
  className,
  onNoteSaved
}) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (showModal) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else if (previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current.focus();
    }
  }, [showModal]);

  // Keyboard handling for accessibility
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleNoteSaved = (note: string): void => {
    setShowModal(false);
    onNoteSaved?.(note);
  };

  const handleModalClose = (): void => {
    setShowModal(false);
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-amber-600 hover:bg-amber-50',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              'touch-manipulation', // Better mobile touch
              className
            )}
            title={`Quick note for ${studentName}`}
            aria-label={`Add quick note for ${studentName}`}
          >
            <StickyNote className="w-4 h-4" />
          </button>
        );
      
      case 'compact':
        return (
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs',
              'rounded transition-colors',
              'text-amber-600 hover:bg-amber-50 border border-amber-200',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              'touch-manipulation',
              className
            )}
            aria-label={`Add quick note for ${studentName}`}
          >
            <Plus className="w-3 h-3" />
            <span>Note</span>
          </button>
        );
      
      default: // 'button'
        return (
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'bg-amber-50 text-amber-700 rounded-lg',
              'border border-amber-200',
              'hover:bg-amber-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-amber-500',
              'text-sm font-medium',
              'touch-manipulation min-h-[44px]', // Minimum mobile touch target
              className
            )}
            aria-label={`Add quick note for ${studentName}`}
          >
            <StickyNote className="w-4 h-4" />
            <span>Quick Note</span>
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {/* Modal with accessibility */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleModalClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />

          {/* Modal Content - Mobile optimized */}
          <div 
            ref={modalRef}
            tabIndex={-1}
            className={cn(
              'relative bg-white shadow-xl',
              // Mobile-first: full screen on small devices
              'w-full h-full max-h-screen',
              'sm:w-full sm:max-w-2xl sm:mx-6 sm:rounded-lg sm:h-auto sm:max-h-[90vh]',
              'md:mx-8',
              // Scrolling
              'overflow-y-auto',
              // Focus outline
              'focus:outline-none',
              // Safe area handling for mobile devices with notches
              'pb-safe-bottom'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <StickyNote className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Quick Note
                  </h2>
                  <p 
                    id="modal-description" 
                    className="text-sm text-gray-600"
                  >
                    {studentName}
                    {context?.lessonTitle && (
                      <span className="ml-2 text-blue-600">• {context.lessonTitle}</span>
                    )}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleModalClose}
                className={cn(
                  'p-2 rounded-lg',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500',
                  'touch-manipulation min-h-[44px] min-w-[44px]' // Better mobile touch target
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <QuickNoteEntry
                studentId={studentId}
                studentName={studentName}
                context={context}
                placeholder={`What did you observe about ${studentName}?`}
                rows={4}
                onSave={handleNoteSaved}
              />
              
              {/* Quick action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-gray-100 text-gray-700',
                    'hover:bg-gray-200 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-gray-500',
                    'text-sm font-medium',
                    'touch-manipulation min-h-[44px]'
                  )}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

