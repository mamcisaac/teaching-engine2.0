import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy , useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Plus } from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '../api/core/client';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';

interface DaySchedule {
  date: Date;
  dateStr: string;
  lessons: any[];
}

const DAILY_SLOTS = [
  { slotNumber: 1, label: 'Slot 1' },
  { slotNumber: 2, label: 'Slot 2' },
  { slotNumber: 3, label: 'Slot 3' },
  { slotNumber: 4, label: 'Slot 4' },
  { slotNumber: 5, label: 'Slot 5' }
];

const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences de la nature': 'bg-purple-100 text-purple-800 border-purple-300',
  'Arts visuels': 'bg-orange-100 text-orange-800 border-orange-300',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800 border-pink-300'
};

// Draggable lesson component
function DraggableLesson({ lesson, subject }: { lesson: any; subject: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-500 ${subject ? SUBJECT_COLORS[subject] : 'bg-gray-100'} ${isDragging ? 'z-50' : ''}`}
      data-testid={`lesson-${lesson.id}`}
      role="listitem"
      aria-label={`${lesson.titleFr || lesson.title} - ${subject} - ${lesson.duration} minutes. Press space to start dragging.`}
      tabIndex={0}
    >
      <div className="font-medium text-xs mb-1">
        {lesson.titleFr || lesson.title}
      </div>
      <div className="text-xs opacity-75">
        {subject} - {lesson.duration} min
      </div>
    </div>
  );
}

// Droppable slot component
function DroppableSlot({ 
  day, 
  slot, 
  lesson, 
  subject, 
  onQuickAdd 
}: { 
  day: any; 
  slot: any; 
  lesson?: any; 
  subject?: string;
  onQuickAdd: (date: Date, slot: any) => void;
}) {
  const slotId = `slot-${day.dateStr.split('-')[2]}-${slot.slotNumber}`;
  const dayName = format(day.date, 'EEEE');
  
  return (
    <div 
      id={slotId}
      className="p-2 border-r last:border-r-0 hover:bg-gray-50 min-h-[100px]"
      data-testid={slotId}
      role="list"
      aria-label={`${dayName} ${slot.label}`}
    >
      {lesson ? (
        <DraggableLesson lesson={lesson} subject={subject || ''} />
      ) : (
        <button
          className="w-full h-full p-2 border-2 border-dashed border-gray-300 rounded hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => onQuickAdd(day.date, slot)}
          data-testid="quick-add-button"
          aria-label={`Add lesson to ${dayName} ${slot.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function WeekViewPage(): React.ReactElement {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: string; slot: number } | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [optimisticLessons, setOptimisticLessons] = useState<any[]>([]);
  const [originalPosition, setOriginalPosition] = useState<{ lessonId: string; date: Date; slot: number } | null>(null);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 4); // Friday
  
  // Fetch lessons for the entire week
  const { data: weekLessons = [], isLoading } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString()
  });
  
  // Use optimistic lessons if available, otherwise use real data
  const displayLessons = optimisticLessons.length > 0 ? optimisticLessons : weekLessons;
  
  // Organize lessons by day
  const weekSchedule = useMemo(() => {
    const schedule: DaySchedule[] = [];
    
    for (let i = 0; i < 5; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLessons = displayLessons.filter(lesson => 
        isSameDay(new Date(lesson.date), date)
      );
      
      schedule.push({
        date,
        dateStr,
        lessons: dayLessons
      });
    }
    
    return schedule;
  }, [weekStart, displayLessons]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Store original position for potential revert
    const lessonId = event.active.id as string;
    const lesson = weekLessons.find(l => l.id === lessonId);
    if (lesson) {
      setOriginalPosition({
        lessonId,
        date: new Date(lesson.date),
        slot: lesson.slotNumber ?? 1
      });
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setDragOverSlot(null);
      return;
    }

    // Parse the drop target (format: "slot-{day}-{slotNumber}")
    const overId = over.id as string;
    if (!overId.startsWith('slot-')) {
      setActiveId(null);
      setDragOverSlot(null);
      return;
    }

    const [, dayStr, slotStr] = overId.split('-');
    const newSlotNumber = parseInt(slotStr);
    const newDate = weekSchedule.find(d => d.dateStr.includes(dayStr.toLowerCase()))?.date;
    
    if (!newDate) {
      setActiveId(null);
      setDragOverSlot(null);
      return;
    }

    // Prevent concurrent requests
    if (isRescheduling) {
      console.warn('Request already in progress, ignoring new drag');
      setActiveId(null);
      setDragOverSlot(null);
      return;
    }

    setIsRescheduling(true);
    setDragError(null);
    
    // Generate unique request ID to handle race conditions
    const requestId = `drag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setPendingRequestId(requestId);
    
    // Optimistic update: immediately update the UI
    const updatedLessons = weekLessons.map(lesson => {
      if (lesson.id === active.id) {
        return {
          ...lesson,
          date: newDate.toISOString(),
          slotNumber: newSlotNumber
        };
      }
      return lesson;
    });
    setOptimisticLessons(updatedLessons);
    
    try {
      // Call the reschedule API
      const response = await apiClient.put(`/api/etfo-lesson-plans/${active.id}/reschedule`, {
        newDate: newDate.toISOString(),
        newSlotNumber: newSlotNumber
      });
      
      // Check if this request is still the current one
      if (requestId !== pendingRequestId) {
        console.warn('Request superseded by newer request, ignoring response');
        return;
      }
      
      // Success - keep optimistic update
      setOriginalPosition(null);
      // The useETFOLessonPlans hook will refetch and sync the real data
    } catch (error: any) {
      // Check if this request is still the current one
      if (requestId !== pendingRequestId) {
        console.warn('Request superseded by newer request, ignoring error');
        return;
      }
      
      console.error('Failed to reschedule lesson:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to reschedule lesson. Please try again.';
      setDragError(errorMessage);
      
      // Revert optimistic update on error
      setOptimisticLessons([]);
      
      // Automatically clear error after 5 seconds
      setTimeout(() => {
        if (requestId === pendingRequestId) {
          setDragError(null);
        }
      }, 5000);
    } finally {
      if (requestId === pendingRequestId) {
        setActiveId(null);
        setDragOverSlot(null);
        setIsRescheduling(false);
        setPendingRequestId(null);
      }
    }
  }, [weekSchedule, weekLessons, isRescheduling, pendingRequestId]);
  
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };
  
  const handleToday = () => {
    setCurrentWeek(new Date());
  };
  
  const handleDayClick = (date: Date) => {
    // Navigate to day view with correct date
    navigate(`/planner/day/${format(date, 'yyyy-MM-dd')}`);
  };
  
  const handleLessonClick = (lessonId: string) => {
    navigate(`/planner/lessons/${lessonId}`);
  };
  
  const handleCreateLesson = (date: Date, slot: any) => {
    // Navigate to lesson creation with pre-filled date and slot
    navigate(`/planner/quick-lesson?date=${format(date, 'yyyy-MM-dd')}&slot=${slot.slotNumber}`);
  };
  
  // Get all lesson IDs for the sortable context
  const allLessonIds = useMemo(() => {
    return weekLessons.map(lesson => lesson.id);
  }, [weekLessons]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Week View - {format(weekStart, 'MMMM d')} to {format(weekEnd, 'MMMM d, yyyy')}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handlePreviousWeek}
                aria-label="Go to previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleToday}
                aria-label="Go to current week"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNextWeek}
                aria-label="Go to next week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/planner/today')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Day View
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/planner/calendar')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Month View
            </Button>
          </div>
        </div>
        
        {/* Error Message */}
        {dragError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between" role="alert" aria-live="polite">
            <span>{dragError}</span>
            <button 
              onClick={() => setDragError(null)}
              className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              aria-label="Dismiss error message"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Week Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : (
          <SortableContext items={allLessonIds} strategy={verticalListSortingStrategy}>
            <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="week-view-grid" role="grid" aria-label="Weekly lesson schedule">
            <div className="grid grid-cols-6 border-b">
              <div className="p-3 bg-gray-50 font-semibold text-gray-700 border-r">
                Lesson Slots
              </div>
              {weekSchedule.map((day) => (
                <div 
                  key={day.dateStr}
                  className="p-3 bg-gray-50 font-semibold text-gray-700 border-r last:border-r-0 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10"
                  onClick={() => handleDayClick(day.date)}
                  role="columnheader"
                  tabIndex={0}
                  aria-label={`${format(day.date, 'EEEE, MMMM d')}. Click to view day details.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDayClick(day.date);
                    }
                  }}
                >
                  <div>{format(day.date, 'EEEE')}</div>
                  <div className="text-sm font-normal text-gray-500">
                    {format(day.date, 'MMM d')}
                  </div>
                  {day.lessons.length > 0 && (
                    <Badge className="mt-1 text-xs" variant="secondary">
                      {day.lessons.length} lessons
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {/* Daily Slots */}
            {DAILY_SLOTS.map((slot) => (
              <div key={slot.slotNumber} className="grid grid-cols-6 border-b last:border-b-0">
                <div className="p-3 bg-gray-50 font-medium text-sm text-gray-700 border-r">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {slot.label}
                  </div>
                </div>
                
                {weekSchedule.map((day) => {
                  // Find lesson for this slot
                  const lesson = day.lessons.find(l => l.slotNumber === slot.slotNumber);
                  const subject = lesson?.unitPlan?.longRangePlan?.subject;
                  
                  return (
                    <DroppableSlot
                      key={`${day.dateStr}-${slot.slotNumber}`}
                      day={day}
                      slot={slot}
                      lesson={lesson}
                      subject={subject}
                      onQuickAdd={handleCreateLesson}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          </SortableContext>
        )}
        
        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Subject Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(SUBJECT_COLORS).map(([subject, colorClass]) => (
                <div key={subject} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colorClass}`}></div>
                  <span className="text-sm text-gray-700">{subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </DndContext>
  );
}