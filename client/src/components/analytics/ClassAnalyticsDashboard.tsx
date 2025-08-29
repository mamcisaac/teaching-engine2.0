/**
 * Class Analytics Dashboard
 * Provides Emily with overall class insights and progress metrics
 */

import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/studentAssessmentAPI';

interface ClassOverviewData {
  overview: {
    totalStudents: number;
    totalArtifacts: number;
    totalAssessments: number;
    totalStorageUsed: number;
    storageUsedMB: number;
    recentActivity: {
      artifacts: number;
      assessments: number;
    };
  };
  masteryDistribution: {
    NOT_YET: number;
    APPROACHING: number;
    MEETING: number;
    EXCEEDING: number;
    total: number;
  };
  progressBySubject: Record<string, {
    NOT_YET: number;
    APPROACHING: number;
    MEETING: number;
    EXCEEDING: number;
    total: number;
  }>;
  artifactTypes: Record<string, number>;
  studentMetrics: Array<{
    id: string;
    name: string;
    artifactCount: number;
    progressCount: number;
    lastActivity: number;
    masteryAverage: number;
  }>;
}

const ClassAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<ClassOverviewData | null>(null);
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
          <p className="text-3xl font-bold text-blue-600">{data.overview.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Evidence Collected</h3>
          <p className="text-3xl font-bold text-green-600">{data.overview.totalArtifacts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Assessments</h3>
          <p className="text-3xl font-bold text-purple-600">{data.overview.totalAssessments}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
          <p className="text-3xl font-bold text-orange-600">{data.overview.storageUsedMB}</p>
          <p className="text-sm text-gray-500">MB</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (30 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{data.overview.recentActivity.artifacts}</p>
            <p className="text-sm text-gray-600">New Evidence Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.overview.recentActivity.assessments}</p>
            <p className="text-sm text-gray-600">Progress Updates</p>
          </div>
        </div>
      </div>

      {/* Mastery Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Mastery Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(data.masteryDistribution)
            .filter(([key]) => key !== 'total')
            .map(([level, count]) => (
              <div key={level} className="text-center">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getMasteryColor(level)}`}>
                  {level.replace('_', ' ')}
                </div>
                <p className="text-2xl font-bold mt-2">{count}</p>
                <p className="text-sm text-gray-600">
                  {getMasteryPercentage(count, data.masteryDistribution.total)}%
                </p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Progress by Subject</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exceeding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Meeting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Approaching
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Not Yet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(data.progressBySubject).map(([subject, counts]) => (
                <tr key={subject}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      {counts.EXCEEDING} ({getMasteryPercentage(counts.EXCEEDING, counts.total)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {counts.MEETING} ({getMasteryPercentage(counts.MEETING, counts.total)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                      {counts.APPROACHING} ({getMasteryPercentage(counts.APPROACHING, counts.total)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                      {counts.NOT_YET} ({getMasteryPercentage(counts.NOT_YET, counts.total)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {counts.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Artifact Types */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Types Collected</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.artifactTypes).map(([type, count]) => (
            <div key={type} className="text-center border border-gray-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{type.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Activity Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Student Activity Summary</h3>
          <p className="text-sm text-gray-600">Sorted by most recent activity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Evidence Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assessments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Mastery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.studentMetrics.slice(0, 10).map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.artifactCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.progressCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2">{student.masteryAverage.toFixed(1)}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(student.masteryAverage / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.lastActivity).toLocaleDateString()}
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