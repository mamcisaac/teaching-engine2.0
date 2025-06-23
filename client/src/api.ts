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
  MediaResource,
  MediaResourceInput,
  ParentMessage,
  ParentMessageInput,
  MaterialList,
  DailyPlan,
  CompleteActivityResponse,
  ActivityTemplate,
  ActivityTemplateInput,
  Student,
  StudentInput,
  StudentGoal,
  StudentGoalInput,
  StudentReflection,
  StudentReflectionInput,
  ParentSummary,
  ParentSummaryGeneration,
  GenerateParentSummaryRequest,
  SaveParentSummaryRequest,
  TeacherReflectionInput,
} from './types';

import type {
  ActivitySuggestion,
  OutcomeCoverage as PlannerOutcomeCoverage,
  OutcomeCoverageResult,
} from './types/planner';

// Export ActivityTemplateInput for use in components
export type { ActivityTemplateInput } from './types';

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

// Sub plan types and interfaces
export interface SubPlanOptions {
  date: string;
  days: number;
  includeGoals?: boolean;
  includeRoutines?: boolean;
  includePlans?: boolean;
  anonymize?: boolean;
  saveRecord?: boolean;
  emailTo?: string;
  notes?: string;
  userId?: number;
}

export interface ClassRoutine {
  id?: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  timeOfDay?: string;
  priority?: number;
  isActive?: boolean;
}

// Sub plan generator for multiple days
export const generateSubPlan = async (date: string, days: number) => {
  const response = await api.post(
    `/subplan/generate?date=${date}&days=${days}`,
    {},
    {
      responseType: 'blob',
    },
  );
  return response;
};

// Enhanced sub plan generator with options
export const generateSubPlanWithOptions = async (options: SubPlanOptions) => {
  const response = await api.post(`/subplan/generate`, options, {
    responseType: 'blob',
  });
  return response;
};

// Get saved sub plan records
export const getSubPlanRecords = async (userId?: number) => {
  const response = await api.get('/subplan/records', { params: { userId } });
  return response.data;
};

// Class routine management
export const getClassRoutines = async (userId?: number) => {
  const response = await api.get('/subplan/routines', { params: { userId } });
  return response.data;
};

export const saveClassRoutine = async (routine: ClassRoutine) => {
  const response = await api.post('/subplan/routines', routine);
  return response.data;
};

export const deleteClassRoutine = async (id: number) => {
  const response = await api.delete(`/subplan/routines/${id}`);
  return response.data;
};

// D3 Sub Plan Extractor - New extraction capabilities

// Weekly plan extraction
export interface WeeklyPlanData {
  startDate: string;
  endDate: string;
  days: Array<Record<string, unknown>>;
  weeklyOverview: {
    subjects: Array<Record<string, unknown>>;
    milestones: Array<Record<string, unknown>>;
    assessments: Array<Record<string, unknown>>;
    specialEvents: Array<Record<string, unknown>>;
  };
  continuityNotes: Array<Record<string, unknown>>;
  emergencyBackupPlans: Array<Record<string, unknown>>;
}

export const extractWeeklyPlan = async (
  startDate: string,
  days: number = 5,
  options: {
    includeGoals?: boolean;
    includeRoutines?: boolean;
    includePlans?: boolean;
    anonymize?: boolean;
    userId?: number;
  } = {},
): Promise<WeeklyPlanData> => {
  const params = new URLSearchParams({
    startDate,
    days: days.toString(),
    ...(options.includeGoals !== undefined && { includeGoals: options.includeGoals.toString() }),
    ...(options.includeRoutines !== undefined && {
      includeRoutines: options.includeRoutines.toString(),
    }),
    ...(options.includePlans !== undefined && { includePlans: options.includePlans.toString() }),
    ...(options.anonymize !== undefined && { anonymize: options.anonymize.toString() }),
    ...(options.userId && { userId: options.userId.toString() }),
  });

  const response = await api.get(`/subplan/extract/weekly?${params}`);
  return response.data;
};

// Scenario template extraction
export interface EmergencyScenario {
  id: string;
  name: string;
  description: string;
  procedures: string[];
  materials: string[];
  contacts: Array<{
    role: string;
    number: string;
    when: string;
  }>;
  modifications: {
    schedule: string[];
    activities: string[];
    safety: string[];
  };
  template: string;
}

