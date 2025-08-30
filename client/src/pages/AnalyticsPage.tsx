import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subject: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  evidenceType: 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  hasIEP: boolean;
}

interface SubjectStats {
  subject: string;
  totalAssessments: number;
  averageLevel: number;
  distribution: {
    NOT_YET: number;
    APPROACHING: number;
    MEETING: number;
    EXCEEDING: number;
  };
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  hasIEP: boolean;
  totalAssessments: number;
  averageLevel: number;
  trend: 'improving' | 'stable' | 'declining';
  recentLevel: string;
  subjects: {
    [key: string]: {
      count: number;
      averageLevel: number;
      lastAssessment: string;
    };
  };
}

const LEVEL_VALUES = {
  NOT_YET: 1,
  APPROACHING: 2,
  MEETING: 3,
  EXCEEDING: 4
};

const LEVEL_COLORS = {
  NOT_YET: 'red',
  APPROACHING: 'yellow',
  MEETING: 'green',
  EXCEEDING: 'blue'
};

export function AnalyticsPage(): React.ReactElement {
  const [assessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('assessment-records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [students] = useState<Student[]>(() => {
    const saved = localStorage.getItem('assessment-students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'students' | 'subjects' | 'trends'>('overview');
  
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [classAverage, setClassAverage] = useState(0);

  useEffect(() => {
    calculateAnalytics();
  }, [assessments, selectedDateRange, selectedSubject]);

  const calculateAnalytics = () => {
    // Filter assessments by date range
    const now = new Date();
    const filteredAssessments = assessments.filter(a => {
      const assessmentDate = new Date(a.date);
      const daysDiff = Math.floor((now.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (selectedDateRange) {
        case 'today': return daysDiff === 0;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        case 'term': return daysDiff <= 90;
        default: return true;
      }
    });

    // Calculate subject stats
    const subjects = [...new Set(filteredAssessments.map(a => a.subject))];
    const stats: SubjectStats[] = subjects.map(subject => {
      const subjectAssessments = filteredAssessments.filter(a => a.subject === subject);
      const distribution = {
        NOT_YET: 0,
        APPROACHING: 0,
        MEETING: 0,
        EXCEEDING: 0
      };
      
      let totalLevel = 0;
      subjectAssessments.forEach(a => {
        distribution[a.level]++;
        totalLevel += LEVEL_VALUES[a.level];
      });
      
      return {
        subject,
        totalAssessments: subjectAssessments.length,
        averageLevel: subjectAssessments.length > 0 ? totalLevel / subjectAssessments.length : 0,
        distribution
      };
    });
    
    setSubjectStats(stats);

    // Calculate student progress
    const progress: StudentProgress[] = students.map(student => {
      const studentAssessments = filteredAssessments.filter(a => a.studentId === student.id);
      const subjects: StudentProgress['subjects'] = {};
      
      let totalLevel = 0;
      studentAssessments.forEach(a => {
        totalLevel += LEVEL_VALUES[a.level];
        
        if (!subjects[a.subject]) {
          subjects[a.subject] = {
            count: 0,
            averageLevel: 0,
            lastAssessment: a.date
          };
        }
        
        subjects[a.subject].count++;
        subjects[a.subject].averageLevel = 
          (subjects[a.subject].averageLevel * (subjects[a.subject].count - 1) + LEVEL_VALUES[a.level]) / 
          subjects[a.subject].count;
        
        if (new Date(a.date) > new Date(subjects[a.subject].lastAssessment)) {
          subjects[a.subject].lastAssessment = a.date;
        }
      });
      
      // Calculate trend
      const recentAssessments = studentAssessments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      let trend: StudentProgress['trend'] = 'stable';
      if (recentAssessments.length >= 3) {
        const recentAvg = recentAssessments.slice(0, 3).reduce((sum, a) => sum + LEVEL_VALUES[a.level], 0) / 3;
        const olderAvg = recentAssessments.slice(-3).reduce((sum, a) => sum + LEVEL_VALUES[a.level], 0) / 3;
        
        if (recentAvg > olderAvg + 0.3) trend = 'improving';
        else if (recentAvg < olderAvg - 0.3) trend = 'declining';
      }
      
      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        hasIEP: student.hasIEP,
        totalAssessments: studentAssessments.length,
        averageLevel: studentAssessments.length > 0 ? totalLevel / studentAssessments.length : 0,
        trend,
        recentLevel: recentAssessments[0]?.level || 'MEETING',
        subjects
      };
    });
    
    setStudentProgress(progress);
    
    // Calculate class average
    const totalClassLevel = filteredAssessments.reduce((sum, a) => sum + LEVEL_VALUES[a.level], 0);
    setClassAverage(filteredAssessments.length > 0 ? totalClassLevel / filteredAssessments.length : 0);
  };

  const getLevelLabel = (value: number) => {
    if (value >= 3.5) return 'EXCEEDING';
    if (value >= 2.5) return 'MEETING';
    if (value >= 1.5) return 'APPROACHING';
    return 'NOT_YET';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'EXCEEDING': return SparklesIcon;
      case 'MEETING': return CheckCircleIcon;
      case 'APPROACHING': return ExclamationTriangleIcon;
      case 'NOT_YET': return XCircleIcon;
      default: return CheckCircleIcon;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Assessment insights and progress tracking</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          data-testid="date-range-filter"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="term">This Term</option>
          <option value="all">All Time</option>
        </select>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Subjects</option>
          {[...new Set(assessments.map(a => a.subject))].map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['overview', 'students', 'subjects', 'trends'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-3 py-1 rounded capitalize ${
                selectedView === view ? 'bg-white shadow' : ''
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Dashboard */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <UserGroupIcon className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">{students.length}</span>
              </div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-xs text-gray-500 mt-1">
                {students.filter(s => s.hasIEP).length} with IEP
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold">{assessments.length}</span>
              </div>
              <p className="text-sm text-gray-600">Total Assessments</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(assessments.length / students.length)} per student
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold">{getLevelLabel(classAverage)}</span>
              </div>
              <p className="text-sm text-gray-600">Class Average</p>
              <p className="text-xs text-gray-500 mt-1">
                Score: {classAverage.toFixed(1)}/4.0
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold">
                  {studentProgress.filter(s => s.trend === 'improving').length}
                </span>
              </div>
              <p className="text-sm text-gray-600">Improving</p>
              <p className="text-xs text-gray-500 mt-1">
                {studentProgress.filter(s => s.trend === 'declining').length} need support
              </p>
            </div>
          </div>

          {/* Class Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Class Performance Distribution</h2>
            <div className="space-y-3">
              {(['EXCEEDING', 'MEETING', 'APPROACHING', 'NOT_YET'] as const).map(level => {
                const count = assessments.filter(a => a.level === level).length;
                const percentage = assessments.length > 0 ? (count / assessments.length) * 100 : 0;
                const Icon = getLevelIcon(level);
                const color = LEVEL_COLORS[level];
                
                return (
                  <div key={level} className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                      <span className="text-sm font-medium">{level.replace('_', ' ')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-6 relative">
                        <div
                          className={`h-6 rounded-full bg-${color}-500 transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Assessments</h2>
            <div className="space-y-2">
              {assessments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(assessment => {
                  const Icon = getLevelIcon(assessment.level);
                  const color = LEVEL_COLORS[assessment.level];
                  
                  return (
                    <div key={assessment.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                        <div>
                          <p className="font-medium">{assessment.studentName}</p>
                          <p className="text-sm text-gray-600">{assessment.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{assessment.level.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(assessment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Students View */}
      {selectedView === 'students' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Individual Student Progress</h2>
          </div>
          
          <div className="divide-y">
            {studentProgress
              .sort((a, b) => b.averageLevel - a.averageLevel)
              .map(student => {
                const levelLabel = getLevelLabel(student.averageLevel);
                const Icon = getLevelIcon(levelLabel);
                const color = LEVEL_COLORS[levelLabel as keyof typeof LEVEL_COLORS];
                
                return (
                  <div key={student.studentId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">{student.studentName}</span>
                          {student.hasIEP && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              IEP
                            </span>
                          )}
                          {student.trend === 'improving' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                              <ArrowTrendingUpIcon className="w-3 h-3" />
                              Improving
                            </span>
                          )}
                          {student.trend === 'declining' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              Needs Support
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Assessments:</span>
                            <span className="ml-1 font-medium">{student.totalAssessments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Average:</span>
                            <Icon className={`w-4 h-4 text-${color}-600`} />
                            <span className="font-medium">{levelLabel.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <span className="ml-1 font-medium">{student.averageLevel.toFixed(1)}/4.0</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Subjects:</span>
                            <span className="ml-1 font-medium">{Object.keys(student.subjects).length}</span>
                          </div>
                        </div>
                        
                        {Object.keys(student.subjects).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(student.subjects).map(([subject, data]) => (
                              <span
                                key={subject}
                                className="px-2 py-1 bg-gray-100 rounded text-xs"
                                title={`${data.count} assessments, avg: ${data.averageLevel.toFixed(1)}`}
                              >
                                {subject}: {getLevelLabel(data.averageLevel)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Subjects View */}
      {selectedView === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjectStats.map(subject => {
            const levelLabel = getLevelLabel(subject.averageLevel);
            const Icon = getLevelIcon(levelLabel);
            
            return (
              <div key={subject.subject} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{subject.subject}</h3>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{levelLabel.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Total Assessments</span>
                    <span className="font-medium">{subject.totalAssessments}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Average Score</span>
                    <span className="font-medium">{subject.averageLevel.toFixed(2)}/4.0</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {(['EXCEEDING', 'MEETING', 'APPROACHING', 'NOT_YET'] as const).map(level => {
                    const count = subject.distribution[level];
                    const percentage = subject.totalAssessments > 0 
                      ? (count / subject.totalAssessments) * 100 
                      : 0;
                    const color = LEVEL_COLORS[level];
                    
                    return (
                      <div key={level} className="flex items-center gap-2">
                        <span className="w-24 text-xs">{level.replace('_', ' ')}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full bg-${color}-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trends View */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Class Progress Trends</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {studentProgress.filter(s => s.trend === 'improving').length}
                </div>
                <p className="text-sm text-gray-600">Students Improving</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {studentProgress.filter(s => s.trend === 'stable').length}
                </div>
                <p className="text-sm text-gray-600">Students Stable</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {studentProgress.filter(s => s.trend === 'declining').length}
                </div>
                <p className="text-sm text-gray-600">Need Support</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Students Needing Support</h3>
              <div className="space-y-2">
                {studentProgress
                  .filter(s => s.trend === 'declining' || s.averageLevel < 2)
                  .map(student => (
                    <div key={student.studentId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="font-medium">{student.studentName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Current: {getLevelLabel(student.averageLevel)}
                        </span>
                        {student.hasIEP && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            IEP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
            <div className="space-y-2">
              {studentProgress
                .filter(s => s.averageLevel >= 3.5)
                .sort((a, b) => b.averageLevel - a.averageLevel)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                      <span className="font-medium">{student.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Score: {student.averageLevel.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}