import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { BookOpen, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCurriculumExpectations, useUnitPlans, useETFOLessonPlans } from '../hooks/useETFOPlanning';

interface StrandCoverage {
  strand: string;
  total: number;
  covered: number;
  percentage: number;
}

interface GradeCoverage {
  grade: number;
  subjects: {
    subject: string;
    total: number;
    covered: number;
    percentage: number;
  }[];
}

export default function CurriculumExpectationCoverage() {
  // Fetch data
  const { data: expectations = [] } = useCurriculumExpectations();
  const { data: unitPlans = [] } = useUnitPlans();
  const { data: lessonPlans = [] } = useETFOLessonPlans();

  // Calculate coverage metrics
  const coverageMetrics = useMemo(() => {
    // Get all expectation IDs that are covered in units or lessons
    const coveredExpectationIds = new Set<string>();
    
    // From unit plans
    unitPlans.forEach(unit => {
      unit.expectations?.forEach(exp => {
        coveredExpectationIds.add(exp.expectation.id);
      });
    });
    
    // From lesson plans
    lessonPlans.forEach(lesson => {
      lesson.expectations?.forEach(exp => {
        coveredExpectationIds.add(exp.expectation.id);
      });
    });

    // Group expectations by subject and strand
    const bySubject: Record<string, typeof expectations> = {};
    const byStrand: Record<string, typeof expectations> = {};
    const byGrade: Record<number, Record<string, typeof expectations>> = {};

    expectations.forEach(exp => {
      // By subject
      if (!bySubject[exp.subject]) {
        bySubject[exp.subject] = [];
      }
      bySubject[exp.subject].push(exp);

      // By strand
      const strand = exp.strand || 'Other';
      if (!byStrand[strand]) {
        byStrand[strand] = [];
      }
      byStrand[strand].push(exp);

      // By grade and subject
      if (!byGrade[exp.grade]) {
        byGrade[exp.grade] = {};
      }
      if (!byGrade[exp.grade][exp.subject]) {
        byGrade[exp.grade][exp.subject] = [];
      }
      byGrade[exp.grade][exp.subject].push(exp);
    });

    // Calculate coverage by subject
    const subjectCoverage = Object.entries(bySubject).map(([subject, exps]) => {
      const covered = exps.filter(exp => coveredExpectationIds.has(exp.id)).length;
      return {
        subject,
        total: exps.length,
        covered,
        percentage: Math.round((covered / exps.length) * 100)
      };
    });

    // Calculate coverage by strand
    const strandCoverage: StrandCoverage[] = Object.entries(byStrand).map(([strand, exps]) => {
      const covered = exps.filter(exp => coveredExpectationIds.has(exp.id)).length;
      return {
        strand,
        total: exps.length,
        covered,
        percentage: Math.round((covered / exps.length) * 100)
      };
    });

    // Calculate coverage by grade
    const gradeCoverage: GradeCoverage[] = Object.entries(byGrade).map(([grade, subjects]) => {
      const subjectData = Object.entries(subjects).map(([subject, exps]) => {
        const covered = exps.filter(exp => coveredExpectationIds.has(exp.id)).length;
        return {
          subject,
          total: exps.length,
          covered,
          percentage: Math.round((covered / exps.length) * 100)
        };
      });

      return {
        grade: Number(grade),
        subjects: subjectData
      };
    }).sort((a, b) => a.grade - b.grade);

    // Overall metrics
    const totalExpectations = expectations.length;
    const coveredExpectations = expectations.filter(exp => coveredExpectationIds.has(exp.id)).length;
    const overallPercentage = totalExpectations > 0 ? Math.round((coveredExpectations / totalExpectations) * 100) : 0;

    // Find gaps (uncovered expectations grouped by priority)
    const uncoveredExpectations = expectations.filter(exp => !coveredExpectationIds.has(exp.id));
    // For now, treat all gaps as regular priority since we don't have type classification
    const highPriorityGaps: typeof expectations = [];
    const regularGaps = uncoveredExpectations;

    return {
      overall: {
        total: totalExpectations,
        covered: coveredExpectations,
        percentage: overallPercentage
      },
      bySubject: subjectCoverage,
      byStrand: strandCoverage,
      byGrade: gradeCoverage,
      gaps: {
        highPriority: highPriorityGaps,
        regular: regularGaps
      }
    };
  }, [expectations, unitPlans, lessonPlans]);

  // Colors for charts
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899'];

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Coverage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Curriculum Expectation Coverage</CardTitle>
          <CardDescription>
            Track how well your lesson plans cover the Ontario curriculum expectations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600">
                {coverageMetrics.overall.covered}
              </div>
              <div className="text-sm text-gray-600">Expectations Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-400">
                {coverageMetrics.overall.total - coverageMetrics.overall.covered}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getStatusColor(coverageMetrics.overall.percentage)}`}>
                {coverageMetrics.overall.percentage}%
              </div>
              <div className="text-sm text-gray-600">Overall Coverage</div>
            </div>
          </div>
          <Progress value={coverageMetrics.overall.percentage} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Coverage Visualizations */}
      <Tabs defaultValue="subject" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subject">By Subject</TabsTrigger>
          <TabsTrigger value="strand">By Strand</TabsTrigger>
          <TabsTrigger value="grade">By Grade</TabsTrigger>
          <TabsTrigger value="gaps">Coverage Gaps</TabsTrigger>
        </TabsList>

        <TabsContent value="subject">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  {coverageMetrics.bySubject.map(subject => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject.subject}</span>
                        <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
                          {subject.percentage}%
                        </span>
                      </div>
                      <Progress value={subject.percentage} className="h-2" />
                      <div className="text-sm text-gray-600">
                        {subject.covered} of {subject.total} expectations covered
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coverageMetrics.bySubject}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ subject, percentage }) => `${subject}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="covered"
                      >
                        {coverageMetrics.bySubject.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strand">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Strand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={coverageMetrics.byStrand}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="strand" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="covered" fill="#4f46e5" name="Covered" />
                    <Bar dataKey="total" fill="#e5e7eb" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grade">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Grade Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {coverageMetrics.byGrade.map(grade => (
                  <div key={grade.grade} className="space-y-3">
                    <h4 className="text-lg font-semibold">Grade {grade.grade}</h4>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {grade.subjects.map(subject => (
                        <div key={subject.subject} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{subject.subject}</span>
                            <Badge variant={subject.percentage >= 80 ? "default" : subject.percentage >= 60 ? "secondary" : "destructive"}>
                              {subject.percentage}%
                            </Badge>
                          </div>
                          <Progress value={subject.percentage} className="h-2" />
                          <div className="text-xs text-gray-600 mt-1">
                            {subject.covered}/{subject.total} covered
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Coverage Gaps Analysis
              </CardTitle>
              <CardDescription>
                Curriculum expectations not yet covered in your planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* High Priority Gaps */}
                {coverageMetrics.gaps.highPriority.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">
                      High Priority Expectations ({coverageMetrics.gaps.highPriority.length})
                    </h4>
                    <div className="space-y-2">
                      {coverageMetrics.gaps.highPriority.slice(0, 5).map(exp => (
                        <div key={exp.id} className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {exp.code} - {exp.subject} Grade {exp.grade}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {exp.description}
                              </div>
                            </div>
                            <Badge variant="destructive" className="ml-2">
                              Regular
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {coverageMetrics.gaps.highPriority.length > 5 && (
                        <div className="text-sm text-gray-600 text-center">
                          +{coverageMetrics.gaps.highPriority.length - 5} more high priority gaps
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Regular Gaps */}
                {coverageMetrics.gaps.regular.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-3">
                      Regular Expectations ({coverageMetrics.gaps.regular.length})
                    </h4>
                    <div className="space-y-2">
                      {coverageMetrics.gaps.regular.slice(0, 5).map(exp => (
                        <div key={exp.id} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {exp.code} - {exp.subject} Grade {exp.grade}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {exp.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {coverageMetrics.gaps.regular.length > 5 && (
                        <div className="text-sm text-gray-600 text-center">
                          +{coverageMetrics.gaps.regular.length - 5} more regular gaps
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Gaps Message */}
                {coverageMetrics.gaps.highPriority.length === 0 && coverageMetrics.gaps.regular.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-lg font-medium text-green-600">Excellent Coverage!</p>
                    <p className="text-gray-600">All curriculum expectations are covered in your planning.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}