import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';
import { toast } from 'sonner';

// Types
export interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
  strand: string;
  substrand?: string;
  grade: number;
  subject: string;
  descriptionFr?: string;
  strandFr?: string;
  substrandFr?: string;
  type?: 'overall' | 'specific';
  coverage?: {
    percentage: number;
    lessonCount?: number;
    unitCount?: number;
  };
}

export interface LongRangePlan {
  id: string;
  title: string;
  titleFr?: string;
  academicYear: string;
  term?: string;
  grade: number;
  subject: string;
  description?: string;
  descriptionFr?: string;
  goals?: string;
  goalsFr?: string;
  themes?: string[];
  expectations?: { expectation: CurriculumExpectation }[];
  unitPlans?: UnitPlan[];
  _count?: {
    unitPlans: number;
    expectations: number;
  };
}

export interface UnitPlan {
  id: string;
  title: string;
  titleFr?: string;
  longRangePlanId: string;
  longRangePlan?: LongRangePlan;
  description?: string;
  descriptionFr?: string;
  bigIdeas?: string;
  bigIdeasFr?: string;
  essentialQuestions?: string[];
  startDate: string;
  endDate: string;
  estimatedHours?: number;
  assessmentPlan?: string;
  successCriteria?: string[];

  // ETFO-aligned planning fields
  crossCurricularConnections?: string;
  learningSkills?: string[];
  culminatingTask?: string;
  keyVocabulary?: string[];
  priorKnowledge?: string;
  parentCommunicationPlan?: string;
  fieldTripsAndGuestSpeakers?: string;
  differentiationStrategies?: {
    forStruggling?: string[];
    forAdvanced?: string[];
    forELL?: string[];
    forIEP?: string[];
  };
  indigenousPerspectives?: string;
  environmentalEducation?: string;
  socialJusticeConnections?: string;
  technologyIntegration?: string;
  communityConnections?: string;

  expectations?: { expectation: CurriculumExpectation }[];
  lessonPlans?: ETFOLessonPlan[];
  resources?: UnitPlanResource[];
  _count?: {
    lessonPlans: number;
    expectations: number;
    resources: number;
  };
  progress?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface UnitPlanResource {
  id: string;
  unitPlanId: string;
  title: string;
  type: string;
  url?: string;
  notes?: string;
  createdAt: string;
}

export interface ETFOLessonPlan {
  id: string;
  title: string;
  titleFr?: string;
  unitPlanId: string;
  unitPlan?: UnitPlan;
  date: string;
  duration: number;
  mindsOn?: string;
  mindsOnFr?: string;
  action?: string;
  actionFr?: string;
  consolidation?: string;
  consolidationFr?: string;
  learningGoals?: string;
  learningGoalsFr?: string;
  materials?: string[];
  grouping?: string;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes?: string;
  isSubFriendly: boolean;
  subNotes?: string;
  expectations?: { expectation: CurriculumExpectation }[];
  daybookEntry?: DaybookEntry;
  resources?: ETFOLessonPlanResource[];
  _count?: {
    expectations: number;
    resources: number;
  };
}

export interface ETFOLessonPlanResource {
  id: string;
  lessonPlanId: string;
  title: string;
  type: string;
  url?: string;
  content?: string;
  createdAt: string;
}

export interface DaybookEntry {
  id: string;
  date: string;
  lessonPlanId?: string;
  lessonPlan?: ETFOLessonPlan;
  whatWorked?: string;
  whatWorkedFr?: string;
  whatDidntWork?: string;
  whatDidntWorkFr?: string;
  nextSteps?: string;
  nextStepsFr?: string;
  studentEngagement?: string;
  studentChallenges?: string;
  studentSuccesses?: string;
  notes?: string;
  notesFr?: string;
  privateNotes?: string;
  overallRating?: number;
  wouldReuseLesson?: boolean;
  expectations?: {
    expectation: CurriculumExpectation;
    coverage?: 'introduced' | 'developing' | 'consolidated';
  }[];
  _count?: {
    expectations: number;
  };
}

// Curriculum Expectations Hooks
export function useCurriculumExpectations(filters?: {
  subject?: string;
  grade?: number;
  strand?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['curriculum-expectations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.grade) params.append('grade', filters.grade.toString());
      if (filters?.strand) params.append('strand', filters.strand);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/api/curriculum-expectations?${params}`);
      return response.data as CurriculumExpectation[];
    },
  });
}

export function useCurriculumExpectation(id: string) {
  return useQuery({
    queryKey: ['curriculum-expectations', id],
    queryFn: async () => {
      const response = await api.get(`/api/curriculum-expectations/${id}`);
      return response.data as CurriculumExpectation;
    },
    enabled: !!id,
  });
}

export function useUpdateCurriculumExpectation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CurriculumExpectation> }) => {
      const response = await api.put(`/api/curriculum-expectations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      toast.success('Curriculum expectation updated successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update curriculum expectation');
    },
  });
}

export function useDeleteCurriculumExpectation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/curriculum-expectations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      toast.success('Curriculum expectation deleted successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to delete curriculum expectation');
    },
  });
}

// Long-Range Plans Hooks
export function useLongRangePlans(filters?: {
  academicYear?: string;
  subject?: string;
  grade?: number;
}) {
  return useQuery({
    queryKey: ['long-range-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.academicYear) params.append('academicYear', filters.academicYear);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.grade) params.append('grade', filters.grade.toString());

      const response = await api.get(`/api/long-range-plans?${params}`);
      return response.data as LongRangePlan[];
    },
  });
}

