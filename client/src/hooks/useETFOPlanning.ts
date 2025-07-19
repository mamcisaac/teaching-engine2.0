import type { UseMutationResult } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '../api/core/client';
import { handleApiError } from '../utils/errorHandler';

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
}): ReturnType<typeof useQuery<CurriculumExpectation[], Error>> {
  return useQuery({
    queryKey: ['curriculum-expectations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.subject !== null && filters.subject !== undefined && filters.subject !== '') {
        params.append('subject', filters.subject);
      }
      if (filters?.grade !== undefined) {
        params.append('grade', filters.grade.toString());
      }
      if (filters?.strand !== null && filters?.strand !== undefined && filters.strand !== '') {
        params.append('strand', filters.strand);
      }
      if (filters?.search !== null && filters?.search !== undefined && filters.search !== '') {
        params.append('search', filters.search);
      }

      const response = await apiClient.get(`/api/curriculum-expectations?${params.toString()}`);
      return response.data as CurriculumExpectation[];
    },
  });
}

export function useCurriculumExpectation(id: string): ReturnType<typeof useQuery<CurriculumExpectation, Error>> {
  return useQuery({
    queryKey: ['curriculum-expectations', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/curriculum-expectations/${id}`);
      return response.data as CurriculumExpectation;
    },
    enabled: id !== '',
  });
}

export function useUpdateCurriculumExpectation(): UseMutationResult<unknown, Error, { id: string; data: Partial<CurriculumExpectation> }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CurriculumExpectation> }) => {
      const response = await apiClient.put(`/api/curriculum-expectations/${id}`, data);
      return response.data as CurriculumExpectation;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
      toast.success('Curriculum expectation updated successfully');
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update curriculum expectation');
    },
  });
}

export function useDeleteCurriculumExpectation(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/curriculum-expectations/${id}`);
      return response.data as { success: boolean };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['curriculum-expectations'] });
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
}): ReturnType<typeof useQuery<LongRangePlan[], Error>> {
  return useQuery({
    queryKey: ['long-range-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.academicYear !== null && filters.academicYear !== undefined && filters.academicYear !== '') {
        params.append('academicYear', filters.academicYear);
      }
      if (filters?.subject !== null && filters.subject !== undefined && filters.subject !== '') {
        params.append('subject', filters.subject);
      }
      if (filters?.grade !== null && filters.grade !== undefined) {
        params.append('grade', filters.grade.toString());
      }

      const response = await apiClient.get(`/api/long-range-plans?${params.toString()}`);
      return response.data as LongRangePlan[];
    },
  });
}

export function useLongRangePlan(id: string): ReturnType<typeof useQuery<LongRangePlan, Error>> {
  return useQuery({
    queryKey: ['long-range-plans', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/long-range-plans/${id}`);
      return response.data as LongRangePlan;
    },
    enabled: id !== '',
  });
}

export function useCreateLongRangePlan(): ReturnType<typeof useMutation<LongRangePlan, Error, Partial<LongRangePlan> & { expectationIds?: string[] }>> {
  const queryClient = useQueryClient();

  return useMutation<LongRangePlan, Error, Partial<LongRangePlan> & { expectationIds?: string[] }>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/api/long-range-plans', data);
      return response.data as LongRangePlan;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
    },
  });
}

export function useUpdateLongRangePlan(): ReturnType<typeof useMutation<LongRangePlan, Error, Partial<LongRangePlan> & { id: string; expectationIds?: string[] }>> {
  const queryClient = useQueryClient();

  return useMutation<LongRangePlan, Error, Partial<LongRangePlan> & { id: string; expectationIds?: string[] }>({
    mutationFn: async ({
      id,
      ...data
    }) => {
      const response = await apiClient.put(`/api/long-range-plans/${id}`, data);
      return response.data as LongRangePlan;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans', _data.id] });
    },
  });
}

export function useDeleteLongRangePlan(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/long-range-plans/${id}`);
      return response.data as { success: boolean };
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans', id] });
    },
  });
}

