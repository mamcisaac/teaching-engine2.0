import React, { useState, memo, useMemo, useCallback } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth } from 'date-fns';
import { useCalendarEvents } from '../../api/domains/calendar';
import type { CalendarEvent } from '../../types';
import { LoadingSkeleton } from './LoadingSkeleton';
import { VirtualizedList } from './VirtualizedList';
import logger from '../../utils/logger';

interface OptimizedCalendarViewProps {
  month: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  className?: string;
  compact?: boolean;
  virtualizeEvents?: boolean;
  maxEventsPerDay?: number;
}

// Memoized day cell component
const DayCell = memo(function DayCell({
  date,
  events,
  onEventClick,
  onDateClick,
  isCurrentMonth,
  maxEventsPerDay = 3,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  isCurrentMonth: boolean;
  maxEventsPerDay: number;
}) {
  const dayNumber = date.getDate();
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [date]);

  const handleDateClick = useCallback(() => {
    onDateClick?.(date);
  }, [date, onDateClick]);

  const visibleEvents = useMemo(() => {
    return events.slice(0, maxEventsPerDay);
  }, [events, maxEventsPerDay]);

  const hiddenEventCount = Math.max(0, events.length - maxEventsPerDay);

  return (
    <div
      className={`border p-1 min-h-16 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
      } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
      onClick={handleDateClick}
    >
      <div className={`font-bold text-xs mb-1 ${isToday ? 'text-blue-600' : ''}`}>
        {dayNumber}
      </div>
      
      <div className="space-y-0.5">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="text-xs bg-gray-200 rounded px-1 py-0.5 cursor-pointer hover:bg-gray-300 transition-colors truncate"
            title={event.title}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick?.(event);
            }}
          >
            {event.title}
          </div>
        ))}
        
        {hiddenEventCount > 0 && (
          <div className="text-xs text-gray-500 font-medium">
            +{hiddenEventCount} more
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing relevant props
  return (
    format(prevProps.date, 'yyyy-MM-dd') === format(nextProps.date, 'yyyy-MM-dd') &&
    prevProps.events.length === nextProps.events.length &&
    prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
    prevProps.maxEventsPerDay === nextProps.maxEventsPerDay &&
    prevProps.events.every((event, index) => 
      event.id === nextProps.events[index]?.id &&
      event.title === nextProps.events[index]?.title
    )
  );
});

// Memoized event list item for virtualized view
const EventListItem = memo(function EventListItem({
  event,
  onClick,
}: {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}) {
  const handleClick = useCallback(() => {
    onClick?.(event);
  }, [event, onClick]);

  const eventDate = useMemo(() => {
    try {
      return new Date(event.start).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }, [event.start]);

  return (
    <div
      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
        <p className="text-sm text-gray-500">{eventDate}</p>
      </div>
      {event.eventType && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {event.eventType}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.start === nextProps.event.start
  );
});

export const OptimizedCalendarView = memo(function OptimizedCalendarView({
  month,
  events: externalEvents,
  onEventClick,
  onDateClick,
  className = '',
  compact = false,
  virtualizeEvents = false,
  maxEventsPerDay = 3,
}: OptimizedCalendarViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Memoize expensive date calculations
  const dateRange = useMemo(() => {
    const from = startOfMonth(month).toISOString();
    const to = endOfMonth(month).toISOString();
    return { from, to };
  }, [month]);

  // Only fetch events if we don't have external events provided
  const shouldFetchEvents = !externalEvents;
  const { data: fetchedEvents, error, isLoading } = useCalendarEvents(
    shouldFetchEvents ? dateRange.from : '',
    shouldFetchEvents ? dateRange.to : ''
  );

  // Log any errors for debugging
  if (error) {
    logger.error('Error loading calendar events:', error);
  }

  // Memoize event array processing
  const events = useMemo(() => {
    const evts = externalEvents || fetchedEvents || [];
    return Array.isArray(evts) ? evts : [];
  }, [externalEvents, fetchedEvents]);

  // Memoize expensive day calculations and event grouping
  const { days, groupedEvents } = useMemo(() => {
    const days = eachDayOfInterval({
      start: new Date(dateRange.from),
      end: new Date(dateRange.to),
    });

    const grouped: Record<string, CalendarEvent[]> = {};

    // Safely process events
    if (Array.isArray(events)) {
      events.forEach((event) => {
        if (event?.start) {
          const dateKey = event.start.split('T')[0];
          if (dateKey) {
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(event);
          }
        }
      });
    }

    return { days, groupedEvents: grouped };
  }, [dateRange.from, dateRange.to, events]);

  // Memoized render function for virtualized event list
  const renderEventItem = useCallback(
    ({ item }: { item: CalendarEvent }) => (
      <EventListItem event={item} onClick={onEventClick} />
    ),
    [onEventClick]
  );

  if (isLoading) {
    return (
      <div className={`border rounded p-4 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {format(month, 'MMMM yyyy')}
          </h3>
          <LoadingSkeleton width="100px" height="32px" />
        </div>
        <LoadingSkeleton variant="table" rows={6} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border rounded p-4 ${className}`}>
        <div className="text-center text-red-600">
          Failed to load calendar events
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded p-2 ${className}`}>
      {/* Header with view toggle */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {format(month, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List ({events.length})
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-7 gap-1 text-sm">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="font-bold text-center py-2 text-gray-600">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayEvents = groupedEvents[dayKey] || [];
            const isCurrentMonth = isSameMonth(day, month);

            return (
              <DayCell
                key={dayKey}
                date={day}
                events={dayEvents}
                onEventClick={onEventClick}
                onDateClick={onDateClick}
                isCurrentMonth={isCurrentMonth}
                maxEventsPerDay={compact ? 2 : maxEventsPerDay}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events found for this month
            </div>
          ) : virtualizeEvents && events.length > 20 ? (
            <VirtualizedList
              items={events}
              itemHeight={60}
              height={400}
              renderItem={renderEventItem}
            />
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <EventListItem
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing month and events
  return (
    format(prevProps.month, 'yyyy-MM') === format(nextProps.month, 'yyyy-MM') &&
    prevProps.events?.length === nextProps.events?.length &&
    prevProps.compact === nextProps.compact &&
    prevProps.maxEventsPerDay === nextProps.maxEventsPerDay
  );
});