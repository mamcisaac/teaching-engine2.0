import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Helper function to get ISO week start date
export const getWeekStartISO = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

// Error handling utilities
export const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error || error.response?.data?.message || defaultMessage;
    toast.error(message);
    throw new Error(message);
  }
  toast.error(defaultMessage);
  throw error;
};

// Success notification utility
export const showSuccessToast = (message: string) => {
  toast.success(message);
};

// Query key factory for consistent cache keys
export const queryKeys = {
  // Newsletter keys
  newsletter: {
    all: ['newsletters'] as const,
    detail: (id: number, type: string) => ['newsletter', id, type] as const,
    suggestions: ['newsletter-suggestions'] as const,
  },
  // Student keys
  student: {
    all: ['students'] as const,
    detail: (id: number) => ['student', id] as const,
    goals: (studentId: number) => ['student-goals', studentId] as const,
    reflections: (studentId: number) => ['student-reflections', studentId] as const,
    parentSummaries: (studentId: number) => ['student-parent-summaries', studentId] as const,
  },
  // Planning keys
  planning: {
    yearPlan: (teacherId: number, year: number) => ['year-plan', teacherId, year] as const,
    dailyPlan: (date: string) => ['daily-plan', date] as const,
    lessonPlan: (weekStart: string) => ['lesson-plan', weekStart] as const,
    materials: (weekStart: string) => ['materials', weekStart] as const,
    suggestions: (weekStart: string) => ['planner-suggestions', weekStart] as const,
  },
  // Curriculum keys
  curriculum: {
    subjects: ['subjects'] as const,
    subject: (id: number) => ['subject', id] as const,
    expectations: (filters?: any) => ['curriculum-expectations', filters] as const,
    thematicUnits: (filters?: any) => ['thematic-units', filters] as const,
    thematicUnit: (id: number) => ['thematic-unit', id] as const,
  },
  // Calendar keys
  calendar: {
    events: (start: string, end: string) => ['calendar-events', start, end] as const,
  },
  // Notification keys
  notification: {
    all: ['notifications'] as const,
    detail: (id: number) => ['notification', id] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  // Notes keys
  notes: {
    all: ['notes'] as const,
    filtered: (filters: any) => ['filtered-notes', filters] as const,
    journal: {
      all: ['journal-entries'] as const,
      list: (params?: any) => ['journal-entries', params] as const,
      detail: (id: number) => ['journal-entry', id] as const,
      search: (query: string) => ['journal-search', query] as const,
    },
    quick: {
      all: ['quick-notes'] as const,
    },
    tags: {
      all: ['note-tags'] as const,
      byTag: (tag: string) => ['notes-by-tag', tag] as const,
    },
  },
  // Routine keys
  routine: {
    templates: (filters?: any) => ['oral-routine-templates', filters] as const,
    daily: (filters?: any) => ['daily-oral-routines', filters] as const,
    stats: (filters?: any) => ['oral-routine-stats', filters] as const,
    class: ['class-routines'] as const,
  },
  // Resource keys
  resource: {
    media: (userId: number) => ['media-resources', userId] as const,
    detail: (id: number) => ['media-resource', id] as const,
  },
  // Parent keys
  parent: {
    messages: {
      all: ['parent-messages'] as const,
      detail: (id: number) => ['parent-message', id] as const,
    },
    summaries: {
      byStudent: (studentId: number) => ['parent-summaries', studentId] as const,
      detail: (studentId: number, summaryId: number) => ['parent-summary', studentId, summaryId] as const,
    },
  },
  // Teacher keys
  teacher: {
    preferences: ['teacher-preferences'] as const,
    reflections: {
      all: ['teacher-reflections'] as const,
      detail: (id: number) => ['teacher-reflection', id] as const,
    },
    dashboard: {
      stats: ['teacher-dashboard-stats'] as const,
      activity: (limit: number) => ['teacher-dashboard-activity', limit] as const,
    },
    profile: ['teacher-profile'] as const,
  },
  // Cognate keys
  cognate: {
    all: (userId?: number) => ['cognates', userId] as const,
    detail: (id: number) => ['cognate', id] as const,
  },
  // Smart goals
  smartGoals: (filters?: any) => ['smart-goals', filters] as const,
} as const;

// Type for mutation options with consistent error handling
export interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}