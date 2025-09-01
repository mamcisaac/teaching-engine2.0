import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { LessonCard } from './LessonCard';

interface TimeBlockProps {
  id: string;
  lesson?: any;
  subject: string;
  isToday?: boolean;
  onQuickAdd: () => void;
  onLessonClick: (lessonId: string) => void;
}

export function TimeBlock({ 
  id, 
  lesson, 
  subject, 
  isToday = false, 
  onQuickAdd, 
  onLessonClick 
}: TimeBlockProps): React.ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'time-block',
      subject
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-2 border-r last:border-r-0 min-h-[100px] transition-all
        ${isToday ? 'bg-blue-50/30' : 'hover:bg-gray-50'}
        ${isOver ? 'bg-green-50 ring-2 ring-green-400 ring-inset' : ''}
      `}
    >
      {lesson ? (
        <LessonCard
          lesson={lesson}
          subject={subject}
          onClick={() => onLessonClick(lesson.id)}
        />
      ) : (
        <button
          onClick={onQuickAdd}
          className={`
            w-full h-full min-h-[80px] p-2 
            border-2 border-dashed rounded-lg
            transition-all group
            ${isOver 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-600">
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Quick Add</span>
            <span className="text-xs opacity-75 mt-0.5">{subject.split(' ')[0]}</span>
          </div>
        </button>
      )}
    </div>
  );
}