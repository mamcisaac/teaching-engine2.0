import { format } from 'date-fns';
import { BookOpen, BookTemplate, CheckCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { BlankTemplateQuickActions } from '../../../components/printing/BlankTemplatePrinter';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface LessonListViewProps {
  unitPlan: any;
  unitId: string;
  lessonPlans: any[];
  isLoadingLessons: boolean;
  onCreateLesson: () => void;
  onCreateFromTemplate: () => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLesson: (id: string) => void;
}

export function LessonListView({
  unitPlan,
  unitId,
  lessonPlans,
  isLoadingLessons,
  onCreateLesson,
  onCreateFromTemplate,
  onEditLesson,
  onDeleteLesson,
}: LessonListViewProps): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link className="hover:text-indigo-600" to="/planner/long-range">
            Long-Range Plans
          </Link>
          <span>›</span>
          <Link className="hover:text-indigo-600" to="/planner/units">
            Unit Plans
          </Link>
          {unitPlan && (
            <React.Fragment>
              <span>›</span>
              <Link className="hover:text-indigo-600" to={`/planner/units/${unitId}`}>
                {unitPlan.title}
              </Link>
            </React.Fragment>
          )}
          <span>›</span>
          <span className="text-gray-900 font-medium">Lesson Plans</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lesson Plans</h1>
            {unitPlan && (
              <p className="mt-2 text-gray-600">
                {unitPlan.title} • {format(new Date(unitPlan.startDate), 'MMM d')} -{' '}
                {format(new Date(unitPlan.endDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <BlankTemplateQuickActions
              schoolInfo={{
                grade: unitPlan?.longRangePlan ? `Grade ${unitPlan.longRangePlan.grade}` : '',
                subject: unitPlan?.longRangePlan?.subject ?? '',
                academicYear: unitPlan?.longRangePlan?.academicYear ?? '',
              }}
              templateType="lesson"
            />
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={onCreateFromTemplate}
            >
              <BookTemplate className="h-4 w-4" />
              Create from Template
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="create-lesson-plan-button"
              onClick={onCreateLesson}
            >
              Create Lesson Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson Plans List */}
      {isLoadingLessons ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : lessonPlans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No lesson plans yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start by creating your first lesson plan for this unit
          </p>
          <div className="mt-6">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-testid="create-lesson-plan-empty-state-button"
              onClick={onCreateLesson}
            >
              Create Lesson Plan
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lessonPlans.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <span className="block sm:hidden">
                      {format(new Date(lesson.date), 'MMM d')}
                    </span>
                    <span className="hidden sm:block">
                      {format(new Date(lesson.date), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
                    <Link
                      className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-900 block"
                      to={`/planner/lessons/${lesson.id}`}
                    >
                      {lesson.title}
                    </Link>
                    {lesson.isSubFriendly && (
                      <Badge className="mt-1 text-xs" variant="secondary">
                        Sub
                      </Badge>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {lesson.duration} min
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    {lesson.assessmentType && (
                      <Badge className="text-xs" variant="outline">
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
                        size="sm"
                        variant="ghost"
                        onClick={() => {
 onEditLesson(lesson); 
}}
                      >
                        Edit
                      </Button>
                      <Button
                        className="text-red-600 hover:text-red-700"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
 onDeleteLesson(lesson.id); 
}}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}