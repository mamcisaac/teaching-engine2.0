import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Target,
  TrendingUp,
  Download,
  ChevronRight,
  BookOpen,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '../api/core/client';
import { cn } from '../utils/cn';

interface CoverageData {
  overall: {
    total: number;
    covered: number;
    uncovered: number;
    percentage: number;
  };
  bySubject: Array<{
    subject: string;
    total: number;
    covered: number;
    percentage: number;
    uncoveredExpectations: Array<{
      id: string;
      code: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }>;
  byStrand: Array<{
    subject: string;
    strand: string;
    total: number;
    covered: number;
    percentage: number;
    uncoveredExpectations: Array<{
      id: string;
      code: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }>;
}

interface UncoveredExpectation {
  id: string;
  code: string;
  description: string;
  descriptionFr?: string;
  subject: string;
  grade: number;
  strand: string;
  substrand?: string;
  priority: 'high' | 'medium' | 'low';
  suggestedDuration: number;
  suggestedActivities: string[];
}

export function CurriculumCoverageDashboard(): React.ReactElement {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Fetch coverage data
  const { data: coverageData, isLoading: loadingCoverage } = useQuery({
    queryKey: ['curriculum-coverage', selectedSubject],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      params.append('grade', '1'); // Grade 1 French Immersion
      
      const response = await apiClient.get(`/api/curriculum-coverage?${params.toString()}`);
      return response.data.data as CoverageData;
    },
  });

  // Fetch uncovered expectations
  const { data: uncoveredData, isLoading: loadingUncovered } = useQuery({
    queryKey: ['uncovered-expectations', selectedSubject, selectedPriority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedPriority !== 'all') params.append('priorityFilter', selectedPriority);
      params.append('grade', '1');
      params.append('limit', '10');
      
      const response = await apiClient.get(`/api/curriculum-coverage/uncovered?${params.toString()}`);
      return response.data.data;
    },
  });

