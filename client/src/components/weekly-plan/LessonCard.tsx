import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// Subject colors matching the main component
const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences de la nature': 'bg-purple-100 text-purple-800 border-purple-300',
  'Arts visuels': 'bg-orange-100 text-orange-800 border-orange-300',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800 border-pink-300'
};

interface LessonCardProps {
  lesson: any;
  isDragging?: boolean;
  subject: string;
  onClick?: () => void;
}

export function LessonCard({ lesson, isDragging = false, subject, onClick }: LessonCardProps): React.ReactElement {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const colorClass = SUBJECT_COLORS[subject] || 'bg-gray-100 text-gray-800';
  const isOverdue = lesson.date && new Date(lesson.date) < new Date() && !lesson.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        p-2 rounded-lg border cursor-move transition-all
        ${colorClass}
        ${isDragging ? 'shadow-2xl scale-105 rotate-2' : 'shadow-sm hover:shadow-md'}
        ${isOverdue ? 'border-red-400' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs truncate">
            {lesson.titleFr || lesson.title}
          </p>
          {lesson.duration && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 opacity-60" />
              <span className="text-xs opacity-75">{lesson.duration} min</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {lesson.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : isOverdue ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : null}
        </div>
      </div>
      
      {lesson.isSubFriendly && (
        <div className="mt-1">
          <span className="inline-block px-1.5 py-0.5 text-xs bg-white/50 rounded">
            Sub-friendly
          </span>
        </div>
      )}
    </div>
  );
}