import { useState } from 'react';
import { useOutcomes } from '../api';
import type { Outcome } from '../types';
import OutcomeTooltip from '../components/OutcomeTooltip';
import OutcomeDetail from '../components/OutcomeDetail';

export default function OutcomesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Outcome>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'details'>('table');

  // Use the API hook to fetch outcomes
  // Use React Query hook to fetch outcomes from API
  const { data: outcomes = [], isLoading: loading, error: queryError } = useOutcomes(searchFilters);

  // Handle API errors
  const error = queryError ? 'Failed to load outcomes. Please try again.' : null;

  // Apply search and filters
  const handleSearch = () => {
    const filters: Record<string, string> = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedSubject) filters.subject = selectedSubject;
    if (selectedGrade) filters.grade = selectedGrade;
    if (selectedDomain) filters.domain = selectedDomain;
    setSearchFilters(filters);
  };

  // Reset all filters
  const handleReset = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedDomain('');
    setSearchFilters({});
  };

  // Handle sorting
  const handleSort = (field: keyof Outcome) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort outcomes based on current sort settings
  const sortedOutcomes = [...outcomes].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (aValue === bValue) return 0;

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  // Group outcomes by subject for the card view
  const outcomesBySubject = sortedOutcomes.reduce(
    (groups, outcome) => {
      const subject = outcome.subject;
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(outcome);
      return groups;
    },
    {} as Record<string, Outcome[]>,
  );

  // Extract unique subjects, grades, and domains for filter dropdowns
  const subjects = [...new Set(outcomes.map((o) => o.subject))].sort();
  const grades = [...new Set(outcomes.map((o) => o.grade))].sort((a, b) => a - b);
  const domains = [...new Set(outcomes.map((o) => o.domain).filter(Boolean))].sort();

  // Sort icon component
  const SortIcon = ({ field }: { field: keyof Outcome }) => {
    if (field !== sortField) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Curriculum Outcomes</h1>
        <div className="flex space-x-2">
          <a
            href="/coverage"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Coverage Dashboard
          </a>
          <a href="/" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
            Back to Dashboard
          </a>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="w-full md:w-auto">
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

          <div className="w-full md:w-auto">
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

          <div className="w-full md:w-auto">
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

        <div className="flex justify-between items-center">
          {/* View mode selector */}
          <div className="flex gap-2 bg-white rounded-md border border-gray-300 p-1">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'details' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              onClick={() => setViewMode('details')}
            >
              Details
            </button>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Loading and error states */}
      {loading && <div className="text-center py-4">Loading outcomes...</div>}
      {error && <div className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</div>}

      {/* Results */}
      {!loading && !error && (
        <>
          {sortedOutcomes.length === 0 ? (
            <div className="text-center py-4">No outcomes found matching your criteria.</div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">All Outcomes ({sortedOutcomes.length})</h2>
              </div>

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="mb-8">
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort('code')}
                          >
                            Code <SortIcon field="code" />
                          </th>
                          <th
                            className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort('description')}
                          >
                            Description <SortIcon field="description" />
                          </th>
                          <th
                            className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort('subject')}
                          >
                            Subject <SortIcon field="subject" />
                          </th>
                          <th
                            className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort('grade')}
                          >
                            Grade <SortIcon field="grade" />
                          </th>
                          <th
                            className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort('domain')}
                          >
                            Domain <SortIcon field="domain" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOutcomes.map((outcome) => (
                          <tr key={outcome.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border font-mono">
                              <OutcomeTooltip outcome={outcome}>
                                <span className="cursor-help border-b border-dotted border-gray-500">
                                  {outcome.code}
                                </span>
                              </OutcomeTooltip>
                            </td>
                            <td className="px-4 py-2 border">{outcome.description}</td>
                            <td className="px-4 py-2 border">{outcome.subject}</td>
                            <td className="px-4 py-2 border text-center">{outcome.grade}</td>
                            <td className="px-4 py-2 border">{outcome.domain || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cards View (Group By Subject) */}
              {viewMode === 'cards' && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(outcomesBySubject).map(([subject, subjectOutcomes]) => (
                      <div
                        key={subject}
                        className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="bg-blue-600 text-white px-4 py-2 font-semibold flex justify-between">
                          <span>{subject}</span>
                          <span>{subjectOutcomes.length} outcomes</span>
                        </div>
                        <div className="p-4">
                          <div className="max-h-60 overflow-y-auto">
                            {subjectOutcomes.map((outcome) => (
                              <div key={outcome.id} className="mb-2 pb-2 border-b">
                                <div className="font-mono text-sm">
                                  <OutcomeTooltip outcome={outcome}>
                                    <span className="cursor-help border-b border-dotted border-gray-500">
                                      {outcome.code}
                                    </span>
                                  </OutcomeTooltip>
                                </div>
                                <div className="text-sm">{outcome.description}</div>
                                <div className="flex flex-wrap text-xs text-gray-600 mt-1 gap-2">
                                  {outcome.domain && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                      {outcome.domain}
                                    </span>
                                  )}
                                  <span className="bg-blue-100 px-2 py-0.5 rounded-full">
                                    Grade {outcome.grade}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed View */}
              {viewMode === 'details' && (
                <div className="mb-8">
                  {sortedOutcomes.map((outcome) => (
                    <OutcomeDetail key={outcome.id} outcome={outcome} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
