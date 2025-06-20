/**
 * Theme Analytics Dashboard Component
 *
 * Provides comprehensive analysis of theme usage across teaching activities,
 * showing thematic coverage, balance, and cross-subject integration patterns.
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

interface ThemeUsageData {
  themeId: number;
  themeName: string;
  usageCount: number;
  domainsUsed: string[];
  subjectsUsed: string[];
  linkedOutcomes: string[];
  termsUsed: string[];
  usageTypes: {
    planner: number;
    reflection: number;
    artifact: number;
    assessment: number;
  };
  lastUsed: Date;
  integrationScore: number;
}

interface ThemeAnalyticsSummary {
  totalThemes: number;
  activeThemes: number;
  averageUsagePerTheme: number;
  mostUsedThemes: ThemeUsageData[];
  underusedThemes: ThemeUsageData[];
  wellIntegratedThemes: ThemeUsageData[];
  themeBalance: {
    balanced: boolean;
    recommendation: string;
    distribution: Record<string, number>;
  };
  crossSubjectConnections: Array<{
    theme: string;
    subjects: string[];
    connectionStrength: number;
  }>;
}

interface ThemeMatrixData {
  themes: string[];
  domains: string[];
  subjects: string[];
  matrix: Record<string, Record<string, number>>;
  heatmapData: Array<{
    theme: string;
    domain: string;
    value: number;
    activities: string[];
  }>;
}

interface ThemeAnalyticsDashboardProps {
  teacherId?: number;
  term?: string;
  subject?: string;
  className?: string;
}

const ThemeAnalyticsDashboard: React.FC<ThemeAnalyticsDashboardProps> = ({
  teacherId,
  term,
  subject,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'matrix' | 'trends'>('summary');
  const [matrixViewBy, setMatrixViewBy] = useState<'domain' | 'subject'>('domain');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'usage' | 'integration' | 'alphabetical'>('usage');

  // Fetch theme analytics summary
  const {
    data: analyticsData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<ThemeAnalyticsSummary>({
    queryKey: ['theme-analytics', { teacherId, term, subject }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teacherId) params.append('teacherId', teacherId.toString());
      if (term) params.append('term', term);
      if (subject) params.append('subject', subject);

      const response = await api.get(`/api/analytics/theme-usage?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch theme matrix data when in matrix view
  const { data: matrixData, isLoading: matrixLoading } = useQuery<ThemeMatrixData>({
    queryKey: ['theme-matrix', { teacherId, term, viewBy: matrixViewBy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teacherId) params.append('teacherId', teacherId.toString());
      if (term) params.append('term', term);
      params.append('viewBy', matrixViewBy);

      const response = await api.get(`/api/analytics/theme-matrix?${params.toString()}`);
      return response.data;
    },
    enabled: viewMode === 'matrix',
  });

  // Sort themes based on selected criteria
  const sortedThemes = useMemo(() => {
    if (!analyticsData?.mostUsedThemes) return [];

    const themes = [...analyticsData.mostUsedThemes];

    switch (sortBy) {
      case 'usage':
        return themes.sort((a, b) => b.usageCount - a.usageCount);
      case 'integration':
        return themes.sort((a, b) => b.integrationScore - a.integrationScore);
      case 'alphabetical':
        return themes.sort((a, b) => a.themeName.localeCompare(b.themeName));
      default:
        return themes;
    }
  }, [analyticsData?.mostUsedThemes, sortBy]);

  const getUsageTypeColor = (type: keyof ThemeUsageData['usageTypes']) => {
    const colors = {
      planner: 'bg-blue-500',
      reflection: 'bg-green-500',
      artifact: 'bg-purple-500',
      assessment: 'bg-orange-500',
    };
    return colors[type];
  };

  const getIntegrationBadge = (score: number) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (score >= 60) return { color: 'bg-yellow-100 text-yellow-800', label: 'Good' };
    if (score >= 40) return { color: 'bg-orange-100 text-orange-800', label: 'Fair' };
    return { color: 'bg-red-100 text-red-800', label: 'Poor' };
  };

  if (summaryLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading theme analytics</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-gray-500 text-center">
          <p>No theme data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Theme Analytics Dashboard</h3>
          <p className="text-sm text-gray-600">
            {analyticsData.activeThemes} active themes across {analyticsData.totalThemes} total
            themes
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {(['summary', 'matrix', 'trends'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === mode
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analyticsData.totalThemes}</div>
          <div className="text-sm text-blue-700">Total Themes</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analyticsData.activeThemes}</div>
          <div className="text-sm text-green-700">Active This Term</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {analyticsData.averageUsagePerTheme}
          </div>
          <div className="text-sm text-purple-700">Avg Usage/Theme</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {analyticsData.crossSubjectConnections.length}
          </div>
          <div className="text-sm text-orange-700">Cross-Subject Links</div>
        </div>
      </div>

      {/* View-specific Content */}
      {viewMode === 'summary' && (
        <div className="space-y-6">
          {/* Theme Balance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Theme Balance Assessment</h4>
            <div
              className={`p-3 rounded ${analyticsData.themeBalance.balanced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
            >
              <div className="flex items-center">
                <span className="mr-2">{analyticsData.themeBalance.balanced ? '✅' : '⚠️'}</span>
                <span className="text-sm">{analyticsData.themeBalance.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Theme Usage Analysis</h4>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="usage">Usage Count</option>
                <option value="integration">Integration Score</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Theme List */}
          <div className="space-y-3">
            {sortedThemes.map((theme) => {
              const integrationBadge = getIntegrationBadge(theme.integrationScore);

              return (
                <div
                  key={theme.themeId}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTheme === theme.themeName
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() =>
                    setSelectedTheme(selectedTheme === theme.themeName ? null : theme.themeName)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-medium text-gray-900">{theme.themeName}</h5>
                        <span className={`px-2 py-1 text-xs rounded ${integrationBadge.color}`}>
                          {integrationBadge.label} Integration
                        </span>
                        <span className="text-sm text-gray-500">Used {theme.usageCount} times</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Subjects: {theme.subjectsUsed.join(', ')}</span>
                        <span>Domains: {theme.domainsUsed.join(', ')}</span>
                        <span>Last used: {new Date(theme.lastUsed).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {theme.integrationScore}
                      </div>
                      <div className="text-xs text-gray-500">Integration Score</div>
                    </div>
                  </div>

                  {/* Usage Type Breakdown */}
                  <div className="mt-3 flex space-x-2">
                    {Object.entries(theme.usageTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center space-x-1">
                        <div className={`w-3 h-3 rounded ${getUsageTypeColor(type as any)}`}></div>
                        <span className="text-xs text-gray-600">
                          {type}: {count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Details */}
                  {selectedTheme === theme.themeName && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Linked Outcomes:</span>
                          <div className="text-gray-600">
                            {theme.linkedOutcomes.length} outcomes
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Terms Used:</span>
                          <div className="text-gray-600">{theme.termsUsed.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cross-Subject Connections */}
          {analyticsData.crossSubjectConnections.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Cross-Subject Connections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analyticsData.crossSubjectConnections.map((connection) => (
                  <div key={connection.theme} className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-900">{connection.theme}</div>
                    <div className="text-sm text-purple-700">
                      Connected across: {connection.subjects.join(', ')}
                    </div>
                    <div className="text-xs text-purple-600">
                      Connection strength: {connection.connectionStrength}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'matrix' && (
        <div className="space-y-4">
          {/* Matrix Controls */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Theme Usage Matrix</h4>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">View by:</label>
              <select
                value={matrixViewBy}
                onChange={(e) => setMatrixViewBy(e.target.value as 'domain' | 'subject')}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="domain">Domain</option>
                <option value="subject">Subject</option>
              </select>
            </div>
          </div>

          {/* Matrix Grid */}
          {matrixLoading ? (
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-gray-500">Loading matrix...</div>
            </div>
          ) : matrixData ? (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `200px repeat(${(matrixViewBy === 'domain' ? matrixData.domains : matrixData.subjects).length}, minmax(60px, 1fr))`,
                  }}
                >
                  {/* Header */}
                  <div></div>
                  {(matrixViewBy === 'domain' ? matrixData.domains : matrixData.subjects).map(
                    (category) => (
                      <div
                        key={category}
                        className="p-2 bg-gray-100 text-center text-sm font-medium truncate"
                      >
                        {category}
                      </div>
                    ),
                  )}

                  {/* Rows */}
                  {matrixData.themes.map((theme) => (
                    <React.Fragment key={theme}>
                      <div className="p-2 bg-gray-50 text-sm font-medium truncate">{theme}</div>
                      {(matrixViewBy === 'domain' ? matrixData.domains : matrixData.subjects).map(
                        (category) => {
                          const value = matrixData.matrix[theme]?.[category] || 0;
                          const intensity = value > 0 ? Math.min(value / 5, 1) : 0;
                          const bgColor =
                            value > 0 ? `rgba(59, 130, 246, ${0.2 + intensity * 0.6})` : '#f9fafb';

                          return (
                            <div
                              key={`${theme}-${category}`}
                              className="p-2 text-center text-sm border border-white"
                              style={{ backgroundColor: bgColor }}
                              title={`${theme} × ${category}: ${value} uses`}
                            >
                              {value || ''}
                            </div>
                          );
                        },
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-gray-500">No matrix data available</div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'trends' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Theme Trends</h4>
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <div className="text-gray-500">Theme trends visualization coming soon</div>
            <div className="text-sm text-gray-400 mt-2">
              This will show theme usage patterns over time
            </div>
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => {
            console.log('Export theme analytics', { analyticsData, viewMode });
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Export Data
        </button>
        <button
          onClick={() => {
            console.log('Generate theme report', analyticsData);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default ThemeAnalyticsDashboard;
