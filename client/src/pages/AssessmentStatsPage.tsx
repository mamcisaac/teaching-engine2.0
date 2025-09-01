import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { AssessmentStatsDashboard } from '../components/assessment/AssessmentStatsDashboard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';

export function AssessmentStatsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'term' | 'all'>('month');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>();

  // Calculate date filters based on selected range
  const getDateFilters = () => {
    const today = new Date();
    switch (dateRange) {
      case 'week':
        return {
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        };
      case 'term':
        // Assuming term is last 3 months
        return {
          startDate: format(subDays(today, 90), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        };
      default:
        return {};
    }
  };

  const dateFilters = getDateFilters();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link className="hover:text-indigo-600" to="/planner">
            Planner
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Assessment Statistics</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              Assessment Statistics
            </h1>
            <p className="mt-2 text-gray-600">
              Track your lesson assessments and reflections over time
            </p>
          </div>

          <Link to="/planner/units">
            <Button variant="outline">Back to Planner</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Time Period:</span>
            <div className="flex gap-1">
              {(['week', 'month', 'term', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    dateRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' ? 'Last Week' :
                   range === 'month' ? 'This Month' :
                   range === 'term' ? 'This Term' :
                   'All Time'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Subjects</option>
              <option value="Français (Immersion)">Français (Immersion)</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Sciences de la nature">Sciences</option>
              <option value="Sciences humaines">Social Studies</option>
              <option value="Arts visuels">Arts</option>
              <option value="Formation personnelle et sociale">Health/FPS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Grade:</span>
            <select
              value={selectedGrade || ''}
              onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
            </select>
          </div>
        </div>

        {dateRange !== 'all' && (
          <div className="mt-2 text-sm text-gray-500">
            Showing data from {format(new Date(dateFilters.startDate!), 'MMM d, yyyy')} to{' '}
            {format(new Date(dateFilters.endDate!), 'MMM d, yyyy')}
          </div>
        )}
      </Card>

      {/* Statistics Dashboard */}
      <AssessmentStatsDashboard
        startDate={dateFilters.startDate}
        endDate={dateFilters.endDate}
        subject={selectedSubject || undefined}
        grade={selectedGrade}
      />

      {/* Export Options */}
      <Card className="mt-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Assessment Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download your assessment data for further analysis or reporting
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Export as CSV
            </Button>
            <Button variant="outline" size="sm">
              Export as PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}