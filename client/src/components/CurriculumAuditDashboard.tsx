import React, { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { useSubjects, useActivities, useOutcomeCoverage } from '../api';
import type { Subject, Activity, Outcome } from '../types';

interface AuditMetrics {
  totalOutcomes: number;
  coveredOutcomes: number;
  uncoveredOutcomes: number;
  coveragePercentage: number;
  activitiesCount: number;
  subjectsAudited: number;
}

interface SubjectAudit {
  subject: Subject;
  metrics: {
    totalOutcomes: number;
    coveredOutcomes: number;
    coveragePercentage: number;
    recentActivities: Activity[];
    uncoveredOutcomes: Outcome[];
  };
}

export default function CurriculumAuditDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'term' | 'semester' | 'year'>('term');
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');

  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();
  const { data: coverageData = [], isLoading: coverageLoading } = useOutcomeCoverage();

  const isLoading = subjectsLoading || activitiesLoading || coverageLoading;

  // Calculate overall audit metrics
  const overallMetrics = useMemo((): AuditMetrics => {
    const filteredSubjects =
      selectedSubjects.length > 0
        ? subjects.filter((s) => selectedSubjects.includes(s.id))
        : subjects;

    const totalOutcomes = filteredSubjects.reduce(
      (sum, subject) =>
        sum +
        subject.milestones.reduce((mSum, milestone) => mSum + (milestone.outcomes?.length || 0), 0),
      0,
    );

    const coveredOutcomes = coverageData.filter((coverage) =>
      filteredSubjects.some((subject) =>
        subject.milestones.some((milestone) =>
          milestone.outcomes?.some((outcome) => outcome.outcome.id === coverage.outcomeId),
        ),
      ),
    ).length;

    const uncoveredOutcomes = totalOutcomes - coveredOutcomes;
    const coveragePercentage = totalOutcomes > 0 ? (coveredOutcomes / totalOutcomes) * 100 : 0;

    return {
      totalOutcomes,
      coveredOutcomes,
      uncoveredOutcomes,
      coveragePercentage,
      activitiesCount: activities.length,
      subjectsAudited: filteredSubjects.length,
    };
  }, [subjects, activities, coverageData, selectedSubjects]);

  // Calculate subject-specific audit data
  const subjectAudits = useMemo((): SubjectAudit[] => {
    const filteredSubjects =
      selectedSubjects.length > 0
        ? subjects.filter((s) => selectedSubjects.includes(s.id))
        : subjects;

    return filteredSubjects.map((subject) => {
      const subjectOutcomes = subject.milestones.flatMap((m) => m.outcomes || []);
      const coveredOutcomeIds = new Set(
        coverageData
          .filter((coverage) => subjectOutcomes.some((o) => o.outcome.id === coverage.outcomeId))
          .map((coverage) => coverage.outcomeId),
      );

      const coveredOutcomes = subjectOutcomes.filter((o) =>
        coveredOutcomeIds.has(o.outcome.id),
      ).length;
      const uncoveredOutcomes = subjectOutcomes
        .filter((o) => !coveredOutcomeIds.has(o.outcome.id))
        .map((o) => o.outcome);
      const recentActivities = activities
        .filter((a) => a.milestoneId && subject.milestones.some((m) => m.id === a.milestoneId))
        .slice(0, 5);

      return {
        subject,
        metrics: {
          totalOutcomes: subjectOutcomes.length,
          coveredOutcomes,
          coveragePercentage:
            subjectOutcomes.length > 0 ? (coveredOutcomes / subjectOutcomes.length) * 100 : 0,
          recentActivities,
          uncoveredOutcomes,
        },
      };
    });
  }, [subjects, activities, coverageData, selectedSubjects]);

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId],
    );
  };

  const handleExportAudit = () => {
    const auditData = {
      generatedAt: new Date().toISOString(),
      timeframe: selectedTimeframe,
      overallMetrics,
      subjectAudits: subjectAudits.map((audit) => ({
        subjectName: audit.subject.name,
        ...audit.metrics,
        uncoveredOutcomes: audit.metrics.uncoveredOutcomes.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
        })),
        recentActivities: audit.metrics.recentActivities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          createdAt: a.createdAt,
        })),
      })),
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculum-audit-${selectedTimeframe}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const csvRows = [
        ['Subject', 'Total Outcomes', 'Covered Outcomes', 'Coverage %', 'Uncovered Count'],
        ...subjectAudits.map((audit) => [
          audit.subject.name,
          audit.metrics.totalOutcomes.toString(),
          audit.metrics.coveredOutcomes.toString(),
          audit.metrics.coveragePercentage.toFixed(1) + '%',
          audit.metrics.uncoveredOutcomes.length.toString(),
        ]),
      ];

      const csvContent = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculum-audit-${selectedTimeframe}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF export would require a PDF library
      alert('PDF export feature requires additional implementation. Use JSON or CSV for now.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading curriculum audit data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Curriculum Audit Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of curriculum coverage and implementation
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleExportAudit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📊 Export Audit Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) =>
                  setSelectedTimeframe(e.target.value as 'term' | 'semester' | 'year')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="term">Current Term</option>
                <option value="semester">Current Semester</option>
                <option value="year">Full Academic Year</option>
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.length === 0}
                    onChange={() => setSelectedSubjects([])}
                    className="mr-2"
                  />
                  <span className="text-sm">All Subjects</span>
                </label>
                {subjects.map((subject) => (
                  <label key={subject.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">{subject.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv' | 'json')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Report</option>
                <option value="csv">CSV Data</option>
                <option value="json">JSON Export</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Coverage Percentage</h3>
            <p className="text-3xl font-bold text-blue-600">
              {overallMetrics.coveragePercentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {overallMetrics.coveredOutcomes} of {overallMetrics.totalOutcomes} outcomes
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Uncovered Outcomes</h3>
            <p className="text-3xl font-bold text-red-600">{overallMetrics.uncoveredOutcomes}</p>
            <p className="text-sm text-gray-600 mt-1">Require attention</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Activities</h3>
            <p className="text-3xl font-bold text-green-600">{overallMetrics.activitiesCount}</p>
            <p className="text-sm text-gray-600 mt-1">Planned this period</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500">Subjects Audited</h3>
            <p className="text-3xl font-bold text-purple-600">{overallMetrics.subjectsAudited}</p>
            <p className="text-sm text-gray-600 mt-1">In current selection</p>
          </div>
        </div>

        {/* Subject-by-Subject Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Subject Analysis</h2>
          </div>
          <div className="p-6">
            {subjectAudits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-sm">No subjects selected for audit</p>
              </div>
            ) : (
              <div className="space-y-6">
                {subjectAudits.map((audit) => (
                  <div key={audit.subject.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {audit.subject.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {audit.metrics.coveredOutcomes} of {audit.metrics.totalOutcomes} outcomes
                          covered ({audit.metrics.coveragePercentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 h-16 relative">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-gray-200"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${audit.metrics.coveragePercentage} 100`}
                              className={
                                audit.metrics.coveragePercentage >= 80
                                  ? 'text-green-500'
                                  : audit.metrics.coveragePercentage >= 60
                                    ? 'text-yellow-500'
                                    : 'text-red-500'
                              }
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {audit.metrics.coveragePercentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Uncovered Outcomes */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Uncovered Outcomes ({audit.metrics.uncoveredOutcomes.length})
                        </h4>
                        {audit.metrics.uncoveredOutcomes.length === 0 ? (
                          <p className="text-sm text-green-600">✅ All outcomes covered!</p>
                        ) : (
                          <div className="max-h-32 overflow-y-auto">
                            {audit.metrics.uncoveredOutcomes.slice(0, 5).map((outcome) => (
                              <div key={outcome.id} className="text-sm text-gray-600 mb-2">
                                • {outcome.title}
                              </div>
                            ))}
                            {audit.metrics.uncoveredOutcomes.length > 5 && (
                              <div className="text-sm text-gray-500 italic">
                                ...and {audit.metrics.uncoveredOutcomes.length - 5} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Recent Activities */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Recent Activities ({audit.metrics.recentActivities.length})
                        </h4>
                        {audit.metrics.recentActivities.length === 0 ? (
                          <p className="text-sm text-gray-500">No recent activities</p>
                        ) : (
                          <div className="max-h-32 overflow-y-auto">
                            {audit.metrics.recentActivities.map((activity) => (
                              <div key={activity.id} className="text-sm text-gray-600 mb-2">
                                • {activity.title}
                                <span className="text-xs text-gray-400 ml-2">
                                  (
                                  {activity.createdAt
                                    ? new Date(activity.createdAt).toLocaleDateString()
                                    : 'No date'}
                                  )
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
