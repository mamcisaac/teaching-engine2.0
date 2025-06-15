import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Activity,
  LessonPlan,
  Milestone,
  Newsletter,
  Note,
  NoteInput,
  Resource,
  Subject,
  TeacherPreferencesInput,
  TimetableSlot,
  YearPlanEntry,
  Notification,
  CalendarEvent,
  Outcome,
  SmartGoal,
  OralRoutineTemplate,
  DailyOralRoutine,
  OralRoutineStats,
} from './types';

import type {
  ActivitySuggestion,
  OutcomeCoverage as PlannerOutcomeCoverage,
  OutcomeCoverageResult,
} from './types/planner';

// Define missing types that are used but not exported from types
type Material = {
  id: number;
  name: string;
  type: string;
  url: string;
};

type MaterialList = Material[];

type DailyPlan = {
  id: number;
  date: string;
  activities: Activity[];
  notes?: string;
};

// Extend the ImportMeta interface to include Vite's environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Point directly to the backend server
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  // Point directly to the backend server
  baseURL: base,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Helper function to get ISO week start date
export const getWeekStartISO = (date: Date): string => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setUTCDate(diff));
  return monday.toISOString().split('T')[0];
};

// Re-export all types for backward compatibility
export type {
  Activity,
  LessonPlan,
  Milestone,
  Newsletter,
  Note,
  NoteInput,
  Resource,
  Subject,
  TeacherPreferencesInput,
  TimetableSlot,
  YearPlanEntry,
  Notification,
  CalendarEvent,
};

// Export planner-specific types
export type {
  ActivitySuggestion,
  PlannerOutcomeCoverage as OutcomeCoverage,
  OutcomeCoverageResult,
};

// Query hooks
export const useNewsletter = (id: number, type: 'raw' | 'polished' = 'raw') =>
  useQuery<Newsletter>({
    queryKey: ['newsletter', id, type],
    queryFn: async () => (await api.get(`/newsletters/${id}?type=${type}`)).data,
  });

export const useFilteredNotes = (filters: {
  subjectId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}) =>
  useQuery<Note[]>({
    queryKey: ['notes', filters],
    queryFn: async () => (await api.get('/api/notes', { params: filters })).data,
  });

export const useMaterialList = (weekStart: string) =>
  useQuery<MaterialList>({
    queryKey: ['material-list', weekStart],
    queryFn: async () => (await api.get(`/materials?weekStart=${weekStart}`)).data,
  });

export const useDailyPlan = (date: string) =>
  useQuery<DailyPlan>({
    queryKey: ['daily-plan', date],
    queryFn: async () => (await api.get(`/daily-plans?date=${date}`)).data,
  });

export const useCreateNewsletterDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string }) => api.post('/api/newsletters/draft', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Draft created');
    },
  });
};

export const useCreateNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) => api.post('/api/newsletters', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter created');
    },
  });
};

export const useAddNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NoteInput) => api.post('/api/notes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note added');
    },
  });
};

export const useAddCalendarEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CalendarEvent, 'id'>) => api.post('/api/calendar-events', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Event added');
    },
  });
};

// Notification hooks
export const useNotifications = () =>
  useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/api/notifications')).data,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Year plan hooks
export const useYearPlan = (teacherId: number, year: number) =>
  useQuery<YearPlanEntry[]>({
    queryKey: ['year-plan', teacherId, year],
    queryFn: async () => (await api.get(`/year-plan?teacherId=${teacherId}&year=${year}`)).data,
  });

// Notes hooks
export const useNotes = () =>
  useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => (await api.get('/api/notes')).data,
  });

// Material hooks
export const useMaterialDetails = (weekStart: string) =>
  useQuery<MaterialList>({
    queryKey: ['material-details', weekStart],
    queryFn: async () => (await api.get(`/materials/details?weekStart=${weekStart}`)).data,
  });

// Resource hooks
export const useResourcesByActivity = (activityId: number) =>
  useQuery<Resource[]>({
    queryKey: ['resources', activityId],
    queryFn: async () => (await api.get(`/resources/activity/${activityId}`)).data,
  });

export const useDeleteResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted');
    },
  });
};

export type ResourceSuggestion = {
  title: string;
  type: 'worksheet' | 'video' | 'audio' | 'link';
  description?: string;
  url: string;
  rationale: string;
};

