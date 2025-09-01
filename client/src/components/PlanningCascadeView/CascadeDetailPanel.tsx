import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Calendar,
  Clock,
  Target,
  Users,
  FileText,
  Edit,
  Eye,
  Plus,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { 
  CascadeSelection, 
  CurriculumData, 
  LRPData, 
  UnitData, 
  LessonData, 
  DaybookData 
} from './types';

interface CascadeDetailPanelProps {
  selection: CascadeSelection;
}

export function CascadeDetailPanel({ selection }: CascadeDetailPanelProps): JSX.Element {
  const navigate = useNavigate();

  const renderCurriculumDetail = (data: CurriculumData) => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{data.code}</h2>
        <p className="text-gray-600">{data.description}</p>
        {data.descriptionFr && (
          <p className="text-gray-500 italic mt-2">{data.descriptionFr}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subject</span>
              <Badge>{data.subject}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Strand</span>
              <span className="font-medium">{data.strand}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Grade</span>
              <span className="font-medium">Grade {data.grade}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.coverage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coverage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Lesson Plans:</span>
                <span className="font-medium">{data.coverage.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Plans:</span>
                <span className="font-medium">{data.coverage.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium">{data.coverage.completedLessons}/{data.coverage.totalLessons}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLRPDetail = (data: LRPData) => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
            {data.titleFr && <p className="text-gray-500 italic">{data.titleFr}</p>}
            {data.description && <p className="text-gray-600 mt-2">{data.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/long-range/${data.id}/units`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Units
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/long-range/${data.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Academic Year:</span>
              <span className="ml-2 font-medium">{data.academicYear}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Subject:</span>
              <Badge className="ml-2">{data.subject}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.goals && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.goals}</p>
          </CardContent>
        </Card>
      )}

      {data.themes && data.themes.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.themes.map((theme: string, index: number) => (
                <Badge key={index} variant="secondary">{theme}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.progress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Units:</span>
                <span className="font-medium">{data.progress.totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Lessons:</span>
                <span className="font-medium">{data.progress.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Lessons:</span>
                <span className="font-medium text-green-600">
                  {data.progress.completedLessons}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderUnitDetail = (data: UnitData) => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
            {data.titleFr && <p className="text-gray-500 italic">{data.titleFr}</p>}
            {data.description && <p className="text-gray-600 mt-2">{data.description}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/units/${data.id}/lessons`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Lessons
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/units/${data.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/planner/units/${data.id}/lessons/new`)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Lesson
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Start:</span>
              <span className="ml-2 font-medium">
                {data.startDate ? format(new Date(data.startDate), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">End:</span>
              <span className="ml-2 font-medium">
                {data.endDate ? format(new Date(data.endDate), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Hours:</span>
              <span className="ml-2 font-medium">{data.estimatedHours || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.bigIdeas && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Big Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.bigIdeas}</p>
          </CardContent>
        </Card>
      )}

      {data.essentialQuestions && data.essentialQuestions.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Essential Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {data.essentialQuestions.map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.progress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Lessons:</span>
                <span className="font-medium">{data.progress.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium text-green-600">
                  {data.progress.completedLessons}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderLessonDetail = (data: LessonData) => (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
            {data.titleFr && <p className="text-gray-500 italic">{data.titleFr}</p>}
            {!!data.daybookEntry && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/lessons/${data.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/planner/lessons/${data.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {!data.daybookEntry && (
              <Button
                size="sm"
                onClick={() => navigate(`/planner/daybook?lessonId=${data.id}`)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Add to Daybook
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Date:</span>
              <span className="ml-2 font-medium">
                {data.date ? format(new Date(String(data.date)), 'EEEE, MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{data.duration} minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {!!data.learningGoals && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Learning Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{String(data.learningGoals || '')}</p>
          </CardContent>
        </Card>
      )}

      {!!data.mindsOn && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Minds On</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{String(data.mindsOn || '')}</p>
          </CardContent>
        </Card>
      )}

      {!!data.action && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{String(data.action || '')}</p>
          </CardContent>
        </Card>
      )}

      {!!data.consolidation && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Consolidation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{String(data.consolidation || '')}</p>
          </CardContent>
        </Card>
      )}

      {!!data.daybookEntry && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Daybook Entry</CardTitle>
          </CardHeader>
          <CardContent>
            {(data.daybookEntry as any).whatWorked && (
              <div className="mb-3">
                <h4 className="font-medium text-green-700">What Worked:</h4>
                <p className="text-gray-700">{String((data.daybookEntry as any).whatWorked)}</p>
              </div>
            )}
            {(data.daybookEntry as any).whatDidntWork && (
              <div className="mb-3">
                <h4 className="font-medium text-orange-700">What Didn't Work:</h4>
                <p className="text-gray-700">{String((data.daybookEntry as any).whatDidntWork)}</p>
              </div>
            )}
            {(data.daybookEntry as any).nextSteps && (
              <div className="mb-3">
                <h4 className="font-medium text-blue-700">Next Steps:</h4>
                <p className="text-gray-700">{String((data.daybookEntry as any).nextSteps)}</p>
              </div>
            )}
            {(data.daybookEntry as any).overallRating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={star <= (data.daybookEntry as any).overallRating ? 'text-yellow-500' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  switch (selection.type) {
    case 'curriculum':
      return renderCurriculumDetail(selection.data as CurriculumData);
    case 'lrp':
      return renderLRPDetail(selection.data as LRPData);
    case 'unit':
      return renderUnitDetail(selection.data as UnitData);
    case 'lesson':
      return renderLessonDetail(selection.data as LessonData);
    default:
      return <div className="p-6">Select an item to view details</div>;
  }
}