export interface ScenarioConditions {
  weather?: 'normal' | 'severe' | 'extreme';
  technology?: 'working' | 'partial' | 'down';
  staffing?: 'full' | 'short' | 'emergency';
  building?: 'normal' | 'maintenance' | 'emergency';
}

export const extractScenarioTemplates = async (conditions?: ScenarioConditions) => {
  const params = new URLSearchParams();
  if (conditions) {
    Object.entries(conditions).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const response = await api.get(`/subplan/extract/scenarios?${params}`);
  return response.data;
};

export const autoDetectScenario = async (userId?: number): Promise<EmergencyScenario> => {
  const params = userId ? `?userId=${userId}` : '';
  const response = await api.get(`/subplan/extract/scenarios/auto${params}`);
  return response.data;
};

export const getScenarioById = async (
  scenarioId: string,
  teacherName?: string,
  className?: string,
) => {
  const params = new URLSearchParams();
  if (teacherName) params.append('teacherName', teacherName);
  if (className) params.append('className', className);

  const response = await api.get(`/subplan/extract/scenarios/${scenarioId}?${params}`);
  return response.data;
};

// Contact extraction
export interface ContactInfo {
  id: string;
  name: string;
  role: string;
  phone: string;
  extension?: string;
  email?: string;
  location?: string;
  availability: string;
  priority: 'emergency' | 'urgent' | 'normal' | 'info';
  category: 'administration' | 'support' | 'medical' | 'safety' | 'technical' | 'transportation';
}

export interface ExtractedContacts {
  emergency: ContactInfo[];
  administration: ContactInfo[];
  support: ContactInfo[];
  technical: ContactInfo[];
  medical: ContactInfo[];
  transportation: ContactInfo[];
  custom: ContactInfo[];
}

export const extractSchoolContacts = async (
  userId?: number,
  format: 'organized' | 'emergency' | 'card' | 'formatted' = 'organized',
) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  params.append('format', format);

  const response = await api.get(`/subplan/extract/contacts?${params}`);
  return response.data;
};

// Material extraction
export interface MaterialItem {
  id: string;
  name: string;
  category: 'physical' | 'digital' | 'printable' | 'supplies' | 'equipment';
  quantity?: number;
  location?: string;
  preparation?: string;
  alternatives?: string[];
  priority: 'essential' | 'recommended' | 'optional';
  source: 'activity' | 'resource' | 'inferred';
}

export interface ExtractedMaterials {
  byTimeSlot: Array<{
    time: string;
    activity: string;
    materials: MaterialItem[];
    setupTime?: number;
    notes?: string;
  }>;
  byCategory: {
    physical: MaterialItem[];
    digital: MaterialItem[];
    printable: MaterialItem[];
    supplies: MaterialItem[];
    equipment: MaterialItem[];
  };
  setupInstructions: string[];
  alternatives: Array<{
    original: string;
    backup: string;
    reason: string;
  }>;
  summary: {
    totalItems: number;
    prepTime: number;
    missingItems: string[];
  };
}

export const extractDayMaterials = async (
  date: string,
  userId?: number,
): Promise<ExtractedMaterials> => {
  const params = new URLSearchParams({ date });
  if (userId) params.append('userId', userId.toString());

  const response = await api.get(`/subplan/extract/materials/day?${params}`);
  return response.data;
};

export const extractWeeklyMaterials = async (
  startDate: string,
  days: number = 5,
  userId?: number,
): Promise<Array<{ date: string; materials: ExtractedMaterials }>> => {
  const params = new URLSearchParams({ startDate, days: days.toString() });
  if (userId) params.append('userId', userId.toString());

  const response = await api.get(`/subplan/extract/materials/weekly?${params}`);
  return response.data;
};

// Comprehensive extraction
export interface ComprehensiveExtractionRequest {
  startDate?: string;
  numDays?: number;
  userId?: number;
  includeWeeklyOverview?: boolean;
  includeScenarios?: boolean;
  includeContacts?: boolean;
  includeMaterials?: boolean;
  scenarioConditions?: ScenarioConditions;
  options?: {
    includeGoals?: boolean;
    includeRoutines?: boolean;
    includePlans?: boolean;
    anonymize?: boolean;
  };
}

