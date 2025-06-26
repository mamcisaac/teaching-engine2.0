import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ETFOLessonPlan } from '../../hooks/useETFOPlanning';

interface LessonPlanTableRowProps {
  lesson: ETFOLessonPlan;
  onEdit: (lesson: ETFOLessonPlan) => void;
  onDelete: (id: string) => void;
}

export const LessonPlanTableRow: React.FC<LessonPlanTableRowProps> = ({
  lesson,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
        <span className="block sm:hidden">{format(new Date(lesson.date), 'MMM d')}</span>
        <span className="hidden sm:block">{format(new Date(lesson.date), 'MMM d, yyyy')}</span>
      </td>
      <td className="px-3 sm:px-6 py-2 sm:py-4">
        <Link
          to={`/planner/lessons/${lesson.id}`}
          className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-900 block"
        >
          {lesson.title}
        </Link>
        {lesson.isSubFriendly && (
          <Badge variant="secondary" className="mt-1 text-xs">
            Sub
          </Badge>
        )}
      </td>
      <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
        {lesson.duration} min
      </td>
      <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
        {lesson.assessmentType && (
          <Badge variant="outline" className="text-xs">
            {lesson.assessmentType}
          </Badge>
        )}
      </td>
      <td className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
        {lesson.daybookEntry ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-0.5" />
            <span className="hidden xl:inline">Taught</span>
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="hidden xl:inline">Planned</span>
          </span>
        )}
      </td>
      <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lesson)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(lesson.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};