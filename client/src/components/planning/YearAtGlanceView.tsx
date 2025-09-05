/**
 * YearAtGlanceView Component
 * Visual overview of the entire school year's planning
 */

import React from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Users } from 'lucide-react';
import type { CascadeStatistics, PlanningPanic } from '../../types/planningCascade';
import { generateRecommendations } from '../../utils/planningCascade';

interface YearAtGlanceViewProps {
  statistics: CascadeStatistics;
  year: string;
  grade: number;
  onSubjectClick?: (subject: string) => void;
}

export const YearAtGlanceView: React.FC<YearAtGlanceViewProps> = ({
  statistics,
  year,
  grade,
  onSubjectClick
}) => {
  // Get recommendations based on statistics
  const recommendations = generateRecommendations(statistics, {
    isValid: statistics.panicAreas.length === 0,
    errors: [],
    warnings: []
  });

  // Get overall status color
  const getOverallStatus = () => {
    if (statistics.panicAreas.some(p => p.level === 'extreme' || p.level === 'high')) {
      return 'critical';
    }
    if (statistics.overdueItems > 10) {
      return 'warning';
    }
    if (statistics.coveragePercentage < 25) {
      return 'behind';
    }
    if (statistics.coveragePercentage > 75) {
      return 'excellent';
    }
    return 'ontrack';
  };

  const overallStatus = getOverallStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'warning': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'behind': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'excellent': return 'bg-green-100 border-green-500 text-green-900';
      default: return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'critical': return 'Immediate attention required';
      case 'warning': return 'Several items need attention';
      case 'behind': return 'Behind schedule - review pacing';
      case 'excellent': return 'Excellent progress!';
      default: return 'On track for the year';
    }
  };

  return (
    <div className="year-at-glance space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Year at a Glance</h2>
          <p className="text-gray-600">Grade {grade} • {year}-{parseInt(year) + 1} School Year</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border-2 ${getStatusColor(overallStatus)}`}>
          <p className="font-semibold">{getStatusMessage(overallStatus)}</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.coveragePercentage}%</div>
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${statistics.coveragePercentage}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.completedLessons} of {statistics.totalLessons} lessons
          </p>
        </div>

        {/* Upcoming Lessons */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Upcoming</span>
            <Calendar className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.upcomingLessons}</div>
          <p className="text-xs text-gray-500 mt-1">lessons in next 7 days</p>
        </div>

        {/* Overdue Items */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${statistics.overdueItems > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-bold ${statistics.overdueItems > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {statistics.overdueItems}
          </div>
          <p className="text-xs text-gray-500 mt-1">items need attention</p>
        </div>

        {/* Completed This Week */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statistics.completedLessons}</div>
          <p className="text-xs text-gray-500 mt-1">lessons taught</p>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Subject Progress
        </h3>
        <div className="space-y-3">
          {Object.entries(statistics.bySubject).map(([subject, data]) => (
            <div
              key={subject}
              className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
              onClick={() => onSubjectClick?.(subject)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{subject}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    {data.completed}/{data.planned} lessons
                  </span>
                  <span className={`font-semibold ${
                    data.coverage >= 80 ? 'text-green-600' : 
                    data.coverage >= 60 ? 'text-blue-600' :
                    data.coverage >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {data.coverage}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    data.coverage >= 80 ? 'bg-green-500' : 
                    data.coverage >= 60 ? 'bg-blue-500' :
                    data.coverage >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${data.coverage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panic Areas */}
      {statistics.panicAreas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Areas Needing Attention
          </h3>
          <div className="space-y-3">
            {statistics.panicAreas.map((panic: PlanningPanic, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{panic.message}</p>
                    {panic.suggestions.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                        {panic.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    panic.level === 'extreme' ? 'bg-red-600 text-white' :
                    panic.level === 'high' ? 'bg-red-500 text-white' :
                    panic.level === 'moderate' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {panic.level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};