export const extractComprehensiveSubPlan = async (request: ComprehensiveExtractionRequest) => {
  const response = await api.post('/subplan/extract/comprehensive', request);
  return response.data;
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
  create: async (data: Omit<Subject, 'id'>) => {
    // Only send name to the API, ignoring milestones
    const response = await api.post<Subject>('/api/subjects', { name: data.name });
    return response.data;
  },
  update: async (id: number, data: Partial<Subject>) => {
    // Only send name to the API if it's provided
    const updateData = data.name ? { name: data.name } : {};
    const response = await api.put<Subject>(`/api/subjects/${id}`, updateData);
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

// Teacher Reflection hooks
export const useTeacherReflections = () => {
  return useQuery({
    queryKey: ['teacher-reflections'],
    queryFn: async () => (await api.get('/api/reflections')).data,
  });
};

export const useCreateTeacherReflection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TeacherReflectionInput) =>
      (await api.post('/api/reflections', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reflections'] });
      toast.success('Reflection saved successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to save reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateTeacherReflection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) =>
      (await api.put(`/api/reflections/${id}`, { content })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reflections'] });
      toast.success('Reflection updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteTeacherReflection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/reflections/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reflections'] });
      toast.success('Reflection deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
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

// Activity Template hooks
export const useActivityTemplates = (filters?: {
  domain?: string;
  subject?: string;
  groupType?: string;
  search?: string;
}) => {
  return useQuery<ActivityTemplate[]>({
    queryKey: ['activity-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.domain) params.append('domain', filters.domain);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.groupType) params.append('groupType', filters.groupType);
      if (filters?.search) params.append('search', filters.search);
      const query = params.toString();
      return (await api.get(`/api/activity-templates${query ? '?' + query : ''}`)).data;
    },
  });
};

export const useCreateActivityTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<ActivityTemplate, Error, ActivityTemplateInput>({
    mutationFn: async (data) => (await api.post('/api/activity-templates', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-templates'] });
      toast.success('Activity template created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create activity template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Activity Suggestions hooks
export const useActivitySuggestions = (params: {
  suggestFor?: string;
  theme?: number;
  domain?: string;
  subject?: string;
  limit?: number;
}) => {
  return useQuery<ActivityTemplate[]>({
    queryKey: ['activity-suggestions', params],
    queryFn: async () => {
      // For now, return empty array until the API is implemented
      return [];
    },
    enabled: !!params.suggestFor,
  });
};

// Student API hooks
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
  return useMutation<Student, Error, { id: number; data: StudentInput }>({
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

// Student Goals API
export const useStudentGoals = (studentId: number) => {
  return useQuery<StudentGoal[]>({
    queryKey: ['students', studentId, 'goals'],
    queryFn: async () => (await api.get(`/api/students/${studentId}/goals`)).data,
    enabled: !!studentId,
  });
};

export const useCreateStudentGoal = () => {
  const queryClient = useQueryClient();
  return useMutation<StudentGoal, Error, { studentId: number; data: StudentGoalInput }>({
    mutationFn: async ({ studentId, data }) =>
      (await api.post(`/api/students/${studentId}/goals`, data)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId, 'goals'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Goal created successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to create goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useUpdateStudentGoal = () => {
  const queryClient = useQueryClient();
  return useMutation<
    StudentGoal,
    Error,
    { studentId: number; goalId: number; data: Partial<StudentGoalInput> }
  >({
    mutationFn: async ({ studentId, goalId, data }) =>
      (await api.put(`/api/students/${studentId}/goals/${goalId}`, data)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId, 'goals'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Goal updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to update goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useDeleteStudentGoal = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { studentId: number; goalId: number }>({
    mutationFn: async ({ studentId, goalId }) =>
      (await api.delete(`/api/students/${studentId}/goals/${goalId}`)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId, 'goals'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Goal deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete goal: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// Student Reflections API functions
export const useStudentReflections = (studentId: number) =>
  useQuery<StudentReflection[]>({
    queryKey: ['students', studentId, 'reflections'],
    queryFn: async () => (await api.get(`/api/students/${studentId}/reflections`)).data,
    enabled: !!studentId,
  });

export const useCreateStudentReflection = () => {
  const queryClient = useQueryClient();
  return useMutation<StudentReflection, Error, { studentId: number; data: StudentReflectionInput }>(
    {
      mutationFn: async ({ studentId, data }) =>
        (await api.post(`/api/students/${studentId}/reflections`, data)).data,
      onSuccess: (_, { studentId }) => {
        queryClient.invalidateQueries({ queryKey: ['students', studentId, 'reflections'] });
        queryClient.invalidateQueries({ queryKey: ['students', studentId] });
        toast.success('Reflection created successfully!');
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
        toast.error(
          'Failed to create reflection: ' +
            (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
        );
      },
    },
  );
};

export const useDeleteStudentReflection = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { studentId: number; reflectionId: number }>({
    mutationFn: async ({ studentId, reflectionId }) =>
      (await api.delete(`/api/students/${studentId}/reflections/${reflectionId}`)).data,
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId, 'reflections'] });
      queryClient.invalidateQueries({ queryKey: ['students', studentId] });
      toast.success('Reflection deleted successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to delete reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

// A3 Enhancement: Reflection Classification API functions
export interface ClassificationResult {
  outcomes: Array<{
    id: string;
    confidence: number;
    rationale: string;
  }>;
  selTags: string[];
  studentId: number;
}

export interface ClassifyReflectionRequest {
  studentId: number;
  text: string;
}

export const useClassifyReflection = () => {
  return useMutation<ClassificationResult, Error, ClassifyReflectionRequest>({
    mutationFn: async (data) => (await api.post('/api/reflections/classify', data)).data,
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to classify reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useClassifyAndUpdateReflection = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { reflection: StudentReflection; classification: ClassificationResult },
    Error,
    { reflectionId: number }
  >({
    mutationFn: async ({ reflectionId }) =>
      (await api.post(`/api/reflections/classify/${reflectionId}`)).data,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['students', data.reflection.studentId, 'reflections'],
      });
      queryClient.invalidateQueries({ queryKey: ['reflections', 'classification', 'stats'] });
      toast.success('Reflection classified and updated successfully!');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to classify and update reflection: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export interface ClassificationStats {
  totalClassified: number;
  averageConfidence: number;
  topSELTags: Array<{ tag: string; count: number }>;
  recentClassifications: number;
}

export const useClassificationStats = () => {
  return useQuery<ClassificationStats>({
    queryKey: ['reflections', 'classification', 'stats'],
    queryFn: async () => (await api.get('/api/reflections/classification/stats')).data,
  });
};

// A4 Enhancement: Prompt Generator API functions
export interface GeneratedPrompt {
  type: 'open_question' | 'sentence_stem' | 'discussion' | 'metacognitive';
  text: string;
  context?: string;
}

export interface PromptGenerationResult {
  outcomeId: string;
  outcome: {
    code: string;
    description: string;
    subject: string;
    grade: number;
  };
  prompts: GeneratedPrompt[];
  language: string;
}

export interface PromptGenerationRequest {
  outcomeId: string;
  language: 'en' | 'fr';
  grade?: number;
  subject?: string;
}

export const useGeneratePrompts = () => {
  return useMutation<PromptGenerationResult, Error, PromptGenerationRequest>({
    mutationFn: async (data) => (await api.post('/api/prompts/generate', data)).data,
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to generate prompts: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useOutcomePrompts = (outcomeId: string, language: string = 'en') => {
  return useQuery<{
    outcomeId: string;
    outcome: {
      id: string;
      code: string;
      description: string;
      subject: string;
      grade: number;
    };
    prompts: Array<{
      id: number;
      type: string;
      text: string;
      isSystem: boolean;
      createdAt: string;
    }>;
    language: string;
  }>({
    queryKey: ['prompts', 'outcome', outcomeId, language],
    queryFn: async () =>
      (await api.get(`/api/prompts/outcome/${outcomeId}?language=${language}`)).data,
    enabled: !!outcomeId,
  });
};

export interface PromptStats {
  totalPrompts: number;
  promptsByType: Record<string, number>;
  promptsByLanguage: Record<string, number>;
  recentlyGenerated: number;
}

export const usePromptStats = () => {
  return useQuery<PromptStats>({
    queryKey: ['prompts', 'stats'],
    queryFn: async () => (await api.get('/api/prompts/stats')).data,
  });
};

export const useSearchPrompts = (filters: {
  type?: string;
  language?: string;
  subject?: string;
  grade?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  return useQuery<{
    prompts: Array<{
      id: number;
      outcomeId: string;
      type: string;
      text: string;
      language: string;
      isSystem: boolean;
      outcome: {
        id: string;
        code: string;
        description: string;
        subject: string;
        grade: number;
      };
      createdAt: string;
    }>;
    filters: typeof filters;
    total: number;
  }>({
    queryKey: ['prompts', 'search', filters],
    queryFn: async () => (await api.get(`/api/prompts/search?${queryParams.toString()}`)).data,
    enabled: Object.values(filters).some((value) => value !== undefined),
  });
};

// Parent Summary API functions (these already exist above, need to be accessible)
export const useGenerateParentSummary = () => {
  return useMutation<ParentSummaryGeneration, Error, GenerateParentSummaryRequest>({
    mutationFn: async (data) => (await api.post('/api/ai-parent-summary/generate', data)).data,
    onSuccess: () => {
      toast.success('Parent summary generated successfully!');
    },
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

// Email Communication API

export interface BulkEmailRecipient {
  email: string;
  name: string;
}

export interface EmailDeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export interface EmailDelivery {
  id: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  language: string;
  status: string;
  sentAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  sentCount: number;
}

export const useSendParentMessage = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SendEmailResponse,
    Error,
    {
      id: number;
      recipients: BulkEmailRecipient[];
      language?: 'en' | 'fr';
    }
  >({
    mutationFn: async ({ id, recipients, language = 'en' }) =>
      (await api.post(`/api/communication/parent-messages/${id}/send`, { recipients, language }))
        .data,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['parent-messages'] });
      toast.success(response.message);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to send newsletter: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useSendParentSummary = () => {
  const queryClient = useQueryClient();
  return useMutation<
    SendEmailResponse,
    Error,
    {
      id: number;
      recipients: BulkEmailRecipient[];
      language?: 'en' | 'fr';
    }
  >({
    mutationFn: async ({ id, recipients, language = 'en' }) =>
      (await api.post(`/api/communication/parent-summaries/${id}/send`, { recipients, language }))
        .data,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['parent-summaries'] });
      toast.success(response.message);
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to send parent summary: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};

export const useParentMessageDeliveries = (id: number) =>
  useQuery<{ deliveries: EmailDelivery[]; stats: EmailDeliveryStats }>({
    queryKey: ['parent-message-deliveries', id],
    queryFn: async () =>
      (await api.get(`/api/communication/parent-messages/${id}/deliveries`)).data,
    enabled: !!id,
  });

export const useParentSummaryDeliveries = (id: number) =>
  useQuery<{ deliveries: EmailDelivery[]; stats: EmailDeliveryStats }>({
    queryKey: ['parent-summary-deliveries', id],
    queryFn: async () =>
      (await api.get(`/api/communication/parent-summaries/${id}/deliveries`)).data,
    enabled: !!id,
  });

export const useParentContacts = () =>
  useQuery<BulkEmailRecipient[]>({
    queryKey: ['parent-contacts'],
    queryFn: async () => (await api.get('/api/communication/parent-contacts')).data,
  });

export const useStudentParentContacts = (studentId: number) =>
  useQuery<BulkEmailRecipient[]>({
    queryKey: ['student-parent-contacts', studentId],
    queryFn: async () =>
      (await api.get(`/api/communication/students/${studentId}/parent-contacts`)).data,
    enabled: !!studentId,
  });

// Email Templates
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  contentFr: string;
  contentEn: string;
  variables: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const useEmailTemplates = () =>
  useQuery<EmailTemplate[]>({
    queryKey: ['email-templates'],
    queryFn: async () => (await api.get('/api/email-templates')).data,
  });

export const useEmailTemplate = (id: number) =>
  useQuery<EmailTemplate>({
    queryKey: ['email-templates', id],
    queryFn: async () => (await api.get(`/api/email-templates/${id}`)).data,
    enabled: !!id,
  });

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    EmailTemplate,
    Error,
    {
      name: string;
      subject: string;
      contentFr: string;
      contentEn: string;
      variables?: string[];
    }
  >({
    mutationFn: async (data) => (await api.post('/api/email-templates', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email template created successfully');
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

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    EmailTemplate,
    Error,
    {
      id: number;
      data: {
        name?: string;
        subject?: string;
        contentFr?: string;
        contentEn?: string;
        variables?: string[];
      };
    }
  >({
    mutationFn: async ({ id, data }) => (await api.put(`/api/email-templates/${id}`, data)).data,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-templates', id] });
      toast.success('Email template updated successfully');
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

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/api/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email template deleted successfully');
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

export const useCloneEmailTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<EmailTemplate, Error, { id: number; name: string }>({
    mutationFn: async ({ id, name }) =>
      (await api.post(`/api/email-templates/${id}/clone`, { name })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Email template cloned successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        'Failed to clone template: ' +
          (axiosError.response?.data?.error || axiosError.message || 'Unknown error'),
      );
    },
  });
};
