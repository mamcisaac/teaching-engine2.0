import React, { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Plus } from 'lucide-react';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface DaySchedule {
  date: Date;
  dateStr: string;
  lessons: any[];
}

const TIME_BLOCKS = [
  { time: '08:45', label: 'Block 1 - Français', subject: 'Français (Immersion)' },
  { time: '09:30', label: 'Block 2 - Mathématiques', subject: 'Mathématiques' },
  { time: '10:30', label: 'Block 3 - Sciences', subject: 'Sciences de la nature' },
  { time: '11:15', label: 'Block 4 - Arts', subject: 'Arts visuels' },
  { time: '13:00', label: 'Block 5 - Social/Health', subject: 'rotating' }
];

const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences de la nature': 'bg-purple-100 text-purple-800 border-purple-300',
  'Arts visuels': 'bg-orange-100 text-orange-800 border-orange-300',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800 border-pink-300'
};

export function WeekViewPage(): React.ReactElement {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekEnd = addDays(weekStart, 4); // Friday
  
  // Fetch lessons for the entire week
  const { data: weekLessons = [], isLoading } = useETFOLessonPlans({
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString()
  });
  
  // Organize lessons by day
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
  
  const handleCreateLesson = (date: Date, timeBlock: any) => {
    // Navigate to lesson creation with pre-filled date and subject
    navigate(`/planner/quick-lesson?date=${format(date, 'yyyy-MM-dd')}&subject=${timeBlock.subject}`);
  };
  
  return (
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
              <Button variant="outline" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" onClick={handleNextWeek}>
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
        
        {/* Week Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-6 border-b">
              <div className="p-3 bg-gray-50 font-semibold text-gray-700 border-r">
                Time
              </div>
              {weekSchedule.map((day) => (
                <div 
                  key={day.dateStr}
                  className="p-3 bg-gray-50 font-semibold text-gray-700 border-r last:border-r-0 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleDayClick(day.date)}
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
            
            {/* Time Blocks */}
            {TIME_BLOCKS.map((timeBlock) => (
              <div key={timeBlock.time} className="grid grid-cols-6 border-b last:border-b-0">
                <div className="p-3 bg-gray-50 font-medium text-sm text-gray-700 border-r">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {timeBlock.time}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {timeBlock.label}
                  </div>
                </div>
                
                {weekSchedule.map((day) => {
                  // Find lesson for this time block
                  const subject = timeBlock.subject === 'rotating' 
                    ? (day.date.getDate() % 2 === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale')
                    : timeBlock.subject;
                  
                  const lesson = day.lessons.find(l => {
                    // Match by subject from unit plan
                    return l.unitPlan?.longRangePlan?.subject === subject;
                  });
                  
                  return (
                    <div 
                      key={`${day.dateStr}-${timeBlock.time}`}
                      className="p-2 border-r last:border-r-0 hover:bg-gray-50 min-h-[100px]"
                    >
                      {lesson ? (
                        <div 
                          className={`p-2 rounded cursor-pointer ${SUBJECT_COLORS[subject] || 'bg-gray-100'}`}
                          onClick={() => handleLessonClick(lesson.id)}
                        >
                          <div className="font-medium text-xs mb-1">
                            {lesson.titleFr || lesson.title}
                          </div>
                          <div className="text-xs opacity-75">
                            {lesson.duration} min
                          </div>
                        </div>
                      ) : (
                        <button
                          className="w-full h-full p-2 border-2 border-dashed border-gray-300 rounded hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center text-gray-400 hover:text-indigo-600"
                          onClick={() => handleCreateLesson(day.date, { ...timeBlock, subject })}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
  );
}