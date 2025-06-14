import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOutcomeCoverage, OutcomeCoverage } from '../api';

export default function CoveragePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [filterParams, setFilterParams] = useState<{
    subject?: string;
    grade?: string;
    domain?: string;
  }>({});

  // Fetch outcome coverage data with the current filters
  const { 
    data: coverageData = [], 
    isLoading, 
    error 
  } = useOutcomeCoverage(filterParams);

  // Calculate coverage statistics
  const totalOutcomes = coverageData.length;
  const coveredOutcomes = coverageData.filter(outcome => outcome.isCovered).length;
  const coveragePercentage = totalOutcomes > 0 
    ? Math.round((coveredOutcomes / totalOutcomes) * 100) 
    : 0;

  // Extract unique subjects, grades, and domains for filter dropdowns
  const subjects = [...new Set(coverageData.map(o => o.subject))];
  const grades = [...new Set(coverageData.map(o => o.grade))].sort((a, b) => a - b);
  const domains = [...new Set(coverageData.map(o => o.domain).filter(Boolean))];

  // Group outcomes by subject for the summary view
  const outcomesBySubject = coverageData.reduce((acc, outcome) => {
    if (!acc[outcome.subject]) {
      acc[outcome.subject] = {
        total: 0,
        covered: 0,
        outcomes: []
      };
    }
    
    acc[outcome.subject].total += 1;
    if (outcome.isCovered) {
      acc[outcome.subject].covered += 1;
    }
    acc[outcome.subject].outcomes.push(outcome);
    
    return acc;
  }, {} as Record<string, { total: number; covered: number; outcomes: OutcomeCoverage[] }>);

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
    setFilterParams({});
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Curriculum Coverage Dashboard</h1>
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
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
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
              onChange={e => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
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
              onChange={e => setSelectedDomain(e.target.value)}
            >
              <option value="">All Domains</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
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
      
      {/* Loading and error states */}
      {isLoading && <div className="text-center py-4">Loading coverage data...</div>}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Error loading coverage data. Please try again.
        </div>
      )}
      
      {/* Subject-wise breakdown */}
      {!isLoading && !error && coverageData.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Coverage by Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(outcomesBySubject).map(([subject, data]) => {
              const subjectCoveragePercent = data.total > 0 
                ? Math.round((data.covered / data.total) * 100) 
                : 0;
              
              return (
                <div key={subject} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-blue-600 text-white p-3">
                    <h3 className="font-semibold">{subject}</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span>Coverage:</span>
                      <span className="font-medium">{data.covered} / {data.total} ({subjectCoveragePercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div 
                        className={`h-2.5 rounded-full ${
                          subjectCoveragePercent < 50 ? 'bg-red-600' : 
                          subjectCoveragePercent < 80 ? 'bg-yellow-400' : 
                          'bg-green-600'
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
                </tr>
              </thead>
              <tbody>
                {coverageData.map(outcome => (
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
                          {outcome.coveredBy.map(activity => (
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
          <p className="text-gray-600">Try adjusting your filters or add some outcomes to your curriculum.</p>
        </div>
      )}
    </div>
  );
}