// Unit Plans Hooks
export function useUnitPlans(filters?: {
  longRangePlanId?: string;
  startDate?: string;
  endDate?: string;
}): ReturnType<typeof useQuery<UnitPlan[], Error>> {
  return useQuery({
    queryKey: ['unit-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.longRangePlanId !== null && filters?.longRangePlanId !== undefined && filters.longRangePlanId !== '') {
        params.append('longRangePlanId', filters.longRangePlanId);
      }
      if (filters?.startDate !== null && filters?.startDate !== undefined && filters.startDate !== '') {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate !== null && filters?.endDate !== undefined && filters.endDate !== '') {
        params.append('endDate', filters.endDate);
      }

      const response = await apiClient.get(`/api/unit-plans?${params.toString()}`);
      return response.data as UnitPlan[];
    },
  });
}

export function useUnitPlan(id: string): ReturnType<typeof useQuery<UnitPlan, Error>> {
  return useQuery({
    queryKey: ['unit-plans', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/unit-plans/${id}`);
      return response.data as UnitPlan;
    },
    enabled: id !== '',
  });
}

export function useCreateUnitPlan(): ReturnType<typeof useMutation<UnitPlan, Error, Partial<UnitPlan> & { expectationIds?: string[] }>> {
  const queryClient = useQueryClient();

  return useMutation<UnitPlan, Error, Partial<UnitPlan> & { expectationIds?: string[] }>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/api/unit-plans', data);
      return response.data as UnitPlan;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['long-range-plans', _data.longRangePlanId] });
    },
  });
}

export function useUpdateUnitPlan(): ReturnType<typeof useMutation<UnitPlan, Error, Partial<UnitPlan> & { id: string; expectationIds?: string[] }>> {
  const queryClient = useQueryClient();

  return useMutation<UnitPlan, Error, Partial<UnitPlan> & { id: string; expectationIds?: string[] }>({
    mutationFn: async ({
      id,
      ...data
    }) => {
      const response = await apiClient.put(`/api/unit-plans/${id}`, data);
      return response.data as UnitPlan;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['unit-plans', _data.id] });
    },
  });
}

export function useDeleteUnitPlan(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/unit-plans/${id}`);
      return response.data as { success: boolean };
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: ['unit-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['unit-plans', id] });
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
}): ReturnType<typeof useQuery<ETFOLessonPlan[], Error>> {
  return useQuery({
    queryKey: ['etfo-lesson-plans', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.unitPlanId !== null && filters?.unitPlanId !== undefined && filters.unitPlanId !== '') {
        params.append('unitPlanId', filters.unitPlanId);
      }
      if (filters?.startDate !== null && filters?.startDate !== undefined && filters.startDate !== '') {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate !== null && filters.endDate !== undefined && filters.endDate !== '') {
        params.append('endDate', filters.endDate);
      }
      if (filters?.isSubFriendly !== null && filters.isSubFriendly !== undefined) {
        params.append('isSubFriendly', filters.isSubFriendly.toString());
      }

      const response = await apiClient.get(`/api/etfo-lesson-plans?${params.toString()}`);
      return response.data as ETFOLessonPlan[];
    },
  });
}

export function useETFOLessonPlan(id: string): ReturnType<typeof useQuery<ETFOLessonPlan, Error>> {
  return useQuery({
    queryKey: ['etfo-lesson-plans', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/etfo-lesson-plans/${id}`);
      return response.data as ETFOLessonPlan;
    },
    enabled: id !== '',
  });
}

export function useCreateETFOLessonPlan(): ReturnType<typeof useMutation<ETFOLessonPlan, Error, Partial<ETFOLessonPlan> & { expectationIds?: string[] }>> {
  const queryClient = useQueryClient();

  return useMutation<ETFOLessonPlan, Error, Partial<ETFOLessonPlan> & { expectationIds?: string[] }>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/api/etfo-lesson-plans', data);
      return response.data as ETFOLessonPlan;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['unit-plans', _data.unitPlanId] });
    },
  });
}

export function useUpdateETFOLessonPlan(): ReturnType<typeof useMutation<ETFOLessonPlan, Error, { id: string; data: Partial<ETFOLessonPlan> & { expectationIds?: string[] } }>> {
  const queryClient = useQueryClient();

  return useMutation<ETFOLessonPlan, Error, { id: string; data: Partial<ETFOLessonPlan> & { expectationIds?: string[] } }>({
    mutationFn: async ({
      id,
      data,
    }) => {
      const response = await apiClient.put(`/api/etfo-lesson-plans/${id}`, data);
      return response.data as ETFOLessonPlan;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans', _data.id] });
    },
  });
}

export function useDeleteETFOLessonPlan(): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/etfo-lesson-plans/${id}`);
      return response.data as { success: boolean };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans'] });
    },
  });
}

