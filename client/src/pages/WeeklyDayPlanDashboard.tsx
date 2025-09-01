import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks, getHours, getMinutes } from 'date-fns';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useWeeklyPlanAccessibility } from '../hooks/useWeeklyPlanAccessibility';
import { useOfflinePlanning } from '../hooks/useOfflinePlanning';
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
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus,
  RotateCcw,
  CalendarDays,
  Target,
  BookOpen,
  Sparkles,
  Settings,
  Download,
  Upload,
  Wifi,
  WifiOff,
  AlertTriangle,
  Check,
  X,
  Info,
  Redo
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { LessonCard } from '../components/weekly-plan/LessonCard';
import { TimeBlock } from '../components/weekly-plan/TimeBlock';
import { QuickAddPopover } from '../components/weekly-plan/QuickAddPopover';
import { CurrentTimeIndicator } from '../components/weekly-plan/CurrentTimeIndicator';
import { WeeklyPlanErrorBoundary } from '../components/weekly-plan/WeeklyPlanErrorBoundary';

// Hooks and utilities
import { useETFOLessonPlans, useUpdateETFOLessonPlan, type ETFOLessonPlan } from '../hooks/useETFOPlanning';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { useWeeklyDashboardStore } from '../stores/weeklyDashboardStore';
import { TimeSlotManager, type ScheduleConflict } from '../utils/timeSlotManager';
import { offlineStorage } from '../services/offlineStorage';

// Lazy load heavy components
const ConflictResolver = lazy(() => import('../components/weekly-plan/ConflictResolver').then(m => ({ default: m.ConflictResolver })));
const ScheduleCustomizer = lazy(() => import('../components/weekly-plan/ScheduleCustomizer').then(m => ({ default: m.ScheduleCustomizer })));
const WeeklyPlanSettings = lazy(() => import('../components/weekly-plan/WeeklyPlanSettings').then(m => ({ default: m.WeeklyPlanSettings })));

// Types
interface LessonWithTimeSlot extends ETFOLessonPlan {
  timeSlot?: string;
  startTime?: string;
  endTime?: string;
}

interface DaySchedule {
  date: Date;
  dateStr: string;
  lessons: LessonWithTimeSlot[];
}

