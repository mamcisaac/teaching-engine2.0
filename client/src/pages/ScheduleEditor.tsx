import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { 
  Calendar, GripVertical, Save, Undo, Redo, 
  ChevronLeft, ChevronRight, Filter, Search 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/core/client';

interface Lesson {
  id: string;
  title: string;
  titleFr: string;
  date: string;
  unitPlanId: string;
  unitTitle?: string;
  subject?: string;
}

interface DragItem {
  lesson: Lesson;
  fromDate: string;
  fromTimeSlot: number;
}

const TIME_SLOTS = [
  { time: '08:45', label: 'Block 1', subject: 'Français (Immersion)' },
  { time: '09:30', label: 'Block 2', subject: 'Mathématiques' },
  { time: '10:30', label: 'Block 3', subject: 'Sciences de la nature' },
  { time: '11:15', label: 'Block 4', subject: 'Arts visuels' },
  { time: '13:00', label: 'Block 5', subject: 'Rotating' }
];

const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 border-blue-300',
  'Mathématiques': 'bg-green-100 border-green-300',
  'Sciences de la nature': 'bg-yellow-100 border-yellow-300',
  'Arts visuels': 'bg-purple-100 border-purple-300',
  'Sciences humaines': 'bg-orange-100 border-orange-300',
  'Formation personnelle et sociale': 'bg-pink-100 border-pink-300'
};

function LessonCard({ lesson, fromDate, fromTimeSlot }: { 
  lesson: Lesson; 
  fromDate: string; 
  fromTimeSlot: number;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'lesson',
    item: { lesson, fromDate, fromTimeSlot } as DragItem,
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

function TimeSlot({ 
  date, 
  timeSlot, 
  lessons, 
  onDrop 
}: { 
  date: string; 
  timeSlot: number; 
  lessons: Lesson[];
  onDrop: (item: DragItem, targetDate: string, targetSlot: number) => void;
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'lesson',
    drop: (item: DragItem) => {
      onDrop(item, date, timeSlot);
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
          fromTimeSlot={timeSlot}
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
  const [changes, setChanges] = useState<Map<string, { date: string; timeSlot: number }>>(new Map());
  const [history, setHistory] = useState<typeof changes[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const queryClient = useQueryClient();
  const { data: lessons, isLoading } = useETFOLessonPlans();

  const updateSchedule = useMutation({
    mutationFn: async (updates: Array<{ lessonId: string; date: string }>) => {
      const response = await apiClient.patch('/api/schedule/batch-update', { updates });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
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
    const { lesson, fromDate, fromTimeSlot } = item;
    
    // Don't do anything if dropping in same spot
    if (fromDate === targetDate && fromTimeSlot === targetSlot) {
      return;
    }

    // Create new changes map
    const newChanges = new Map(changes);
    
    // Calculate new datetime
    const targetDateTime = new Date(targetDate);
    const [hours, minutes] = TIME_SLOTS[targetSlot].time.split(':').map(Number);
    targetDateTime.setHours(hours, minutes, 0, 0);
    
    newChanges.set(lesson.id, { 
      date: targetDateTime.toISOString(), 
      timeSlot: targetSlot 
    });
    
    // Update state
    setChanges(newChanges);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newChanges);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    toast.info(`Moved "${lesson.titleFr || lesson.title}" to ${format(targetDateTime, 'MMM d, h:mm a')}`);
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

  // Organize lessons by date and time slot
  const lessonsByDateTime = new Map<string, Lesson[]>();
  
  if (lessons) {
    lessons.forEach((lesson: any) => {
      // Apply pending changes
      const changeData = changes.get(lesson.id);
      const effectiveDate = changeData ? changeData.date : lesson.date;
      const lessonDate = parseISO(effectiveDate);
      
      // Determine time slot based on time
      const hours = lessonDate.getHours();
      const minutes = lessonDate.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      let timeSlot = TIME_SLOTS.findIndex(slot => slot.time === timeStr);
      if (timeSlot === -1) {
        // Find closest time slot
        timeSlot = 0;
        for (let i = 0; i < TIME_SLOTS.length; i++) {
          const [slotHours, slotMinutes] = TIME_SLOTS[i].time.split(':').map(Number);
          if (hours < slotHours || (hours === slotHours && minutes <= slotMinutes)) {
            timeSlot = i;
            break;
          }
        }
      }
      
      const dateKey = format(lessonDate, 'yyyy-MM-dd');
      const key = `${dateKey}-${timeSlot}`;
      
      if (!lessonsByDateTime.has(key)) {
        lessonsByDateTime.set(key, []);
      }
      
      lessonsByDateTime.get(key)!.push({
        id: lesson.id,
        title: lesson.title,
        titleFr: lesson.titleFr,
        date: lesson.date,
        unitPlanId: lesson.unitPlanId,
        unitTitle: lesson.unitPlan?.title,
        subject: lesson.unitPlan?.longRangePlan?.subject
      });
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
              <div className="flex-1">
                <Input
                  placeholder="Search lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
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
                  You have {changes.size} unsaved changes. Click "Save Changes" to apply them.
                </AlertDescription>
              </Alert>
            )}

            {/* Schedule Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 w-24">Time</th>
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
                  {TIME_SLOTS.map((slot, slotIndex) => (
                    <tr key={slot.time}>
                      <td className="border p-2 bg-gray-50">
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-xs text-gray-600">{slot.label}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {slot.subject}
                        </Badge>
                      </td>
                      {weekDays.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const key = `${dateKey}-${slotIndex}`;
                        const slotLessons = lessonsByDateTime.get(key) || [];
                        
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
                            <TimeSlot
                              date={dateKey}
                              timeSlot={slotIndex}
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
                <li>• Click "Save Changes" when you're happy with your adjustments</li>
                <li>• Navigate between weeks using the Previous/Next buttons</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}