// Daybook Entries Hooks
export function useDaybookEntries(filters?: {
  startDate?: string;
  endDate?: string;
  hasLessonPlan?: boolean;
  rating?: number;
}): ReturnType<typeof useQuery<DaybookEntry[], Error>> {
  return useQuery({
    queryKey: ['daybook-entries', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate !== null && filters?.startDate !== undefined && filters.startDate !== '') {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate !== null && filters.endDate !== undefined && filters.endDate !== '') {
        params.append('endDate', filters.endDate);
      }
      if (filters?.hasLessonPlan !== null && filters.hasLessonPlan !== undefined) {
        params.append('hasLessonPlan', filters.hasLessonPlan.toString());
      }
      if (filters?.rating !== null && filters.rating !== undefined) {
        params.append('rating', filters.rating.toString());
      }

      const response = await apiClient.get(`/api/daybook-entries?${params.toString()}`);
      return response.data as DaybookEntry[];
    },
  });
}

export function useDaybookEntry(id: string): ReturnType<typeof useQuery<DaybookEntry, Error>> {
  return useQuery({
    queryKey: ['daybook-entries', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/daybook-entries/${id}`);
      return response.data as DaybookEntry;
    },
    enabled: id !== '',
  });
}

export function useCreateDaybookEntry(): ReturnType<typeof useMutation<DaybookEntry, Error, Partial<DaybookEntry> & { expectationCoverage?: { expectationId: string; coverage: string }[] }>> {
  const queryClient = useQueryClient();

  return useMutation<DaybookEntry, Error, Partial<DaybookEntry> & { expectationCoverage?: { expectationId: string; coverage: string }[] }>({
    mutationFn: async (
      data
    ) => {
      const response = await apiClient.post('/api/daybook-entries', data);
      return response.data as DaybookEntry;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['daybook-entries'] });
      if (_data.lessonPlanId) {
        void queryClient.invalidateQueries({ queryKey: ['etfo-lesson-plans', _data.lessonPlanId] });
      }
    },
  });
}

export function useUpdateDaybookEntry(): ReturnType<typeof useMutation<DaybookEntry, Error, Partial<DaybookEntry> & { id: string; expectationCoverage?: { expectationId: string; coverage: string }[] }>> {
  const queryClient = useQueryClient();

  return useMutation<DaybookEntry, Error, Partial<DaybookEntry> & { id: string; expectationCoverage?: { expectationId: string; coverage: string }[] }>({
    mutationFn: async ({
      id,
      ...data
    }) => {
      const response = await apiClient.put(`/api/daybook-entries/${id}`, data);
      return response.data as DaybookEntry;
    },
    onSuccess: (_data) => {
      void queryClient.invalidateQueries({ queryKey: ['daybook-entries'] });
      void queryClient.invalidateQueries({ queryKey: ['daybook-entries', _data.id] });
    },
  });
}
