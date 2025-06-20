/**
 * Curriculum Heatmap Component
 *
 * Visualizes curriculum outcome coverage across time periods using a
 * color-coded grid that shows teaching intensity and coverage patterns.
 */

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { exportCurriculumHeatmap, showExportError } from '../../utils/analyticsExport';

interface HeatmapData {
  outcomes: Array<{
    id: string;
    code: string;
    label: string;
    subject: string;
    domain: string | null;
  }>;
  weeks: number[];
  grid: Record<string, Record<number, number>>;
  metadata: {
    viewMode: 'planned' | 'taught' | 'assessed' | 'reinforced';
    totalOutcomes: number;
    totalWeeks: number;
    coveragePercentage: number;
  };
}

interface CurriculumHeatmapProps {
  teacherId?: number;
  subject?: string;
  domain?: string;
  className?: string;
}

const CurriculumHeatmap: React.FC<CurriculumHeatmapProps> = ({
  teacherId,
  subject,
  domain,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'planned' | 'taught' | 'assessed' | 'reinforced'>(
    'planned',
  );
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState({ start: 1, end: 20 });

  // Fetch heatmap data
  const {
    data: heatmapData,
    isLoading,
    error,
  } = useQuery<HeatmapData>({
    queryKey: ['curriculum-heatmap', { teacherId, subject, domain, viewMode, ...weekRange }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teacherId) params.append('teacherId', teacherId.toString());
      if (subject) params.append('subject', subject);
      if (domain) params.append('domain', domain);
      params.append('viewMode', viewMode);
      params.append('startWeek', weekRange.start.toString());
      params.append('endWeek', weekRange.end.toString());

      const response = await api.get(`/api/analytics/curriculum-heatmap?${params.toString()}`);
      return response.data;
    },
  });

  // Color scale for heatmap
  const getHeatmapColor = (count: number, maxCount: number): string => {
    if (count === 0) return 'bg-gray-100';

    const intensity = count / maxCount;
    if (intensity > 0.8) return 'bg-blue-900';
    if (intensity > 0.6) return 'bg-blue-700';
    if (intensity > 0.4) return 'bg-blue-500';
    if (intensity > 0.2) return 'bg-blue-300';
    return 'bg-blue-100';
  };

  // Calculate max count for color scaling
  const maxCount = useMemo(() => {
    if (!heatmapData) return 1;

    let max = 1;
    Object.values(heatmapData.grid).forEach((outcomeData) => {
      Object.values(outcomeData).forEach((count) => {
        max = Math.max(max, count);
      });
    });
    return max;
  }, [heatmapData]);

  // Filter outcomes based on selection
  const filteredOutcomes = useMemo(() => {
    if (!heatmapData) return [];
    return heatmapData.outcomes.filter(
      (outcome) => !selectedOutcome || outcome.id === selectedOutcome,
    );
  }, [heatmapData, selectedOutcome]);

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading heatmap</p>
          <p className="text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
        <div className="text-gray-500 text-center">
          <p>No curriculum data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Curriculum Coverage Heatmap</h3>
          <p className="text-sm text-gray-600">
            {heatmapData.metadata.coveragePercentage}% coverage across{' '}
            {heatmapData.metadata.totalOutcomes} outcomes
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {(['planned', 'taught', 'assessed', 'reinforced'] as const).map((mode) => (
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

      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          {/* Outcome Filter */}
          <select
            value={selectedOutcome || ''}
            onChange={(e) => setSelectedOutcome(e.target.value || null)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">All Outcomes</option>
            {heatmapData.outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.code} - {outcome.label.substring(0, 30)}...
              </option>
            ))}
          </select>

          {/* Week Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Weeks:</label>
            <input
              type="number"
              value={weekRange.start}
              onChange={(e) =>
                setWeekRange((prev) => ({ ...prev, start: parseInt(e.target.value) }))
              }
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              min="1"
              max="52"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={weekRange.end}
              onChange={(e) => setWeekRange((prev) => ({ ...prev, end: parseInt(e.target.value) }))}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
              min="1"
              max="52"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Coverage:</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-100 border rounded"></div>
            <span>None</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-300 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-700 rounded"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Week Headers */}
          <div className="flex">
            <div className="w-48 flex-shrink-0"></div> {/* Space for outcome labels */}
            <div className="flex">
              {heatmapData.weeks.map((week) => (
                <div
                  key={week}
                  className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600"
                >
                  {week}
                </div>
              ))}
            </div>
          </div>

          {/* Outcome Rows */}
          <div className="space-y-1">
            {filteredOutcomes.map((outcome) => (
              <div key={outcome.id} className="flex items-center hover:bg-gray-50 rounded">
                {/* Outcome Label */}
                <div className="w-48 flex-shrink-0 pr-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{outcome.code}</span>
                    {outcome.subject && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {outcome.subject}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 truncate" title={outcome.label}>
                    {outcome.label}
                  </div>
                </div>

                {/* Week Cells */}
                <div className="flex">
                  {heatmapData.weeks.map((week) => {
                    const count = heatmapData.grid[outcome.id]?.[week] || 0;
                    const colorClass = getHeatmapColor(count, maxCount);

                    return (
                      <div
                        key={week}
                        className={`w-8 h-8 ${colorClass} border border-white rounded flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all`}
                        title={`Week ${week}: ${count} ${viewMode} event(s)`}
                      >
                        {count > 0 && (
                          <span className="text-xs font-medium text-white">{count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {heatmapData.metadata.totalOutcomes}
          </div>
          <div className="text-sm text-gray-600">Total Outcomes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {heatmapData.metadata.coveragePercentage}%
          </div>
          <div className="text-sm text-gray-600">Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {heatmapData.metadata.totalWeeks}
          </div>
          <div className="text-sm text-gray-600">Weeks Analyzed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{maxCount}</div>
          <div className="text-sm text-gray-600">Max Weekly Events</div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={async () => {
            if (!heatmapData) return;

            try {
              await exportCurriculumHeatmap(heatmapData, 'csv', {
                subtitle: `${viewMode} view - ${heatmapData.metadata.coveragePercentage}% coverage`,
                includeMetadata: true,
              });
            } catch (error) {
              showExportError('curriculum-heatmap', 'csv', error as Error);
            }
          }}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Export Data
        </button>
        <button
          onClick={async () => {
            if (!heatmapData) return;

            try {
              await exportCurriculumHeatmap(heatmapData, 'pdf', {
                subtitle: `${viewMode} view - Generated on ${new Date().toLocaleDateString()}`,
                includeMetadata: true,
              });
            } catch (error) {
              showExportError('curriculum-heatmap', 'pdf', error as Error);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Export Report
        </button>
      </div>
    </div>
  );
};

export default CurriculumHeatmap;
