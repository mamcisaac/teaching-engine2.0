import { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit, Trash2, Calendar, Clock, Book } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../ui/Button';

interface CalendarViewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  metadata?: {
    subject?: string;
    unitId?: string;
    lessonId?: string;
    color: string;
    isEditable: boolean;
  };
  originalData?: {
    id: string;
    [key: string]: unknown;
  };
}

interface CalendarEventDetailsProps {
  event: CalendarViewEvent;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function CalendarEventDetails({
  event,
  onClose,
  onUpdate,
}: CalendarEventDetailsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (event.type === 'lesson' && event.metadata?.lessonId) {
        return api.delete(`/api/etfo-lesson-plans/${event.metadata.lessonId}`);
      } else if (event.originalData?.id) {
        return api.delete(`/api/calendar-events/${event.originalData.id}`);
      }
    },
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      onUpdate?.();
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete event');
    },
  });

  // Update title mutation
  const updateTitleMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      if (event.type === 'lesson' && event.metadata?.lessonId) {
        return api.patch(`/api/etfo-lesson-plans/${event.metadata.lessonId}`, {
          title: newTitle,
        });
      } else if (event.originalData?.id) {
        return api.patch(`/api/calendar-events/${event.originalData.id}`, {
          title: newTitle,
        });
      }
    },
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setIsEditing(false);
      onUpdate?.();
    },
    onError: () => {
      toast.error('Failed to update event');
    },
  });

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== event.title) {
      updateTitleMutation.mutate(editedTitle.trim());
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate();
    }
  };

  const handleViewDetails = () => {
    if (event.type === 'lesson' && event.metadata?.lessonId) {
      navigate(`/planner/lessons/${event.metadata.lessonId}`);
    } else if (event.type === 'unit-boundary' && event.metadata?.unitId) {
      navigate(`/planner/units/${event.metadata.unitId}`);
    }
  };

  const getEventTypeLabel = () => {
    const typeLabels: Record<string, string> = {
      lesson: 'Lesson',
      'unit-boundary': 'Unit Milestone',
      holiday: 'Holiday',
      'pd-day': 'PD Day',
      assessment: 'Assessment',
      'school-event': 'School Event',
    };
    return typeLabels[event.type] || 'Event';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div
          className="p-4 rounded-t-lg flex justify-between items-center"
          style={{ backgroundColor: event.metadata?.color || '#6B7280' }}
        >
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {getEventTypeLabel()}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Title */}
          <div className="mb-4">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={updateTitleMutation.isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(event.title);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{event.title}</h2>
                {event.metadata?.isEditable && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(event.start, 'EEEE, MMMM d, yyyy')}</span>
            </div>

            {!(event.originalData?.allDay as boolean) && event.start.getTime() !== event.end.getTime() && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                </span>
              </div>
            )}

            {event.metadata?.subject && (
              <div className="flex items-center gap-2 text-gray-600">
                <Book className="h-4 w-4" />
                <span className="capitalize">{event.metadata.subject}</span>
              </div>
            )}

            {event.originalData?.description && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-gray-600 text-sm">{String(event.originalData.description)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            {(event.type === 'lesson' || event.type === 'unit-boundary') && (
              <Button onClick={handleViewDetails} className="flex-1">
                View Details
              </Button>
            )}
            {event.metadata?.isEditable && (
              <Button
                onClick={handleDelete}
                variant="danger"
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}