export const useResourceSuggestions = (activityId: number | null) =>
  useQuery<ResourceSuggestion[]>({
    queryKey: ['resource-suggestions', activityId],
    queryFn: async () => (await api.get(`/resources/suggestions?activityId=${activityId}`)).data,
    enabled: !!activityId,
  });

export const useCreateResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      filename: string;
      url: string;
      type: string;
      size: number;
      activityId: number;
    }) => api.post('/resources', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource attached');
    },
  });
};

// Sub plan generator
export const fetchSubPlan = async (data: { date: string; reason: string }) => {
  const response = await api.post('/api/sub-plan', data);
  return response.data;
};

// Sub plan generator for multiple days
export const generateSubPlan = async (date: string, days: number) => {
  const response = await api.post(
    `/api/sub-plan/generate?date=${date}&days=${days}`,
    {},
    {
      responseType: 'blob',
    },
  );
  return response;
};

// Newsletter suggestions
export const fetchNewsletterSuggestions = async () => {
  const response = await api.get('/api/newsletter-suggestions');
  return response.data;
};

export const useGenerateNewsletter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      weekStart: string;
      weekEnd: string;
      subject: string;
      highlights: string[];
    }) => api.post('/api/newsletters/generate', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['newsletters'] });
      toast.success('Newsletter generated successfully');
    },
  });
};

export const useLessonPlan = (weekStart: string) => {
  // Query client is available if needed for future use

  return useQuery<LessonPlan>({
    queryKey: ['lesson-plan', weekStart],
    queryFn: async () => {
      try {
        // First try to get the existing plan
        return (await api.get(`/api/lesson-plans/${weekStart}`)).data;
      } catch (error) {
        // If plan doesn't exist, generate a new one
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          const response = await api.post('/api/lesson-plans/generate', {
            weekStart,
            preserveBuffer: true,
            pacingStrategy: 'relaxed',
          });
          return response.data;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on 404
  });
};

export const useTimetable = () =>
  useQuery<TimetableSlot[]>({
    queryKey: ['timetable'],
    queryFn: async () => (await api.get('/api/timetable')).data,
  });

export const useSaveTimetable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      slots: Array<{ day: number; startMin: number; endMin: number; subjectId?: number | null }>,
    ) => api.put('/api/timetable', { slots }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable'] });
      toast.success('Timetable saved');
    },
  });
};

export const useCalendarEvents = (start: string, end: string) =>
  useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events', start, end],
    queryFn: async () => (await api.get(`/api/calendar-events?from=${start}&to=${end}`)).data,
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const usePlannerSuggestions = (weekStart: string, _filters?: Record<string, boolean>) =>
  useQuery<ActivitySuggestion[]>({
    queryKey: ['planner-suggestions', weekStart],
    queryFn: async () => {
      try {
        const url = `/api/planner/suggestions?weekStart=${weekStart}`;
        const response = await api.get<ActivitySuggestion[]>(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching planner suggestions:', error);
        throw error;
      }
    },
    // Only enable the query if we have a valid weekStart
    enabled: !!weekStart,
  });

export const useSubjects = () =>
  useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/api/subjects')).data,
  });

export const useSubject = (id: number) =>
  useQuery<Subject>({
    queryKey: ['subject', id],
    queryFn: async () => (await api.get(`/api/subjects/${id}`)).data,
  });

export const useMilestones = () =>
  useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: async () => (await api.get('/api/milestones')).data,
  });

export const useMilestone = (id: number) =>
  useQuery<Milestone>({
    queryKey: ['milestone', id],
    queryFn: async () => (await api.get(`/milestones/${id}`)).data,
  });

// Mutation hooks
export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post('/api/subjects', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created');
    },
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      api.put(`/api/subjects/${data.id}`, { name: data.name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated');
    },
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/subjects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted');
    },
  });
};

export const useCreateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      subjectId: number;
      description?: string;
      startDate?: string;
      endDate?: string;
      outcomes?: string[];
    }) => api.post('/api/milestones', data),
    onSuccess: (data, { subjectId }) => {
      qc.invalidateQueries({ queryKey: ['milestones', subjectId] });
      qc.invalidateQueries({ queryKey: ['subject', subjectId] });
      toast.success('Milestone created');
    },
  });
};

