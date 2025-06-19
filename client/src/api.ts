import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  Activity,
  LessonPlan,
  Milestone,
  Newsletter,
  Note,
  NoteDetail,
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
  ThematicUnit,
  CognatePair,
  CognateInput,
  AssessmentTemplate,
  AssessmentResult,
  AssessmentInput,
  AssessmentResultInput,
  OutcomeAssessmentData,
  MediaResource,
  MediaResourceInput,
  ParentMessage,
  ParentMessageInput,
  MaterialList,
  DailyPlan,
  CompleteActivityResponse,
  Student,
  StudentInput,
  ParentContact,
  ParentSummary,
  ParentSummaryGeneration,
  GenerateParentSummaryRequest,
  SaveParentSummaryRequest,
} from './types';

import type {
  ActivitySuggestion,
  OutcomeCoverage as PlannerOutcomeCoverage,
  OutcomeCoverageResult,
} from './types/planner';

// Define missing types that are used but not exported from types

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
const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
export type { ActivitySuggestion, OutcomeCoverageResult };

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
  useQuery<NoteDetail[]>({
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

export const usePlannerSuggestions = (weekStart: string, filters?: Record<string, boolean>) =>
  useQuery<ActivitySuggestion[]>({
    queryKey: ['planner-suggestions', weekStart, filters],
    queryFn: async () => {
      try {
        const url = `/api/planner/suggestions?weekStart=${weekStart}`;
        const response = await api.get<ActivitySuggestion[]>(url);
        let suggestions = response.data;

        // Apply client-side filtering based on activity tags
        if (filters && Object.keys(filters).length > 0) {
          console.log(
            'Applying filters:',
            filters,
            'to suggestions:',
            suggestions.map((s) => s.title),
          );
          suggestions = suggestions.filter((suggestion) => {
            // If no filters are enabled, show all
            const enabledFilters = Object.entries(filters)
              .filter(([, enabled]) => enabled)
              .map(([tag]) => tag);
            if (enabledFilters.length === 0) return true; // Changed from false to true - show all if no filters

            // Check if the suggestion has any of the enabled filter tags
            // This requires getting the activity data to check tags
            // For now, we'll do a simple check based on activity title patterns
            const matches = enabledFilters.some((tag) => {
              switch (tag) {
                case 'Worksheet':
                  return (
                    suggestion.title.toLowerCase().includes('worksheet') ||
                    suggestion.title.includes('WorksheetAct')
                  );
                case 'Video':
                  return (
                    suggestion.title.toLowerCase().includes('video') ||
                    suggestion.title.includes('VideoAct')
                  );
                case 'HandsOn':
                  return (
                    suggestion.title.toLowerCase().includes('handson') ||
                    suggestion.title.toLowerCase().includes('hands-on')
                  );
                default:
                  return false;
              }
            });
            console.log(`Suggestion "${suggestion.title}" matches filters:`, matches);
            return matches;
          });
          console.log(
            'Filtered suggestions:',
            suggestions.map((s) => s.title),
          );
        }

        return suggestions;
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
    queryFn: async () => (await api.get(`/api/milestones/${id}`)).data,
  });

export const useActivities = () =>
  useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => (await api.get('/api/activities')).data,
  });

import { createCrudMutations } from './utils/apiFactory';

// Subject API functions
const subjectApi = {
  create: async (data: { name: string }) => {
    const response = await api.post<Subject>('/api/subjects', data);
    return response.data;
  },
  update: async (id: number, data: { name: string }) => {
    const response = await api.put<Subject>(`/api/subjects/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/subjects/${id}`);
  },
};

// Subject mutation hooks using factory
const subjectMutations = createCrudMutations('Subject', subjectApi);

export const useCreateSubject = subjectMutations.useCreate;
export const useUpdateSubject = subjectMutations.useUpdate;
export const useDeleteSubject = subjectMutations.useDelete;

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
    }) => api.put(`/api/milestones/${data.id}`, data),
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
    mutationFn: ({ id }) => api.delete(`/api/milestones/${id}`).then(() => {}),
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
      cognateIds?: number[];
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
  return useMutation<CompleteActivityResponse, Error, { activityId: number; note?: string }>({
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
    mutationFn: async (data: {
      weekStart: string;
      preserveBuffer: boolean;
      pacingStrategy: 'strict' | 'relaxed';
    }) => (await api.post<LessonPlan>('/api/lesson-plans/generate', data)).data,
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
    mutationFn: (data: {
      title: string;
      titleEn?: string;
      titleFr?: string;
      description?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      outcomes?: string[];
    }) => api.post('/api/oral-routines/templates', data),
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
      data: {
        title?: string;
        titleEn?: string;
        titleFr?: string;
        description?: string;
        descriptionEn?: string;
        descriptionFr?: string;
        outcomes?: string[];
      };
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

// Thematic Unit hooks
export const useThematicUnits = (filters?: {
  userId?: number;
  startDate?: string;
  endDate?: string;
}) =>
  useQuery<ThematicUnit[]>({
    queryKey: ['thematic-units', filters],
    queryFn: async () => (await api.get('/api/thematic-units', { params: filters })).data,
  });

export const useThematicUnit = (id: number) =>
  useQuery<ThematicUnit>({
    queryKey: ['thematic-units', id],
    queryFn: async () => (await api.get(`/api/thematic-units/${id}`)).data,
    enabled: !!id,
  });

export const useCreateThematicUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ThematicUnit,
    Error,
    {
      title: string;
      titleEn?: string;
      titleFr?: string;
      description?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      startDate: string;
      endDate: string;
      outcomes?: string[];
      activities?: number[];
    }
  >({
    mutationFn: async (data) => (await api.post('/api/thematic-units', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
      toast.success('Thematic unit created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create thematic unit: ${error.message}`);
    },
  });
};

export const useUpdateThematicUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ThematicUnit,
    Error,
    {
      id: number;
      data: {
        title?: string;
        titleEn?: string;
        titleFr?: string;
        description?: string;
        descriptionEn?: string;
        descriptionFr?: string;
        startDate?: string;
        endDate?: string;
        outcomes?: string[];
        activities?: number[];
      };
    }
  >({
    mutationFn: async ({ id, data }) => (await api.put(`/api/thematic-units/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
      queryClient.invalidateQueries({ queryKey: ['thematic-units', id] });
      toast.success('Thematic unit updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update thematic unit: ${error.message}`);
    },
  });
};

export const useDeleteThematicUnit = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/thematic-units/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thematic-units'] });
      toast.success('Thematic unit deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete thematic unit: ${error.message}`);
    },
  });
};

