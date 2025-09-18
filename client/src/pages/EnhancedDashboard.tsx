import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, BookOpen, Target, ChevronRight,
  ArrowRight, Package, Layers, GitBranch
} from 'lucide-react';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { useLongRangePlans } from '../hooks/useLongRangePlans';
import { useUnitPlans } from '../hooks/useUnitPlans';
import { useLessonPlans } from '../hooks/useLessonPlans';
import { useAllLessonPlans } from '../hooks/useAllLessonPlans';
import { useCurriculumExpectations } from '../hooks/useCurriculumExpectations';
import { useCoverageCalculation } from '../hooks/useCoverageCalculation';
import type { LongRangePlanWithRelations } from '../hooks/useLongRangePlans';
import type { UnitPlanWithRelations } from '../hooks/useUnitPlans';
import type { ETFOLessonPlanWithRelations } from '../hooks/useLessonPlans';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Subject colors matching WeekViewPage
const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mathématiques': 'bg-green-100 text-green-800 border-green-300',
  'Sciences de la nature': 'bg-purple-100 text-purple-800 border-purple-300',
  'Arts visuels': 'bg-orange-100 text-orange-800 border-orange-300',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800 border-pink-300'
};

const SUBJECT_BADGE_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-500',
  'Mathématiques': 'bg-green-500',
  'Sciences de la nature': 'bg-purple-500',
  'Arts visuels': 'bg-orange-500',
  'Sciences humaines': 'bg-cyan-500',
  'Formation personnelle et sociale': 'bg-pink-500'
};

