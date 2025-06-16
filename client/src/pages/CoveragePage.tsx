import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useOutcomeCoverage,
  useThematicUnits,
  useCognates,
  useOutcomeAssessments,
  type OutcomeCoverage,
  type ThematicUnit,
} from '../api';
import { useAuth } from '../contexts/AuthContext';

// Component to display assessment data for a specific outcome
function OutcomeAssessmentCell({ outcomeId }: { outcomeId: string }) {
  const { data: assessmentData } = useOutcomeAssessments(outcomeId);

  if (!assessmentData || assessmentData.assessmentCount === 0) {
    return <div className="text-gray-500 text-center text-sm">No assessments</div>;
  }

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-blue-900">
        {assessmentData.assessmentCount} assessment{assessmentData.assessmentCount > 1 ? 's' : ''}
      </div>
      {assessmentData.averageScore > 0 && (
        <div className="text-xs text-gray-600">Avg: {assessmentData.averageScore}%</div>
      )}
      {assessmentData.lastAssessmentDate && (
        <div className="text-xs text-gray-500">
          Last:{' '}
          {new Date(assessmentData.lastAssessmentDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}
      {assessmentData.totalResults === 0 && (
        <div className="text-xs text-orange-600">⏳ Pending results</div>
      )}
    </div>
  );
}

export default function CoveragePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [showCognateOutcomes, setShowCognateOutcomes] = useState<boolean>(false);
  const [showAssessedOutcomes, setShowAssessedOutcomes] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'subject' | 'thematic'>('subject');
  const [filterParams, setFilterParams] = useState<{
    subject?: string;
    grade?: string;
    domain?: string;
  }>({});

  const { user } = useAuth();

  // Fetch outcome coverage data with the current filters
  const { data: coverageData = [], isLoading, error } = useOutcomeCoverage(filterParams);

  // Fetch thematic units for the thematic view
  const { data: thematicUnits = [] } = useThematicUnits();

  // Fetch cognates for filtering
  const { data: cognates = [] } = useCognates(user ? Number(user.id) : undefined);

  // Get outcomes linked to cognates
  const cognateLinkedOutcomeIds = new Set(
    cognates.flatMap((cognate) => cognate.linkedOutcomes?.map((link) => link.outcome.id) || []),
  );

  // Filter coverage data based on cognate filter
  const filteredCoverageData = showCognateOutcomes
    ? coverageData.filter((outcome) => cognateLinkedOutcomeIds.has(outcome.outcomeId))
    : coverageData;

  // Calculate coverage statistics based on filtered data
  const totalOutcomes = filteredCoverageData.length;
  const coveredOutcomes = filteredCoverageData.filter((outcome) => outcome.isCovered).length;
  const coveragePercentage =
    totalOutcomes > 0 ? Math.round((coveredOutcomes / totalOutcomes) * 100) : 0;

  // Extract unique subjects, grades, and domains for filter dropdowns
  const subjects = [...new Set(coverageData.map((o) => o.subject))];
  const grades = [...new Set(coverageData.map((o) => o.grade))].sort((a, b) => a - b);
  const domains = [...new Set(coverageData.map((o) => o.domain).filter(Boolean))];

  // Group outcomes by subject for the summary view (using filtered data)
  const outcomesBySubject = filteredCoverageData.reduce(
    (acc, outcome) => {
      if (!acc[outcome.subject]) {
        acc[outcome.subject] = {
          total: 0,
          covered: 0,
          outcomes: [],
        };
      }

      acc[outcome.subject].total += 1;
      if (outcome.isCovered) {
        acc[outcome.subject].covered += 1;
      }
      acc[outcome.subject].outcomes.push(outcome);

      return acc;
    },
    {} as Record<string, { total: number; covered: number; outcomes: OutcomeCoverage[] }>,
  );

  // Group outcomes by thematic units for the thematic view
  const outcomesByThematicUnit = thematicUnits.reduce(
    (acc, unit) => {
      if (!unit.outcomes) {
        acc[unit.id] = {
          unit,
          total: 0,
          covered: 0,
          outcomes: [],
        };
        return acc;
      }

      const unitOutcomeIds = new Set(unit.outcomes.map((o) => o.outcome.id));
      const unitCoverageData = filteredCoverageData.filter((coverage) =>
        unitOutcomeIds.has(coverage.outcomeId),
      );

      acc[unit.id] = {
        unit,
        total: unitCoverageData.length,
        covered: unitCoverageData.filter((o) => o.isCovered).length,
        outcomes: unitCoverageData,
      };

      return acc;
    },
    {} as Record<
      number,
      {
        unit: ThematicUnit;
        total: number;
        covered: number;
        outcomes: OutcomeCoverage[];
      }
    >,
  );

  // Apply filters
  const handleApplyFilters = () => {
    const filters: {
      subject?: string;
      grade?: string;
      domain?: string;
    } = {};

    if (selectedSubject) filters.subject = selectedSubject;
    if (selectedGrade) filters.grade = selectedGrade;
    if (selectedDomain) filters.domain = selectedDomain;

    setFilterParams(filters);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedDomain('');
    setShowCognateOutcomes(false);
    setFilterParams({});
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Curriculum Coverage Dashboard</h1>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setViewMode('subject')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'subject'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📚 By Subject
            </button>
            <button
              onClick={() => setViewMode('thematic')}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'thematic'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🌍 By Thematic Unit
            </button>
          </div>
        </div>
        <a href="/" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
          Back to Dashboard
        </a>
      </div>

      {/* Coverage Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Overall Coverage</h2>
        <div className="flex flex-wrap gap-6">
          <div className="bg-blue-50 rounded-lg p-4 flex-1">
            <p className="text-sm text-gray-600">Total Outcomes</p>
            <p className="text-3xl font-bold">{totalOutcomes}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex-1">
            <p className="text-sm text-gray-600">Covered Outcomes</p>
            <p className="text-3xl font-bold text-green-600">{coveredOutcomes}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex-1">
            <p className="text-sm text-gray-600">Coverage Percentage</p>
            <p className="text-3xl font-bold">{coveragePercentage}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${coveragePercentage < 50 ? 'bg-red-600' : coveragePercentage < 80 ? 'bg-yellow-400' : 'bg-green-600'}`}
                style={{ width: `${coveragePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Filter Outcomes</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full md:w-auto flex-grow">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto flex-grow">
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              id="grade"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-auto flex-grow">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <select
              id="domain"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="">All Domains</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cognate-filter"
                checked={showCognateOutcomes}
                onChange={(e) => setShowCognateOutcomes(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="cognate-filter" className="ml-2 text-sm text-gray-700">
                🧠 Show only outcomes linked to cognates
                {cognateLinkedOutcomeIds.size > 0 && (
                  <span className="ml-1 text-indigo-600">
                    ({cognateLinkedOutcomeIds.size} available)
                  </span>
                )}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="assessment-filter"
                checked={showAssessedOutcomes}
                onChange={(e) => setShowAssessedOutcomes(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="assessment-filter" className="ml-2 text-sm text-gray-700">
                📝 Show only outcomes with no assessments
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading and error states */}
      {isLoading && <div className="text-center py-4">Loading coverage data...</div>}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error loading coverage data. Please try again.
        </div>
      )}

      {/* Subject-wise breakdown */}
      {!isLoading && !error && coverageData.length > 0 && viewMode === 'subject' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Coverage by Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(outcomesBySubject).map(([subject, data]) => {
              const subjectCoveragePercent =
                data.total > 0 ? Math.round((data.covered / data.total) * 100) : 0;

              return (
                <div key={subject} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-blue-600 text-white p-3">
                    <h3 className="font-semibold">{subject}</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span>Coverage:</span>
                      <span className="font-medium">
                        {data.covered} / {data.total} ({subjectCoveragePercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className={`h-2.5 rounded-full ${
                          subjectCoveragePercent < 50
                            ? 'bg-red-600'
                            : subjectCoveragePercent < 80
                              ? 'bg-yellow-400'
                              : 'bg-green-600'
                        }`}
                        style={{ width: `${subjectCoveragePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Thematic Units breakdown */}
      {!isLoading && !error && viewMode === 'thematic' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Coverage by Thematic Unit</h2>
          {Object.keys(outcomesByThematicUnit).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(outcomesByThematicUnit).map(([unitId, data]) => {
                const unitCoveragePercent =
                  data.total > 0 ? Math.round((data.covered / data.total) * 100) : 0;

                const formatDateRange = (startDate: string, endDate: string) => {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

                  if (
                    start.getMonth() === end.getMonth() &&
                    start.getFullYear() === end.getFullYear()
                  ) {
                    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}`;
                  }

                  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
                };

                return (
                  <div key={unitId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-emerald-600 text-white p-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        🌍 {data.unit.title}
                      </h3>
                      <p className="text-emerald-100 text-sm mt-1">
                        {formatDateRange(data.unit.startDate, data.unit.endDate)}
                      </p>
                    </div>
                    <div className="p-4">
                      {data.unit.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {data.unit.description}
                        </p>
                      )}
                      <div className="flex justify-between mb-2">
                        <span>Outcome Coverage:</span>
                        <span className="font-medium">
                          {data.covered} / {data.total} ({unitCoveragePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                          className={`h-2.5 rounded-full ${
                            unitCoveragePercent < 50
                              ? 'bg-red-600'
                              : unitCoveragePercent < 80
                                ? 'bg-yellow-400'
                                : 'bg-green-600'
                          }`}
                          style={{ width: `${unitCoveragePercent}%` }}
                        ></div>
                      </div>
                      {data.unit.activities && data.unit.activities.length > 0 && (
                        <div className="text-xs text-gray-500">
                          📚 {data.unit.activities.length} activities planned
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-lg font-medium text-emerald-900 mb-2">No thematic units found</h3>
              <p className="text-emerald-700 text-sm">
                Create thematic units to see curriculum coverage organized by cross-curricular
                themes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed outcomes table */}
      {!isLoading && !error && coverageData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Detailed Outcome Coverage</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Code</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Subject</th>
                  <th className="px-4 py-2 border">Domain</th>
                  <th className="px-4 py-2 border">Grade</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Activities</th>
                  <th className="px-4 py-2 border">Assessments</th>
                </tr>
              </thead>
              <tbody>
                {coverageData.map((outcome) => (
                  <tr
                    key={outcome.outcomeId}
                    className={`${outcome.isCovered ? 'bg-green-50' : 'bg-red-50'} hover:bg-opacity-80`}
                  >
                    <td className="px-4 py-2 border font-mono">{outcome.code}</td>
                    <td className="px-4 py-2 border">{outcome.description}</td>
                    <td className="px-4 py-2 border">{outcome.subject}</td>
                    <td className="px-4 py-2 border">{outcome.domain || '-'}</td>
                    <td className="px-4 py-2 border text-center">{outcome.grade}</td>
                    <td className="px-4 py-2 border text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          outcome.isCovered
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {outcome.isCovered ? 'Covered' : 'Not Covered'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      {outcome.isCovered ? (
                        <ul className="list-disc list-inside">
                          {outcome.coveredBy.map((activity) => (
                            <li key={activity.id}>
                              <Link
                                to={`/activities/${activity.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {activity.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border">
                      <OutcomeAssessmentCell outcomeId={outcome.outcomeId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !error && coverageData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-lg text-yellow-700 mb-2">No outcomes found</p>
          <p className="text-gray-600">
            Try adjusting your filters or add some outcomes to your curriculum.
          </p>
        </div>
      )}
    </div>
  );
}
