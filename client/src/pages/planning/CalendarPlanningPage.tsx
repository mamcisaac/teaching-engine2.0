import { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Event, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import CalendarEventModal from '../../components/calendar/CalendarEventModal';
import CalendarEventDetails from '../../components/calendar/CalendarEventDetails';
import CalendarFilters from '../../components/calendar/CalendarFilters';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import type { CalendarEvent, ETFOLessonPlan, UnitPlan } from '../../types';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Types for calendar events
interface CalendarViewEvent extends Event {
  id: string;
  type: CalendarEventType;
  metadata?: {
    subject?: string;
    unitId?: string;
    lessonId?: string;
    color: string;
    isEditable: boolean;
  };
  originalData?: CalendarEvent | ETFOLessonPlan | UnitPlan;
}

type CalendarEventType = 'lesson' | 'unit-boundary' | 'holiday' | 'pd-day' | 'assessment' | 'school-event';

interface CalendarFilter {
  subjects: string[];
  eventTypes: CalendarEventType[];
  showWeekends: boolean;
}

// Subject color mapping
const SUBJECT_COLORS: Record<string, string> = {
  math: '#3B82F6', // blue
  language: '#10B981', // emerald
  science: '#8B5CF6', // violet
  social_studies: '#F59E0B', // amber
  arts: '#EC4899', // pink
  phys_ed: '#EF4444', // red
  french: '#6366F1', // indigo
  default: '#6B7280', // gray
};

export default function CalendarPlanningPage() {
  const { user: _user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarViewEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CalendarFilter>({
    subjects: [],
    eventTypes: [],
    showWeekends: true,
  });

  // Fetch calendar events
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendar-events', format(startOfMonth(currentDate), 'yyyy-MM-dd'), format(endOfMonth(currentDate), 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await api.get('/api/calendar-events', {
        params: {
          start: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          end: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        },
      });
      return response.data;
    },
  });

  // Fetch lessons for the current month
  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const response = await api.get('/api/etfo-lesson-plans', {
        params: {
          startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        },
      });
      return response.data;
    },
  });

  // Fetch unit boundaries
  const { data: units = [] } = useQuery({
    queryKey: ['unit-plans'],
    queryFn: async () => {
      const response = await api.get('/api/unit-plans');
      return response.data;
    },
  });

  // Update lesson date mutation
  const updateLessonMutation = useMutation({
    mutationFn: async ({ lessonId, newDate }: { lessonId: string; newDate: Date }) => {
      const response = await api.put(`/api/etfo-lesson-plans/${lessonId}/reschedule`, {
        newDate: format(newDate, 'yyyy-MM-dd'),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      toast.success('Lesson rescheduled successfully');
    },
    onError: () => {
      toast.error('Failed to reschedule lesson');
    },
  });

  // Transform data into calendar events
  const events = useMemo<CalendarViewEvent[]>(() => {
    const allEvents: CalendarViewEvent[] = [];

    // Add calendar events (holidays, PD days, etc.)
    calendarEvents.forEach((event: CalendarEvent) => {
      const eventType = event.eventType.toLowerCase().replace('_', '-') as CalendarEventType;
      allEvents.push({
        id: `cal-${event.id}`,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        type: eventType,
        metadata: {
          color: eventType === 'holiday' ? '#DC2626' : eventType === 'pd-day' ? '#7C3AED' : '#6B7280',
          isEditable: event.source === 'MANUAL',
        },
        originalData: event,
      });
    });

    // Add lessons
    lessons.forEach((lesson: ETFOLessonPlan) => {
      if (lesson.date) {
        allEvents.push({
          id: `lesson-${lesson.id}`,
          title: lesson.title || 'Untitled Lesson',
          start: new Date(lesson.date),
          end: new Date(lesson.date),
          type: 'lesson',
          metadata: {
            subject: (lesson as ETFOLessonPlan).subject || 'general',
            unitId: lesson.unitPlanId,
            lessonId: lesson.id,
            color: SUBJECT_COLORS[(lesson as ETFOLessonPlan).subject?.toLowerCase() || 'default'] || SUBJECT_COLORS.default,
            isEditable: true,
          },
          originalData: lesson,
        });
      }
    });

    // Add unit boundaries
    units.forEach((unit: UnitPlan) => {
      if (unit.startDate) {
        allEvents.push({
          id: `unit-start-${unit.id}`,
          title: `${unit.title} - Start`,
          start: new Date(unit.startDate),
          end: new Date(unit.startDate),
          type: 'unit-boundary',
          metadata: {
            unitId: unit.id,
            color: '#059669',
            isEditable: false,
          },
          originalData: unit,
        });
      }
      if (unit.endDate) {
        allEvents.push({
          id: `unit-end-${unit.id}`,
          title: `${unit.title} - End`,
          start: new Date(unit.endDate),
          end: new Date(unit.endDate),
          type: 'unit-boundary',
          metadata: {
            unitId: unit.id,
            color: '#DC2626',
            isEditable: false,
          },
          originalData: unit,
        });
      }
    });

    // Apply filters
    return allEvents.filter((event) => {
      if (filters.subjects.length > 0 && event.metadata?.subject) {
        if (!filters.subjects.includes(event.metadata.subject)) return false;
      }
      if (filters.eventTypes.length > 0) {
        if (!filters.eventTypes.includes(event.type)) return false;
      }
      if (!filters.showWeekends && event.start) {
        const day = event.start.getDay();
        if (day === 0 || day === 6) return false;
      }
      return true;
    });
  }, [calendarEvents, lessons, units, filters]);

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarViewEvent) => {
    return {
      style: {
        backgroundColor: event.metadata?.color || '#6B7280',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarViewEvent) => {
    setSelectedEvent(event);
  }, []);

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowEventModal(true);
  }, []);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(
    ({ event, start }: { event: CalendarViewEvent; start: Date }) => {
      if (event.type === 'lesson' && event.metadata?.lessonId) {
        updateLessonMutation.mutate({
          lessonId: event.metadata.lessonId,
          newDate: start,
        });
      }
    },
    [updateLessonMutation]
  );

  // Navigate calendar
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Custom toolbar component
  const CustomToolbar = useCallback(
    ({ date, onNavigate }: { date: Date; onNavigate: (date: Date) => void }) => {
      const goToBack = () => {
        const newDate = new Date(date);
        if (view === 'month') {
          newDate.setMonth(date.getMonth() - 1);
        } else if (view === 'week') {
          newDate.setDate(date.getDate() - 7);
        } else {
          newDate.setDate(date.getDate() - 1);
        }
        onNavigate(newDate);
      };

      const goToNext = () => {
        const newDate = new Date(date);
        if (view === 'month') {
          newDate.setMonth(date.getMonth() + 1);
        } else if (view === 'week') {
          newDate.setDate(date.getDate() + 7);
        } else {
          newDate.setDate(date.getDate() + 1);
        }
        onNavigate(newDate);
      };

      const goToToday = () => {
        onNavigate(new Date());
      };

      return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4 calendar-toolbar-mobile md:calendar-toolbar-desktop">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button onClick={goToBack} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm">
              Today
            </Button>
            <Button onClick={goToNext} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg md:text-xl font-semibold ml-2 md:ml-4">{format(date, 'MMMM yyyy')}</h2>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className={showFilters ? 'bg-gray-100 flex-1 md:flex-initial' : 'flex-1 md:flex-initial'}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button onClick={() => setShowEventModal(true)} size="sm" className="flex-1 md:flex-initial">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            </div>
            <div className="flex gap-1 view-buttons">
              <Button
                onClick={() => setView('month')}
                variant={view === 'month' ? 'primary' : 'outline'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                <span className="md:hidden">M</span>
                <span className="hidden md:inline">Month</span>
              </Button>
              <Button
                onClick={() => setView('week')}
                variant={view === 'week' ? 'primary' : 'outline'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                <span className="md:hidden">W</span>
                <span className="hidden md:inline">Week</span>
              </Button>
              <Button
                onClick={() => setView('agenda')}
                variant={view === 'agenda' ? 'primary' : 'outline'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                <span className="md:hidden">A</span>
                <span className="hidden md:inline">Agenda</span>
              </Button>
            </div>
          </div>
        </div>
      );
    },
    [view, showFilters]
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
          Calendar Planning
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Visual planning with drag-and-drop scheduling
        </p>
      </div>

      {showFilters && (
        <CalendarFilters
          filters={filters}
          onFiltersChange={(newFilters: CalendarFilter) => setFilters(newFilters)}
          availableSubjects={[...new Set(lessons.map((l: ETFOLessonPlan) => (l as { subject?: string }).subject).filter(Boolean))].map(s => String(s))}
        />
      )}

      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: window.innerWidth < 768 ? 500 : 700 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          selectable
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={handleNavigate}
          components={{
            toolbar: CustomToolbar,
          }}
          views={['month', 'week', 'agenda']}
          defaultView={window.innerWidth < 768 ? 'agenda' : 'month'}
        />
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <CalendarEventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedSlot(null);
          }}
          selectedDate={selectedSlot?.start || new Date()}
          onEventCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
          }}
        />
      )}

      {/* Event Details */}
      {selectedEvent && (
        <CalendarEventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
          }}
        />
      )}
    </div>
  );
}