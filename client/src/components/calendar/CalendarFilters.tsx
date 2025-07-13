import { X } from 'lucide-react';

import { Button } from '../ui/Button';

interface CalendarFilter {
  subjects: string[];
  eventTypes: string[];
  showWeekends: boolean;
}

interface CalendarFiltersProps {
  filters: CalendarFilter;
  onFiltersChange: (filters: CalendarFilter) => void;
  availableSubjects: string[];
}

const EVENT_TYPE_OPTIONS = [
  { value: 'lesson', label: 'Lessons' },
  { value: 'unit-boundary', label: 'Unit Milestones' },
  { value: 'holiday', label: 'Holidays' },
  { value: 'pd-day', label: 'PD Days' },
  { value: 'assessment', label: 'Assessments' },
  { value: 'school-event', label: 'School Events' },
];

export default function CalendarFilters({
  filters,
  onFiltersChange,
  availableSubjects,
}: CalendarFiltersProps): React.ReactElement {
  const handleSubjectToggle = (subject: string): void => {
    const newSubjects = filters.subjects.includes(subject)
      ? filters.subjects.filter(s => s !== subject)
      : [...filters.subjects, subject];
    onFiltersChange({ ...filters, subjects: newSubjects });
  };

  const handleEventTypeToggle = (eventType: string): void => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(t => t !== eventType)
      : [...filters.eventTypes, eventType];
    onFiltersChange({ ...filters, eventTypes: newEventTypes });
  };

  const handleClearFilters = (): void => {
    onFiltersChange({
      subjects: [],
      eventTypes: [],
      showWeekends: true,
    });
  };

  const hasActiveFilters = filters.subjects.length > 0 || filters.eventTypes.length > 0 || !filters.showWeekends;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">Filter Calendar</h3>
        {hasActiveFilters && (
          <Button
            className="text-gray-500 hover:text-gray-700"
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Subject Filters */}
      {availableSubjects.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Subjects</h4>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map(subject => (
              <button
                key={subject}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.subjects.includes(subject)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => {
 handleSubjectToggle(subject); 
}}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event Type Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Event Types</h4>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPE_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filters.eventTypes.includes(option.value)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => {
 handleEventTypeToggle(option.value); 
}}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Other Options */}
      <div>
        <label className="flex items-center space-x-2 text-sm">
          <input
            checked={filters.showWeekends}
            className="rounded border-gray-300"
            type="checkbox"
            onChange={(e) => {
 onFiltersChange({ ...filters, showWeekends: e.target.checked }); 
}}
          />
          <span className="text-gray-700">Show Weekends</span>
        </label>
      </div>
    </div>
  );
}