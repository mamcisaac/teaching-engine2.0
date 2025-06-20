import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Users,
  BookOpen,
  Target,
  FileText,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalyticsWidget } from '@/components/analytics/AnalyticsWidget';
import { exportService } from '@/services/analytics/exportService';
import { useToast } from '@/hooks/use-toast';

const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Get current filters from URL params
  const currentTab = searchParams.get('tab') || 'overview';
  const selectedTerm = searchParams.get('term') || 'current';
  const selectedSubject = searchParams.get('subject') || 'all';

  // Mock teacher and student IDs - in real app, these would come from auth context
  const teacherId = 1;
  const studentIds = [1, 2, 3, 4, 5]; // Mock student IDs for class view

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set('tab', value);
      return prev;
    });
  };

  const handleTermChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set('term', value);
      return prev;
    });
  };

  const handleSubjectChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set('subject', value);
      return prev;
    });
  };

  const handleExport = async (type: string, format: 'pdf' | 'csv' | 'png') => {
    try {
      await exportService.exportData({
        type,
        format,
        data: {
          teacherId,
          term: selectedTerm,
          subject: selectedSubject === 'all' ? undefined : selectedSubject,
        },
      });
      toast({
        title: 'Export Successful',
        description: `${type} exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track student progress, curriculum coverage, and teaching insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Term Filter */}
              <Select value={selectedTerm} onValueChange={handleTermChange}>
                <SelectTrigger className="w-32">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                  <SelectItem value="year">Full Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Subject Filter */}
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="language">Language Arts</SelectItem>
                  <SelectItem value="social">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="curriculum">
              <BookOpen className="mr-2 h-4 w-4" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="themes">
              <Target className="mr-2 h-4 w-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="vocabulary">
              <FileText className="mr-2 h-4 w-4" />
              Vocabulary
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Quick Stats Cards */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Curriculum Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">+12% from last term</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Well balanced</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Vocabulary Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+245</div>
                  <p className="text-xs text-muted-foreground">Words this term</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Student Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground">On track</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Overview Widgets */}
            <div className="grid gap-6 lg:grid-cols-2">
              <AnalyticsWidget
                type="curriculum-heatmap"
                teacherId={teacherId}
                subject={selectedSubject === 'all' ? undefined : selectedSubject}
                size="large"
                title="Outcome Coverage Overview"
                className="h-96"
              />

              <AnalyticsWidget
                type="theme-analytics"
                teacherId={teacherId}
                size="large"
                title="Theme Distribution"
                className="h-96"
              />
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Curriculum Coverage Analysis</CardTitle>
                    <CardDescription>
                      Detailed view of outcome coverage across time periods
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('curriculum-heatmap', 'pdf')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnalyticsWidget
                  type="curriculum-heatmap"
                  teacherId={teacherId}
                  subject={selectedSubject === 'all' ? undefined : selectedSubject}
                  size="full"
                  showExport={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sample student domain progress cards */}
              {studentIds.slice(0, 4).map((studentId) => (
                <Card key={studentId}>
                  <CardHeader>
                    <CardTitle className="text-lg">Student {studentId} Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalyticsWidget
                      type="domain-radar"
                      studentId={studentId}
                      size="medium"
                      showExport={true}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Theme Usage Analytics</CardTitle>
                    <CardDescription>
                      Analyze how themes are distributed across your curriculum
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('theme-analytics', 'csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnalyticsWidget
                  type="theme-analytics"
                  teacherId={teacherId}
                  size="full"
                  title=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vocabulary Growth Tracking</CardTitle>
                    <CardDescription>
                      Monitor vocabulary acquisition and bilingual development
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('vocabulary-growth', 'pdf')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnalyticsWidget
                  type="vocabulary-growth"
                  studentId={studentIds[0]} // Show first student as example
                  size="full"
                />
              </CardContent>
            </Card>

            {/* Class vocabulary overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {studentIds.slice(0, 3).map((studentId) => (
                <Card key={studentId}>
                  <CardHeader>
                    <CardTitle className="text-sm">Student {studentId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalyticsWidget
                      type="mini-vocabulary-stats"
                      studentId={studentId}
                      size="small"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-blue-900">Analytics Tips</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• Use filters to focus on specific terms or subjects</li>
            <li>• Export visualizations for parent meetings or reports</li>
            <li>• Click on any chart element for detailed information</li>
            <li>• Analytics update automatically as you add new data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