export function EnhancedDashboard() {
  const navigate = useNavigate();
  const { longRangePlans, loading: lrpLoading } = useLongRangePlans();
  const { unitPlans, loading: unitLoading } = useUnitPlans();
  const { lessonPlans, loading: lessonLoading } = useLessonPlans();
  const { lessonPlans: allLessonPlans } = useAllLessonPlans(); // Get ALL lessons for coverage calculation
  const { expectations, loading: expectationsLoading } = useCurriculumExpectations();
  
  // Use shared coverage calculation with ALL lessons (not just the paginated ones)
  const coverage = useCoverageCalculation(longRangePlans, expectations, allLessonPlans);
  
  const [weekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [expandedLRP, setExpandedLRP] = useState<string | null>(null);

  // Get this week's lessons
  const thisWeekLessons = lessonPlans?.filter((lesson: ETFOLessonPlanWithRelations) => {
    if (!lesson.date) return false;
    const lessonDate = new Date(lesson.date);
    const weekEnd = addDays(weekStart, 6);
    return lessonDate >= weekStart && lessonDate <= weekEnd;
  }) || [];

  // Aggregate materials for the week
  const weeklyMaterials = useMemo(() => {
    const materialsMap = new Map<string, number>();
    
    thisWeekLessons.forEach((lesson: ETFOLessonPlanWithRelations) => {
      if (lesson.materials && Array.isArray(lesson.materials)) {
        lesson.materials.forEach((material: string) => {
          if (material && material.trim()) {
            const normalizedMaterial = material.trim();
            materialsMap.set(normalizedMaterial, (materialsMap.get(normalizedMaterial) || 0) + 1);
          }
        });
      }
    });
    
    // Sort by frequency and convert to array
    return Array.from(materialsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([material, count]) => ({ material, count }));
  }, [thisWeekLessons]);

  // Group lessons by day
  const lessonsByDay = Array.from({ length: 5 }, (_, i) => {
    const dayDate = addDays(weekStart, i);
    return {
      date: dayDate,
      dayName: format(dayDate, 'EEEE'),
      lessons: thisWeekLessons.filter((lesson: ETFOLessonPlanWithRelations) => {
        const lessonDate = new Date(lesson.date!);
        return format(lessonDate, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd');
      })
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teaching Dashboard</h1>
        <p className="text-gray-600">Quick overview of your week and planning structure</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Long Range Plans</p>
                <p className="text-2xl font-bold">{longRangePlans?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unit Plans</p>
                <p className="text-2xl font-bold">50</p>
              </div>
              <Layers className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lessons</p>
                <p className="text-2xl font-bold">970</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">{coverage.coveragePercentage}%</p>
              </div>
              <div className="w-16 h-16">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${coverage.coveragePercentage * 1.5} 150`}
                    className="text-blue-500"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Week View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Week's Lessons
            </CardTitle>
            <button
              onClick={() => navigate('/planner/week')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full Week
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lessonsByDay.map((day, index) => (
                <div key={index} className={`border rounded-lg p-3 ${isToday(day.date) ? 'bg-blue-50 border-blue-300' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm">
                      {day.dayName}
                      {isToday(day.date) && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Today</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{format(day.date, 'MMM d')}</span>
                  </div>
                  
                  {day.lessons.length > 0 ? (
                    <div className="space-y-1">
                      {day.lessons.map((lesson: ETFOLessonPlanWithRelations, lessonIndex: number) => {
                        const subject = lesson.unitPlan?.longRangePlan?.subject;
                        const bgColor = subject && SUBJECT_BADGE_COLORS[subject] || 'bg-gray-400';
                        const title = lesson.titleFr || lesson.title || 'Lesson';
                        const truncatedTitle = title.length > 25 ? title.substring(0, 25) + '...' : title;
                        
                        return (
                          <div
                            key={lessonIndex}
                            className="flex items-center gap-2 text-xs"
                            title={title}
                          >
                            <span className={`w-2 h-2 rounded-full ${bgColor}`} />
                            <span className="text-gray-600">{lesson.slotNumber || lessonIndex + 1}.</span>
                            <span className="flex-1 truncate">{truncatedTitle}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No lessons scheduled</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini Hierarchy View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Planning Hierarchy
            </CardTitle>
            <button
              onClick={() => navigate('/planner/hierarchy')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full Hierarchy
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {longRangePlans?.map((lrp: LongRangePlanWithRelations) => {
                const isExpanded = expandedLRP === lrp.id;
                const lrpUnits = unitPlans?.filter((u: UnitPlanWithRelations) => u.longRangePlanId === lrp.id) || [];
                const bgColor = lrp.subject && SUBJECT_COLORS[lrp.subject]?.split(' ')[0] || 'bg-gray-50';
                
                return (
                  <div key={lrp.id} className="border rounded-lg">
                    <button
                      onClick={() => setExpandedLRP(isExpanded ? null : lrp.id)}
                      className={`w-full p-3 flex items-center justify-between hover:bg-opacity-80 transition-colors ${bgColor}`}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium text-sm">{lrp.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white bg-opacity-60 px-2 py-1 rounded">
                          {lrpUnits.length} units
                        </span>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t bg-white p-2">
                        <div className="space-y-1">
                          {lrpUnits.slice(0, 3).map((unit: UnitPlanWithRelations) => {
                            const lessonCount = unit._count?.lessonPlans || 0;
                            return (
                              <div key={unit.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <Layers className="h-3 w-3 text-gray-500" />
                                  <span className="truncate max-w-[200px]">{unit.titleFr || unit.title}</span>
                                </div>
                                <span className="text-xs text-gray-500">{lessonCount} lessons</span>
                              </div>
                            );
                          })}
                          {lrpUnits.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{lrpUnits.length - 3} more units
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Materials Summary */}
      {weeklyMaterials.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materials Needed This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyMaterials.slice(0, 10).map(({ material, count }, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{material}</span>
                  {count > 1 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {count}x
                    </span>
                  )}
                </div>
              ))}
              {weeklyMaterials.length > 10 && (
                <div className="col-span-full text-center text-sm text-gray-500 mt-2">
                  +{weeklyMaterials.length - 10} more items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}