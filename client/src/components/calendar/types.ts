import type { Event, ToolbarProps as RBCToolbarProps } from 'react-big-calendar';

import type { CalendarEvent, ETFOLessonPlan, UnitPlan } from '../../types';

export type CalendarEventType =
  | 'lesson'
  | 'unit-boundary'
  | 'holiday'
  | 'pd-day'
  | 'assessment'
  | 'school-event';

export interface CalendarFilter {
  subjects: string[];
  eventTypes: CalendarEventType[];
  showWeekends: boolean;
}

export interface CalendarViewEvent extends Event {
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

// Use the actual react-big-calendar ToolbarProps
export type ToolbarProps = RBCToolbarProps;