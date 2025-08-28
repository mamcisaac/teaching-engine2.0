/**
 * Evidence Triangulation Monitoring Dashboard
 * Provides Emily with insights into ETFO evidence balance across her students
 */

import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/studentAssessmentAPI';

interface EvidenceData {
  overview: {
    totalEvidence: number;
    evidenceTypes: Record<string, number>;
    averagePerStudent: number;
  };
  triangulationAnalysis: Array<{
    name: string;
    OBSERVATION: number;
    CONVERSATION: number;
    PRODUCT: number;
    total: number;
    percentages: {
      observation: number;
      conversation: number;
      product: number;
    };
    balance: string;
    needsAttention: boolean;
    recommendations: string[];
  }>;
  subjectTriangulation: Record<string, {
    OBSERVATION: number;
    CONVERSATION: number;
    PRODUCT: number;
    total: number;
  }>;
  recommendations: {
    classLevel: string[];
    studentsNeedingAttention: number;
  };
}

const EvidenceTriangulationDashboard: React.FC = () => {
  const [data, setData] = useState<EvidenceData | null>(null);
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

  const getBalanceColor = (balance: string, needsAttention: boolean) => {
    if (needsAttention) return 'text-amber-600 bg-amber-50';
    if (balance === 'Well balanced') return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getProgressBarColor = (type: 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT') => {
    switch (type) {
      case 'OBSERVATION': return 'bg-blue-500';
      case 'CONVERSATION': return 'bg-green-500';
      case 'PRODUCT': return 'bg-purple-500';
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Evidence</h3>
          <p className="text-3xl font-bold text-blue-600">{data.overview.totalEvidence}</p>
          <p className="text-sm text-gray-500 mt-1">
            {data.overview.averagePerStudent.toFixed(1)} per student
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evidence Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.overview.evidenceTypes).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-gray-600">{type}:</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Attention</h3>
          <p className="text-3xl font-bold text-amber-600">
            {data.recommendations.studentsNeedingAttention}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            students need better balance
          </p>
        </div>
      </div>

      {/* Class-Level Recommendations */}
      {data.recommendations.classLevel.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            Class-Level Recommendations
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {data.recommendations.classLevel.map((recommendation, index) => (
              <li key={index} className="text-amber-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Student Triangulation Analysis */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Evidence Balance
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            ETFO recommends balanced evidence across Observation, Conversation, and Product
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Evidence Distribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Balance Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Evidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Recommendations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.triangulationAnalysis.map((student, index) => (
                <tr key={index} className={student.needsAttention ? 'bg-amber-25' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* Observation */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs w-16 text-gray-600">Observ:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                          <div 
                            className={`${getProgressBarColor('OBSERVATION')} h-2 rounded-full`}
                            style={{ width: `${student.percentages.observation}%` }}
                          ></div>
                        </div>
                        <span className="text-xs w-8 text-gray-600">
                          {student.percentages.observation}%
                        </span>
                      </div>
                      
                      {/* Conversation */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs w-16 text-gray-600">Conv:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                          <div 
                            className={`${getProgressBarColor('CONVERSATION')} h-2 rounded-full`}
                            style={{ width: `${student.percentages.conversation}%` }}
                          ></div>
                        </div>
                        <span className="text-xs w-8 text-gray-600">
                          {student.percentages.conversation}%
                        </span>
                      </div>
                      
                      {/* Product */}
                      <div className="flex items-center space-x-2">
                        <span className="text-xs w-16 text-gray-600">Product:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                          <div 
                            className={`${getProgressBarColor('PRODUCT')} h-2 rounded-full`}
                            style={{ width: `${student.percentages.product}%` }}
                          ></div>
                        </div>
                        <span className="text-xs w-8 text-gray-600">
                          {student.percentages.product}%
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBalanceColor(student.balance, student.needsAttention)}`}>
                      {student.balance}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.total}
                  </td>
                  
                  <td className="px-6 py-4">
                    {student.recommendations.length > 0 ? (
                      <div className="text-xs text-gray-600 space-y-1">
                        {student.recommendations.map((rec, i) => (
                          <div key={i}>• {rec}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-green-600">Good balance</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject-wise Triangulation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Evidence Balance by Subject
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.subjectTriangulation).map(([subject, counts]) => (
              <div key={subject} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{subject}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">Observation:</span>
                    <span>{counts.OBSERVATION}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Conversation:</span>
                    <span>{counts.CONVERSATION}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-600">Product:</span>
                    <span>{counts.PRODUCT}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                    <span>Total:</span>
                    <span>{counts.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">ETFO Evidence Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span><strong>Observation:</strong> Watching students work and learn</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span><strong>Conversation:</strong> Talking with students about their learning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span><strong>Product:</strong> Student work samples and artifacts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceTriangulationDashboard;