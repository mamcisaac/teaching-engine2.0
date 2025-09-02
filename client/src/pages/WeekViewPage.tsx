import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfWeek, addDays, parseISO, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, BookOpen, X, Loader2, GripVertical } from 'lucide-react';
import { api } from '../lib/axios';
import { toast } from 'sonner';
import { useUnitPlans } from '../hooks/useETFOPlanning';

// Properly typed Lesson interface
interface Lesson {
  id: string;
  title: string;
  date: string;
  position: number;
  duration: number;
  unitPlan: {
    id: string;
    title: string;
    longRangePlan: {
      subject: string;
    };
  };
}

interface SortableLessonProps {
  lesson: Lesson;
  isOverlay?: boolean;
}

// Simple request queue to prevent race conditions
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  async add(request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
      }
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

function SortableLesson({ lesson, isOverlay }: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: lesson.id,
    data: { type: 'lesson', lesson }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.5 : 1,
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Français (Immersion)': 'bg-blue-100 border-blue-300 text-blue-900',
      'Mathématiques': 'bg-green-100 border-green-300 text-green-900',
      'Sciences de la nature': 'bg-yellow-100 border-yellow-300 text-yellow-900',
      'Sciences humaines': 'bg-purple-100 border-purple-300 text-purple-900',
      'Arts visuels': 'bg-pink-100 border-pink-300 text-pink-900',
      'Formation personnelle et sociale': 'bg-orange-100 border-orange-300 text-orange-900',
    };
    return colors[subject] || 'bg-gray-100 border-gray-300 text-gray-900';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-3 mb-2 rounded-lg border-2 transition-all group ${
        getSubjectColor(lesson.unitPlan.longRangePlan.subject)
      } ${isOverlay ? 'shadow-2xl scale-105' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes}
          {...listeners}
          className="cursor-move opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm line-clamp-1">
            {lesson.title}
          </h4>
          <p className="text-xs opacity-75 mt-1">
            {lesson.unitPlan.longRangePlan.subject}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs opacity-60 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.duration} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeekViewPage() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  
  // Refs for form inputs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const unitPlanSelectRef = useRef<HTMLSelectElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);

  const { data: unitPlans = [] } = useUnitPlans({});

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

  // Single refetch function to avoid repetition
  const refetchWeekLessons = useCallback(async () => {
    try {
      const endOfWeek = addDays(currentWeek, 4); // Friday
      const response = await api.get<Lesson[]>('/api/schedule/range', {
        params: {
          startDate: format(currentWeek, "yyyy-MM-dd'T'HH:mm:ss.000'Z'"),
          endDate: format(endOfWeek, "yyyy-MM-dd'T'23:59:59.999'Z'"),
        },
      });
      
      // Sort lessons by date and position
      const sortedLessons = response.data.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.position - b.position;
      });
      
      setLessons(sortedLessons);
      return sortedLessons;
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      toast.error('Failed to load lessons');
      throw error;
    }
  }, [currentWeek]);

  // Fetch lessons for the current week
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        await refetchWeekLessons();
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [refetchWeekLessons]);

  // Group lessons by day with proper typing
  const lessonsByDay = useMemo(() => {
    const days = Array.from({ length: 5 }, (_, i) => addDays(currentWeek, i));
    const grouped: Record<string, { date: Date; lessons: Lesson[] }> = {};
    
    days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = {
        date: day,
        lessons: lessons
          .filter(lesson => isSameDay(parseISO(lesson.date), day))
          .sort((a, b) => a.position - b.position)
      };
    });
    
    return grouped;
  }, [lessons, currentWeek]);

  // Get all sortable IDs (just lessons, no slots)
  const allSortableIds = useMemo(() => {
    return lessons.map(l => l.id);
  }, [lessons]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const activeLesson = lessons.find(l => l.id === active.id);
    if (!activeLesson) return;

    setIsUpdating(true);

    try {
      let targetDate: string;
      let targetIndex: number;

      // Check what we dropped on
      const overId = over.id.toString();
      
      // Dropped on a day container
      if (overId.startsWith('day-')) {
        // Extract date using regex to handle dates with hyphens
        const match = overId.match(/^day-(\d{4}-\d{2}-\d{2})$/);
        if (!match) {
          console.error('Invalid day ID format:', overId);
          return;
        }
        const dayKey = match[1];
        targetDate = `${dayKey}T12:00:00.000Z`;
        
        // Find position based on where we dropped
        const dayLessons = lessonsByDay[dayKey]?.lessons || [];
        
        if (dayLessons.length === 0) {
          targetIndex = 0;
        } else {
          // If we have collision detection data, use it to determine position
          // For now, default to end of day
          targetIndex = dayLessons.length;
        }
      } else {
        // Dropped on another lesson
        const overLesson = lessons.find(l => l.id === overId);
        if (!overLesson) return;
        
        targetDate = overLesson.date;
        
        // Find position in that day's lessons
        const dayKey = format(parseISO(overLesson.date), 'yyyy-MM-dd');
        const dayLessons = lessonsByDay[dayKey]?.lessons || [];
        const overIndex = dayLessons.findIndex(l => l.id === overId);
        
        // Check if we're moving within the same day
        const isSameDay = format(parseISO(activeLesson.date), 'yyyy-MM-dd') === dayKey;
        const activeIndex = dayLessons.findIndex(l => l.id === active.id);
        
        if (isSameDay && activeIndex !== -1) {
          // Moving within same day - account for index shift when removing the item
          if (activeIndex < overIndex) {
            // Moving down - the item will be removed first, shifting overIndex down by 1
            targetIndex = overIndex - 1;
          } else {
            // Moving up - overIndex is not affected by removing item at higher index
            targetIndex = overIndex;
          }
        } else {
          // Moving to different day - insert after the target lesson
          targetIndex = overIndex + 1;
        }
      }

      // Queue the request to prevent race conditions
      await requestQueue.add(async () => {
        await api.post('/api/schedule/reorder', {
          lessonId: active.id,
          targetDate,
          targetIndex
        });
        
        // Refresh lessons to get accurate positions
        await refetchWeekLessons();
      });
      
      toast.success('Lesson moved');
    } catch (error) {
      console.error('Failed to reorder lesson:', error);
      toast.error('Failed to move lesson');
      // Refresh to revert any changes
      await refetchWeekLessons();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickAddDate) return;

    const title = titleInputRef.current?.value?.trim();
    const unitPlanId = unitPlanSelectRef.current?.value;
    const duration = parseInt(durationInputRef.current?.value || '45');

    if (!title || !unitPlanId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUpdating(true);

    try {
      const lessonDate = new Date(quickAddDate);
      lessonDate.setHours(12, 0, 0, 0);

      await requestQueue.add(async () => {
        await api.post('/api/etfo-lesson-plans', {
          title,
          unitPlanId,
          date: lessonDate.toISOString(),
          duration,
          isSubFriendly: true
        });

        // Refresh lessons
        await refetchWeekLessons();
      });
      
      setQuickAddDate(null);
      // Clear form inputs
      if (titleInputRef.current) titleInputRef.current.value = '';
      if (unitPlanSelectRef.current) unitPlanSelectRef.current.value = '';
      if (durationInputRef.current) durationInputRef.current.value = '45';
      
      toast.success('Lesson added');
    } catch (error) {
      console.error('Failed to add lesson:', error);
      toast.error('Failed to add lesson');
    } finally {
      setIsUpdating(false);
    }
  };

  const activeLesson = activeId && typeof activeId === 'string' 
    ? lessons.find(l => l.id === activeId) 
    : null;

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!isUpdating) {
      setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
    }
  };

  const goToToday = () => {
    if (!isUpdating) {
      setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg text-gray-600">Loading weekly schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">
                Week of {format(currentWeek, 'MMMM d, yyyy')}
              </h1>
              
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                disabled={isUpdating}
              >
                <Calendar className="w-4 h-4" />
                Today
              </button>

              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Week Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-5 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayName, index) => {
              const day = addDays(currentWeek, index);
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayData = lessonsByDay[dayKey] || { date: day, lessons: [] };
              const totalMinutes = dayData.lessons.reduce((sum, l) => sum + l.duration, 0);
              const dayLessonIds = dayData.lessons.map(l => l.id);
              
              return (
                <div 
                  key={dayKey} 
                  className={`bg-white rounded-lg shadow-sm ${
                    isToday(day) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">{dayName}</h2>
                    <p className="text-sm text-gray-600">{format(day, 'MMM d')}</p>
                    {dayData.lessons.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {dayData.lessons.length} lesson{dayData.lessons.length !== 1 ? 's' : ''} • {Math.round(totalMinutes / 60 * 10) / 10}h
                      </p>
                    )}
                    {totalMinutes > 270 && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        ⚠️ Overloaded
                      </p>
                    )}
                  </div>
                  
                  <SortableContext 
                    items={dayLessonIds} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      id={`day-${dayKey}`}
                      className="p-4 min-h-[300px]"
                      data-day={dayKey}
                    >
                      {dayData.lessons.length === 0 ? (
                        // Empty day
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                          <p className="text-sm mb-2">No lessons</p>
                          <button
                            onClick={() => setQuickAddDate(day)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Add lesson
                          </button>
                        </div>
                      ) : (
                        // Lessons for this day
                        <div className="space-y-1">
                          {dayData.lessons.map((lesson) => (
                            <SortableLesson key={lesson.id} lesson={lesson} />
                          ))}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                  
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => setQuickAddDate(day)}
                      className="w-full py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      disabled={isUpdating}
                    >
                      <Plus className="w-3 h-3" />
                      Quick Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeLesson && <SortableLesson lesson={activeLesson} isOverlay />}
          </DragOverlay>
        </DndContext>

        {/* Quick Add Modal */}
        {quickAddDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Add Lesson - {format(quickAddDate, 'EEEE, MMM d')}
                </h3>
                <button
                  onClick={() => setQuickAddDate(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isUpdating}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lesson title"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Plan
                  </label>
                  <select
                    ref={unitPlanSelectRef}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a unit plan</option>
                    {unitPlans.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.title} ({unit.longRangePlan?.subject || 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    ref={durationInputRef}
                    type="number"
                    defaultValue="45"
                    min="15"
                    max="180"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setQuickAddDate(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Adding...' : 'Add Lesson'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}