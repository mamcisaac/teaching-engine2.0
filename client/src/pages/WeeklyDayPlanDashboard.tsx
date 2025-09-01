import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks, getHours, getMinutes } from 'date-fns';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragOverEvent,
  Active,
  Over
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus,
  Home,
  ChevronDown,
  Sparkles,
  RotateCcw,
  Save,
  CalendarDays,
  Target,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useETFOLessonPlans, useUpdateETFOLessonPlan } from '../hooks/useETFOPlanning';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

// Import sub-components
import { LessonCard } from '../components/weekly-plan/LessonCard';
import { TimeBlock } from '../components/weekly-plan/TimeBlock';
import { QuickAddPopover } from '../components/weekly-plan/QuickAddPopover';
import { CurrentTimeIndicator } from '../components/weekly-plan/CurrentTimeIndicator';

// Types
interface TimeSlot {
  id: string;
  time: string;
  label: string;
  subject: string;
  duration: number;
}

interface DaySchedule {
  date: Date;
  dateStr: string;
  lessons: any[];
}

interface DragItem {
  id: string;
  lessonId: string;
  currentDay: string;
  currentTime: string;
}

// Time blocks configuration
const TIME_BLOCKS: TimeSlot[] = [
  { id: 'block-1', time: '08:45', label: 'Block 1 - Français', subject: 'Français (Immersion)', duration: 45 },
  { id: 'block-2', time: '09:30', label: 'Block 2 - Mathématiques', subject: 'Mathématiques', duration: 45 },
  { id: 'block-3', time: '10:30', label: 'Block 3 - Sciences', subject: 'Sciences de la nature', duration: 45 },
  { id: 'block-4', time: '11:15', label: 'Block 4 - Arts', subject: 'Arts visuels', duration: 45 },
  { id: 'block-5', time: '13:00', label: 'Block 5 - Social/Health', subject: 'rotating', duration: 45 }
];

// Subject colors
const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences de la nature': 'bg-purple-100 text-purple-800 border-purple-300',
  'Arts visuels': 'bg-orange-100 text-orange-800 border-orange-300',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800 border-pink-300'
};

