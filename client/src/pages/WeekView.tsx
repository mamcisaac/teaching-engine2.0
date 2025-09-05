import { format, startOfWeek, endOfWeek, addDays, isToday, addWeeks, subWeeks } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/card';
import { useETFOLessonPlans, type ETFOLessonPlan } from '../hooks/useETFOPlanning';
import { generateLessonPlanHTML, printHTML, downloadHTML } from '../utils/printUtils';

interface DayColumnProps {
  date: Date;
  lessons: ETFOLessonPlan[];
  onViewLesson: (lesson: ETFOLessonPlan) => void;
  onAddLesson: (date: Date) => void;
}

function DayColumn({ date, lessons, onViewLesson, onAddLesson }: DayColumnProps): React.ReactElement {
  const isCurrentDay = isToday(date);
  const dayName = format(date, 'EEEE');
  const dateStr = format(date, 'MMM d');
  
  return (
    <div className={`min-h-[400px] ${isCurrentDay ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      <div className={`p-3 border-b ${isCurrentDay ? 'bg-blue-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-sm">{dayName}</p>
            <p className="text-xs text-gray-600">{dateStr}</p>
            {isCurrentDay && (
              <Badge variant="default" className="text-xs mt-1">Today</Badge>
            )}
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onAddLesson(date)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        {lessons.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4">
            No lessons scheduled
          </p>
        ) : (
          lessons.map((lesson) => (
            <Card 
              key={lesson.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewLesson(lesson)}
            >
              <CardContent className="p-3">
                <p className="font-medium text-sm line-clamp-2">{lesson.title}</p>
                {lesson.unitPlan && (
                  <p className="text-xs text-gray-500 mt-1">
                    {lesson.unitPlan.title}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration} min
                  </span>
                  {lesson.isSubFriendly && (
                    <Badge variant="secondary" className="text-xs py-0">
                      Sub
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function WeekView(): React.ReactElement {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  // Fetch lessons for the current week
  const { data: lessons = [], isLoading } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
  });
  
  // Group lessons by date
  const lessonsByDate = lessons.reduce((acc, lesson) => {
    const dateKey = format(new Date(lesson.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lesson);
    return acc;
  }, {} as Record<string, ETFOLessonPlan[]>);
  
  const handleViewLesson = (lesson: ETFOLessonPlan): void => {
    if (lesson.unitPlanId) {
      navigate(`/planner/units/${lesson.unitPlanId}/lessons?lessonId=${lesson.id}`);
    }
  };
  
  const handleAddLesson = (date: Date): void => {
    navigate(`/planner/quick-lesson?date=${format(date, 'yyyy-MM-dd')}`);
  };
  
  const handlePrintWeek = (): void => {
    const weekHTML = `
      <h1>Week of ${format(weekStart, 'MMMM d, yyyy')}</h1>
      ${[0, 1, 2, 3, 4].map(dayOffset => {
        const date = addDays(weekStart, dayOffset);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayLessons = lessonsByDate[dateKey] || [];
        
        return `
          <div style="page-break-inside: avoid; margin-top: 20px;">
            <h2>${format(date, 'EEEE, MMMM d')}</h2>
            ${dayLessons.length === 0 ? 
              '<p style="color: gray;">No lessons scheduled</p>' :
              dayLessons.map(lesson => `
                <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                  <h3>${lesson.title}</h3>
                  <p><strong>Duration:</strong> ${lesson.duration} minutes</p>
                  ${lesson.learningGoals ? `<p><strong>Goals:</strong> ${lesson.learningGoals}</p>` : ''}
                  ${lesson.materials && lesson.materials.length > 0 ? 
                    `<p><strong>Materials:</strong> ${lesson.materials.join(', ')}</p>` : ''}
                </div>
              `).join('')
            }
          </div>
        `;
      }).join('')}
    `;
    
    printHTML(weekHTML, `week-${format(weekStart, 'yyyy-MM-dd')}`);
  };
  
  const handleExportWeek = (): void => {
    const weekHTML = lessons.map(lesson => {
      const lessonForPrint = {
        title: lesson.title,
        date: new Date(lesson.date),
        duration: lesson.duration,
        learningGoals: lesson.learningGoals,
        mindsOn: lesson.mindsOn,
        action: lesson.action,
        consolidation: lesson.consolidation,
        materials: lesson.materials,
        assessmentNotes: lesson.assessmentNotes,
      };
      return generateLessonPlanHTML(lessonForPrint, lesson.unitPlan);
    }).join('<div style="page-break-after: always;"></div>');
    
    downloadHTML(weekHTML, `week-${format(weekStart, 'yyyy-MM-dd')}-lessons`);
  };
  
  const navigateWeek = (direction: 'prev' | 'next'): void => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1));
  };
  
  const totalLessons = lessons.length;
  const totalTeachingTime = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Week at a Glance</h1>
              <p className="text-gray-600">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWeek('next')}
              className="px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Week Stats */}
        <div className="flex gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {Math.round(totalTeachingTime / 60)} hours total
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={handlePrintWeek}>
          <Printer className="h-4 w-4 mr-2" />
          Print Week
        </Button>
        <Button variant="outline" onClick={handleExportWeek}>
          <Download className="h-4 w-4 mr-2" />
          Export Lessons
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/planner/calendar')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Calendar View
        </Button>
      </div>
      
      {/* Week Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-5 divide-x">
            {[0, 1, 2, 3, 4].map((dayOffset) => {
              const date = addDays(weekStart, dayOffset);
              const dateKey = format(date, 'yyyy-MM-dd');
              const dayLessons = lessonsByDate[dateKey] || [];
              
              return (
                <DayColumn
                  key={dateKey}
                  date={date}
                  lessons={dayLessons}
                  onViewLesson={handleViewLesson}
                  onAddLesson={handleAddLesson}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Weekend Note */}
      <Alert className="mt-6">
        <AlertDescription>
          Weekend planning: Use the calendar view to schedule lessons for Saturday or Sunday if needed.
        </AlertDescription>
      </Alert>
    </div>
  );
}