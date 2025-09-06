/**
 * Class Analytics Dashboard
 * Provides Emily with overall class insights and progress metrics
 */

import React, { useEffect, useState } from 'react';
import { analyticsAPI, type ClassOverviewAnalytics } from '../../services/studentAssessmentAPI';

const ClassAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<ClassOverviewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsAPI.getClassOverview();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load class data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow">
        <div className="text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Class Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow">
        <p className="text-gray-600">No class data available.</p>
      </div>
    );
  }

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'EXCEEDING': return 'text-green-600 bg-green-100';
      case 'MEETING': return 'text-blue-600 bg-blue-100';
      case 'APPROACHING': return 'text-yellow-600 bg-yellow-100';
      case 'NOT_YET': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMasteryPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Class Analytics Overview
        </h2>
        <p className="text-gray-600">
          Monitor your Grade 1 French Immersion class progress and activity
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Assessments</h3>
          <p className="text-3xl font-bold text-green-600">{data.activeAssessments}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Artifacts Added</h3>
          <p className="text-3xl font-bold text-purple-600">{data.recentActivity.artifactsAdded}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Assessments Completed</h3>
          <p className="text-3xl font-bold text-orange-600">{data.recentActivity.assessmentsCompleted}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{data.recentActivity.artifactsAdded}</p>
            <p className="text-sm text-gray-600">Artifacts Added</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.recentActivity.assessmentsCompleted}</p>
            <p className="text-sm text-gray-600">Assessments Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{data.recentActivity.studentsAssessed}</p>
            <p className="text-sm text-gray-600">Students Assessed</p>
          </div>
        </div>
      </div>

      {/* Subject Overview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Subject Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Outcomes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assessed Outcomes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Average Mastery
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(data.subjectOverview).map(([subject, overview]) => (
                <tr key={subject}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {overview.totalOutcomes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {overview.assessedOutcomes} ({Math.round((overview.assessedOutcomes / overview.totalOutcomes) * 100)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{overview.averageMastery.toFixed(1)}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(overview.averageMastery / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassAnalyticsDashboard;