import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Target,
  Users,
  Package,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  Eye,
  GripVertical,
  ClipboardCheck
} from 'lucide-react';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CoverageWidget } from '../components/CoverageWidget';
import { SubjectDashboard } from '../components/SubjectDashboard';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { STORAGE_KEYS } from '../constants/subjects';
import { useAuth } from '../contexts/AuthContext';
import { useETFOLessonPlans, useUnitPlans, useLongRangePlans, useCurriculumExpectations } from '../hooks/useETFOPlanning';
import { safeJsonParse } from '../utils/typeGuards';

export function TeachingDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  // Get today&apos;s lessons
  const { data: todayLessons = [] } = useETFOLessonPlans({
    startDate: startOfDay(today).toISOString(),
    endDate: endOfDay(today).toISOString(),
  });
  
  // Get tomorrow&apos;s lessons for preview
  const { data: tomorrowLessons = [] } = useETFOLessonPlans({
    startDate: startOfDay(tomorrow).toISOString(),
    endDate: endOfDay(tomorrow).toISOString(),
  });
  
  // Get all unit plans to show current units
  const { data: allUnits = [] } = useUnitPlans({});
  
  // Get long range plans for overview
  const { data: _longRangePlans = [] } = useLongRangePlans();
  
  // Get all lesson plans and curriculum expectations to calculate coverage
  const { data: allLessonPlans = [] } = useETFOLessonPlans();
  const { data: allExpectations = [] } = useCurriculumExpectations({
    grade: 1
  });
  
  // Filter for currently active units
  const activeUnits = useMemo(() => {
    const now = new Date();
    return allUnits.filter(unit => {
      const start = new Date(unit.startDate);
      const end = new Date(unit.endDate);
      return start <= now && end >= now;
    });
  }, [allUnits]);
  
  // Get teacher&apos;s selected subjects
  const _teacherSubjects = useMemo(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
    return safeJsonParse<string[]>(stored, []);
  }, []);
  
  // Calculate what's next
  const currentTime = new Date();
  const nextLesson = todayLessons.find(lesson => {
    const lessonTime = new Date(lesson.date);
    return lessonTime > currentTime;
  });
  
  const completedToday = 2; // This would come from completion tracking
  const totalToday = todayLessons.length;
  
  // Calculate curriculum coverage
  const { coveredCount, totalCount, percentage } = useMemo(() => {
    // Filter expectations based on teacher's selected subjects
    const teacherFilteredExpectations = _teacherSubjects.length > 0 
      ? allExpectations.filter(exp => _teacherSubjects.includes(exp.subject))
      : allExpectations;
    
    // Calculate which expectations are covered
    const coveredIds = new Set<string>();
    allLessonPlans.forEach((lesson: any) => {
      lesson.expectations?.forEach((exp: any) => {
        const id = exp.expectation?.id;
        if (id) {
          coveredIds.add(id);
        }
      });
    });
    allUnits.forEach((unit: any) => {
      unit.expectations?.forEach((exp: any) => {
        const id = exp.expectation?.id;
        if (id) {
          coveredIds.add(id);
        }
      });
    });
    
    const covered = teacherFilteredExpectations.filter(exp => coveredIds.has(exp.id)).length;
    const total = teacherFilteredExpectations.length;
    const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
    
    return { coveredCount: covered, totalCount: total, percentage: pct };
  }, [allExpectations, allLessonPlans, allUnits, _teacherSubjects]);
  
  // Navigate functions
  const handleViewToday = (): void => {
    navigate('/today');
  };
  
  const handleViewWeek = (): void => {
    navigate('/planner/week');
  };
  
  const handleViewUnit = (unitId: string): void => {
    navigate(`/planner/units/${unitId}/lessons`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Hero Section - What Am I Teaching Right Now? */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bonjour, {user?.name.split(' ')[0] || 'Teacher'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {format(today, 'EEEE, MMMM d, yyyy')} • Week {format(today, 'w')} of the School Year
          </p>
        </div>
        
        {/* Current/Next Lesson - PRIMARY FOCUS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Current Lesson Card */}
          <div className="lg:col-span-2">
            {nextLesson ? (
              <Card className="border-2 border-green-500 shadow-lg bg-gradient-to-r from-green-50 to-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-6 w-6 text-green-600" />
                      <CardTitle className="text-2xl">Teaching Next</CardTitle>
                    </div>
                    <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                      READY
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {nextLesson.titleFr || nextLesson.title}
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    {nextLesson.title}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{nextLesson.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{nextLesson.unitPlan?.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{nextLesson.grouping || 'Whole class'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">Learning Goals Ready</span>
                    </div>
                  </div>
                  
                  {/* Quick Lesson Overview */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Overview:</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Minds On:</span> {nextLesson.mindsOnFr || nextLesson.mindsOn}
                      </div>
                      <div>
                        <span className="font-medium">Main Activity:</span> {nextLesson.actionFr || nextLesson.action}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="lg" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate(`/planner/lessons/${nextLesson.id}`)}
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Full Lesson Plan
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => window.print()}
                    >
                      Print for Today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-500 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    All Done for Today!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 mb-4">
                    Great work! You&apos;ve completed all your lessons for today.
                  </p>
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Tomorrow you have <strong>{tomorrowLessons.length} lessons</strong> planned.
                      Take a moment to review them now.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => navigate(`/planner/day/${format(tomorrow, 'yyyy-MM-dd')}`)}
                  >
                    Preview Tomorrow&apos;s Lessons
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Today's Progress Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Today&apos;s Progress
                  <Badge variant={completedToday === totalToday ? "default" : "secondary"}>
                    {completedToday}/{totalToday}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
                    />
                  </div>
                  
                  {/* Today's Schedule */}
                  <div className="space-y-2">
                    {todayLessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        className={`flex items-center gap-2 text-sm ${idx < completedToday ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                      >
                        {idx < completedToday ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="flex-1 truncate">{lesson.titleFr || lesson.title}</span>
                        <span className="text-xs text-gray-500">{lesson.duration}m</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleViewToday}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Day
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Materials Needed */}
            {nextLesson?.materials && nextLesson.materials.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Materials Needed Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {nextLesson.materials.slice(0, 5).map((material, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <div className="h-2 w-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                  {nextLesson.materials.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{nextLesson.materials.length - 5} more items
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Curriculum Coverage Widget - Third Column */}
          <div>
            <CoverageWidget />
          </div>
        </div>
        
        {/* Subject Dashboard Section */}
        <div className="mb-8">
          <SubjectDashboard />
        </div>
        
        {/* Active Units Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Currently Teaching
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeUnits.map((unit) => (
              <Card 
                key={unit.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewUnit(unit.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {unit.titleFr || unit.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {unit.longRangePlan?.subject}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {unit.estimatedHours}h
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {format(new Date(unit.startDate), 'MMM d')} - {format(new Date(unit.endDate), 'MMM d')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Quick Actions - Teaching Focused */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-blue-50"
            onClick={handleViewToday}
          >
            <Calendar className="h-8 w-8 mb-2 text-blue-600" />
            <span className="text-sm font-medium">Today&apos;s Teaching</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-green-50"
            onClick={handleViewWeek}
          >
            <Eye className="h-8 w-8 mb-2 text-green-600" />
            <span className="text-sm font-medium">Week Overview</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-indigo-50 border-indigo-300"
            onClick={() => navigate('/planner/schedule-editor')}
          >
            <GripVertical className="h-8 w-8 mb-2 text-indigo-600" />
            <span className="text-sm font-medium">Edit Schedule</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-emerald-50 border-emerald-300"
            onClick={() => navigate('/assessment')}
          >
            <ClipboardCheck className="h-8 w-8 mb-2 text-emerald-600" />
            <span className="text-sm font-medium">Assess Students</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-purple-50"
            onClick={() => navigate('/planner/daybook')}
          >
            <FileText className="h-8 w-8 mb-2 text-purple-600" />
            <span className="text-sm font-medium">Teaching Notes</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto flex flex-col items-center py-4 hover:bg-orange-50"
            onClick={() => navigate('/planner/units')}
          >
            <BookOpen className="h-8 w-8 mb-2 text-orange-600" />
            <span className="text-sm font-medium">All Unit Plans</span>
          </Button>
        </div>
        
        {/* Year Overview - Subtle */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Your 2025-2026 Teaching Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">6</p>
                <p className="text-sm text-gray-600">Subjects</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">50</p>
                <p className="text-sm text-gray-600">Unit Plans</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">731</p>
                <p className="text-sm text-gray-600">Teaching Hours</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{percentage}%</p>
                <p className="text-sm text-gray-600">Curriculum Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}