import { format, isToday, startOfDay, endOfDay } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  FileText, 
  Printer, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Package
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/Progress';
import { Textarea } from '../components/ui/Textarea';
import { useETFOLessonPlans, useDaybookEntries, useCreateDaybookEntry, type ETFOLessonPlan } from '../hooks/useETFOPlanning';
import { useLessonCompletions } from '../hooks/useLessonCompletions';
import { LessonCompletionCheckbox } from '../components/lesson-completion/LessonCompletionCheckbox';
import { LessonCompletionErrorBoundary } from '../components/lesson-completion/LessonCompletionErrorBoundary';
import { generateLessonPlanHTML, printHTML } from '../utils/printUtils';

interface LessonCardProps {
  lesson: ETFOLessonPlan;
  onViewDetails: () => void;
  isCompleted: boolean;
  onToggleCompletion: (lessonId: string) => void;
  isToggling: boolean;
}

function LessonCard({ lesson, onViewDetails, isCompleted, onToggleCompletion, isToggling }: LessonCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  
  const handlePrint = (): void => {
    const lessonForPrint = {
      title: lesson.title,
      date: new Date(lesson.date),
      duration: lesson.duration,
      learningGoals: lesson.learningGoals,
      mindsOn: lesson.mindsOn,
      action: lesson.action,
      consolidation: lesson.consolidation,
      materials: lesson.materials,
      grouping: lesson.grouping,
      accommodations: lesson.accommodations,
      assessmentNotes: lesson.assessmentNotes,
      isSubFriendly: lesson.isSubFriendly,
      subNotes: lesson.subNotes,
    };
    
    printHTML(
      generateLessonPlanHTML(lessonForPrint, lesson.unitPlan),
      `${lesson.title}-lesson-plan`
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid="lesson-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              {lesson.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {lesson.unitPlan?.title && (
                <span className="text-sm">{lesson.unitPlan.title}</span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center">
            <LessonCompletionErrorBoundary>
              <LessonCompletionCheckbox
                lessonId={lesson.id}
                isCompleted={isCompleted}
                onToggle={onToggleCompletion}
                isLoading={isToggling}
                aria-label={`Mark ${lesson.title} as complete`}
              />
            </LessonCompletionErrorBoundary>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {lesson.duration} min
          </span>
          {lesson.grouping && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {lesson.grouping}
            </span>
          )}
          {lesson.isSubFriendly && (
            <Badge variant="secondary" className="text-xs">
              Sub-Friendly
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Learning Goals */}
          {lesson.learningGoals && (
            <div>
              <h4 className="font-medium text-sm mb-1">Learning Goals</h4>
              <p className="text-sm text-gray-600">{lesson.learningGoals}</p>
            </div>
          )}
          
          {/* Three-Part Lesson */}
          <div className="space-y-3">
            {lesson.mindsOn && (
              <div>
                <h4 className="font-medium text-sm mb-1">Minds On</h4>
                <p className="text-sm text-gray-600">{lesson.mindsOn}</p>
              </div>
            )}
            {lesson.action && (
              <div>
                <h4 className="font-medium text-sm mb-1">Action</h4>
                <p className="text-sm text-gray-600">{lesson.action}</p>
              </div>
            )}
            {lesson.consolidation && (
              <div>
                <h4 className="font-medium text-sm mb-1">Consolidation</h4>
                <p className="text-sm text-gray-600">{lesson.consolidation}</p>
              </div>
            )}
          </div>
          
          {/* Materials */}
          {lesson.materials && lesson.materials.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Materials Needed
              </h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {lesson.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Sub Notes */}
          {lesson.isSubFriendly && lesson.subNotes && (
            <div className="bg-yellow-50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-1">Supply Teacher Notes</h4>
              <p className="text-sm text-gray-700">{lesson.subNotes}</p>
            </div>
          )}
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onViewDetails}
          >
            View Full Details
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function TodayView(): React.ReactElement {
  const navigate = useNavigate();
  const today = new Date();
  const [quickNotes, setQuickNotes] = useState('');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [teachingMode, setTeachingMode] = useState(false);
  
  // Fetch today's lessons
  const { data: lessons = [], isLoading: lessonsLoading } = useETFOLessonPlans({
    startDate: startOfDay(today).toISOString(),
    endDate: endOfDay(today).toISOString(),
  });
  
  // Fetch today's daybook entry
  const { data: daybookEntries = [] } = useDaybookEntries({
    startDate: startOfDay(today).toISOString(),
    endDate: endOfDay(today).toISOString(),
  });
  
  const todayEntry = daybookEntries.length > 0 ? daybookEntries[0] : null;
  const currentLesson = lessons[currentLessonIndex];
  
  // Lesson completion tracking
  const lessonIds = lessons.map(l => l.id);
  const {
    isCompleted,
    toggleCompletion,
    isToggling,
    progress
  } = useLessonCompletions(lessonIds);
  
  // Create daybook entry mutation
  const createDaybookMutation = useCreateDaybookEntry();
  
  const handleSaveNotes = async (): Promise<void> => {
    try {
      await createDaybookMutation.mutateAsync({
        date: format(today, 'yyyy-MM-dd'),
        notes: quickNotes,
        lessonPlanId: lessons.length > 0 ? lessons[0].id : undefined,
      });
      toast.success('Notes saved successfully');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };
  
  const handleViewLesson = (lesson: ETFOLessonPlan): void => {
    if (lesson.unitPlanId) {
      navigate(`/planner/units/${lesson.unitPlanId}/lessons?lessonId=${lesson.id}`);
    }
  };
  
  const totalTeachingTime = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  const subjects = [...new Set(lessons.map(l => l.unitPlan?.longRangePlan?.subject).filter(Boolean))];
  
  if (lessonsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  // Teaching mode full screen view
  if (teachingMode && currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Teaching Mode Header */}
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-green-600 text-white px-3 py-1 text-lg">
              TEACHING MODE
            </Badge>
            <Button 
              variant="outline"
              onClick={() => setTeachingMode(false)}
            >
              Exit Teaching Mode
            </Button>
          </div>
          
          {/* Current Lesson Display */}
          <Card className="shadow-2xl border-2 border-green-500 mb-6">
            <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 pb-6">
              <CardTitle className="text-3xl">{currentLesson.titleFr || currentLesson.title}</CardTitle>
              <CardDescription className="text-lg mt-2">{currentLesson.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Three Part Lesson in Teaching Mode */}
              <div className="space-y-6">
                <Card className="bg-yellow-50 border-yellow-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-yellow-900">🧠 Minds On (15 min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentLesson.mindsOnFr || currentLesson.mindsOn}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">🎯 Action (35 min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentLesson.actionFr || currentLesson.action}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-green-300">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-900">✨ Consolidation (10 min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{currentLesson.consolidationFr || currentLesson.consolidation}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-6">
                <Button 
                  variant="outline"
                  disabled={currentLessonIndex === 0}
                  onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                >
                  Previous Lesson
                </Button>
                <span className="text-lg font-medium">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </span>
                <Button 
                  variant="outline"
                  disabled={currentLessonIndex === lessons.length - 1}
                  onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                >
                  Next Lesson
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Today's Teaching Plan
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setTeachingMode(true)}
              disabled={lessons.length === 0}
            >
              📺 Teaching Mode
            </Button>
            <div className="text-right">
              <p className="text-lg font-medium">{format(today, 'EEEE, MMMM d, yyyy')}</p>
              <p className="text-sm text-gray-600">{format(today, 'h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Lessons Today</CardDescription>
            <CardTitle className="text-2xl">{lessons.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Teaching Time</CardDescription>
            <CardTitle className="text-2xl">{Math.round(totalTeachingTime / 60)} hrs</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle 
              className="text-2xl" 
              data-testid="progress-indicator"
            >
              {progress.completed} of {progress.total} lessons complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress 
              value={progress.percentage} 
              data-testid="progress-bar"
              aria-valuenow={progress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Lesson completion progress: ${progress.completed} of ${progress.total} lessons complete`}
              className="w-full"
            />
            {progress.completed === progress.total && progress.total > 0 && (
              <div 
                data-testid="all-complete-message" 
                className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-green-800 font-medium">Great job! All lessons complete!</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Subjects</CardDescription>
            <CardTitle className="text-lg">{subjects.join(', ') || 'None'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Preparation</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {lessons.every(l => l.materials && l.materials.length > 0) ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Ready
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Check Materials
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-3">Today's Lessons</h2>
          
          {lessons.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No lessons scheduled for today. 
                <Button 
                  variant="ghost" 
                  className="px-2 text-blue-600 hover:text-blue-700 underline"
                  onClick={() => navigate('/planner/quick-lesson')}
                >
                  Create a quick lesson
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <LessonCard 
                  key={lesson.id} 
                  lesson={lesson}
                  onViewDetails={() => handleViewLesson(lesson)}
                  isCompleted={isCompleted(lesson.id)}
                  onToggleCompletion={toggleCompletion}
                  isToggling={isToggling}
                />
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={() => navigate('/planner/daybook')}>
              <FileText className="h-4 w-4 mr-2" />
              Open Daybook
            </Button>
            <Button variant="outline" onClick={() => navigate('/planner/week')}>
              View Week
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const allLessonsHTML = lessons.map(lesson => {
                  const lessonForPrint = {
                    title: lesson.title,
                    date: new Date(lesson.date),
                    duration: lesson.duration,
                    learningGoals: lesson.learningGoals,
                    mindsOn: lesson.mindsOn,
                    action: lesson.action,
                    consolidation: lesson.consolidation,
                    materials: lesson.materials,
                    accommodations: lesson.accommodations,
                    assessmentNotes: lesson.assessmentNotes,
                  };
                  return generateLessonPlanHTML(lessonForPrint, lesson.unitPlan);
                }).join('<div style="page-break-after: always;"></div>');
                
                printHTML(allLessonsHTML, 'todays-lessons');
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Notes for Today</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Reminders, observations, things to remember..."
                value={quickNotes || todayEntry?.notes || ''}
                onChange={(e) => setQuickNotes(e.target.value)}
                className="min-h-[100px]"
              />
              <Button 
                className="w-full mt-3" 
                size="sm"
                onClick={handleSaveNotes}
                disabled={createDaybookMutation.isPending}
              >
                Save Notes
              </Button>
            </CardContent>
          </Card>
          
          {/* Materials Checklist */}
          {lessons.some(l => l.materials && l.materials.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Materials Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.flatMap(lesson => 
                    (lesson.materials || []).map((material, idx) => (
                      <label key={`${lesson.id}-${idx}`} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>{material}</span>
                      </label>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Tomorrow Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tomorrow's Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Prepare for tomorrow's lessons
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  navigate(`/planner/day/${format(tomorrow, 'yyyy-MM-dd')}`);
                }}
              >
                View Tomorrow
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}