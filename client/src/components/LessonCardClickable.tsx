import React from 'react';
import { GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type LessonCardProps = {
  id: string;                         // REAL ETFOLessonPlan.id (CUID)
  title?: string | null;
  titleFr?: string | null;
  subject?: string | null;
  duration?: number | null;
  isSubFriendly?: boolean | number | null;
  date?: string | null;
  slotNumber?: number | null;
  // DnD bindings (optional) - only for the drag handle
  dragHandleRef?: (element: HTMLElement | null) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  disabled?: boolean;
  // Color class for subject
  colorClass?: string;
};

export function LessonCardClickable({
  id, 
  title, 
  titleFr, 
  subject,
  duration,
  isSubFriendly,
  date, 
  dragHandleRef,
  dragHandleProps, 
  isDragging,
  disabled,
  colorClass = 'bg-white'
}: LessonCardProps) {
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (!disabled && !isDragging && id) {
      navigate(`/planner/lessons/${id}`);
    }
  };

  const displayTitle = titleFr || title || "Sans titre";

  return (
    <div
      data-testid="lesson-card"
      data-lesson-id={id}
      data-day={date?.split('T')[0]}
      className={`flex items-stretch gap-0 rounded border transition-all ${
        isDragging ? 'opacity-50 z-50' : 'hover:shadow-md'
      } ${colorClass}`}
      role="group"
      aria-label={`Leçon ${displayTitle}`}
    >
      {/* Drag handle (small left strip) */}
      {dragHandleProps && (
        <button
          ref={dragHandleRef}
          aria-label="Déplacer la leçon"
          {...dragHandleProps}
          className="shrink-0 w-8 cursor-grab active:cursor-grabbing bg-gray-100 hover:bg-gray-200 rounded-l flex items-center justify-center border-r"
          onClick={(e) => e.preventDefault()} // never navigate from the handle
          type="button"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </button>
      )}

      {/* Click zone (rest of the card) */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isDragging}
        className="flex-1 text-left p-2 rounded-r focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-default"
        aria-label={`Ouvrir ${displayTitle}`}
      >
        <div className="font-medium text-xs mb-1">
          {displayTitle}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">
            {subject} {duration && `- ${duration} min`}
          </span>
          {isSubFriendly && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200">Sub</span>
          )}
        </div>
      </button>
    </div>
  );
}