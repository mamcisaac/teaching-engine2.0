import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { useTimelineEvents, useTimelineSummary, TimelineEvent, TimelineFilters } from '../api';
import { useSubjects } from '../api';
import { useOutcomes } from '../api';
import {
  Activity,
  GraduationCap,
  Palette,
  FileText,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TimelineWeek {
  weekStart: Date;
  weekEnd: Date;
  events: TimelineEvent[];
}

const StudentTimeline: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
  });

  const [filters, setFilters] = useState<TimelineFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: events = [], isLoading: eventsLoading } = useTimelineEvents({
    ...dateRange,
    ...filters,
  });

  const { data: summary, isLoading: summaryLoading } = useTimelineSummary(dateRange);
  const { data: subjects = [] } = useSubjects();
  const { data: outcomes = [] } = useOutcomes();

  // Group events by week
  const weeklyEvents = useMemo(() => {
    const weeks: TimelineWeek[] = [];
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sortedEvents.forEach((event) => {
      const eventDate = parseISO(event.date);
      const weekStart = startOfWeek(eventDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(eventDate, { weekStartsOn: 1 });

      let week = weeks.find((w) => w.weekStart.getTime() === weekStart.getTime());

      if (!week) {
        week = { weekStart, weekEnd, events: [] };
        weeks.push(week);
      }

      week.events.push(event);
    });

    return weeks;
  }, [events]);

  // Event icon and color mapping
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'activity':
        return <Activity className="w-4 h-4" />;
      case 'assessment':
        return <GraduationCap className="w-4 h-4" />;
      case 'theme':
        return <Palette className="w-4 h-4" />;
      case 'newsletter':
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'activity':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assessment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'theme':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'newsletter':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Navigation handlers
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const fromDate = parseISO(dateRange.from);
    const toDate = parseISO(dateRange.to);
    const monthDiff = direction === 'prev' ? -3 : 3;

    setDateRange({
      from: new Date(fromDate.setMonth(fromDate.getMonth() + monthDiff)).toISOString(),
      to: new Date(toDate.setMonth(toDate.getMonth() + monthDiff)).toISOString(),
    });
  };

  if (eventsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Learning Timeline</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Outcome Coverage</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.coveredOutcomes}/{summary.totalOutcomes}
              </p>
              <p className="text-sm text-gray-500">{summary.coveragePercentage}%</p>
            </div>

            {summary.nextMilestone && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Next Milestone</p>
                <p className="text-lg font-semibold text-green-600">
                  {summary.nextMilestone.title}
                </p>
                <p className="text-sm text-gray-500">
                  {format(parseISO(summary.nextMilestone.targetDate), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Timeline Period</p>
              <p className="text-sm font-semibold text-purple-600">
                {format(parseISO(dateRange.from), 'MMM dd, yyyy')} -
                {format(parseISO(dateRange.to), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="subject-filter" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <select
                  id="subject-filter"
                  value={filters.subjectId?.toString() || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      subjectId: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="outcome-filter" className="block text-sm font-medium mb-2">
                  Outcome
                </label>
                <select
                  id="outcome-filter"
                  value={filters.outcomeId || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, outcomeId: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Outcomes</option>
                  {outcomes.map((outcome) => (
                    <option key={outcome.id} value={outcome.id}>
                      {outcome.code} - {outcome.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTimeline('prev')}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous 3 Months
        </button>

        <button
          onClick={() => navigateTimeline('next')}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          Next 3 Months
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Timeline Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-6">
            {weeklyEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No timeline events found for this period.
              </div>
            ) : (
              <div className="space-y-8">
                {weeklyEvents.map((week, weekIndex) => (
                  <div key={weekIndex} className="relative">
                    {/* Week Header */}
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="font-semibold text-gray-700">
                        Week of {format(week.weekStart, 'MMM dd, yyyy')}
                      </h3>
                    </div>

                    {/* Week Events */}
                    <div className="ml-7 space-y-3">
                      {/* Render theme blocks first */}
                      {week.events
                        .filter((e) => e.type === 'theme')
                        .map((event) => (
                          <div
                            key={event.id}
                            className={`p-4 rounded-lg border-2 ${getEventColor(event.type)}`}
                          >
                            <div className="flex items-start gap-3">
                              {getEventIcon(event.type)}
                              <div className="flex-1">
                                <p className="font-medium">{event.label}</p>
                                {event.metadata?.endDate && (
                                  <p className="text-sm opacity-75">
                                    Through{' '}
                                    {format(parseISO(event.metadata.endDate), 'MMM dd, yyyy')}
                                  </p>
                                )}
                                {event.linkedOutcomeIds.length > 0 && (
                                  <p className="text-xs mt-1">
                                    {event.linkedOutcomeIds.length} outcomes
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Render other events */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {week.events
                          .filter((e) => e.type !== 'theme')
                          .map((event) => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
                            >
                              <div className="flex items-start gap-2">
                                {getEventIcon(event.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{event.label}</p>
                                  <p className="text-xs opacity-75">
                                    {format(parseISO(event.date), 'MMM dd')}
                                  </p>
                                  {event.metadata?.score !== undefined && (
                                    <p className="text-xs font-semibold mt-1">
                                      Score: {event.metadata.score}%
                                    </p>
                                  )}
                                  {event.linkedOutcomeIds.length > 0 && (
                                    <p className="text-xs mt-1">
                                      {event.linkedOutcomeIds.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
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
};

export default StudentTimeline;