// Cognate Pair hooks
export const useCognates = (userId?: number) =>
  useQuery<CognatePair[]>({
    queryKey: ['cognates', userId],
    queryFn: async () => (await api.get('/api/cognates', { params: { userId } })).data,
  });

export const useCognate = (id: number) =>
  useQuery<CognatePair>({
    queryKey: ['cognates', id],
    queryFn: async () => (await api.get(`/api/cognates/${id}`)).data,
    enabled: !!id,
  });

export const useCreateCognate = () => {
  const queryClient = useQueryClient();
  return useMutation<CognatePair, Error, CognateInput>({
    mutationFn: async (data) => (await api.post('/api/cognates', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cognates'] });
      toast.success('Cognate pair created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create cognate pair: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateCognate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CognatePair,
    Error,
    {
      id: number;
      data: Partial<CognateInput>;
    }
  >({
    mutationFn: async ({ id, data }) => (await api.put(`/api/cognates/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cognates'] });
      queryClient.invalidateQueries({ queryKey: ['cognates', id] });
      toast.success('Cognate pair updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update cognate pair: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteCognate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/cognates/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cognates'] });
      toast.success('Cognate pair deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete cognate pair: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Parent Message hooks
export const useParentMessages = () =>
  useQuery<ParentMessage[]>({
    queryKey: ['parent-messages'],
    queryFn: async () => (await api.get('/api/parent-messages')).data,
  });

export const useParentMessage = (id: number) =>
  useQuery<ParentMessage>({
    queryKey: ['parent-messages', id],
    queryFn: async () => (await api.get(`/api/parent-messages/${id}`)).data,
    enabled: !!id,
  });

export const useCreateParentMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<ParentMessage, Error, ParentMessageInput>({
    mutationFn: async (data) => (await api.post('/api/parent-messages', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      toast.success('Parent message created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create parent message: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateParentMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ParentMessage,
    Error,
    {
      id: number;
      data: Partial<ParentMessageInput>;
    }
  >({
    mutationFn: async ({ id, data }) => (await api.put(`/api/parent-messages/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['parent-messages', id] });
      toast.success('Parent message updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update parent message: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteParentMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/parent-messages/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      toast.success('Parent message deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete parent message: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Assessment Templates API
export const useAssessmentTemplates = () => {
  return useQuery<AssessmentTemplate[]>({
    queryKey: ['assessment-templates'],
    queryFn: async () => (await api.get('/api/assessments/templates')).data,
  });
};

export const useCreateAssessmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<AssessmentTemplate, Error, AssessmentInput>({
    mutationFn: async (data) => (await api.post('/api/assessments/templates', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      toast.success('Assessment template created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create assessment template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateAssessmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<AssessmentTemplate, Error, { id: number; data: Partial<AssessmentInput> }>({
    mutationFn: async ({ id, data }) =>
      (await api.put(`/api/assessments/templates/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-templates', id] });
      toast.success('Assessment template updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update assessment template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteAssessmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/assessments/templates/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      toast.success('Assessment template deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete assessment template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Assessment Results API
export const useAssessmentResults = (filters?: { week?: string; templateId?: number }) => {
  return useQuery<AssessmentResult[]>({
    queryKey: ['assessment-results', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.week) params.append('week', filters.week);
      if (filters?.templateId) params.append('templateId', filters.templateId.toString());
      return (await api.get(`/api/assessments/results?${params.toString()}`)).data;
    },
  });
};

export const useCreateAssessmentResult = () => {
  const queryClient = useQueryClient();
  return useMutation<AssessmentResult, Error, AssessmentResultInput>({
    mutationFn: async (data) => (await api.post('/api/assessments/results', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-results'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-templates'] });
      queryClient.invalidateQueries({ queryKey: ['outcome-coverage'] });
      toast.success('Assessment result logged successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to log assessment result: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Assessment by Outcome API
export const useOutcomeAssessments = (outcomeId: string) => {
  return useQuery<OutcomeAssessmentData>({
    queryKey: ['outcome-assessments', outcomeId],
    queryFn: async () => (await api.get(`/api/assessments/by-outcome/${outcomeId}`)).data,
    enabled: !!outcomeId,
  });
};

// Media Resource hooks
export const useMediaResources = (userId: number) =>
  useQuery<MediaResource[]>({
    queryKey: ['media-resources', userId],
    queryFn: async () => (await api.get('/api/media-resources', { params: { userId } })).data,
    enabled: !!userId,
  });

export const useMediaResource = (id: number) =>
  useQuery<MediaResource>({
    queryKey: ['media-resources', id],
    queryFn: async () => (await api.get(`/api/media-resources/${id}`)).data,
    enabled: !!id,
  });

export const useUploadMediaResource = () => {
  const queryClient = useQueryClient();
  return useMutation<MediaResource, Error, FormData>({
    mutationFn: async (formData) =>
      (
        await api.post('/api/media-resources/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      toast.success('Media resource uploaded successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to upload media resource: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateMediaResource = () => {
  const queryClient = useQueryClient();
  return useMutation<MediaResource, Error, { id: number; data: Partial<MediaResourceInput> }>({
    mutationFn: async ({ id, data }) => (await api.put(`/api/media-resources/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      queryClient.invalidateQueries({ queryKey: ['media-resources', id] });
      toast.success('Media resource updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update media resource: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteMediaResource = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/media-resources/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-resources'] });
      toast.success('Media resource deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete media resource: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// =================== STUDENT API ===================

export const useStudents = () => {
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => (await api.get('/api/students')).data,
  });
};

export const useStudent = (id: number) => {
  return useQuery<Student>({
    queryKey: ['students', id],
    queryFn: async () => (await api.get(`/api/students/${id}`)).data,
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, StudentInput>({
    mutationFn: async (data) => (await api.post('/api/students', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create student: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, { id: number; data: Partial<StudentInput> }>({
    mutationFn: async ({ id, data }) => (await api.put(`/api/students/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      toast.success('Student updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update student: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => (await api.delete(`/api/students/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete student: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useAddParentContact = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ParentContact,
    Error,
    { studentId: number; data: { name: string; email: string } }
  >({
    mutationFn: async ({ studentId, data }) =>
      (await api.post(`/api/students/${studentId}/contacts`, data)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Parent contact added successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to add parent contact: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteParentContact = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { studentId: number; contactId: number }>({
    mutationFn: async ({ studentId, contactId }) =>
      (await api.delete(`/api/students/${studentId}/contacts/${contactId}`)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Parent contact deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete parent contact: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// =================== PARENT SUMMARY API ===================

export const useGenerateParentSummary = () => {
  return useMutation<ParentSummaryGeneration, Error, GenerateParentSummaryRequest>({
    mutationFn: async (data) => (await api.post('/api/ai-parent-summary/generate', data)).data,
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to generate parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useRegenerateParentSummary = () => {
  return useMutation<
    ParentSummaryGeneration,
    Error,
    {
      originalFrench: string;
      originalEnglish: string;
      studentId: number;
      from: string;
      to: string;
      focus?: string[];
      tone?: 'formal' | 'informal';
    }
  >({
    mutationFn: async (data) => (await api.post('/api/ai-parent-summary/regenerate', data)).data,
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to regenerate parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useSaveParentSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ParentSummary, Error, SaveParentSummaryRequest>({
    mutationFn: async (data) => (await api.post('/api/ai-parent-summary/save', data)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parent-summaries', data.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students', data.studentId] });
      toast.success('Parent summary saved successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to save parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useStudentParentSummaries = (studentId: number) => {
  return useQuery<ParentSummary[]>({
    queryKey: ['parent-summaries', studentId],
    queryFn: async () => (await api.get(`/api/ai-parent-summary/student/${studentId}`)).data,
    enabled: !!studentId,
  });
};

export const useUpdateParentSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<ParentSummary, Error, { id: number; data: Partial<ParentSummary> }>({
    mutationFn: async ({ id, data }) => (await api.put(`/api/ai-parent-summary/${id}`, data)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['parent-summaries', data.studentId] });
      toast.success('Parent summary updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteParentSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; studentId: number }>({
    mutationFn: async ({ id }) => (await api.delete(`/api/ai-parent-summary/${id}`)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['parent-summaries', studentId] });
      toast.success('Parent summary deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};
