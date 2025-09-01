import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Meh, 
  TrendingUp, 
  Users, 
  Clock, 
  RefreshCw,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { apiClient } from '../../api/core/client';

interface AssessmentStatsProps {
  startDate?: string;
  endDate?: string;
  unitPlanId?: string;
  subject?: string;
  grade?: number;
}

interface AssessmentStats {
  totalLessons: number;
  assessedLessons: number;
  assessmentBreakdown: {
    thumbsUp: number;
    thumbsOkay: number;
    thumbsDown: number;
  };
  wouldRepeatPercentage: number;
  engagementStats: {
    high: number;
    medium: number;
    low: number;
  };
  paceStats: {
    tooFast: number;
    justRight: number;
    tooSlow: number;
  };
  recentAssessments: Array<{
    id: string;
    title: string;
    date: string;
    quickAssessment: string;
    quickAssessmentNotes?: string;
    assessedAt: string;
    unitPlanTitle?: string;
  }>;
}

export function AssessmentStatsDashboard({
  startDate,
  endDate,
  unitPlanId,
  subject,
  grade,
}: AssessmentStatsProps) {
  const { data: stats, isLoading } = useQuery<AssessmentStats>({
    queryKey: ['assessment-stats', { startDate, endDate, unitPlanId, subject, grade }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (unitPlanId) params.append('unitPlanId', unitPlanId);
      if (subject) params.append('subject', subject);
      if (grade) params.append('grade', grade.toString());

      const response = await apiClient.get(`/api/etfo-lesson-plans/assessment-stats?${params}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div>No assessment data available</div>;
  }

  const completionRate = stats.totalLessons > 0 
    ? Math.round((stats.assessedLessons / stats.totalLessons) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.assessedLessons} of {stats.totalLessons} lessons
              </p>
            </div>
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Would Repeat</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.wouldRepeatPercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-1">of assessed lessons</p>
            </div>
            <RefreshCw className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Engagement</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.engagementStats.high}
              </p>
              <p className="text-xs text-gray-500 mt-1">lessons</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Perfect Pace</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.paceStats.justRight}
              </p>
              <p className="text-xs text-gray-500 mt-1">lessons</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Assessment Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Assessment Breakdown
        </h3>
        <div className="space-y-3">
          {/* Thumbs Up */}
          <div className="flex items-center gap-3">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Great Lessons</span>
                <span className="text-sm font-medium">{stats.assessmentBreakdown.thumbsUp}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.assessedLessons > 0
                        ? (stats.assessmentBreakdown.thumbsUp / stats.assessedLessons) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Thumbs Okay */}
          <div className="flex items-center gap-3">
            <Meh className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Okay Lessons</span>
                <span className="text-sm font-medium">{stats.assessmentBreakdown.thumbsOkay}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.assessedLessons > 0
                        ? (stats.assessmentBreakdown.thumbsOkay / stats.assessedLessons) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Thumbs Down */}
          <div className="flex items-center gap-3">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Needs Improvement</span>
                <span className="text-sm font-medium">{stats.assessmentBreakdown.thumbsDown}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.assessedLessons > 0
                        ? (stats.assessmentBreakdown.thumbsDown / stats.assessedLessons) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Assessments */}
      {stats.recentAssessments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Assessments
          </h3>
          <div className="space-y-3">
            {stats.recentAssessments.map((assessment) => {
              const Icon = 
                assessment.quickAssessment === 'thumbs-up' ? ThumbsUp :
                assessment.quickAssessment === 'thumbs-okay' ? Meh :
                ThumbsDown;
              const color = 
                assessment.quickAssessment === 'thumbs-up' ? 'text-green-600' :
                assessment.quickAssessment === 'thumbs-okay' ? 'text-yellow-600' :
                'text-red-600';

              return (
                <div key={assessment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{assessment.title}</p>
                    {assessment.unitPlanTitle && (
                      <p className="text-sm text-gray-600">{assessment.unitPlanTitle}</p>
                    )}
                    {assessment.quickAssessmentNotes && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        "{assessment.quickAssessmentNotes}"
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(assessment.assessedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Engagement & Pace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Engagement Levels
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High</span>
              <span className="text-lg font-bold text-green-600">{stats.engagementStats.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium</span>
              <span className="text-lg font-bold text-yellow-600">{stats.engagementStats.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low</span>
              <span className="text-lg font-bold text-red-600">{stats.engagementStats.low}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pace Distribution
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Too Fast</span>
              <span className="text-lg font-bold text-orange-600">{stats.paceStats.tooFast}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Just Right</span>
              <span className="text-lg font-bold text-green-600">{stats.paceStats.justRight}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Too Slow</span>
              <span className="text-lg font-bold text-blue-600">{stats.paceStats.tooSlow}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}