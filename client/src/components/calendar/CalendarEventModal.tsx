import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { apiClient } from '../../api/core';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  onEventCreated?: () => void;
}

type EventType = 'lesson' | 'assessment' | 'pd-day' | 'school-event' | 'holiday';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'lesson', label: 'Lesson' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'pd-day', label: 'PD Day' },
  { value: 'school-event', label: 'School Event' },
  { value: 'holiday', label: 'Holiday' },
];

export function CalendarEventModal({
  isOpen,
  onClose,
  selectedDate = new Date(),
  onEventCreated,
}: CalendarEventModalProps): React.ReactElement {
  const queryClient = useQueryClient();
  const [eventType, setEventType] = useState<EventType>('lesson');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    subject: '',
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (eventType === 'lesson') {
        // Create a lesson plan
        return apiClient.post('/api/etfo-lesson-plans', {
          title: data.title,
          description: data.description,
          date: data.date,
          subject: data.subject,
          duration: 60, // Default duration
        });
      } 
        // Create a calendar event
        const eventTypeMap: Record<EventType, string> = {
          'assessment': 'CUSTOM',
          'pd-day': 'PD_DAY',
          'school-event': 'CUSTOM',
          'holiday': 'HOLIDAY',
          'lesson': 'CUSTOM',
        };

        return apiClient.post('/api/calendar-events', {
          title: data.title,
          description: data.description,
          start: data.allDay ? `${data.date}T00:00:00Z` : `${data.date}T${data.startTime}:00Z`,
          end: data.allDay ? `${data.date}T23:59:59Z` : `${data.date}T${data.endTime}:00Z`,
          allDay: data.allDay,
          eventType: eventTypeMap[eventType],
        });
      
    },
    onSuccess: () => {
      toast.success(`${eventType === 'lesson' ? 'Lesson' : 'Event'} created successfully`);
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      void queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onEventCreated?.();
      onClose();
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
 onClose(); 
}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="event-type-select">Event Type</label>
            <Select value={eventType} onValueChange={(value) => {
 setEventType(value as EventType); 
}}>
              <SelectTrigger id="event-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title
            </label>
            <input
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {eventType === 'lesson' && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="subject">
                Subject
              </label>
              <input
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="subject"
                name="subject"
                placeholder="e.g., Math, Language, Science"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="date">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date
            </label>
            <input
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>

          {eventType !== 'lesson' && (
            <>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    checked={formData.allDay}
                    className="rounded border-gray-300"
                    name="allDay"
                    type="checkbox"
                    onChange={handleInputChange}
                  />
                  <span className="text-sm font-medium">All Day Event</span>
                </label>
              </div>

              {!formData.allDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="startTime">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Start Time
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="endTime">
                      <Clock className="inline h-4 w-4 mr-1" />
                      End Time
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button aria-label="Click button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={createEventMutation.isPending} type="submit">
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}