  // Colors for charts
  const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
    covered: '#4f46e5',
    uncovered: '#e5e7eb',
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    return COLORS[priority];
  };

  const getPriorityBadgeVariant = (priority: 'high' | 'medium' | 'low'): 'default' | 'secondary' | 'destructive' => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
    }
  };

  // Export coverage report
  const handleExportReport = (): void => {
    if (!coverageData) return;

    const reportContent = {
      date: new Date().toISOString(),
      overall: coverageData.overall,
      bySubject: coverageData.bySubject,
      uncoveredCount: uncoveredData?.total || 0,
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curriculum-coverage-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Coverage report exported successfully');
  };

  // Handle quick plan navigation
  const handleQuickPlan = (expectationId: string): void => {
    navigate(`/planner/quick-lesson?expectationId=${expectationId}`);
  };

  // Calculate priority distribution
  const priorityDistribution = useMemo(() => {
    if (!uncoveredData?.expectations) return [];
    
    const dist = { high: 0, medium: 0, low: 0 };
    uncoveredData.expectations.forEach((exp: UncoveredExpectation) => {
      dist[exp.priority]++;
    });
    
    return [
      { name: 'High Priority', value: dist.high, fill: COLORS.high },
      { name: 'Medium Priority', value: dist.medium, fill: COLORS.medium },
      { name: 'Low Priority', value: dist.low, fill: COLORS.low },
    ];
  }, [uncoveredData]);

  // Calculate coverage trend (mock data for now)
  const coverageTrend = useMemo(() => {
    return [
      { month: 'Sept', coverage: 15 },
      { month: 'Oct', coverage: 28 },
      { month: 'Nov', coverage: 42 },
      { month: 'Dec', coverage: 55 },
      { month: 'Jan', coverage: coverageData?.overall.percentage || 0 },
    ];
  }, [coverageData]);

  if (loadingCoverage || loadingUncovered) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Curriculum Coverage Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Track your Grade 1 French Immersion curriculum coverage and identify gaps
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Overall Coverage Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expectations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coverageData?.overall.total || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Covered</p>
                <p className="text-2xl font-bold text-green-600">
                  {coverageData?.overall.covered || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {coverageData?.overall.uncovered || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coverage Rate</p>
                <p className={cn(
                  "text-2xl font-bold",
                  getStatusColor(coverageData?.overall.percentage || 0)
                )}>
                  {coverageData?.overall.percentage || 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bySubject">By Subject</TabsTrigger>
          <TabsTrigger value="byStrand">By Strand</TabsTrigger>
          <TabsTrigger value="uncovered">Uncovered</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Coverage Radial Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Coverage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="30%" 
                      outerRadius="90%"
                      data={[
                        {
                          name: 'Coverage',
                          value: coverageData?.overall.percentage || 0,
                          fill: '#4f46e5',
                        }
                      ]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#4f46e5"
                        background={{ fill: '#e5e7eb' }}
                      />
                      <text 
                        x="50%" 
                        y="50%" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        className="text-3xl font-bold fill-current"
                      >
                        {coverageData?.overall.percentage || 0}%
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Uncovered Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Subject Tab */}
        <TabsContent value="bySubject">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Subject Area</CardTitle>
              <CardDescription>
                Detailed breakdown of curriculum coverage for each subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {coverageData?.bySubject.map((subject) => (
                  <div key={subject.subject} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg">{subject.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {subject.covered} of {subject.total} expectations covered
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-2xl font-bold",
                          getStatusColor(subject.percentage)
                        )}>
                          {subject.percentage}%
                        </span>
                        {subject.uncoveredExpectations.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {subject.uncoveredExpectations.filter(e => e.priority === 'high').length} high priority gaps
                          </p>
                        )}
                      </div>
                    </div>
                    <Progress value={subject.percentage} className="h-3" />
                    {subject.uncoveredExpectations.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {subject.uncoveredExpectations.slice(0, 3).map((exp) => (
                          <button
                            key={exp.id}
                            onClick={() => handleQuickPlan(exp.id)}
                            className="inline-block"
                          >
                            <Badge
                              variant={getPriorityBadgeVariant(exp.priority)}
                              className="cursor-pointer"
                            >
                              {exp.code}
                            </Badge>
                          </button>
                        ))}
                        {subject.uncoveredExpectations.length > 3 && (
                          <Badge variant="secondary">
                            +{subject.uncoveredExpectations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Strand Tab */}
        <TabsContent value="byStrand">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Learning Strand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={coverageData?.byStrand.slice(0, 10)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strand" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="covered" stackId="a" fill={COLORS.covered} name="Covered" />
                    <Bar dataKey="uncovered" stackId="a" fill={COLORS.uncovered} name="Uncovered" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uncovered Expectations Tab */}
        <TabsContent value="uncovered">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Uncovered Expectations</CardTitle>
                  <CardDescription>
                    Priority expectations that need coverage in your lessons
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Subjects</option>
                    <option value="Français (Immersion)">Français</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Sciences de la nature">Sciences</option>
                    <option value="Sciences humaines">Social Studies</option>
                    <option value="Arts visuels">Arts</option>
                    <option value="Formation personnelle et sociale">FPS</option>
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uncoveredData?.expectations?.map((exp: UncoveredExpectation) => (
                  <div
                    key={exp.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getPriorityBadgeVariant(exp.priority)}>
                            {exp.priority} priority
                          </Badge>
                          <Badge variant="outline">{exp.subject}</Badge>
                          <Badge variant="outline">{exp.strand}</Badge>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{exp.code}</h4>
                        <p className="text-gray-700 text-sm mb-2">{exp.description}</p>
                        {exp.descriptionFr && (
                          <p className="text-gray-600 text-sm italic mb-2">{exp.descriptionFr}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exp.suggestedDuration} min
                          </span>
                          <span>
                            {exp.suggestedActivities.length} suggested activities
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickPlan(exp.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Quick Plan
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {uncoveredData?.hasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => navigate('/curriculum-coverage/uncovered')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      View All {uncoveredData.total} Uncovered Expectations →
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Trend</CardTitle>
              <CardDescription>
                Your curriculum coverage progress over the school year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coverageTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="coverage" 
                      stroke="#4f46e5" 
                      fill="#4f46e5" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Need to increase coverage?</h3>
              <p className="text-gray-600 text-sm mt-1">
                Use our AI-powered quick planner to create lessons for uncovered expectations
              </p>
            </div>
            <button
              onClick={() => navigate('/planner/quick-lesson')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Quick Lesson Plan
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}