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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import type { 
  CascadeSelection, 
  CascadeData,
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

  const renderDaybookDetail = (data: DaybookData) => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Daybook Entry</h2>
        {data.date && (
          <p className="text-gray-600">
            <Calendar className="inline h-4 w-4 mr-1" />
            {format(new Date(data.date), 'MMMM d, yyyy')}
          </p>
        )}
      </div>

      {data.whatWorked && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              What Worked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{data.whatWorked}</p>
          </CardContent>
        </Card>
      )}

      {data.whatDidntWork && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{data.whatDidntWork}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-2">
        <Button
          onClick={() => navigate(`/daybook/${data.id}/edit`)}
          size="sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit Entry
        </Button>
        <Button
          onClick={() => navigate(`/daybook/${data.id}`)}
          variant="outline"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Full Entry
        </Button>
      </div>
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

  // Type guards with unique field checks for each type
  const isCurriculumData = (data: CascadeData): data is CurriculumData => {
    // Curriculum has code, strand, or subject as unique identifiers
    return typeof data === 'object' && data !== null && 'id' in data &&
           ('code' in data || 'strand' in data || 'coverage' in data || 
            ('subject' in data && 'description' in data));
  };
  
  const isLRPData = (data: CascadeData): data is LRPData => {
    // LRP has academicYear or goals as unique fields
    return typeof data === 'object' && data !== null && 'id' in data &&
           ('academicYear' in data || 'goals' in data || 'themes' in data);
  };
  
  const isUnitData = (data: CascadeData): data is UnitData => {
    // Unit has hoursAllocated, weeks, or bigIdeas as unique fields
    return typeof data === 'object' && data !== null && 'id' in data &&
           ('hoursAllocated' in data || 'weeks' in data || 'bigIdeas' in data || 
            'essentialQuestions' in data || 'estimatedHours' in data);
  };
  
  const isLessonData = (data: CascadeData): data is LessonData => {
    // Lesson has duration or isComplete as unique fields
    return typeof data === 'object' && data !== null && 'id' in data &&
           ('duration' in data || 'isComplete' in data || 
            ('title' in data && !('hoursAllocated' in data) && !('academicYear' in data) && 
             !('weeks' in data) && !('bigIdeas' in data) && !('themes' in data)));
  };
  
  const isDaybookData = (data: CascadeData): data is DaybookData => {
    // Daybook must have date field
    return typeof data === 'object' && data !== null && 'id' in data &&
           'date' in data && typeof data.date === 'string';
  };

  // Flexible rendering that handles partial data gracefully
  try {
    switch (selection.type) {
      case 'curriculum':
        // Render with whatever data we have
        return renderCurriculumDetail({
          ...selection.data,
          id: selection.data?.id || selection.id,
          name: selection.data?.name || selection.data?.title || 'Curriculum Item'
        } as CurriculumData);
      
      case 'lrp':
        // Render with flexible data structure
        return renderLRPDetail({
          ...selection.data,
          id: selection.data?.id || selection.id,
          name: selection.data?.name || selection.data?.title || selection.data?.titleFr || 'Long Range Plan'
        } as LRPData);
      
      case 'unit':
        // Handle unit data flexibly
        return renderUnitDetail({
          ...selection.data,
          id: selection.data?.id || selection.id,
          name: selection.data?.name || selection.data?.title || selection.data?.titleFr || 'Unit Plan'
        } as UnitData);
      
      case 'lesson':
        // Handle lesson data flexibly
        return renderLessonDetail({
          ...selection.data,
          id: selection.data?.id || selection.id,
          title: selection.data?.title || selection.data?.name || 'Lesson'
        } as LessonData);
      
      case 'daybook':
        // Handle daybook data flexibly
        return renderDaybookDetail({
          ...selection.data,
          id: selection.data?.id || selection.id,
          date: selection.data?.date || new Date().toISOString()
        } as DaybookData);
      
      default:
        return <div className="p-6">Select an item to view details</div>;
    }
  } catch (error) {
    console.error('Error rendering detail panel:', error);
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading details</div>
        <p className="text-sm text-gray-600 mt-2">Please try selecting the item again</p>
      </div>
    );
  }
}