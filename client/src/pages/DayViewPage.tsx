import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, addDays, subDays, isValid } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const TIME_BLOCKS = [
  { time: '08:45', duration: 45, label: 'Block 1 - Français', subject: 'Français (Immersion)' },
  { time: '09:30', duration: 45, label: 'Block 2 - Mathématiques', subject: 'Mathématiques' },
  { time: '10:30', duration: 45, label: 'Block 3 - Sciences', subject: 'Sciences de la nature' },
  { time: '11:15', duration: 45, label: 'Block 4 - Arts', subject: 'Arts visuels' },
  { time: '13:00', duration: 45, label: 'Block 5 - Social/Health', subject: 'rotating' }
];

const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-50 text-blue-800 border-blue-200',
  'Mathématiques': 'bg-green-50 text-green-800 border-green-200',
  'Sciences de la nature': 'bg-purple-50 text-purple-800 border-purple-200',
  'Arts visuels': 'bg-orange-50 text-orange-800 border-orange-200',
  'Sciences humaines': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  'Formation personnelle et sociale': 'bg-pink-50 text-pink-800 border-pink-200'
};

export function DayViewPage(): React.ReactElement {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  
  // Parse the date correctly - this ensures we show the right day
  const currentDate = useMemo(() => {
    if (!dateParam) return new Date();
    const parsed = parseISO(dateParam);
    return isValid(parsed) ? parsed : new Date();
  }, [dateParam]);
  
  // Fetch lessons for this specific day
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data: dayLessons = [], isLoading } = useETFOLessonPlans({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString()
  });
  
  // Organize lessons by time block
  const lessonsByBlock = useMemo(() => {
    const organized: Record<string, any> = {};
    
    TIME_BLOCKS.forEach(block => {
      const subject = block.subject === 'rotating' 
        ? (currentDate.getDate() % 2 === 0 ? 'Sciences humaines' : 'Formation personnelle et sociale')
        : block.subject;
      
      // Find lesson for this subject
      const lesson = dayLessons.find(l => 
        l.unitPlan?.longRangePlan?.subject === subject
      );
      
      organized[block.time] = {
        ...block,
        subject,
        lesson
      };
    });
    
    return organized;
  }, [dayLessons, currentDate]);
  
  const handlePreviousDay = () => {
    const prevDay = subDays(currentDate, 1);
    navigate(`/planner/day/${format(prevDay, 'yyyy-MM-dd')}`);
  };
  
  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    navigate(`/planner/day/${format(nextDay, 'yyyy-MM-dd')}`);
  };
  
  const handleToday = () => {
    const today = new Date();
    navigate(`/planner/day/${format(today, 'yyyy-MM-dd')}`);
  };
  
  const handleLessonClick = (lessonId: string) => {
    navigate(`/planner/lessons/${lessonId}`);
  };
  
  const handleCreateLesson = (timeBlock: any) => {
    navigate(`/planner/quick-lesson?date=${format(currentDate, 'yyyy-MM-dd')}&subject=${timeBlock.subject}&time=${timeBlock.time}`);
  };
  
  const handleEditLesson = (lessonId: string) => {
    navigate(`/planner/lessons/${lessonId}/edit`);
  };
  
  const totalLessons = dayLessons.length;
  const totalDuration = dayLessons.reduce((sum, lesson) => sum + (lesson.duration || 45), 0);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/planner/week')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Week View
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
        
        {/* Day Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Total Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalLessons}/5</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Teaching Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalDuration} min</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((totalLessons / 5) * 100)}%
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Daily Schedule */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(lessonsByBlock).map((block: any) => (
              <Card 
                key={block.time}
                className={`border-2 ${block.lesson ? SUBJECT_COLORS[block.subject] : 'border-gray-200'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">{block.time}</span>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {block.label}
                      </Badge>
                    </div>
                    
                    {block.lesson ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLesson(block.lesson.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLessonClick(block.lesson.id)}
                        >
                          View
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateLesson(block)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                {block.lesson && (
                  <CardContent>
                    <div 
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => handleLessonClick(block.lesson.id)}
                    >
                      <h3 className="font-semibold text-lg mb-1">
                        {block.lesson.titleFr || block.lesson.title}
                      </h3>
                      {block.lesson.title !== block.lesson.titleFr && (
                        <p className="text-sm opacity-75 mb-2">{block.lesson.title}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {block.lesson.learningGoalsFr && (
                          <Badge variant="secondary" className="text-xs">
                            {block.lesson.learningGoalsFr.length} objectifs
                          </Badge>
                        )}
                        {block.lesson.materials && block.lesson.materials.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {block.lesson.materials.length} matériaux
                          </Badge>
                        )}
                        {block.lesson.assessmentType && (
                          <Badge variant="secondary" className="text-xs">
                            {block.lesson.assessmentType}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {block.lesson.duration || 45} min
                        </Badge>
                      </div>
                      
                      {block.lesson.mindsOnFr && (
                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                          <p className="text-xs font-semibold mb-1">Mise en train:</p>
                          <p className="text-sm">{block.lesson.mindsOnFr}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate(`/planner/quick-lesson?date=${format(currentDate, 'yyyy-MM-dd')}`)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Lesson for Today
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/planner/units')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                View Unit Plans
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                Print Day Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}