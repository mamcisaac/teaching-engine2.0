import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, AlertCircle, TrendingUp, Calendar, Clock, Target, Users } from 'lucide-react';
import { useLongRangePlans, useUnitPlans, useETFOLessonPlans, useDaybookEntries } from '../hooks/useETFOPlanning';
import { useETFOProgress } from '../hooks/useETFOProgress';

interface PlanningLevel {
  name: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  description: string;
}

export default function ETFOPlanningCoverage() {
  // Fetch data for all planning levels
  const { data: longRangePlans = [] } = useLongRangePlans();
  const { data: unitPlans = [] } = useUnitPlans();
  const { data: lessonPlans = [] } = useETFOLessonPlans();
  const { data: daybookEntries = [] } = useDaybookEntries();
  const { progressData } = useETFOProgress();

  // Calculate coverage for each planning level
  const planningLevels: PlanningLevel[] = [
    {
      name: 'Long-Range Plans',
      icon: <Calendar className="h-5 w-5" />,
      total: 8, // Assuming 8 subjects for elementary
      completed: longRangePlans.filter(p => p.goals && (p.themes?.length || 0) > 0).length,
      inProgress: longRangePlans.filter(p => p.goals && !(p.themes?.length || 0)).length,
      notStarted: 8 - longRangePlans.length,
      description: 'Year-long curriculum organization by subject'
    },
    {
      name: 'Unit Plans',
      icon: <Target className="h-5 w-5" />,
      total: longRangePlans.reduce((sum, lrp) => sum + (lrp._count?.unitPlans || 0) + 5, 0), // Expected units
      completed: unitPlans.filter(u => u.bigIdeas && u.assessmentPlan && (u.successCriteria?.length || 0) > 0).length,
      inProgress: unitPlans.filter(u => u.bigIdeas && (!u.assessmentPlan || !(u.successCriteria?.length || 0))).length,
      notStarted: unitPlans.filter(u => !u.bigIdeas).length,
      description: '3-6 week thematic units with big ideas and assessments'
    },
    {
      name: 'Lesson Plans',
      icon: <Clock className="h-5 w-5" />,
      total: unitPlans.reduce((sum, unit) => sum + (unit.estimatedHours || 20), 0), // Estimated lessons needed
      completed: lessonPlans.filter(l => l.mindsOn && l.action && l.consolidation).length,
      inProgress: lessonPlans.filter(l => (l.mindsOn || l.action || l.consolidation) && !(l.mindsOn && l.action && l.consolidation)).length,
      notStarted: lessonPlans.filter(l => !l.mindsOn && !l.action && !l.consolidation).length,
      description: 'Daily lessons with three-part structure'
    },
    {
      name: 'Daybook Reflections',
      icon: <Users className="h-5 w-5" />,
      total: lessonPlans.length, // One reflection per lesson
      completed: daybookEntries.filter(d => d.whatWorked && d.nextSteps).length,
      inProgress: daybookEntries.filter(d => (d.whatWorked || d.nextSteps) && !(d.whatWorked && d.nextSteps)).length,
      notStarted: lessonPlans.length - daybookEntries.length,
      description: 'Daily reflections and student observations'
    }
  ];

  const calculatePercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  // Calculate overall progress
  const overallTotal = planningLevels.reduce((sum, level) => sum + level.total, 0);
  const overallCompleted = planningLevels.reduce((sum, level) => sum + level.completed, 0);
  const overallPercentage = calculatePercentage(overallCompleted, overallTotal);

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ETFO Planning Coverage Dashboard</CardTitle>
          <CardDescription>
            Track your progress across all five levels of ETFO-aligned planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Progress</span>
              <span className={`text-2xl font-bold ${getStatusColor(overallPercentage)}`}>
                {overallPercentage}%
              </span>
            </div>
            <Progress value={overallPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overallCompleted}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {planningLevels.reduce((sum, level) => sum + level.inProgress, 0)}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {planningLevels.reduce((sum, level) => sum + level.notStarted, 0)}
                </div>
                <div className="text-sm text-gray-600">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning Levels Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {planningLevels.map((level) => {
          const percentage = calculatePercentage(level.completed, level.total);
          return (
            <Card key={level.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {level.icon}
                    <CardTitle className="text-lg">{level.name}</CardTitle>
                  </div>
                  <Badge variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "destructive"}>
                    {percentage}%
                  </Badge>
                </div>
                <CardDescription>{level.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={percentage} className="h-2" />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{level.completed} Complete</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span>{level.inProgress} In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Circle className="h-4 w-4 text-gray-400" />
                      <span>{level.notStarted} Not Started</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Coverage by Subject/Grade */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage by Subject & Grade</CardTitle>
          <CardDescription>
            Detailed breakdown of planning coverage across subjects and grade levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subject" className="space-y-4">
            <TabsList>
              <TabsTrigger value="subject">By Subject</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="subject" className="space-y-4">
              {/* Group plans by subject */}
              {Object.entries(
                longRangePlans.reduce((acc, plan) => {
                  if (!acc[plan.subject]) {
                    acc[plan.subject] = [];
                  }
                  acc[plan.subject].push(plan);
                  return acc;
                }, {} as Record<string, typeof longRangePlans>)
              ).map(([subject, plans]) => (
                <div key={subject} className="space-y-2">
                  <h4 className="font-medium">{subject}</h4>
                  <div className="grid gap-2">
                    {plans.map((plan) => {
                      const planUnits = unitPlans.filter(u => u.longRangePlanId === plan.id);
                      const unitPercentage = plan._count?.unitPlans ? 
                        calculatePercentage(planUnits.length, plan._count.unitPlans) : 0;
                      
                      return (
                        <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">Grade {plan.grade}</span>
                            <span className="text-sm text-gray-600 ml-2">{plan.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="text-gray-600">Units: </span>
                              <span className="font-medium">{planUnits.length}/{plan._count?.unitPlans || '?'}</span>
                            </div>
                            <Progress value={unitPercentage} className="w-24 h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="text-center text-gray-600">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Timeline visualization showing planning progress over the school year</p>
                <p className="text-sm mt-2">This feature helps track which units are planned for each month</p>
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Planning Gaps Identified
                </h4>
                
                {/* Show units without lesson plans */}
                {unitPlans.filter(unit => {
                  const unitLessons = lessonPlans.filter(l => l.unitPlanId === unit.id);
                  return unitLessons.length === 0;
                }).map(unit => (
                  <div key={unit.id} className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{unit.title}</span>
                        <span className="text-sm text-gray-600 ml-2">No lesson plans created</span>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100">
                        Needs Attention
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Show lessons without reflections */}
                {lessonPlans.filter(lesson => {
                  const hasReflection = daybookEntries.some(d => 
                    new Date(d.date).toDateString() === new Date(lesson.date).toDateString()
                  );
                  return !hasReflection;
                }).slice(0, 5).map(lesson => (
                  <div key={lesson.id} className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{lesson.title}</span>
                        <span className="text-sm text-gray-600 ml-2">Missing daybook reflection</span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100">
                        No Reflection
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Progress Insights */}
      {progressData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Planning Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((overallCompleted / Math.max(overallTotal, 1)) * 40)}h
                </div>
                <div className="text-sm text-gray-600">Weekly Planning Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {overallPercentage}%
                </div>
                <div className="text-sm text-gray-600">On-Time Completion</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((daybookEntries.length / Math.max(lessonPlans.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Reflection Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}