export const useUpdateMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      title: string;
      subjectId: number;
      description?: string;
      startDate?: string;
      endDate?: string;
      outcomes?: string[];
    }) => api.put(`/milestones/${data.id}`, data),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['milestones', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      toast.success('Milestone updated');
    },
  });
};

export const useDeleteMilestone = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: number; subjectId: number },
    { previousMilestones?: unknown }
  >({
    mutationFn: ({ id }) => api.delete(`/milestones/${id}`).then(() => {}),
    onSuccess: (_, { subjectId }) => {
      qc.invalidateQueries({ queryKey: ['milestones', subjectId] });
      qc.invalidateQueries({ queryKey: ['subject', subjectId] });
      toast.success('Milestone deleted');
    },
    onError: (error) => {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    },
  });
};

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      milestoneId: number;
      materialsText?: string;
      outcomes?: string[];
    }) => api.post('/api/activities', data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      toast.success('Activity created');
    },
  });
};

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      milestoneId: number;
      subjectId?: number;
      title?: string;
      materialsText?: string;
      completedAt?: string | null;
      outcomes?: string[];
    }) =>
      api.put(`/api/activities/${data.id}`, {
        title: data.title,
        completedAt: data.completedAt,
        materialsText: data.materialsText,
        outcomes: data.outcomes,
      }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      if (vars.subjectId) qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      qc.invalidateQueries({ queryKey: ['lesson-plan'] });
      toast.success('Activity updated');
    },
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; milestoneId: number; subjectId?: number }) =>
      api.delete(`/api/activities/${data.id}`),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ['milestone', vars.milestoneId] });
      if (vars.subjectId) qc.invalidateQueries({ queryKey: ['subject', vars.subjectId] });
      toast.success('Activity deleted');
    },
  });
};

export const useCompleteActivity = () => {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { activityId: number; note?: string }>({
    mutationFn: async (data: { activityId: number; note?: string }) => {
      const response = await api.put(`/api/activities/${data.activityId}/complete`, {
        note: data.note,
      });
      toast.success('Activity completed');
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-plan'] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['materials'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activity marked as complete');
    },
  });
};

export const useReorderActivities = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { milestoneId: number; activityIds: number[] }) =>
      (
        await api.patch('/api/activities/reorder', {
          milestoneId: data.milestoneId,
          activityIds: data.activityIds,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Activities reordered successfully');
    },
  });
};

// Teacher preferences
export const useUpdateTeacherPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherPreferencesInput) => api.put('/api/teacher/preferences', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher'] });
      toast.success('Preferences updated');
    },
  });
};

// Resource management
export const downloadPrintables = async (weekStart: string) => {
  return api.get(`/printables?weekStart=${weekStart}`, {
    responseType: 'blob',
  });
};

export const useUploadResource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<Resource>('/api/resources/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource uploaded');
    },
  });
};

// Planning and scheduling
export const useGenerateDailyPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => api.post('/api/daily-plans/generate', { date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-plan'] });
    },
  });
};

export const useUpdateDailyPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: number;
      items: Array<{
        startMin: number;
        endMin: number;
        activityId?: number | null;
        notes?: string | null;
      }>;
    }) => api.put(`/daily-plans/${data.id}`, { items: data.items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-plan'] });
      toast.success('Daily plan updated');
    },
  });
};

