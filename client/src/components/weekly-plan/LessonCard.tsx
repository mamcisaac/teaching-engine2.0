import React, { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckCircle2, AlertCircle, Users, BookOpen, Target, Sparkles, Palette, Globe } from 'lucide-react';
import type { ETFOLessonPlan } from '../../hooks/useETFOPlanning';

// Enhanced subject colors with accessibility patterns and icons
const SUBJECT_CONFIG: Record<string, { 
  colors: string; 
  icon: React.ReactNode;
  ariaLabel: string;
}> = {
  'Français (Immersion)': {
    colors: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: <BookOpen className="h-3 w-3" aria-hidden="true" />,
    ariaLabel: 'French Immersion'
  },
  'Mathématiques': {
    colors: 'bg-green-100 text-green-800 border-green-300',
    icon: <div className="h-3 w-3 font-bold" aria-hidden="true">Σ</div>,
    ariaLabel: 'Mathematics'
  },
  'Sciences de la nature': {
    colors: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: <Sparkles className="h-3 w-3" aria-hidden="true" />,
    ariaLabel: 'Natural Sciences'
  },
  'Arts visuels': {
    colors: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: <Palette className="h-3 w-3" aria-hidden="true" />,
    ariaLabel: 'Visual Arts'
  },
  'Sciences humaines': {
    colors: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    icon: <Globe className="h-3 w-3" aria-hidden="true" />,
    ariaLabel: 'Social Sciences'
  },
  'Formation personnelle et sociale': {
    colors: 'bg-pink-100 text-pink-800 border-pink-300',
    icon: <Users className="h-3 w-3" aria-hidden="true" />,
    ariaLabel: 'Personal and Social Development'
  }
};

interface LessonCardProps {
  lesson: ETFOLessonPlan;
  isDragging?: boolean;
  subject: string;
  onClick?: () => void;
  isSelected?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  'aria-label'?: string;
  tabIndex?: number;
}

export const LessonCard = memo(function LessonCard({ 
  lesson, 
  isDragging = false, 
  subject, 
  onClick,
  isSelected = false,
  showDetails = false,
  compact = false,
  'aria-label': ariaLabel,
  tabIndex = 0
}: LessonCardProps): React.ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: lesson.id,
    data: {
      type: 'lesson',
      lesson
    }
  });

  // Memoize expensive calculations
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }), [transform, transition, isSortableDragging]);

  const subjectConfig = useMemo(
    () => SUBJECT_CONFIG[subject] || {
      colors: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: null,
      ariaLabel: subject
    },
    [subject]
  );

  const isOverdue = useMemo(
    () => lesson.date && new Date(lesson.date) < new Date() && !lesson.daybookEntry,
    [lesson.date, lesson.daybookEntry]
  );

  const lessonTitle = lesson.titleFr || lesson.title;
  
  // Generate comprehensive aria-label
  const computedAriaLabel = ariaLabel || `${lessonTitle}. ${subjectConfig.ariaLabel} lesson. ${
    lesson.duration ? `${lesson.duration} minutes.` : ''
  } ${isOverdue ? 'Overdue.' : ''} ${
    lesson.isSubFriendly ? 'Substitute friendly.' : ''
  } ${isDragging ? 'Dragging.' : 'Press Space to drag, Enter to open.'}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onClick) {
      e.preventDefault();
      onClick();
    }
    // Space key handled by drag-and-drop
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={tabIndex}
      aria-label={computedAriaLabel}
      aria-selected={isSelected}
      aria-grabbed={isDragging}
      data-lesson-id={lesson.id}
      className={`
        relative p-${compact ? '1.5' : '2'} rounded-lg border transition-all
        ${subjectConfig.colors}
        ${isDragging ? 'shadow-2xl scale-105 rotate-1 z-50' : 'shadow-sm hover:shadow-md'}
        ${isOverdue ? 'border-red-400 ring-2 ring-red-200' : ''}
        ${isSelected ? 'ring-2 ring-blue-400' : ''}
        ${onClick ? 'cursor-pointer' : 'cursor-move'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        transform-gpu will-change-transform
      `}
    >
      {/* Visual pattern overlay for accessibility */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none rounded-lg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0zM2 2h1v1H2z' fill='currentColor' /%3E%3C/svg%3E")`
        }}
        aria-hidden="true"
      />
      
      <div className="relative flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1">
            {subjectConfig.icon && (
              <span className="flex-shrink-0 mt-0.5">
                {subjectConfig.icon}
              </span>
            )}
            <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'} truncate`}>
              {lessonTitle}
            </p>
          </div>
          
          {!compact && (
            <>
              {lesson.duration && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 opacity-60" aria-hidden="true" />
                  <span className="text-xs opacity-75">{lesson.duration} min</span>
                </div>
              )}
              
              {showDetails && lesson.learningGoals && (
                <p className="text-xs opacity-75 mt-1 line-clamp-2">
                  {lesson.learningGoalsFr || lesson.learningGoals}
                </p>
              )}
            </>
          )}
        </div>
        
        <div className="flex-shrink-0 flex flex-col gap-1">
          {lesson.daybookEntry ? (
            <CheckCircle2 
              className="h-4 w-4 text-green-600" 
              aria-label="Completed"
            />
          ) : isOverdue ? (
            <AlertCircle 
              className="h-4 w-4 text-red-600" 
              aria-label="Overdue"
            />
          ) : null}
          
          {lesson.assessmentType && (
            <Target 
              className="h-4 w-4 text-blue-600" 
              aria-label={`${lesson.assessmentType} assessment`}
            />
          )}
        </div>
      </div>
      
      {!compact && lesson.isSubFriendly && (
        <div className="mt-1">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-white/50 rounded">
            <Users className="h-3 w-3" aria-hidden="true" />
            Sub-friendly
          </span>
        </div>
      )}
      
      {/* Visual drag handle */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-current opacity-20 rounded-r"
        aria-hidden="true"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.lesson.id === nextProps.lesson.id &&
    prevProps.lesson.title === nextProps.lesson.title &&
    prevProps.lesson.titleFr === nextProps.lesson.titleFr &&
    prevProps.lesson.duration === nextProps.lesson.duration &&
    prevProps.lesson.daybookEntry === nextProps.lesson.daybookEntry &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showDetails === nextProps.showDetails &&
    prevProps.compact === nextProps.compact &&
    prevProps.subject === nextProps.subject
  );
});