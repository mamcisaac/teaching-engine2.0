/**
 * Evidence Triangulation Monitoring Dashboard
 * Provides Emily with insights into ETFO evidence balance across her students
 */

import React, { useEffect, useState } from 'react';
import { analyticsAPI, type EvidenceTriangulationAnalytics } from '../../services/studentAssessmentAPI';

const EvidenceTriangulationDashboard: React.FC = () => {
  const [data, setData] = useState<EvidenceTriangulationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await analyticsAPI.getEvidenceTriangulation();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evidence data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg shadow">
        <div className="text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Evidence Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow">
        <p className="text-gray-600">No evidence data available.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Evidence Triangulation Dashboard
        </h2>
        <p className="text-gray-600">
          Monitor the balance of ETFO evidence types across your students
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Evidence</h3>
          <p className="text-3xl font-bold text-blue-600">{data.totalEvidence}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Observation</h3>
          <p className="text-3xl font-bold text-blue-600">{data.observationEvidence}</p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.round((data.observationEvidence / data.totalEvidence) * 100)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation</h3>
          <p className="text-3xl font-bold text-green-600">{data.conversationEvidence}</p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.round((data.conversationEvidence / data.totalEvidence) * 100)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Product</h3>
          <p className="text-3xl font-bold text-purple-600">{data.productEvidence}</p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.round((data.productEvidence / data.totalEvidence) * 100)}%
          </p>
        </div>
      </div>

      {/* Triangulation Score */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Triangulation Score</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${data.triangulationScore}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600">{data.triangulationScore}%</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Higher scores indicate better balance across evidence types
        </p>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            Recommendations
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="text-amber-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Types Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Evidence Balance Visualization
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            ETFO recommends balanced evidence across Observation, Conversation, and Product
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{data.observationEvidence}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mt-2">Observation</h4>
              <p className="text-sm text-gray-600">
                {Math.round((data.observationEvidence / data.totalEvidence) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{data.conversationEvidence}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mt-2">Conversation</h4>
              <p className="text-sm text-gray-600">
                {Math.round((data.conversationEvidence / data.totalEvidence) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">{data.productEvidence}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mt-2">Product</h4>
              <p className="text-sm text-gray-600">
                {Math.round((data.productEvidence / data.totalEvidence) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">ETFO Evidence Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span><strong>Observation:</strong> What you see students doing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span><strong>Conversation:</strong> What students say and discuss</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span><strong>Product:</strong> What students create and produce</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceTriangulationDashboard;