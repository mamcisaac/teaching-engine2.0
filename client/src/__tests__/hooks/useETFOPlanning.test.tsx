import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import * as api from '../../api';
import * as errorHandler from '../../utils/errorHandler';
import {
  useLongRangePlans,
  useLongRangePlan,
  useCreateLongRangePlan,
  useUpdateLongRangePlan,
  useDeleteLongRangePlan,
  useUnitPlans,
  useUnitPlan,
  useCreateUnitPlan,
  useUpdateUnitPlan,
  useDeleteUnitPlan,
  useETFOLessonPlans,
  useETFOLessonPlan,
  useCreateETFOLessonPlan,
  useUpdateETFOLessonPlan,
  useDeleteETFOLessonPlan,
  useDaybookEntries,
  useCreateDaybookEntry,
  useUpdateDaybookEntry,
} from '../../hooks/useETFOPlanning';
import { mockUser, mockLessonPlan, mockUnitPlan, createTestQueryClient } from '../../test-utils';

// Mock the API
vi.mock('../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../../utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useETFOPlanning hooks', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  describe('Long Range Plans', () => {
    describe('useLongRangePlans', () => {
      it('fetches long range plans successfully', async () => {
        const mockPlans = [
          { id: '1', title: 'Grade 3 Math', grade: 3, subject: 'Mathematics' },
          { id: '2', title: 'Grade 3 Language', grade: 3, subject: 'Language Arts' },
        ];
        
        (api.api.get as any).mockResolvedValueOnce({ data: mockPlans });

        const { result } = renderHook(() => useLongRangePlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockPlans);
          expect(result.current.isLoading).toBe(false);
          expect(result.current.error).toBeNull();
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/long-range-plans?');
      });

      it('handles API error', async () => {
        const mockError = new Error('API Error');
        (api.api.get as any).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useLongRangePlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
          expect(result.current.error).toEqual(mockError);
        });
      });
    });

    describe('useLongRangePlan', () => {
      it('fetches single long range plan', async () => {
        const mockPlan = { id: '1', title: 'Grade 3 Math', grade: 3 };
        (api.api.get as any).mockResolvedValueOnce({ data: mockPlan });

        const { result } = renderHook(() => useLongRangePlan('1'), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockPlan);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/long-range-plans/1');
      });

      it('skips query when id is not provided', () => {
        const { result } = renderHook(() => useLongRangePlan(''), { wrapper });

        expect(result.current.data).toBeUndefined();
        expect(api.api.get).not.toHaveBeenCalled();
      });
    });

    describe('useCreateLongRangePlan', () => {
      it('creates long range plan successfully', async () => {
        const newPlan = { title: 'New Plan', grade: 3, subject: 'Mathematics' };
        const createdPlan = { id: '3', ...newPlan };
        
        (api.api.post as any).mockResolvedValueOnce({ data: createdPlan });

        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        result.current.mutate(newPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/long-range-plans', newPlan);
      });

      it('handles creation error', async () => {
        const mockError = new Error('Creation failed');
        (api.api.post as any).mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        result.current.mutate({ title: 'Test', grade: 3 });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
          expect(result.current.error).toEqual(mockError);
        });
      });
    });

    describe('useUpdateLongRangePlan', () => {
      it('updates long range plan successfully', async () => {
        const updatedPlan = { id: '1', title: 'Updated Plan' };
        (api.api.put as any).mockResolvedValueOnce({ data: updatedPlan });

        const { result } = renderHook(() => useUpdateLongRangePlan(), { wrapper });

        result.current.mutate(updatedPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/long-range-plans/1', { title: 'Updated Plan' });
      });
    });

    describe('useDeleteLongRangePlan', () => {
      it('deletes long range plan successfully', async () => {
        (api.api.delete as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useDeleteLongRangePlan(), { wrapper });

        result.current.mutate('1');

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.delete).toHaveBeenCalledWith('/api/long-range-plans/1');
      });
    });
  });

  describe('Unit Plans', () => {
    describe('useUnitPlans', () => {
      it('fetches unit plans for long range plan', async () => {
        const mockUnits = [mockUnitPlan];
        (api.api.get as any).mockResolvedValueOnce({ data: mockUnits });

        const { result } = renderHook(() => useUnitPlans({ longRangePlanId: '1' }), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockUnits);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/unit-plans?longRangePlanId=1');
      });

      it('fetches all unit plans when no longRangePlanId provided', async () => {
        const mockUnits = [mockUnitPlan];
        (api.api.get as any).mockResolvedValueOnce({ data: mockUnits });

        const { result } = renderHook(() => useUnitPlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockUnits);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/unit-plans?');
      });
    });

    describe('useCreateUnitPlan', () => {
      it('creates unit plan successfully', async () => {
        const newUnit = { title: 'New Unit', longRangePlanId: '1' };
        const createdUnit = { id: '2', ...newUnit };
        
        (api.api.post as any).mockResolvedValueOnce({ data: createdUnit });

        const { result } = renderHook(() => useCreateUnitPlan(), { wrapper });

        result.current.mutate(newUnit);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/unit-plans', newUnit);
      });
    });
  });

  describe('ETFO Lesson Plans', () => {
    describe('useETFOLessonPlans', () => {
      it('fetches lesson plans for unit', async () => {
        const mockLessons = [mockLessonPlan];
        (api.api.get as any).mockResolvedValueOnce({ data: mockLessons });

        const { result } = renderHook(() => useETFOLessonPlans({ unitPlanId: '1' }), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLessons);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/etfo-lesson-plans?unitPlanId=1');
      });

      it('fetches all lesson plans when no unitId provided', async () => {
        const mockLessons = [mockLessonPlan];
        (api.api.get as any).mockResolvedValueOnce({ data: mockLessons });

        const { result } = renderHook(() => useETFOLessonPlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLessons);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/etfo-lesson-plans?');
      });
    });

    describe('useETFOLessonPlan', () => {
      it('fetches single lesson plan', async () => {
        (api.api.get as any).mockResolvedValueOnce({ data: mockLessonPlan });

        const { result } = renderHook(() => useETFOLessonPlan('1'), { wrapper });

        await waitFor(() => {
          expect(result.current.data).toEqual(mockLessonPlan);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/etfo-lesson-plans/1');
      });
    });

    describe('useCreateETFOLessonPlan', () => {
      it('creates lesson plan successfully', async () => {
        const newLesson = { title: 'New Lesson', unitId: '1' };
        const createdLesson = { id: '2', ...newLesson };
        
        (api.api.post as any).mockResolvedValueOnce({ data: createdLesson });

        const { result } = renderHook(() => useCreateETFOLessonPlan(), { wrapper });

        result.current.mutate(newLesson);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/etfo-lesson-plans', newLesson);
      });
    });

    describe('useUpdateETFOLessonPlan', () => {
      it('updates lesson plan successfully', async () => {
        const updatedLesson = { id: '1', title: 'Updated Lesson' };
        (api.api.put as any).mockResolvedValueOnce({ data: updatedLesson });

        const { result } = renderHook(() => useUpdateETFOLessonPlan(), { wrapper });

        result.current.mutate({ id: '1', data: { title: 'Updated Lesson' } });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/etfo-lesson-plans/1', { title: 'Updated Lesson' });
      });
    });

    describe('useDeleteETFOLessonPlan', () => {
      it('deletes lesson plan successfully', async () => {
        (api.api.delete as any).mockResolvedValueOnce({});

        const { result } = renderHook(() => useDeleteETFOLessonPlan(), { wrapper });

        result.current.mutate('1');

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.delete).toHaveBeenCalledWith('/api/etfo-lesson-plans/1');
      });
    });
  });

  describe('Daybook Entries', () => {
    describe('useDaybookEntries', () => {
      it('fetches daybook entries for date range', async () => {
        const mockEntries = [
          {
            id: '1',
            date: '2024-01-15',
            morningReflection: 'Good start',
            teachingNotes: 'Lesson went well',
          },
        ];
        
        (api.api.get as any).mockResolvedValueOnce({ data: mockEntries });

        const { result } = renderHook(
          () => useDaybookEntries({ startDate: '2024-01-15', endDate: '2024-01-19' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockEntries);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/daybook-entries?startDate=2024-01-15&endDate=2024-01-19');
      });

      it('calls API with empty query string when no dates provided', async () => {
        const mockEntries: any[] = [];
        (api.api.get as any).mockResolvedValueOnce({ data: mockEntries });

        const { result } = renderHook(
          () => useDaybookEntries(),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.data).toEqual(mockEntries);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/daybook-entries?');
      });
    });

    describe('useCreateDaybookEntry', () => {
      it('creates daybook entry successfully', async () => {
        const newEntry = {
          date: '2024-01-15',
          morningReflection: 'New reflection',
        };
        const createdEntry = { id: '2', ...newEntry };
        
        (api.api.post as any).mockResolvedValueOnce({ data: createdEntry });

        const { result } = renderHook(() => useCreateDaybookEntry(), { wrapper });

        result.current.mutate(newEntry);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/daybook-entries', newEntry);
      });
    });

    describe('useUpdateDaybookEntry', () => {
      it('updates daybook entry successfully', async () => {
        const updatedEntry = {
          id: '1',
          morningReflection: 'Updated reflection',
        };
        
        (api.api.put as any).mockResolvedValueOnce({ data: updatedEntry });

        const { result } = renderHook(() => useUpdateDaybookEntry(), { wrapper });

        result.current.mutate(updatedEntry);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/daybook-entries/1', { morningReflection: 'Updated reflection' });
      });
    });
  });

  describe('Query invalidation', () => {
    it('invalidates related queries after successful creation', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      const newPlan = { title: 'New Plan', grade: 3 };
      (api.api.post as any).mockResolvedValueOnce({ data: { id: '1', ...newPlan } });

      const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

      result.current.mutate(newPlan);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['long-range-plans'],
      });
    });

    it('invalidates related queries after successful update', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      const updatedPlan = { id: '1', title: 'Updated Plan' };
      (api.api.put as any).mockResolvedValueOnce({ data: updatedPlan });

      const { result } = renderHook(() => useUpdateLongRangePlan(), { wrapper });

      result.current.mutate(updatedPlan);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['long-range-plans'],
      });
    });

    it('invalidates related queries after successful deletion', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      
      (api.api.delete as any).mockResolvedValueOnce({});

      const { result } = renderHook(() => useDeleteLongRangePlan(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['long-range-plans'],
      });
    });
  });
});