export const useGeneratePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      weekStart: string;
      preserveBuffer: boolean;
      pacingStrategy: 'strict' | 'relaxed';
    }) => api.post<LessonPlan>('/api/lesson-plans/generate', data),
    onSuccess: (_, { weekStart }) => {
      qc.invalidateQueries({ queryKey: ['weekly-plan', weekStart] });
      qc.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

// Year plan
export const useShareYearPlan = () => {
  return useMutation({
    mutationFn: (data: { teacherId: number; year: number }) =>
      api.post<{ shareToken: string }>('/api/year-plan/share', data),
  });
};

// Calendar events
export const useHolidays = () => {
  return useQuery<CalendarEvent[]>({
    queryKey: ['holidays'],
    queryFn: async () => (await api.get('/api/holidays')).data,
  });
};

// Outcomes hooks
export const useOutcomes = (filters?: {
  subject?: string;
  grade?: string | number;
  search?: string;
}) => {
  return useQuery<Outcome[]>({
    queryKey: ['outcomes', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/api/outcomes', { params: filters });
        return response.data;
      } catch (error) {
        console.error('Error fetching outcomes:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Type for outcome coverage data
export interface OutcomeCoverage {
  outcomeId: string;
  code: string;
  description: string;
  subject: string;
  domain: string | null;
  grade: number;
  isCovered: boolean;
  coveredBy: Array<{
    id: number;
    title: string;
  }>;
}

// Hook for outcome coverage data
export const useOutcomeCoverage = (filters?: {
  subject?: string;
  grade?: string | number;
  domain?: string;
}): OutcomeCoverageResult => {
  return useQuery<PlannerOutcomeCoverage[]>({
    queryKey: ['outcome-coverage', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/api/outcomes/coverage', { params: filters });
        return response.data;
      } catch (error) {
        console.error('Error fetching outcome coverage:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAddHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { date: string; name: string }) => api.post('/api/holidays', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Holiday added');
    },
  });
};

export const useDeleteHoliday = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/holidays/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Holiday removed');
    },
  });
};

// Substitute information
export interface SubstituteInfo {
  id: number;
  teacherId: number;
  procedures?: string | null;
  allergies?: string | null;
}

export const useSubstituteInfo = () => {
  return useQuery<SubstituteInfo>({
    queryKey: ['substitute-info'],
    queryFn: async () => (await api.get('/api/substitute-info')).data,
  });
};

export const useSaveSubstituteInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SubstituteInfo, 'id' | 'teacherId'>) =>
      api.put('/api/substitute-info', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['substitute-info'] });
      toast.success('Substitute information saved');
    },
  });
};

// SMART Goals API
export const useSmartGoals = (filters?: {
  outcomeId?: string;
  milestoneId?: number;
  userId?: number;
}) =>
  useQuery<SmartGoal[]>({
    queryKey: ['smart-goals', filters],
    queryFn: async () => (await api.get('/api/smart-goals', { params: filters })).data,
  });

export const useCreateSmartGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SmartGoal>) => api.post('/api/smart-goals', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-goals'] });
      toast.success('SMART goal created');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create SMART goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateSmartGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SmartGoal> }) =>
      api.put(`/api/smart-goals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-goals'] });
      toast.success('SMART goal updated');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update SMART goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteSmartGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/smart-goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smart-goals'] });
      toast.success('SMART goal deleted');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete SMART goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Oral Routine Templates API
export const useOralRoutineTemplates = (filters?: { userId?: number }) =>
  useQuery<OralRoutineTemplate[]>({
    queryKey: ['oral-routine-templates', filters],
    queryFn: async () => (await api.get('/api/oral-routines/templates', { params: filters })).data,
  });

export const useCreateOralRoutineTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OralRoutineTemplate> & { outcomes?: string[] }) =>
      api.post('/api/oral-routines/templates', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oral-routine-templates'] });
      toast.success('Oral routine template created');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateOralRoutineTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<OralRoutineTemplate> & { outcomes?: string[] };
    }) => api.put(`/api/oral-routines/templates/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oral-routine-templates'] });
      toast.success('Template updated');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteOralRoutineTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/oral-routines/templates/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oral-routine-templates'] });
      toast.success('Template deleted');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Daily Oral Routines API
export const useDailyOralRoutines = (filters?: {
  date?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}) =>
  useQuery<DailyOralRoutine[]>({
    queryKey: ['daily-oral-routines', filters],
    queryFn: async () => (await api.get('/api/oral-routines/daily', { params: filters })).data,
  });

export const useCreateDailyOralRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      date: string;
      templateId: number;
      completed?: boolean;
      notes?: string;
      participation?: number;
    }) => api.post('/api/oral-routines/daily', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-oral-routines'] });
      toast.success('Daily routine scheduled');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to schedule routine: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateDailyOralRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { completed?: boolean; notes?: string; participation?: number };
    }) => api.put(`/api/oral-routines/daily/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-oral-routines'] });
      toast.success('Routine updated');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update routine: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteDailyOralRoutine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/oral-routines/daily/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-oral-routines'] });
      toast.success('Routine removed');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to remove routine: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Oral Routine Stats API
export const useOralRoutineStats = (filters?: {
  userId?: number;
  startDate?: string;
  endDate?: string;
}) =>
  useQuery<OralRoutineStats>({
    queryKey: ['oral-routine-stats', filters],
    queryFn: async () => (await api.get('/api/oral-routines/stats', { params: filters })).data,
  });
