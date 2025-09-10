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
  // Enhanced data for comprehensive view
  description?: string | null;
  descriptionFr?: string | null;
  unitTitle?: string | null;
  unitTitleFr?: string | null;
  lessonNumber?: number | null;
  expectations?: Array<{
    code: string;
    description?: string;
  }> | null;
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
  description,
  descriptionFr,
  unitTitle,
  unitTitleFr,
  lessonNumber,
  expectations,
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
  const displayDescription = descriptionFr || description;
  const displayUnitTitle = unitTitleFr || unitTitle;
  
  // Truncate description if too long
  const truncatedDescription = displayDescription 
    ? displayDescription.length > 100 
      ? displayDescription.substring(0, 97) + '...'
      : displayDescription
    : null;

  return (
    <div
      data-testid="lesson-card"
      data-lesson-id={id}
      data-day={date ? date.split('T')[0] : ''}
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
        data-testid="lesson-link"
      >
        <div className="space-y-1">
          {/* Title and lesson number */}
          <div className="font-medium text-sm">
            {displayTitle}
            {lessonNumber && (
              <span className="ml-2 text-xs text-gray-500">
                #{lessonNumber}
              </span>
            )}
          </div>
          
          {/* Subject and unit */}
          <div className="text-xs text-gray-600">
            {subject && <div className="font-semibold">📚 {subject}</div>}
            {!subject && <div className="text-red-500">⚠️ No subject</div>}
            {displayUnitTitle && (
              <div className="text-gray-500 italic">{displayUnitTitle}</div>
            )}
          </div>
          
          {/* Description */}
          {truncatedDescription && (
            <div className="text-xs text-gray-700 line-clamp-2">
              {truncatedDescription}
            </div>
          )}
          
          {/* Curriculum expectations */}
          {expectations && expectations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {expectations.slice(0, 3).map((exp, index) => (
                <span 
                  key={index}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                  title={exp.description}
                >
                  {exp.code}
                </span>
              ))}
              {expectations.length > 3 && (
                <span className="text-xs text-gray-500">+{expectations.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}