export function useLongRangePlan(id: string) {
  return useQuery({
    queryKey: ['long-range-plans', id],
    queryFn: async () => {
      const response = await api.get(`/api/long-range-plans/${id}`);
      return response.data as LongRangePlan;
    },
    enabled: !!id,
  });
}

export function useCreateLongRangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LongRangePlan> & { expectationIds?: string[] }) => {
      const response = await api.post('/api/long-range-plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
    },
  });
}

export function useUpdateLongRangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<LongRangePlan> & { id: string; expectationIds?: string[] }) => {
      const response = await api.put(`/api/long-range-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
      queryClient.invalidateQueries({ queryKey: ['long-range-plans', data.id] });
    },
  });
}

export function useDeleteLongRangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/long-range-plans/${id}`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
      queryClient.invalidateQueries({ queryKey: ['long-range-plans', id] });
    },
  });
}

// Unit Plans Hooks
export function useUnitPlans(filters?: {
  longRangePlanId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['unit-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.longRangePlanId) params.append('longRangePlanId', filters.longRangePlanId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/api/unit-plans?${params}`);
      return response.data as UnitPlan[];
    },
  });
}

export function useUnitPlan(id: string) {
  return useQuery({
    queryKey: ['unit-plans', id],
    queryFn: async () => {
      const response = await api.get(`/api/unit-plans/${id}`);
      return response.data as UnitPlan;
    },
    enabled: !!id,
  });
}

export function useCreateUnitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UnitPlan> & { expectationIds?: string[] }) => {
      const response = await api.post('/api/unit-plans', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      queryClient.invalidateQueries({ queryKey: ['long-range-plans', data.longRangePlanId] });
    },
  });
}

export function useUpdateUnitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<UnitPlan> & { id: string; expectationIds?: string[] }) => {
      const response = await api.put(`/api/unit-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      queryClient.invalidateQueries({ queryKey: ['unit-plans', data.id] });
    },
  });
}

export function useDeleteUnitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/unit-plans/${id}`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      queryClient.invalidateQueries({ queryKey: ['unit-plans', id] });
      toast.success('Unit plan deleted successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to delete unit plan');
    },
  });
}

// ETFO Lesson Plans Hooks
export function useETFOLessonPlans(filters?: {
  unitPlanId?: string;
  startDate?: string;
  endDate?: string;
  isSubFriendly?: boolean;
}) {
  return useQuery({
    queryKey: ['etfo-lesson-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.unitPlanId) params.append('unitPlanId', filters.unitPlanId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.isSubFriendly !== undefined)
        params.append('isSubFriendly', filters.isSubFriendly.toString());

      const response = await api.get(`/api/etfo-lesson-plans?${params}`);
      return response.data as ETFOLessonPlan[];
    },
  });
}

export function useETFOLessonPlan(id: string) {
  return useQuery({
    queryKey: ['etfo-lesson-plans', id],
    queryFn: async () => {
      const response = await api.get(`/api/etfo-lesson-plans/${id}`);
      return response.data as ETFOLessonPlan;
    },
    enabled: !!id,
  });
}

export function useCreateETFOLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ETFOLessonPlan> & { expectationIds?: string[] }) => {
      const response = await api.post('/api/etfo-lesson-plans', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['unit-plans', data.unitPlanId] });
    },
  });
}

export function useUpdateETFOLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ETFOLessonPlan> & { expectationIds?: string[] };
    }) => {
      const response = await api.put(`/api/etfo-lesson-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans', data.id] });
    },
  });
}

export function useDeleteETFOLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/etfo-lesson-plans/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
    },
  });
}

// Daybook Entries Hooks
export function useDaybookEntries(filters?: {
  startDate?: string;
  endDate?: string;
  hasLessonPlan?: boolean;
  rating?: number;
}) {
  return useQuery({
    queryKey: ['daybook-entries', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.hasLessonPlan !== undefined)
        params.append('hasLessonPlan', filters.hasLessonPlan.toString());
      if (filters?.rating) params.append('rating', filters.rating.toString());

      const response = await api.get(`/api/daybook-entries?${params}`);
      return response.data as DaybookEntry[];
    },
  });
}

export function useDaybookEntry(id: string) {
  return useQuery({
    queryKey: ['daybook-entries', id],
    queryFn: async () => {
      const response = await api.get(`/api/daybook-entries/${id}`);
      return response.data as DaybookEntry;
    },
    enabled: !!id,
  });
}

export function useCreateDaybookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<DaybookEntry> & {
        expectationCoverage?: { expectationId: string; coverage: string }[];
      },
    ) => {
      const response = await api.post('/api/daybook-entries', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daybook-entries'] });
      if (data.lessonPlanId) {
        queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans', data.lessonPlanId] });
      }
    },
  });
}

export function useUpdateDaybookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<DaybookEntry> & {
      id: string;
      expectationCoverage?: { expectationId: string; coverage: string }[];
    }) => {
      const response = await api.put(`/api/daybook-entries/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daybook-entries'] });
      queryClient.invalidateQueries({ queryKey: ['daybook-entries', data.id] });
    },
  });
}