export function WeeklyDayPlanDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date()); // For mobile view
  const [activeId, setActiveId] = useState<string | null>(null);
  const [quickAddSlot, setQuickAddSlot] = useState<{ day: string; time: string; subject: string } | null>(null);
  const [highlightToday, setHighlightToday] = useState(true);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 4); // Friday
  
  // Fetch lessons for the entire week
  const { data: weekLessons = [], isLoading, refetch } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString()
  });
  
  const updateLesson = useUpdateETFOLessonPlan();
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Organize lessons by day and time
  const weekSchedule = useMemo(() => {
    const schedule: DaySchedule[] = [];
    
    for (let i = 0; i < 5; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLessons = weekLessons.filter(lesson => 
        isSameDay(new Date(lesson.date), date)
      );
      
      schedule.push({
        date,
        dateStr,
        lessons: dayLessons
      });
    }
    
    return schedule;
  }, [weekStart, weekLessons]);
  
  // Current time position for indicator
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const totalMinutes = hours * 60 + minutes;
      const schoolStartMinutes = 8 * 60 + 45; // 8:45 AM
      const schoolEndMinutes = 15 * 60; // 3:00 PM
      
      if (totalMinutes >= schoolStartMinutes && totalMinutes <= schoolEndMinutes) {
        const schoolDayMinutes = schoolEndMinutes - schoolStartMinutes;
        const elapsedMinutes = totalMinutes - schoolStartMinutes;
        const position = (elapsedMinutes / schoolDayMinutes) * 100;
        setCurrentTimePosition(position);
      } else {
        setCurrentTimePosition(-1); // Outside school hours
      }
    };
    
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleToday = () => {
    setCurrentWeek(new Date());
    setHighlightToday(true);
    // Smooth scroll to today's column
    const todayElement = document.getElementById('day-column-today');
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }
    
    // Parse the drop target ID to get day and time
    const [targetDay, targetTime] = (over.id as string).split('-slot-');
    const lesson = weekLessons.find(l => l.id === active.id);
    
    if (lesson && targetDay && targetTime) {
      // Save current state for undo
      setUndoStack(prev => [...prev, { lessonId: lesson.id, oldDate: lesson.date, oldTime: lesson.startTime || '' }]);
      
      // Update lesson with new date and time
      try {
        await updateLesson.mutateAsync({
          id: lesson.id,
          data: {
            date: targetDay,
            startTime: targetTime
          }
        });
        
        toast.success('Lesson moved successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to move lesson');
        console.error('Error moving lesson:', error);
      }
    }
    
    setActiveId(null);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    // Add visual feedback for valid drop zones
  };
  
  // Quick add handlers
  const handleQuickAdd = (day: string, time: string, subject: string) => {
    setQuickAddSlot({ day, time, subject });
  };
  
  const handleQuickAddClose = () => {
    setQuickAddSlot(null);
    refetch();
  };
  
  // Undo last move
  const handleUndo = async () => {
    if (undoStack.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    
    const lastMove = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    try {
      await updateLesson.mutateAsync({
        id: lastMove.lessonId,
        data: {
          date: lastMove.oldDate,
          startTime: lastMove.oldTime
        }
      });
      
      toast.success('Move undone');
      refetch();
    } catch (error) {
      toast.error('Failed to undo');
      console.error('Error undoing move:', error);
    }
  };
  
  // Keyboard shortcuts
  useKeyboardShortcut(
    () => {
      const now = new Date();
      const currentHour = getHours(now);
      const currentBlock = TIME_BLOCKS.find(block => {
        const blockHour = parseInt(block.time.split(':')[0]);
        return Math.abs(blockHour - currentHour) <= 1;
      });
      
      if (currentBlock) {
        handleQuickAdd(
          format(now, 'yyyy-MM-dd'),
          currentBlock.time,
          currentBlock.subject === 'rotating' 
            ? (now.getDate() % 2 === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale')
            : currentBlock.subject
        );
      }
    },
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: 'Quick add lesson at current time',
      category: 'planning'
    }
  );
  
  useKeyboardShortcut(
    handleToday,
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: 'Jump to today',
      category: 'navigation'
    }
  );
  
  useKeyboardShortcut(
    handleUndo,
    {
      key: 'z',
      ctrl: true,
      cmd: true,
      description: 'Undo last move',
      category: 'editing'
    }
  );
  
  // Get active lesson for drag overlay
  const activeLessonCard = activeId ? weekLessons.find(l => l.id === activeId) : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                <span className="hidden sm:inline">Weekly Teaching Plan</span>
                <span className="sm:hidden">Week Plan</span>
              </h1>
              <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
              {undoStack.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleUndo}
                  className="flex items-center gap-1 px-2 sm:px-3"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Undo</span>
                </Button>
              )}
              
              <Button
                variant={highlightToday ? "primary" : "outline"}
                size="sm"
                onClick={handleToday}
                className="flex items-center gap-1 px-2 sm:px-3"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Today</span>
              </Button>
              
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="sm" onClick={handlePreviousWeek} className="px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">
                  W{Math.ceil((weekStart.getDate()) / 7)}
                </span>
                <Button variant="ghost" size="sm" onClick={handleNextWeek} className="px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
              <span className="text-gray-600">
                {weekLessons.length} lessons
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
              <span className="text-gray-600">
                {Math.round(weekLessons.reduce((sum, l) => sum + (l.duration || 45), 0) / 60)}h
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl+Shift+N</kbd> to quick add
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your weekly plan...</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Mobile Day Selector */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDay(addDays(selectedDay, -1))}
                    disabled={isSameDay(selectedDay, weekStart)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {format(selectedDay, 'EEEE')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(selectedDay, 'MMM d')}
                    </div>
                    {isToday(selectedDay) && (
                      <Badge className="mt-1 bg-blue-600 text-white text-xs">
                        TODAY
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDay(addDays(selectedDay, 1))}
                    disabled={isSameDay(selectedDay, weekEnd)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {/* Days header - Desktop/Tablet */}
              <div className={`${isMobile ? 'hidden' : 'grid'} grid-cols-6 border-b bg-gray-50`}>
                <div className="p-4 font-semibold text-gray-700 border-r flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time
                </div>
                {weekSchedule.map((day) => {
                  const dayIsToday = isToday(day.date);
                  const completedLessons = day.lessons.filter(l => l.completed).length;
                  
                  return (
                    <div
                      key={day.dateStr}
                      id={dayIsToday ? 'day-column-today' : undefined}
                      className={`
                        p-4 font-semibold border-r last:border-r-0 relative
                        ${dayIsToday && highlightToday ? 'bg-blue-50 border-t-4 border-t-blue-500' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 flex items-center gap-2">
                            {format(day.date, 'EEEE')}
                            {dayIsToday && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                TODAY
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-normal text-gray-500">
                            {format(day.date, 'MMM d')}
                          </div>
                        </div>
                        {day.lessons.length > 0 && (
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs">
                              {completedLessons}/{day.lessons.length}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Time blocks grid */}
              <div className="relative">
                {/* Current time indicator */}
                {currentTimePosition >= 0 && isToday(currentWeek) && (
                  <CurrentTimeIndicator position={currentTimePosition} />
                )}
                
                {TIME_BLOCKS.map((timeBlock, timeIndex) => {
                  // For mobile, filter to show only selected day
                  const daysToShow = isMobile 
                    ? weekSchedule.filter(d => isSameDay(d.date, selectedDay))
                    : weekSchedule;
                  
                  return (
                    <div key={timeBlock.id} className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-6'} border-b last:border-b-0 min-h-[100px]`}>
                      <div className="p-3 bg-gray-50 border-r">
                        <div className="font-medium text-sm text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {timeBlock.time}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {timeBlock.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {timeBlock.duration} min
                        </div>
                      </div>
                    
                    {daysToShow.map((day) => {
                      const dayIsToday = isToday(day.date);
                      const slotId = `${day.dateStr}-slot-${timeBlock.time}`;
                      
                      // Determine subject for rotating block
                      const subject = timeBlock.subject === 'rotating' 
                        ? (day.date.getDate() % 2 === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale')
                        : timeBlock.subject;
                      
                      // Find lesson for this slot
                      const lesson = day.lessons.find(l => {
                        const lessonTime = l.startTime;
                        return lessonTime === timeBlock.time || 
                               (l.unitPlan?.longRangePlan?.subject === subject && !lessonTime);
                      });
                      
                      return (
                        <TimeBlock
                          key={slotId}
                          id={slotId}
                          lesson={lesson}
                          subject={subject}
                          isToday={dayIsToday && highlightToday}
                          onQuickAdd={() => handleQuickAdd(day.dateStr, timeBlock.time, subject)}
                          onLessonClick={(lessonId) => navigate(`/planner/lessons/${lessonId}`)}
                        />
                      );
                    })}
                  </div>
                  );
                })}
              </div>
            </div>
            
            {/* Drag overlay */}
            <DragOverlay>
              {activeId && activeLessonCard ? (
                <LessonCard 
                  lesson={activeLessonCard} 
                  isDragging={true}
                  subject={activeLessonCard.unitPlan?.longRangePlan?.subject || 'Unknown'}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        
        {/* Quick Add Popover */}
        {quickAddSlot && (
          <QuickAddPopover
            isOpen={!!quickAddSlot}
            onClose={handleQuickAddClose}
            date={quickAddSlot.day}
            time={quickAddSlot.time}
            subject={quickAddSlot.subject}
          />
        )}
        
        {/* Bottom Action Bar */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/planner/calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Month View
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/planner/units')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Unit Plans
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <span className="text-xs">Tip: Drag lessons to reschedule</span>
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Subject Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(SUBJECT_COLORS).map(([subject, colorClass]) => (
                <div key={subject} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></div>
                  <span className="text-xs text-gray-600">{subject.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}