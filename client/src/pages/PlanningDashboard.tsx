import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ETFOPlanningCoverage from '../components/ETFOPlanningCoverage';
import CurriculumExpectationCoverage from '../components/CurriculumExpectationCoverage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { FileText, Target, TrendingUp, Calendar, Plus } from 'lucide-react';
import { useWorkflowState } from '../hooks/useWorkflowState';

export default function PlanningDashboard() {
  const { workflowState } = useWorkflowState();
  const workflowProgress = workflowState?.progress ? 
    Math.round(workflowState.progress.reduce((acc, p) => acc + p.progressPercentage, 0) / workflowState.progress.length) : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planning Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your ETFO planning progress and curriculum coverage
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/planner/long-range">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Long-Range Plans
            </Button>
          </Link>
          <Link to="/planner/units">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4" />
              Create Unit Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowProgress}%</div>
            <p className="text-xs text-muted-foreground">ETFO workflow completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Lessons planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3d</div>
            <p className="text-xs text-muted-foreground">Unit 4 completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Coverage Tabs */}
      <Tabs defaultValue="etfo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="etfo">ETFO Planning Coverage</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="etfo" className="space-y-4">
          <ETFOPlanningCoverage />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <CurriculumExpectationCoverage />
        </TabsContent>
      </Tabs>

      {/* Helpful Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Planning Resources</CardTitle>
          <CardDescription>
            Quick links to help you complete your planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/curriculum/import" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Import Curriculum</h4>
                <p className="text-sm text-gray-600">
                  Upload PDF or DOCX files to extract curriculum expectations
                </p>
              </div>
            </Link>
            <Link to="/planner/daybook" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Daily Reflections</h4>
                <p className="text-sm text-gray-600">
                  Record daily observations and lesson reflections
                </p>
              </div>
            </Link>
            <Link to="/planner/etfo-lessons" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Lesson Templates</h4>
                <p className="text-sm text-gray-600">
                  Use ETFO-aligned templates for three-part lessons
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}