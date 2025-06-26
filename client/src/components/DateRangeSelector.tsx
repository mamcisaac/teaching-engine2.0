import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { cn } from '../lib/utils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  className?: string;
}

type PresetRange = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

export default function DateRangeSelector({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const [preset, setPreset] = useState<PresetRange>('thisWeek');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(format(startDate, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endDate, 'yyyy-MM-dd'));

  // Update custom dates when props change
  useEffect(() => {
    setCustomStart(format(startDate, 'yyyy-MM-dd'));
    setCustomEnd(format(endDate, 'yyyy-MM-dd'));
  }, [startDate, endDate]);

  const handlePresetChange = (newPreset: PresetRange) => {
    setPreset(newPreset);
    setShowCustomPicker(newPreset === 'custom');

    const today = new Date();
    let newStart: Date;
    let newEnd: Date;

    switch (newPreset) {
      case 'thisWeek':
        newStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        newEnd = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'lastWeek': {
        const lastWeek = subWeeks(today, 1);
        newStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
        newEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      }
      case 'thisMonth':
        newStart = startOfMonth(today);
        newEnd = endOfMonth(today);
        break;
      case 'lastMonth': {
        const lastMonth = subMonths(today, 1);
        newStart = startOfMonth(lastMonth);
        newEnd = endOfMonth(lastMonth);
        break;
      }
      case 'custom':
        // Don't change dates for custom
        return;
      default:
        return;
    }

    onChange(newStart, newEnd);
  };

  const handleCustomDateChange = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    
    if (start <= end) {
      onChange(start, end);
      setShowCustomPicker(false);
    }
  };

  const quickNavigation = (direction: 'prev' | 'next') => {
    let newStart: Date;
    let newEnd: Date;

    if (preset === 'thisWeek' || preset === 'lastWeek') {
      // Navigate by week
      const weekOffset = direction === 'prev' ? -1 : 1;
      newStart = new Date(startDate);
      newEnd = new Date(endDate);
      newStart.setDate(newStart.getDate() + (weekOffset * 7));
      newEnd.setDate(newEnd.getDate() + (weekOffset * 7));
    } else if (preset === 'thisMonth' || preset === 'lastMonth') {
      // Navigate by month
      const monthOffset = direction === 'prev' ? -1 : 1;
      newStart = new Date(startDate);
      newEnd = new Date(endDate);
      newStart.setMonth(newStart.getMonth() + monthOffset);
      newEnd.setMonth(newEnd.getMonth() + monthOffset);
      newEnd = endOfMonth(newEnd);
    } else {
      // For custom, navigate by the current range duration
      const duration = endDate.getTime() - startDate.getTime();
      const offset = direction === 'prev' ? -duration : duration;
      newStart = new Date(startDate.getTime() + offset);
      newEnd = new Date(endDate.getTime() + offset);
    }

    onChange(newStart, newEnd);
    setPreset('custom'); // Switch to custom when navigating
  };

  const presetButtons: { value: PresetRange; label: string }[] = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {presetButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handlePresetChange(value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                preset === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Current range display with navigation */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={() => quickNavigation('prev')}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Previous period"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex-1 flex items-center justify-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
              {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            </span>
            <span className="text-gray-500">
              ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
            </span>
          </div>
          
          <button
            onClick={() => quickNavigation('next')}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Next period"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Custom date picker */}
        {showCustomPicker && (
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  min={customStart}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCustomPicker(false);
                  setPreset('thisWeek');
                  handlePresetChange('thisWeek');
                }}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateChange}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}