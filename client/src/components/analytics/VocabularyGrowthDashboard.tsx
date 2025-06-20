/**
 * Vocabulary Growth Dashboard Component
 *
 * Tracks and visualizes student vocabulary acquisition patterns,
 * bilingual development, and growth trajectory analytics.
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { exportVocabularyGrowth, showExportError } from '../../utils/analyticsExport';

interface VocabularyGrowthData {
  studentId: number;
  studentName: string;
  totalWords: number;
  wordsThisTerm: number;
  weeklyGrowth: Array<{
    week: number;
    newWords: number;
    cumulativeWords: number;
    languages: { en: number; fr: number };
  }>;
  domainBreakdown: Record<
    string,
    {
      count: number;
      percentage: number;
      recentWords: string[];
    }
  >;
  difficultyProgression: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  acquisitionRate: number;
  targetGrowth: number;
  projectedEndOfTerm: number;
}

interface BilingualAnalytics {
  studentId: number;
  cognateConnections: Array<{
    enWord: string;
    frWord: string;
    domain: string;
    similarity: number;
    acquired: boolean;
  }>;
  languageBalance: {
    english: { count: number; percentage: number };
    french: { count: number; percentage: number };
  };
  transferPatterns: Array<{
    pattern: string;
    examples: Array<{ en: string; fr: string }>;
    strength: number;
  }>;
  recommendedCognates: Array<{
    enWord: string;
    frWord: string;
    domain: string;
    priority: number;
    rationale: string;
  }>;
}

interface VocabularyGrowthDashboardProps {
  studentId: number;
  term?: string;
  teacherId?: number;
  className?: string;
  showBilingualAnalysis?: boolean;
}

const VocabularyGrowthDashboard: React.FC<VocabularyGrowthDashboardProps> = ({
  studentId,
  term,
  teacherId,
  className = '',
  showBilingualAnalysis = true,
}) => {
  const [viewMode, setViewMode] = useState<'growth' | 'domains' | 'bilingual' | 'projections'>(
    'growth',
  );
  const [timeRange, setTimeRange] = useState(20);

  // Fetch vocabulary growth data
  const {
    data: growthData,
    isLoading: growthLoading,
    error: growthError,
  } = useQuery<VocabularyGrowthData>({
    queryKey: ['vocabulary-growth', studentId, { term, teacherId, weekCount: timeRange }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (teacherId) params.append('teacherId', teacherId.toString());
      params.append('weekCount', timeRange.toString());

      const response = await api.get(
        `/api/analytics/vocabulary-growth/${studentId}?${params.toString()}`,
      );
      return response.data;
    },
  });

  // Fetch bilingual analytics
  const { data: bilingualData, isLoading: bilingualLoading } = useQuery<BilingualAnalytics>({
    queryKey: ['bilingual-analytics', studentId, { term, teacherId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (teacherId) params.append('teacherId', teacherId.toString());

      const response = await api.get(
        `/api/analytics/bilingual-vocabulary/${studentId}?${params.toString()}`,
      );
      return response.data;
    },
    enabled: showBilingualAnalysis,
  });

  // Chart data transformations
  const growthChartData = useMemo(() => {
    if (!growthData?.weeklyGrowth) return [];

    return growthData.weeklyGrowth.map((week) => ({
      week: `Week ${week.week}`,
      'New Words': week.newWords,
      'Total Words': week.cumulativeWords,
      English: week.languages.en,
      French: week.languages.fr,
    }));
  }, [growthData]);

  const domainChartData = useMemo(() => {
    if (!growthData?.domainBreakdown) return [];

    return Object.entries(growthData.domainBreakdown).map(([domain, data]) => ({
      domain,
      count: data.count,
      percentage: data.percentage,
    }));
  }, [growthData]);

  const difficultyChartData = useMemo(() => {
    if (!growthData?.difficultyProgression) return [];

    const { basic, intermediate, advanced } = growthData.difficultyProgression;
    const total = basic + intermediate + advanced;

    return [
      { name: 'Basic', value: basic, percentage: Math.round((basic / total) * 100) },
      {
        name: 'Intermediate',
        value: intermediate,
        percentage: Math.round((intermediate / total) * 100),
      },
      { name: 'Advanced', value: advanced, percentage: Math.round((advanced / total) * 100) },
    ];
  }, [growthData]);

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (growthLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (growthError) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading vocabulary data</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-gray-500 text-center">
          <p>No vocabulary data available for this student</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Vocabulary Growth - {growthData.studentName}
          </h3>
          <p className="text-sm text-gray-600">
            {growthData.totalWords} total words | {growthData.wordsThisTerm} added this term
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {(['growth', 'domains', 'bilingual', 'projections'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={mode === 'bilingual' && (!showBilingualAnalysis || bilingualLoading)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{growthData.totalWords}</div>
          <div className="text-sm text-blue-700">Total Vocabulary</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{growthData.acquisitionRate}</div>
          <div className="text-sm text-green-700">Words/Week</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div
            className={`text-2xl font-bold ${getProgressColor(growthData.wordsThisTerm, growthData.targetGrowth)}`}
          >
            {Math.round((growthData.wordsThisTerm / growthData.targetGrowth) * 100)}%
          </div>
          <div className="text-sm text-purple-700">Target Progress</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{growthData.projectedEndOfTerm}</div>
          <div className="text-sm text-orange-700">Projected Total</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress toward target ({growthData.targetGrowth} words)</span>
          <span>
            {growthData.wordsThisTerm} / {growthData.targetGrowth}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressBarColor(growthData.wordsThisTerm, growthData.targetGrowth)}`}
            style={{
              width: `${Math.min((growthData.wordsThisTerm / growthData.targetGrowth) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* View-specific Content */}
      {viewMode === 'growth' && (
        <div className="space-y-6">
          {/* Time Range Control */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Vocabulary Growth Over Time</h4>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Weeks:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value={10}>Last 10 weeks</option>
                <option value={20}>Last 20 weeks</option>
                <option value={30}>Last 30 weeks</option>
              </select>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Total Words"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="New Words"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Language Breakdown Chart */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Weekly Language Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="English" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="French" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'domains' && (
        <div className="space-y-6">
          {/* Domain Distribution */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Vocabulary by Domain</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="domain" type="category" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Domain Details */}
              <div className="space-y-3">
                {Object.entries(growthData.domainBreakdown).map(([domain, data]) => (
                  <div key={domain} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{domain}</span>
                      <span className="text-sm text-gray-600">
                        {data.count} words ({data.percentage}%)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Recent: {data.recentWords.slice(0, 3).join(', ')}
                      {data.recentWords.length > 3 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              Difficulty Level Distribution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {difficultyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {difficultyChartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'bilingual' && bilingualData && (
        <div className="space-y-6">
          {/* Language Balance */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">English Vocabulary</h5>
              <div className="text-2xl font-bold text-blue-600">
                {bilingualData.languageBalance.english.count}
              </div>
              <div className="text-sm text-blue-700">
                {bilingualData.languageBalance.english.percentage}% of total
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">French Vocabulary</h5>
              <div className="text-2xl font-bold text-green-600">
                {bilingualData.languageBalance.french.count}
              </div>
              <div className="text-sm text-green-700">
                {bilingualData.languageBalance.french.percentage}% of total
              </div>
            </div>
          </div>

          {/* Cognate Connections */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Cognate Connections</h4>
            <div className="space-y-2">
              {bilingualData.cognateConnections.slice(0, 5).map((connection, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${connection.acquired ? 'bg-green-50' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{connection.enWord}</span>
                      <span className="text-gray-400">↔</span>
                      <span className="font-medium">{connection.frWord}</span>
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {connection.domain}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {connection.similarity}% similar
                      </span>
                      {connection.acquired && <span className="text-green-600">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Patterns */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Transfer Patterns</h4>
            <div className="space-y-3">
              {bilingualData.transferPatterns.map((pattern, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-purple-900">{pattern.pattern}</div>
                      <div className="text-sm text-purple-700 mt-1">
                        Examples: {pattern.examples.map((ex) => `${ex.en} → ${ex.fr}`).join(', ')}
                      </div>
                    </div>
                    <div className="text-sm text-purple-600">{pattern.strength}% strength</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Cognates */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Recommended Cognates</h4>
            <div className="space-y-2">
              {bilingualData.recommendedCognates.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-yellow-900">
                        {rec.enWord} ↔ {rec.frWord}
                      </div>
                      <div className="text-sm text-yellow-700">{rec.rationale}</div>
                    </div>
                    <div className="text-sm text-yellow-600">Priority: {rec.priority}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'projections' && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900">Growth Projections</h4>

          {/* Projection Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Current Trajectory</h5>
              <div className="text-lg font-semibold text-blue-600">
                {growthData.projectedEndOfTerm} words
              </div>
              <div className="text-sm text-blue-700">by end of term</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900 mb-2">Target Achievement</h5>
              <div className="text-lg font-semibold text-green-600">
                {Math.round((growthData.wordsThisTerm / growthData.targetGrowth) * 100)}%
              </div>
              <div className="text-sm text-green-700">of target reached</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-2">Words Needed</h5>
              <div className="text-lg font-semibold text-purple-600">
                {Math.max(0, growthData.targetGrowth - growthData.wordsThisTerm)}
              </div>
              <div className="text-sm text-purple-700">to reach target</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Recommendations</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              {growthData.acquisitionRate < 2 && (
                <li>• Increase vocabulary exposure through reading and activities</li>
              )}
              {bilingualData && bilingualData.languageBalance.french.percentage < 30 && (
                <li>• Focus on French vocabulary building to improve balance</li>
              )}
              {growthData.wordsThisTerm < growthData.targetGrowth * 0.5 && (
                <li>• Implement intensive vocabulary intervention strategies</li>
              )}
              <li>• Continue current progress - on track for target achievement</li>
            </ul>
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={async () => {
            if (!growthData) return;

            try {
              await exportVocabularyGrowth(growthData, 'csv', {
                includeMetadata: true,
              });
            } catch (error) {
              showExportError('vocabulary-growth', 'csv', error as Error);
            }
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Export Data
        </button>
        <button
          onClick={async () => {
            if (!growthData) return;

            try {
              await exportVocabularyGrowth(growthData, 'pdf', {
                subtitle: `Generated on ${new Date().toLocaleDateString()}`,
                includeMetadata: true,
              });
            } catch (error) {
              showExportError('vocabulary-growth', 'pdf', error as Error);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default VocabularyGrowthDashboard;
