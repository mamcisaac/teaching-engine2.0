import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { api } from '../api';

interface OutcomeCoverage {
  outcomeId: string;
  outcomeCode: string;
  outcomeDescription: string;
  domain?: string;
  coveredCount: number;
  assessed: boolean;
  lastUsed: string | null;
}

interface CoverageSummary {
  total: number;
  covered: number;
  assessed: number;
  overused: number;
  uncovered: number;
  coveragePercentage: number;
  assessmentPercentage: number;
}

interface AuditFilters {
  term?: string;
  subject?: string;
  grade?: string;
  domain?: string;
  showOnlyUncovered?: boolean;
  showOnlyUnassessed?: boolean;
}

export function CurriculumAuditDashboard() {
  const [filters, setFilters] = useState<AuditFilters>({});

  // Fetch coverage data
  const { data: coverage, isLoading: isLoadingCoverage } = useQuery({
    queryKey: ['curriculum-coverage', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.term) params.append('term', filters.term);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.domain) params.append('domain', filters.domain);

      const response = await api.get(`/audit/curriculum-coverage?${params}`);
      return response.data as OutcomeCoverage[];
    },
  });

  // Fetch summary data
  const { data: summary } = useQuery({
    queryKey: ['curriculum-coverage-summary', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.term) params.append('term', filters.term);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.domain) params.append('domain', filters.domain);

      const response = await api.get(`/audit/curriculum-coverage/summary?${params}`);
      return response.data as CoverageSummary;
    },
  });

  // Filter coverage data based on checkboxes
  const filteredCoverage = useMemo(() => {
    if (!coverage) return [];

    let filtered = [...coverage];

    if (filters.showOnlyUncovered) {
      filtered = filtered.filter((item) => item.coveredCount === 0);
    }

    if (filters.showOnlyUnassessed) {
      filtered = filtered.filter((item) => !item.assessed);
    }

    return filtered;
  }, [coverage, filters]);

  // Handle export
  const handleExport = async (format: 'csv' | 'markdown') => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.term) params.append('term', filters.term);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.domain) params.append('domain', filters.domain);

    try {
      const response = await api.get(`/audit/curriculum-coverage/export?${params}`, {
        responseType: 'text',
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'text/markdown',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculum-audit.${format === 'markdown' ? 'md' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get row color class based on status
  const getRowColorClass = (item: OutcomeCoverage) => {
    if (item.coveredCount === 0) return 'bg-red-100';
    if (item.coveredCount > 3 && !item.assessed) return 'bg-yellow-100';
    if (item.coveredCount > 0 && item.assessed) return 'bg-green-100';
    return '';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Curriculum Coverage Audit</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            📁 CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('markdown')}>
            📄 Markdown
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Coverage Summary</h2>
          <p className="text-gray-600 mb-4">Overall curriculum alignment statistics</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Outcomes</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Covered</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.covered} ({summary.coveragePercentage}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${summary.coveragePercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Assessed</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.assessed} ({summary.assessmentPercentage}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${summary.assessmentPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Not Covered</p>
              <p className="text-2xl font-bold text-red-600">{summary.uncovered}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            value={filters.term || ''}
            onChange={(e) => setFilters({ ...filters, term: e.target.value || undefined })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Terms</option>
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="term3">Term 3</option>
          </select>

          <select
            value={filters.subject || ''}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value || undefined })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Subjects</option>
            <option value="FRA">French</option>
            <option value="MAT">Mathematics</option>
            <option value="SCI">Science</option>
            <option value="SOC">Social Studies</option>
          </select>

          <select
            value={filters.grade || ''}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value || undefined })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Grades</option>
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>

          <select
            value={filters.domain || ''}
            onChange={(e) => setFilters({ ...filters, domain: e.target.value || undefined })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Domains</option>
            <option value="Oral Language">Oral Language</option>
            <option value="Reading">Reading</option>
            <option value="Writing">Writing</option>
            <option value="Number Sense">Number Sense</option>
            <option value="Geometry">Geometry</option>
          </select>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.showOnlyUncovered || false}
              onChange={(e) => setFilters({ ...filters, showOnlyUncovered: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Show only uncovered</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.showOnlyUnassessed || false}
              onChange={(e) => setFilters({ ...filters, showOnlyUnassessed: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium">Show only unassessed</span>
          </label>
        </div>
      </div>

      {/* Coverage Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Coverage</h2>
        <p className="text-gray-600 mb-4">Individual outcome coverage analysis</p>

        {isLoadingCoverage ? (
          <div className="text-center py-8">Loading coverage data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Outcome</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Domain</th>
                  <th className="px-4 py-2 text-center">Covered</th>
                  <th className="px-4 py-2 text-center">Assessed</th>
                  <th className="px-4 py-2 text-center">Usage</th>
                  <th className="px-4 py-2 text-left">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoverage.map((item) => (
                  <tr key={item.outcomeId} className={`border-t ${getRowColorClass(item)}`}>
                    <td className="px-4 py-2 font-medium">{item.outcomeCode}</td>
                    <td className="px-4 py-2 max-w-md">{item.outcomeDescription}</td>
                    <td className="px-4 py-2">
                      {item.domain && (
                        <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs">
                          {item.domain}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">{item.coveredCount > 0 ? '✅' : '❌'}</td>
                    <td className="px-4 py-2 text-center">{item.assessed ? '✅' : '❌'}</td>
                    <td className="px-4 py-2 text-center">
                      {item.coveredCount === 0 ? (
                        <span className="inline-block bg-red-200 rounded-full px-2 py-1 text-xs">
                          Never
                        </span>
                      ) : item.coveredCount > 3 ? (
                        <span className="inline-block bg-yellow-200 rounded-full px-2 py-1 text-xs">
                          {item.coveredCount}× 🟡
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs">
                          {item.coveredCount}×
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {item.lastUsed ? (
                        <div className="flex items-center gap-1">
                          📅 {new Date(item.lastUsed).toLocaleDateString()}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
