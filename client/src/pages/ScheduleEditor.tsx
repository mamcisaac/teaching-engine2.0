import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { 
  Calendar, GripVertical, Save, Undo, Redo, 
  ChevronLeft, ChevronRight, Search 
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';
import { api } from '../lib/axios';
import type { ETFOLessonPlan } from '../types/curriculum';

type Lesson = ETFOLessonPlan & {
  unitTitle?: string;
  subject?: string;
};

interface DragItem {
  lesson: Lesson;
  fromDate: string;
  fromSlotNumber: number;
}

const DAILY_SLOTS = [
  { slotNumber: 1, label: 'Slot 1' },
  { slotNumber: 2, label: 'Slot 2' },
  { slotNumber: 3, label: 'Slot 3' },
  { slotNumber: 4, label: 'Slot 4' },
  { slotNumber: 5, label: 'Slot 5' }
];

const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 border-blue-300',
  'Mathématiques': 'bg-green-100 border-green-300',
  'Sciences de la nature': 'bg-yellow-100 border-yellow-300',
  'Arts visuels': 'bg-purple-100 border-purple-300',
  'Sciences humaines': 'bg-orange-100 border-orange-300',
  'Formation personnelle et sociale': 'bg-pink-100 border-pink-300'
};

function LessonCard({ lesson, fromDate, fromSlotNumber }: { 
  lesson: Lesson; 
  fromDate: string; 
  fromSlotNumber: number;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'lesson',
    item: { lesson, fromDate, fromSlotNumber } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const colorClass = lesson.subject ? SUBJECT_COLORS[lesson.subject] || 'bg-gray-100' : 'bg-gray-100';

  return (
    <div
      ref={drag}
      className={`p-2 rounded border cursor-move transition-all ${colorClass} ${
        isDragging ? 'opacity-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {lesson.titleFr || lesson.title}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {lesson.unitTitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function DailySlot({ 
  date, 
  slotNumber, 
  lessons, 
  onDrop 
}: { 
  date: string; 
  slotNumber: number; 
  lessons: Lesson[];
  onDrop: (item: DragItem, targetDate: string, targetSlot: number) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'lesson',
    drop: (item: DragItem) => {
      onDrop(item, date, slotNumber);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  const backgroundColor = isOver && canDrop ? 'bg-green-50' : isOver ? 'bg-red-50' : '';

  return (
    <div
      ref={drop}
      className={`border rounded p-2 min-h-[80px] transition-colors ${backgroundColor}`}
    >
      {lessons.map((lesson) => (
        <LessonCard 
          key={lesson.id} 
          lesson={lesson} 
          fromDate={date}
          fromSlotNumber={slotNumber}
        />
      ))}
      {lessons.length === 0 && (
        <p className="text-xs text-gray-400 text-center">Drop lesson here</p>
      )}
    </div>
  );
}

export function ScheduleEditor(): React.ReactElement {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [changes, setChanges] = useState<Map<string, { date: string; slotNumber: number }>>(new Map());
  const [history, setHistory] = useState<typeof changes[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const queryClient = useQueryClient();
  const { data: lessons, isLoading } = useETFOLessonPlans();

  const updateSchedule = useMutation({
    mutationFn: async (updates: Array<{ lessonId: string; date: string }>) => {
      const response = await api.patch('/api/schedule/batch-update', { updates });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      toast.success('Schedule updated successfully!');
      setChanges(new Map());
      setHistory([]);
      setHistoryIndex(-1);
    },
    onError: () => {
      toast.error('Failed to update schedule');
    }
  });

  const handleDrop = useCallback((item: DragItem, targetDate: string, targetSlot: number) => {
    const { lesson, fromDate, fromSlotNumber } = item;
    
    // Don&apos;t do anything if dropping in same spot
    if (fromDate === targetDate && fromSlotNumber === targetSlot) {
      return;
    }

    // Create new changes map
    const newChanges = new Map(changes);
    
    // Set the target date for the lesson
    const targetDateTime = new Date(targetDate);
    
    newChanges.set(lesson.id, { 
      date: targetDateTime.toISOString(), 
      slotNumber: targetSlot 
    });
    
    // Update state
    setChanges(newChanges);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newChanges);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.info(`Moved "${lesson.titleFr || lesson.title}" to ${format(targetDateTime, 'MMM d')} Slot ${targetSlot}`);
  }, [changes, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setChanges(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setChanges(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    const updates = Array.from(changes.entries()).map(([lessonId, { date }]) => ({
      lessonId,
      date
    }));
    
    if (updates.length === 0) {
      toast.info('No changes to save');
      return;
    }
    
    updateSchedule.mutate(updates);
  };

  // Get week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  // Organize lessons by date and slot number
  const lessonsByDateSlot = new Map<string, Lesson[]>();
  
  if (lessons) {
    lessons.forEach((lesson: ETFOLessonPlan) => {
      // Apply pending changes
      const changeData = changes.get(lesson.id);
      const effectiveDate = changeData ? changeData.date : lesson.date;
      const effectiveSlot = changeData ? changeData.slotNumber : (lesson.slotNumber || 1);
      const lessonDate = parseISO(effectiveDate);
      
      const dateKey = format(lessonDate, 'yyyy-MM-dd');
      const key = `${dateKey}-${effectiveSlot}`;
      
      if (!lessonsByDateSlot.has(key)) {
        lessonsByDateSlot.set(key, []);
      }
      
      lessonsByDateSlot.get(key)!.push({
        ...lesson,
        unitTitle: lesson.unitPlan?.title,
        subject: lesson.unitPlan?.longRangePlan?.subject
      } as Lesson);
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Editor
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={changes.size === 0 || updateSchedule.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes ({changes.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                >
                  Next Week
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <h2 className="text-lg font-semibold">
                Week of {format(weekStart, 'MMM d, yyyy')}
              </h2>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Subjects</option>
                {Object.keys(SUBJECT_COLORS).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {changes.size > 0 && (
              <Alert className="mb-4">
                <AlertDescription>
                  You have {changes.size} unsaved changes. Click &quot;Save Changes&quot; to apply them.
                </AlertDescription>
              </Alert>
            )}

            {/* Schedule Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 w-24">Slot</th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} className="border p-2 bg-gray-50">
                        <div>{format(day, 'EEEE')}</div>
                        <div className="text-sm font-normal text-gray-600">
                          {format(day, 'MMM d')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAILY_SLOTS.map((slot) => (
                    <tr key={slot.slotNumber}>
                      <td className="border p-2 bg-gray-50">
                        <div className="font-medium">Slot {slot.slotNumber}</div>
                        <div className="text-xs text-gray-600">{slot.label}</div>
                      </td>
                      {weekDays.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const key = `${dateKey}-${slot.slotNumber}`;
                        const slotLessons = lessonsByDateSlot.get(key) || [];
                        
                        // Apply filters
                        const filteredLessons = slotLessons.filter(lesson => {
                          if (searchTerm && 
                              !lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                              !lesson.titleFr?.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return false;
                          }
                          if (filterSubject && lesson.subject !== filterSubject) {
                            return false;
                          }
                          return true;
                        });
                        
                        return (
                          <td key={day.toISOString()} className="border p-2">
                            <DailySlot
                              date={dateKey}
                              slotNumber={slot.slotNumber}
                              lessons={filteredLessons}
                              onDrop={handleDrop}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How to use the Schedule Editor:</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Drag lessons from one time slot to another to reschedule them</li>
                <li>• Use the search box to find specific lessons</li>
                <li>• Filter by subject to see only certain types of lessons</li>
                <li>• Changes are highlighted and tracked - use Undo/Redo as needed</li>
                <li>• Click &quot;Save Changes&quot; when you&apos;re happy with your adjustments</li>
                <li>• Navigate between weeks using the Previous/Next buttons</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}