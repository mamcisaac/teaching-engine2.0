/**
 * @file useETFOPlanning.test.ts
 * @description Comprehensive tests for useETFOPlanning hooks including all CRUD operations,
 * error handling, caching behavior, and API integration.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  useCurriculumExpectations,
  useCurriculumExpectation,
  useUpdateCurriculumExpectation,
  useDeleteCurriculumExpectation,
  useLongRangePlans,
  useLongRangePlan,
  useCreateLongRangePlan,
  useUpdateLongRangePlan,
  useUnitPlans,
  useUnitPlan,
  useCreateUnitPlan,
  useUpdateUnitPlan,
  useETFOLessonPlans,
  useETFOLessonPlan,
  useCreateETFOLessonPlan,
  useUpdateETFOLessonPlan,
  useDeleteETFOLessonPlan,
  useDaybookEntries,
  useDaybookEntry,
  useCreateDaybookEntry,
  useUpdateDaybookEntry,
} from '../useETFOPlanning';
import { 
  setupTest, 
  renderWithProviders, 
  createTestQueryClient,
  mockApiResponses,
  createMockCurriculumExpectation,
  createMockLessonPlan,
  createMockUnitPlan
} from '@/test-utils';
import * as api from '@/api';
import * as errorHandler from '@/utils/errorHandler';

// Mock dependencies
vi.mock('@/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useETFOPlanning Hooks', () => {
  let queryClient: any;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    setupTest();
    queryClient = createTestQueryClient();
    vi.mocked(api.api.get).mockClear();
    vi.mocked(api.api.post).mockClear();
    vi.mocked(api.api.put).mockClear();
    vi.mocked(api.api.delete).mockClear();
    vi.mocked(errorHandler.handleApiError).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Curriculum Expectations Hooks', () => {
    describe('useCurriculumExpectations', () => {
      it('should fetch curriculum expectations without filters', async () => {
        const mockExpectations = [createMockCurriculumExpectation(), createMockCurriculumExpectation({ id: 'exp-2' })];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockExpectations });

        const { result } = renderHook(() => useCurriculumExpectations(), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/curriculum-expectations?');
        expect(result.current.data).toEqual(mockExpectations);
      });

      it('should fetch curriculum expectations with filters', async () => {
        const mockExpectations = [createMockCurriculumExpectation()];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockExpectations });

        const filters = {
          subject: 'Mathematics',
          grade: 3,
          strand: 'Number',
          search: 'addition',
        };

        const { result } = renderHook(() => useCurriculumExpectations(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith(
          '/api/curriculum-expectations?subject=Mathematics&grade=3&strand=Number&search=addition'
        );
      });

      it('should handle API errors', async () => {
        const error = new Error('API Error');
        vi.mocked(api.api.get).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useCurriculumExpectations(), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBe(error);
      });

      it('should use correct query key for caching', () => {
        const filters = { subject: 'Math' };
        renderHook(() => useCurriculumExpectations(filters), { wrapper });

        // The query should be cached with the correct key
        const cachedData = queryClient.getQueryData(['curriculum-expectations', filters]);
        expect(cachedData).toBeUndefined(); // Initially undefined before data loads
      });
    });

    describe('useCurriculumExpectation', () => {
      it('should fetch single curriculum expectation', async () => {
        const mockExpectation = createMockCurriculumExpectation();
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockExpectation });

        const { result } = renderHook(() => useCurriculumExpectation('exp-123'), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/curriculum-expectations/exp-123');
        expect(result.current.data).toEqual(mockExpectation);
      });

      it('should not fetch when id is empty', () => {
        renderHook(() => useCurriculumExpectation(''), { wrapper });

        expect(api.api.get).not.toHaveBeenCalled();
      });

      it('should be enabled only when id is provided', () => {
        const { result: emptyResult } = renderHook(() => useCurriculumExpectation(''), { wrapper });
        const { result: validResult } = renderHook(() => useCurriculumExpectation('exp-123'), { wrapper });

        expect(emptyResult.current.isFetching).toBe(false);
        expect(validResult.current.isFetching).toBe(true);
      });
    });

    describe('useUpdateCurriculumExpectation', () => {
      it('should update curriculum expectation successfully', async () => {
        const mockUpdated = createMockCurriculumExpectation({ description: 'Updated description' });
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const { result } = renderHook(() => useUpdateCurriculumExpectation(), { wrapper });

        const updateData = { description: 'Updated description' };
        result.current.mutate({ id: 'exp-123', data: updateData });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/curriculum-expectations/exp-123', updateData);
      });

      it('should invalidate queries on success', async () => {
        const mockUpdated = createMockCurriculumExpectation();
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateCurriculumExpectation(), { wrapper });

        result.current.mutate({ id: 'exp-123', data: {} });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['curriculum-expectations'] });
      });

      it('should handle errors', async () => {
        const error = new Error('Update failed');
        vi.mocked(api.api.put).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useUpdateCurriculumExpectation(), { wrapper });

        result.current.mutate({ id: 'exp-123', data: {} });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(errorHandler.handleApiError).toHaveBeenCalledWith(error, 'Failed to update curriculum expectation');
      });
    });

    describe('useDeleteCurriculumExpectation', () => {
      it('should delete curriculum expectation successfully', async () => {
        vi.mocked(api.api.delete).mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() => useDeleteCurriculumExpectation(), { wrapper });

        result.current.mutate('exp-123');

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.delete).toHaveBeenCalledWith('/api/curriculum-expectations/exp-123');
      });

      it('should handle deletion errors', async () => {
        const error = new Error('Delete failed');
        vi.mocked(api.api.delete).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useDeleteCurriculumExpectation(), { wrapper });

        result.current.mutate('exp-123');

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(errorHandler.handleApiError).toHaveBeenCalledWith(error, 'Failed to delete curriculum expectation');
      });
    });
  });

  describe('Long Range Plans Hooks', () => {
    describe('useLongRangePlans', () => {
      it('should fetch long range plans without filters', async () => {
        const mockPlans = [{ id: 'lrp-1', title: 'Plan 1' }, { id: 'lrp-2', title: 'Plan 2' }];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockPlans });

        const { result } = renderHook(() => useLongRangePlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/long-range-plans?');
        expect(result.current.data).toEqual(mockPlans);
      });

      it('should fetch long range plans with filters', async () => {
        const mockPlans = [{ id: 'lrp-1', title: 'Plan 1' }];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockPlans });

        const filters = {
          academicYear: '2023-2024',
          subject: 'Mathematics',
          grade: 3,
        };

        const { result } = renderHook(() => useLongRangePlans(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith(
          '/api/long-range-plans?academicYear=2023-2024&subject=Mathematics&grade=3'
        );
      });
    });

    describe('useCreateLongRangePlan', () => {
      it('should create long range plan successfully', async () => {
        const newPlan = { title: 'New Plan', academicYear: '2023-2024' };
        const mockCreated = { id: 'lrp-new', ...newPlan };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        result.current.mutate(newPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/long-range-plans', newPlan);
        expect(result.current.data).toEqual(mockCreated);
      });

      it('should invalidate queries on successful creation', async () => {
        const mockCreated = { id: 'lrp-new', title: 'New Plan' };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        result.current.mutate({ title: 'New Plan' });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['long-range-plans'] });
      });
    });

    describe('useUpdateLongRangePlan', () => {
      it('should update long range plan successfully', async () => {
        const updateData = { id: 'lrp-123', title: 'Updated Plan' };
        const mockUpdated = { ...updateData };
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const { result } = renderHook(() => useUpdateLongRangePlan(), { wrapper });

        result.current.mutate(updateData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/long-range-plans/lrp-123', { title: 'Updated Plan' });
      });

      it('should invalidate both list and specific queries on update', async () => {
        const updateData = { id: 'lrp-123', title: 'Updated Plan' };
        const mockUpdated = { ...updateData };
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateLongRangePlan(), { wrapper });

        result.current.mutate(updateData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['long-range-plans'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['long-range-plans', 'lrp-123'] });
      });
    });
  });

  describe('Unit Plans Hooks', () => {
    describe('useUnitPlans', () => {
      it('should fetch unit plans with filters', async () => {
        const mockUnitPlans = [createMockUnitPlan(), createMockUnitPlan({ id: 'unit-2' })];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockUnitPlans });

        const filters = {
          longRangePlanId: 'lrp-123',
          startDate: '2023-09-01',
          endDate: '2023-12-31',
        };

        const { result } = renderHook(() => useUnitPlans(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith(
          '/api/unit-plans?longRangePlanId=lrp-123&startDate=2023-09-01&endDate=2023-12-31'
        );
      });
    });

    describe('useCreateUnitPlan', () => {
      it('should create unit plan and invalidate related queries', async () => {
        const newUnitPlan = { 
          title: 'New Unit', 
          longRangePlanId: 'lrp-123',
          startDate: '2023-09-01',
          endDate: '2023-09-30'
        };
        const mockCreated = { id: 'unit-new', ...newUnitPlan };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateUnitPlan(), { wrapper });

        result.current.mutate(newUnitPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/unit-plans', newUnitPlan);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['unit-plans'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['long-range-plans', 'lrp-123'] });
      });
    });
  });

  describe('ETFO Lesson Plans Hooks', () => {
    describe('useETFOLessonPlans', () => {
      it('should fetch ETFO lesson plans with all filter types', async () => {
        const mockLessonPlans = [createMockLessonPlan(), createMockLessonPlan({ id: 'lesson-2' })];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockLessonPlans });

        const filters = {
          unitPlanId: 'unit-123',
          startDate: '2023-09-01',
          endDate: '2023-09-30',
          isSubFriendly: true,
        };

        const { result } = renderHook(() => useETFOLessonPlans(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith(
          '/api/etfo-lesson-plans?unitPlanId=unit-123&startDate=2023-09-01&endDate=2023-09-30&isSubFriendly=true'
        );
      });

      it('should handle boolean filter correctly', async () => {
        const mockLessonPlans = [createMockLessonPlan()];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockLessonPlans });

        const { result } = renderHook(() => useETFOLessonPlans({ isSubFriendly: false }), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/etfo-lesson-plans?isSubFriendly=false');
      });
    });

    describe('useCreateETFOLessonPlan', () => {
      it('should create ETFO lesson plan with expectation IDs', async () => {
        const newLessonPlan = {
          title: 'New Lesson',
          unitPlanId: 'unit-123',
          date: '2023-09-15',
          duration: 60,
          expectationIds: ['exp-1', 'exp-2'],
        };
        const mockCreated = { id: 'lesson-new', ...newLessonPlan };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const { result } = renderHook(() => useCreateETFOLessonPlan(), { wrapper });

        result.current.mutate(newLessonPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/etfo-lesson-plans', newLessonPlan);
      });
    });

    describe('useUpdateETFOLessonPlan', () => {
      it('should update ETFO lesson plan with correct structure', async () => {
        const updateData = {
          title: 'Updated Lesson',
          duration: 90,
          expectationIds: ['exp-3'],
        };
        const mockUpdated = { id: 'lesson-123', ...updateData };
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const { result } = renderHook(() => useUpdateETFOLessonPlan(), { wrapper });

        result.current.mutate({ id: 'lesson-123', data: updateData });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/etfo-lesson-plans/lesson-123', updateData);
      });

      it('should invalidate both list and specific lesson plan queries', async () => {
        const mockUpdated = { id: 'lesson-123', title: 'Updated' };
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateETFOLessonPlan(), { wrapper });

        result.current.mutate({ id: 'lesson-123', data: { title: 'Updated' } });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['etfo-lesson-plans'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['etfo-lesson-plans', 'lesson-123'] });
      });
    });

    describe('useDeleteETFOLessonPlan', () => {
      it('should delete ETFO lesson plan successfully', async () => {
        vi.mocked(api.api.delete).mockResolvedValueOnce({ data: { success: true } });

        const { result } = renderHook(() => useDeleteETFOLessonPlan(), { wrapper });

        result.current.mutate('lesson-123');

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.delete).toHaveBeenCalledWith('/api/etfo-lesson-plans/lesson-123');
      });
    });
  });

  describe('Daybook Entries Hooks', () => {
    describe('useDaybookEntries', () => {
      it('should fetch daybook entries with all filter types', async () => {
        const mockEntries = [
          { id: 'entry-1', date: '2023-09-15' },
          { id: 'entry-2', date: '2023-09-16' },
        ];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockEntries });

        const filters = {
          startDate: '2023-09-01',
          endDate: '2023-09-30',
          hasLessonPlan: true,
          rating: 4,
        };

        const { result } = renderHook(() => useDaybookEntries(filters), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith(
          '/api/daybook-entries?startDate=2023-09-01&endDate=2023-09-30&hasLessonPlan=true&rating=4'
        );
      });

      it('should handle boolean hasLessonPlan filter correctly', async () => {
        const mockEntries = [{ id: 'entry-1', date: '2023-09-15' }];
        vi.mocked(api.api.get).mockResolvedValueOnce({ data: mockEntries });

        const { result } = renderHook(() => useDaybookEntries({ hasLessonPlan: false }), { wrapper });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.get).toHaveBeenCalledWith('/api/daybook-entries?hasLessonPlan=false');
      });
    });

    describe('useCreateDaybookEntry', () => {
      it('should create daybook entry with expectation coverage', async () => {
        const newEntry = {
          date: '2023-09-15',
          lessonPlanId: 'lesson-123',
          whatWorked: 'Students engaged well',
          expectationCoverage: [
            { expectationId: 'exp-1', coverage: 'introduced' },
            { expectationId: 'exp-2', coverage: 'developing' },
          ],
        };
        const mockCreated = { id: 'entry-new', ...newEntry };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const { result } = renderHook(() => useCreateDaybookEntry(), { wrapper });

        result.current.mutate(newEntry);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.post).toHaveBeenCalledWith('/api/daybook-entries', newEntry);
      });

      it('should invalidate lesson plan queries when entry has lesson plan', async () => {
        const mockCreated = { id: 'entry-new', lessonPlanId: 'lesson-123' };
        vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useCreateDaybookEntry(), { wrapper });

        result.current.mutate({ date: '2023-09-15', lessonPlanId: 'lesson-123' });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['daybook-entries'] });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['etfo-lesson-plans', 'lesson-123'] });
      });
    });

    describe('useUpdateDaybookEntry', () => {
      it('should update daybook entry with expectation coverage', async () => {
        const updateData = {
          id: 'entry-123',
          whatWorked: 'Updated reflection',
          expectationCoverage: [{ expectationId: 'exp-1', coverage: 'consolidated' }],
        };
        const mockUpdated = { ...updateData };
        vi.mocked(api.api.put).mockResolvedValueOnce({ data: mockUpdated });

        const { result } = renderHook(() => useUpdateDaybookEntry(), { wrapper });

        result.current.mutate(updateData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(api.api.put).toHaveBeenCalledWith('/api/daybook-entries/entry-123', {
          whatWorked: 'Updated reflection',
          expectationCoverage: [{ expectationId: 'exp-1', coverage: 'consolidated' }],
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(api.api.get).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useCurriculumExpectations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(networkError);
    });

    it('should handle 404 errors for single entity queries', async () => {
      const notFoundError = new Error('Not Found');
      vi.mocked(api.api.get).mockRejectedValueOnce(notFoundError);

      const { result } = renderHook(() => useCurriculumExpectation('non-existent'), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(notFoundError);
    });
  });

  describe('Query Invalidation', () => {
    it('should properly invalidate related queries on mutations', async () => {
      const mockCreated = createMockUnitPlan();
      vi.mocked(api.api.post).mockResolvedValueOnce({ data: mockCreated });

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateUnitPlan(), { wrapper });

      result.current.mutate({
        title: 'New Unit',
        longRangePlanId: 'lrp-123',
        startDate: '2023-09-01',
        endDate: '2023-09-30',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should invalidate both unit plans and the parent long range plan
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['unit-plans'] });
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['long-range-plans', mockCreated.longRangePlanId] });
    });
  });

  describe('Loading States', () => {
    it('should track loading states correctly', () => {
      vi.mocked(api.api.get).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );

      const { result } = renderHook(() => useCurriculumExpectations(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isFetching).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should track mutation loading states', () => {
      vi.mocked(api.api.post).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
      );

      const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

      result.current.mutate({ title: 'Test Plan' });

      expect(result.current.isPending).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});