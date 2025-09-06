import { format, parseISO, addDays, subDays, isValid } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Plus, FileText } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { SubPlanGenerator } from '../components/SubPlanGenerator';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useETFOLessonPlans } from '../hooks/useETFOPlanning';
import type { ETFOLessonPlan } from '../types/curriculum';

interface DailySlot {
  slotNumber: number;
  duration: number;
  label: string;
  lesson?: ETFOLessonPlan;
}

const DAILY_SLOTS = [
  { slotNumber: 1, duration: 45, label: 'Slot 1' },
  { slotNumber: 2, duration: 45, label: 'Slot 2' },
  { slotNumber: 3, duration: 45, label: 'Slot 3' },
  { slotNumber: 4, duration: 45, label: 'Slot 4' },
  { slotNumber: 5, duration: 45, label: 'Slot 5' }
];

export function DayViewPage(): React.ReactElement {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();
  const [showSubPlanGenerator, setShowSubPlanGenerator] = useState(false);
  
  const currentDate = useMemo(() => {
    if (!dateParam) return new Date();
    const parsed = parseISO(dateParam);
    return isValid(parsed) ? parsed : new Date();
  }, [dateParam]);
  
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data: dayLessons = [], isLoading } = useETFOLessonPlans({
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString()
  });
  
  const lessonsBySlot = useMemo(() => {
    const organized: Record<number, DailySlot> = {};
    
    DAILY_SLOTS.forEach(slot => {
      const lesson = dayLessons.find(l => l.slotNumber === slot.slotNumber);
      organized[slot.slotNumber] = { ...slot, lesson };
    });
    
    return organized;
  }, [dayLessons]);
  
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
              <Button 
                variant="outline" 
                onClick={() => setShowSubPlanGenerator(true)}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-300"
              >
                <FileText className="h-4 w-4" />
                Generate Sub Plan
              </Button>
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
            {Object.values(lessonsBySlot).map((slot: DailySlot) => (
              <Card 
                key={slot.slotNumber}
                className={`border-2 ${slot.lesson ? 'border-blue-200' : 'border-gray-200'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">{slot.label}</span>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        Slot {slot.slotNumber}
                      </Badge>
                    </div>
                    
                    {!slot.lesson && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                {slot.lesson && (
                  <CardContent>
                    <div className="cursor-pointer hover:opacity-80">
                      <h3 className="font-semibold text-lg mb-1">
                        {slot.lesson.titleFr || slot.lesson.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {slot.lesson.duration || 45} min
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* Substitute Plan Generator Modal */}
        {showSubPlanGenerator && (
          <SubPlanGenerator 
            date={currentDate} 
            onClose={() => setShowSubPlanGenerator(false)} 
          />
        )}
      </div>
    </div>
  );
}