// Skeleton loader for better perceived performance
function WeeklyPlanSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-6 border-b bg-gray-50 h-20">
          <div className="p-4 bg-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 border-r last:border-r-0" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 border-b h-24">
            <div className="p-3 bg-gray-50" />
            {[...Array(5)].map((_, j) => (
              <div key={j} className="p-2 border-r last:border-r-0">
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main component
export function WeeklyDayPlanDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Store state
  const {
    undoStack,
    redoStack,
    viewPreferences,
    offlineQueue,
    addToUndoStack,
    undo,
    redo,
    updateViewPreferences,
    addToOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue
  } = useWeeklyDashboardStore();
  
  // Local state for UI
  const [selectedLessonId, setSelectedLesson] = useState<string | null>(null);
  const [isOnline, setOnlineStatus] = useState(navigator.onLine);
  const [quickAddSlot, setQuickAddSlot] = useState<{ day: string; time: string; subject: string } | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  
  // Local state
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date()); // For mobile view
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState<ScheduleConflict[]>([]);
  
  // Time slot manager uses static methods, no need for instance
  // TimeSlotManager provides static methods for all operations
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 4); // Friday
  
  // Fetch lessons with proper error handling
  const { 
    data: weekLessons = [], 
    isLoading, 
    error: fetchError,
    refetch,
    isRefetching 
  } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString()
  });
  
  const updateLesson = useUpdateETFOLessonPlan();
  
  // Accessibility setup
  const {
    gridRef,
    registerCell,
    currentPosition,
    isNavigating,
    setIsNavigating,
    jumpToToday,
    jumpToFirstEmpty
  } = useWeeklyPlanAccessibility({
    rows: timeSlots.length,
    cols: isMobile ? 1 : 5,
    onCellSelect: (row, col) => {
      // Update selected cell
      const day = weekSchedule[col];
      const timeSlot = timeSlots[row];
      if (day && timeSlot) {
        const lesson = day.lessons.find(l => 
          timeSlotManager.parseTimeSlotFromLesson(l) === timeSlot.id
        );
        setSelectedLesson(lesson?.id || null);
      }
    },
    onCellActivate: (row, col) => {
      const day = weekSchedule[col];
      const timeSlot = timeSlots[row];
      if (day && timeSlot) {
        const lesson = day.lessons.find(l => 
          timeSlotManager.parseTimeSlotFromLesson(l) === timeSlot.id
        );
        if (lesson) {
          navigate(`/planner/lessons/${lesson.id}`);
        } else {
          handleQuickAdd(day.dateStr, timeSlot.time, timeSlot.subject);
        }
      }
    },
    onQuickAdd: (row, col) => {
      const day = weekSchedule[col];
      const timeSlot = timeSlots[row];
      if (day && timeSlot) {
        handleQuickAdd(day.dateStr, timeSlot.time, timeSlot.subject);
      }
    },
    onEscape: () => {
      setSelectedLesson(null);
    }
  });
  
  // Drag and drop sensors with accessibility
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
  
  // Enhanced lessons with time slot information
  const enhancedLessons = useMemo(() => {
    return weekLessons.map(lesson => ({
      ...lesson,
      timeSlot: timeSlotManager.parseTimeSlotFromLesson(lesson)
    } as LessonWithTimeSlot));
  }, [weekLessons, timeSlotManager]);
  
  // Organize lessons by day with memoization
  const weekSchedule = useMemo(() => {
    const schedule: DaySchedule[] = [];
    
    for (let i = 0; i < 5; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLessons = enhancedLessons.filter(lesson => 
        isSameDay(new Date(lesson.date), date)
      );
      
      schedule.push({
        date,
        dateStr,
        lessons: dayLessons
      });
    }
    
    return schedule;
  }, [weekStart, enhancedLessons]);
  
  // Current time position for indicator
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(-1);
  
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
        setCurrentTimePosition(-1);
      }
    };
    
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      toast.success('Back online! Syncing changes...', {
        icon: <Wifi className="h-4 w-4" />
      });
      syncPendingChanges();
    };
    
    const handleOffline = () => {
      setOnlineStatus(false);
      toast.warning('You are offline. Changes will be saved locally.', {
        icon: <WifiOff className="h-4 w-4" />
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial status
    setOnlineStatus(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
  
  // Conflict detection
  useEffect(() => {
    const checkConflicts = () => {
      const allConflicts: ScheduleConflict[] = [];
      
      for (const day of weekSchedule) {
        const dayConflicts = timeSlotManager.detectConflicts(
          enhancedLessons,
          day.dateStr
        );
        allConflicts.push(...dayConflicts);
      }
      
      setDetectedConflicts(allConflicts);
      
      // Add to store for resolution
      allConflicts.forEach(conflict => {
        if (conflict.severity === 'error') {
          addConflict({
            id: `${conflict.lessonId1}-${conflict.lessonId2}`,
            lessonId: conflict.lessonId1,
            localChange: {} as any,
            remoteChange: {} as any,
            resolved: false
          });
        }
      });
    };
    
    checkConflicts();
  }, [weekSchedule, enhancedLessons, timeSlotManager, addConflict]);
  
  // Sync pending changes
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || pendingChanges.length === 0) return;
    
    for (const change of pendingChanges) {
      try {
        const lesson = enhancedLessons.find(l => l.id === change.lessonId);
        if (lesson) {
          const timeSlot = timeSlotManager.getTimeSlotByTime(change.toTime);
          if (timeSlot) {
            const updatedMaterials = timeSlotManager.embedTimeSlotInMaterials(
              lesson.materials,
              timeSlot.id
            );
            
            await updateLesson.mutateAsync({
              id: lesson.id,
              data: {
                date: change.toDate,
                materials: updatedMaterials
              }
            });
            
            removePendingChange(change.lessonId);
          }
        }
      } catch (error) {
        console.error('Failed to sync change:', error);
      }
    }
    
    toast.success('All changes synced!', {
      icon: <Check className="h-4 w-4" />
    });
  }, [isOnline, pendingChanges, enhancedLessons, timeSlotManager, updateLesson, removePendingChange]);
  
  // Navigation handlers
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  }, []);
  
  const handleNextWeek = useCallback(() => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  }, []);
  
  const handleToday = useCallback(() => {
    setCurrentWeek(new Date());
    if (!isReducedMotion) {
      // Smooth scroll to today's column
      const todayElement = document.getElementById('day-column-today');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isReducedMotion]);
  
  // Drag handlers with error handling
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);
  
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }
    
    // Parse the drop target ID to get day and time
    const [targetDay, targetTime] = (over.id as string).split('-slot-');
    const lesson = enhancedLessons.find(l => l.id === active.id);
    
    if (lesson && targetDay && targetTime) {
      // Check for conflicts
      const targetSlot = timeSlotManager.getTimeSlotByTime(targetTime);
      if (!targetSlot) {
        toast.error('Invalid time slot');
        setActiveId(null);
        return;
      }
      
      // Check if slot is occupied
      const existingLesson = weekSchedule
        .find(d => d.dateStr === targetDay)
        ?.lessons.find(l => timeSlotManager.parseTimeSlotFromLesson(l) === targetSlot.id);
      
      if (existingLesson && existingLesson.id !== lesson.id) {
        toast.error('Time slot already occupied', {
          description: 'Move or remove the existing lesson first',
          icon: <AlertTriangle className="h-4 w-4" />
        });
        setActiveId(null);
        return;
      }
      
      // Save to undo stack
      addToUndoStack({
        lessonId: lesson.id,
        fromDate: lesson.date,
        fromTime: timeSlotManager.getTimeSlot(lesson.timeSlot || '')?.time || '',
        toDate: targetDay,
        toTime: targetTime,
        timestamp: Date.now()
      });
      
      // Update lesson with optimistic update
      try {
        // Embed time slot in materials
        const updatedMaterials = timeSlotManager.embedTimeSlotInMaterials(
          lesson.materials,
          targetSlot.id
        );
        
        if (isOnline) {
          await updateLesson.mutateAsync({
            id: lesson.id,
            data: {
              date: targetDay,
              materials: updatedMaterials
            }
          });
          
          toast.success('Lesson moved successfully', {
            icon: <Check className="h-4 w-4" />
          });
        } else {
          // Save to offline storage
          await offlineStorage.addChange({
            id: `move-${lesson.id}-${Date.now()}`,
            type: 'UPDATE',
            entity: 'lesson-plan',
            entityId: lesson.id,
            data: {
              date: targetDay,
              materials: updatedMaterials
            },
            timestamp: Date.now(),
            synced: false
          });
          
          addPendingChange({
            lessonId: lesson.id,
            fromDate: lesson.date,
            fromTime: timeSlotManager.getTimeSlot(lesson.timeSlot || '')?.time || '',
            toDate: targetDay,
            toTime: targetTime,
            timestamp: Date.now()
          });
          
          toast.info('Change saved offline', {
            description: 'Will sync when connection is restored',
            icon: <WifiOff className="h-4 w-4" />
          });
        }
        
        refetch();
      } catch (error) {
        toast.error('Failed to move lesson', {
          description: 'Please try again',
          icon: <X className="h-4 w-4" />
        });
        console.error('Error moving lesson:', error);
      }
    }
    
    setActiveId(null);
  }, [
    enhancedLessons, 
    weekSchedule, 
    timeSlotManager, 
    addToUndoStack, 
    isOnline, 
    updateLesson, 
    addPendingChange, 
    refetch
  ]);
  
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Add visual feedback for valid drop zones
    const { over } = event;
    if (over) {
      // Could add hover state here
    }
  }, []);
  
  // Quick add handlers
  const handleQuickAdd = useCallback((day: string, time: string, subject: string) => {
    setQuickAddSlot({ day, time, subject });
  }, [setQuickAddSlot]);
  
  const handleQuickAddClose = useCallback(() => {
    setQuickAddSlot(null);
    refetch();
  }, [setQuickAddSlot, refetch]);
  
  // Undo/Redo handlers
  const handleUndo = useCallback(async () => {
    const operation = undo();
    if (!operation) {
      toast.info('Nothing to undo');
      return;
    }
    
    try {
      const lesson = enhancedLessons.find(l => l.id === operation.lessonId);
      if (lesson) {
        const fromSlot = timeSlotManager.getTimeSlotByTime(operation.fromTime);
        if (fromSlot) {
          const materials = timeSlotManager.embedTimeSlotInMaterials(
            lesson.materials,
            fromSlot.id
          );
          
          await updateLesson.mutateAsync({
            id: operation.lessonId,
            data: {
              date: operation.fromDate,
              materials
            }
          });
          
          toast.success('Action undone', {
            icon: <RotateCcw className="h-4 w-4" />
          });
          refetch();
        }
      }
    } catch (error) {
      toast.error('Failed to undo');
      console.error('Error undoing:', error);
    }
  }, [undo, enhancedLessons, timeSlotManager, updateLesson, refetch]);
  
  const handleRedo = useCallback(async () => {
    const operation = redo();
    if (!operation) {
      toast.info('Nothing to redo');
      return;
    }
    
    try {
      const lesson = enhancedLessons.find(l => l.id === operation.lessonId);
      if (lesson) {
        const toSlot = timeSlotManager.getTimeSlotByTime(operation.toTime);
        if (toSlot) {
          const materials = timeSlotManager.embedTimeSlotInMaterials(
            lesson.materials,
            toSlot.id
          );
          
          await updateLesson.mutateAsync({
            id: operation.lessonId,
            data: {
              date: operation.toDate,
              materials
            }
          });
          
          toast.success('Action redone', {
            icon: <Redo className="h-4 w-4" />
          });
          refetch();
        }
      }
    } catch (error) {
      toast.error('Failed to redo');
      console.error('Error redoing:', error);
    }
  }, [redo, enhancedLessons, timeSlotManager, updateLesson, refetch]);
  
  // Export schedule
  const handleExportSchedule = useCallback(() => {
    const summary = timeSlotManager.generateScheduleSummary(
      enhancedLessons,
      weekStart,
      weekEnd
    );
    
    const data = {
      week: {
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd')
      },
      lessons: weekSchedule.map(day => ({
        date: day.dateStr,
        lessons: day.lessons.map(l => ({
          id: l.id,
          title: l.titleFr || l.title,
          subject: l.unitPlan?.longRangePlan?.subject,
          timeSlot: timeSlotManager.getTimeSlot(l.timeSlot || '')?.label,
          duration: l.duration
        }))
      })),
      summary,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `week-schedule-${format(weekStart, 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Schedule exported', {
      icon: <Download className="h-4 w-4" />
    });
  }, [weekStart, weekEnd, weekSchedule, enhancedLessons, timeSlotManager]);
  
  // Keyboard shortcuts
  useKeyboardShortcut(
    () => {
      const now = new Date();
      const currentHour = getHours(now);
      const currentBlock = timeSlots.find(block => {
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
      category: 'planning',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(handleToday, {
    key: 't',
    ctrl: true,
    shift: true,
    description: 'Jump to today',
    category: 'navigation',
    preventDefault: true
  });
  
  useKeyboardShortcut(handleUndo, {
    key: 'z',
    ctrl: true,
    cmd: true,
    description: 'Undo last move',
    category: 'editing',
    preventDefault: true
  });
  
  useKeyboardShortcut(handleRedo, {
    key: 'z',
    ctrl: true,
    cmd: true,
    shift: true,
    description: 'Redo last action',
    category: 'editing',
    preventDefault: true
  });
  
  // Get active lesson for drag overlay
  const activeLessonCard = activeId ? enhancedLessons.find(l => l.id === activeId) : null;
  
  // Generate schedule summary
  const scheduleSummary = useMemo(() => {
    return timeSlotManager.generateScheduleSummary(
      enhancedLessons,
      weekStart,
      weekEnd
    );
  }, [enhancedLessons, weekStart, weekEnd, timeSlotManager]);
  
  return (
    <WeeklyPlanErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Dashboard error:', error, errorInfo);
        // Could send to error reporting service
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Skip navigation links for accessibility */}
        <div className="sr-only">
          <a href="#main-content" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded">
            Skip to main content
          </a>
          <a href="#weekly-schedule" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-blue-600 text-white px-4 py-2 rounded">
            Skip to schedule
          </a>
        </div>
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
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
                {!isOnline && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
              
              <nav className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                {/* Undo/Redo */}
                {undoStack.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleUndo}
                    aria-label="Undo last action"
                    className="flex items-center gap-1 px-2 sm:px-3"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Undo</span>
                  </Button>
                )}
                
                {redoStack.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleRedo}
                    aria-label="Redo last action"
                    className="flex items-center gap-1 px-2 sm:px-3"
                  >
                    <Redo className="h-4 w-4" />
                    <span className="hidden sm:inline">Redo</span>
                  </Button>
                )}
                
                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Export */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportSchedule}
                  aria-label="Export schedule"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {/* Today button */}
                <Button
                  variant={viewPreferences.highlightToday ? "primary" : "outline"}
                  size="sm"
                  onClick={handleToday}
                  className="flex items-center gap-1 px-2 sm:px-3"
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Today</span>
                </Button>
                
                {/* Week navigation */}
                <div className="flex items-center border rounded-lg" role="group" aria-label="Week navigation">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handlePreviousWeek} 
                    className="px-2"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium" aria-live="polite">
                    W{Math.ceil((weekStart.getDate()) / 7)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleNextWeek} 
                    className="px-2"
                    aria-label="Next week"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </nav>
            </div>
            
            {/* Quick stats and alerts */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                <span className="text-gray-600">
                  {weekLessons.length} lessons
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                <span className="text-gray-600">
                  {Math.round(scheduleSummary.totalLessons * 45 / 60)}h
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                <span className="text-gray-600">
                  {Math.round(scheduleSummary.coverage)}% coverage
                </span>
              </div>
              
              {detectedConflicts.length > 0 && (
                <button
                  onClick={() => setShowConflictResolver(true)}
                  className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                >
                  <AlertTriangle className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>{detectedConflicts.length} conflicts</span>
                </button>
              )}
              
              {pendingChanges.length > 0 && (
                <button
                  onClick={syncPendingChanges}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  disabled={!isOnline}
                >
                  <Upload className="h-3 sm:h-4 w-3 sm:w-4" />
                  <span>{pendingChanges.length} pending</span>
                </button>
              )}
              
              <div className="hidden sm:flex items-center gap-1 ml-auto">
                <Sparkles className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl+Shift+N</kbd> to quick add
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main id="main-content" className="max-w-[1920px] mx-auto p-4 sm:p-6">
          {fetchError ? (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to load lessons. Please check your connection and try again.
                {!isOnline && ' You are currently offline.'}
              </AlertDescription>
            </Alert>
          ) : null}
          
          {isLoading ? (
            <WeeklyPlanSkeleton />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              <div 
                id="weekly-schedule"
                ref={gridRef}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
                role="grid"
                aria-label="Weekly schedule grid"
              >
                {/* Mobile Day Selector */}
                {isMobile && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDay(addDays(selectedDay, -1))}
                      disabled={isSameDay(selectedDay, weekStart)}
                      aria-label="Previous day"
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
                      aria-label="Next day"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Days header - Desktop/Tablet */}
                <div className={`${isMobile ? 'hidden' : 'grid'} grid-cols-6 border-b bg-gray-50`} role="row">
                  <div className="p-4 font-semibold text-gray-700 border-r flex items-center gap-2" role="columnheader">
                    <Clock className="h-5 w-5" />
                    Time
                  </div>
                  {weekSchedule.map((day) => {
                    const dayIsToday = isToday(day.date);
                    const completedLessons = day.lessons.filter(l => l.daybookEntry).length;
                    
                    return (
                      <div
                        key={day.dateStr}
                        id={dayIsToday ? 'day-column-today' : undefined}
                        className={`
                          p-4 font-semibold border-r last:border-r-0 relative
                          ${dayIsToday && viewPreferences.highlightToday ? 'bg-blue-50 border-t-4 border-t-blue-500' : ''}
                        `}
                        role="columnheader"
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
                  {currentTimePosition >= 0 && isToday(currentWeek) && viewPreferences.showTimeIndicator && (
                    <CurrentTimeIndicator position={currentTimePosition} />
                  )}
                  
                  {timeSlots.map((timeBlock, timeIndex) => {
                    // For mobile, filter to show only selected day
                    const daysToShow = isMobile 
                      ? weekSchedule.filter(d => isSameDay(d.date, selectedDay))
                      : weekSchedule;
                    
                    return (
                      <div 
                        key={timeBlock.id} 
                        className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-6'} border-b last:border-b-0 min-h-[100px]`}
                        role="row"
                      >
                        <div className="p-3 bg-gray-50 border-r" role="rowheader">
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
                        
                        {daysToShow.map((day, dayIndex) => {
                          const dayIsToday = isToday(day.date);
                          const slotId = `${day.dateStr}-slot-${timeBlock.time}`;
                          
                          // Determine subject for rotating block
                          const subject = timeBlock.subject === 'rotating' 
                            ? (day.date.getDate() % 2 === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale')
                            : timeBlock.subject;
                          
                          // Find lesson for this slot
                          const lesson = day.lessons.find(l => {
                            const lessonSlot = timeSlotManager.parseTimeSlotFromLesson(l);
                            return lessonSlot === timeBlock.id;
                          });
                          
                          return (
                            <TimeBlock
                              key={slotId}
                              id={slotId}
                              lesson={lesson}
                              subject={subject}
                              isToday={dayIsToday && viewPreferences.highlightToday}
                              onQuickAdd={() => handleQuickAdd(day.dateStr, timeBlock.time, subject)}
                              onLessonClick={(lessonId) => navigate(`/planner/lessons/${lessonId}`)}
                              ref={(el) => registerCell(timeIndex, dayIndex, el)}
                              tabIndex={isNavigating && currentPosition.row === timeIndex && currentPosition.col === dayIndex ? 0 : -1}
                              aria-label={`${format(day.date, 'EEEE')}, ${timeBlock.label}${lesson ? `, ${lesson.titleFr || lesson.title}` : ', empty'}`}
                              data-time={timeBlock.label}
                              data-day={format(day.date, 'EEEE')}
                              data-has-lesson={lesson ? 'true' : 'false'}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
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
                <Button
                  variant="outline"
                  onClick={() => setShowCustomizer(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize Schedule
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {isNavigating && (
                  <Badge variant="secondary" className="px-3 py-1">
                    <Info className="h-3 w-3 mr-1" />
                    <span className="text-xs">Grid navigation active</span>
                  </Badge>
                )}
                <Badge variant="secondary" className="px-3 py-1">
                  <span className="text-xs">Drag lessons to reschedule</span>
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Subject distribution */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Lessons by Subject</h4>
                  <div className="space-y-1">
                    {Array.from(scheduleSummary.lessonsBySubject.entries()).map(([subject, count]) => (
                      <div key={subject} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{subject}</span>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Keyboard shortcuts */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Keyboard Shortcuts</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div><kbd>Ctrl+Shift+N</kbd> - Quick add</div>
                    <div><kbd>Ctrl+Shift+T</kbd> - Jump to today</div>
                    <div><kbd>Ctrl+Z</kbd> - Undo</div>
                    <div><kbd>Ctrl+G</kbd> - Grid navigation</div>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Status</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <>
                          <Wifi className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-orange-600" />
                          <span className="text-orange-600">Offline ({pendingChanges.length} pending)</span>
                        </>
                      )}
                    </div>
                    {isRefetching && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-600">Syncing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </WeeklyPlanErrorBoundary>
  );
}