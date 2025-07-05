/**
 * Real Backend Integration Tests for useETFOPlanning hooks
 * These tests use actual API calls instead of mocks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
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
import { 
  setupRealBackendTest, 
  createRealTestQueryClient,
  resetTestDatabase,
} from '../../test-utils/real-backend-setup';
import { createAuthenticatedTestUser, type AuthTestContext } from '../../test-utils/auth-test-utils';
import { 
  realApiHelpers, 
  testDataFactory,
  realApiAssertions,
  testDataSeeder,
} from '../../test-utils/real-api-helpers';

describe('useETFOPlanning hooks - Real Backend Integration', () => {
  let queryClient: QueryClient;
  let authContext: AuthTestContext;
  let cleanup: () => Promise<void>;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeAll(async () => {
    // Setup real backend and authentication
    const backendSetup = await setupRealBackendTest();
    queryClient = backendSetup.queryClient;
    cleanup = backendSetup.cleanup;
    authContext = await createAuthenticatedTestUser();
  });

  afterAll(async () => {
    await authContext.cleanup();
    await cleanup();
  });

  beforeEach(async () => {
    // Reset database state between tests
    await resetTestDatabase();
    queryClient.clear();
  });

  describe('Long Range Plans - Real API Integration', () => {
    describe('useLongRangePlans', () => {
      it('fetches long range plans successfully from real API', async () => {
        // Seed test data
        await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Grade 3 Math',
          grade: 3,
          subject: 'Mathematics'
        });
        await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Grade 3 Language',
          grade: 3,
          subject: 'Language Arts'
        });

        const { result } = renderHook(() => useLongRangePlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(Array.isArray(result.current.data)).toBe(true);
          expect(result.current.data!.length).toBe(2);
          expect(result.current.error).toBeNull();
        });

        // Validate the actual data structure
        result.current.data!.forEach(plan => {
          realApiAssertions.assertValidLongRangePlan(plan);
        });

        // Check specific plans
        const mathPlan = result.current.data!.find(p => p.title === 'Grade 3 Math');
        const languagePlan = result.current.data!.find(p => p.title === 'Grade 3 Language');
        
        expect(mathPlan).toBeDefined();
        expect(mathPlan!.subject).toBe('Mathematics');
        expect(languagePlan).toBeDefined();
        expect(languagePlan!.subject).toBe('Language Arts');
      });

      it('handles empty result from real API', async () => {
        const { result } = renderHook(() => useLongRangePlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toEqual([]);
          expect(result.current.error).toBeNull();
        });
      });

      it('filters by grade parameter', async () => {
        // Create plans for different grades
        await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Grade 3 Plan',
          grade: 3,
        });
        await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Grade 4 Plan',
          grade: 4,
        });

        const { result } = renderHook(() => useLongRangePlans({ grade: 3 }), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.length).toBe(1);
          expect(result.current.data![0].title).toBe('Grade 3 Plan');
          expect(result.current.data![0].grade).toBe(3);
        });
      });
    });

    describe('useLongRangePlan', () => {
      it('fetches single long range plan from real API', async () => {
        const createdPlan = await realApiHelpers.createLongRangePlan(authContext, {
          title: 'Grade 3 Math',
          grade: 3,
        });

        const { result } = renderHook(() => useLongRangePlan(createdPlan.id), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.id).toBe(createdPlan.id);
          expect(result.current.data!.title).toBe('Grade 3 Math');
        });

        realApiAssertions.assertValidLongRangePlan(result.current.data!);
      });

      it('skips query when id is not provided', () => {
        const { result } = renderHook(() => useLongRangePlan(''), { wrapper });

        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
      });

      it('handles not found error from real API', async () => {
        const { result } = renderHook(() => useLongRangePlan('non-existent-id'), { wrapper });

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
          expect(result.current.error).toBeDefined();
        });
      });
    });

    describe('useCreateLongRangePlan', () => {
      it('creates long range plan successfully via real API', async () => {
        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        const newPlan = testDataFactory.longRangePlan({
          title: 'New Plan',
          grade: 3,
          subject: 'Mathematics',
        });

        result.current.mutate(newPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
          expect(result.current.data).toBeDefined();
        });

        const createdPlan = result.current.data;
        realApiAssertions.assertValidLongRangePlan(createdPlan);
        expect(createdPlan.title).toBe('New Plan');
        expect(createdPlan.grade).toBe(3);
        expect(createdPlan.subject).toBe('Mathematics');
      });

      it('handles validation error from real API', async () => {
        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        // Send invalid data (missing required fields)
        result.current.mutate({});

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
          expect(result.current.error).toBeDefined();
        });
      });

      it('invalidates queries after successful creation', async () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
        const { result } = renderHook(() => useCreateLongRangePlan(), { wrapper });

        const newPlan = testDataFactory.longRangePlan();
        result.current.mutate(newPlan);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['long-range-plans'],
        });
      });
    });

    describe('useUpdateLongRangePlan', () => {
      it('updates long range plan successfully via real API', async () => {
        const createdPlan = await realApiHelpers.createLongRangePlan(authContext);
        const { result } = renderHook(() => useUpdateLongRangePlan(), { wrapper });

        const updatedData = { id: createdPlan.id, title: 'Updated Plan Title' };
        result.current.mutate(updatedData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
          expect(result.current.data).toBeDefined();
        });

        const updatedPlan = result.current.data;
        expect(updatedPlan.id).toBe(createdPlan.id);
        expect(updatedPlan.title).toBe('Updated Plan Title');
      });
    });

    describe('useDeleteLongRangePlan', () => {
      it('deletes long range plan successfully via real API', async () => {
        const createdPlan = await realApiHelpers.createLongRangePlan(authContext);
        const { result } = renderHook(() => useDeleteLongRangePlan(), { wrapper });

        result.current.mutate(createdPlan.id);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        // Verify plan is actually deleted
        const { result: fetchResult } = renderHook(() => useLongRangePlan(createdPlan.id), { wrapper });
        
        await waitFor(() => {
          expect(fetchResult.current.isError).toBe(true);
        });
      });
    });
  });

  describe('Unit Plans - Real API Integration', () => {
    let longRangePlan: any;

    beforeEach(async () => {
      longRangePlan = await realApiHelpers.createLongRangePlan(authContext);
    });

    describe('useUnitPlans', () => {
      it('fetches unit plans for long range plan from real API', async () => {
        // Create unit plans
        await realApiHelpers.createUnitPlan(authContext, longRangePlan.id, {
          title: 'Fractions Unit',
        });
        await realApiHelpers.createUnitPlan(authContext, longRangePlan.id, {
          title: 'Geometry Unit',
        });

        const { result } = renderHook(() => useUnitPlans({ longRangePlanId: longRangePlan.id }), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.length).toBe(2);
        });

        result.current.data!.forEach(unit => {
          realApiAssertions.assertValidUnitPlan(unit);
          expect(unit.longRangePlanId).toBe(longRangePlan.id);
        });
      });

      it('fetches all unit plans when no longRangePlanId provided', async () => {
        // Create unit plans in different long range plans
        const otherLongRangePlan = await realApiHelpers.createLongRangePlan(authContext);
        
        await realApiHelpers.createUnitPlan(authContext, longRangePlan.id);
        await realApiHelpers.createUnitPlan(authContext, otherLongRangePlan.id);

        const { result } = renderHook(() => useUnitPlans(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.length).toBe(2);
        });
      });
    });

    describe('useCreateUnitPlan', () => {
      it('creates unit plan successfully via real API', async () => {
        const { result } = renderHook(() => useCreateUnitPlan(), { wrapper });

        const newUnit = testDataFactory.unitPlan(longRangePlan.id, {
          title: 'New Unit',
        });

        result.current.mutate(newUnit);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
          expect(result.current.data).toBeDefined();
        });

        const createdUnit = result.current.data;
        realApiAssertions.assertValidUnitPlan(createdUnit);
        expect(createdUnit.title).toBe('New Unit');
        expect(createdUnit.longRangePlanId).toBe(longRangePlan.id);
      });
    });
  });

  describe('ETFO Lesson Plans - Real API Integration', () => {
    let unitPlan: any;

    beforeEach(async () => {
      const longRangePlan = await realApiHelpers.createLongRangePlan(authContext);
      unitPlan = await realApiHelpers.createUnitPlan(authContext, longRangePlan.id);
    });

    describe('useETFOLessonPlans', () => {
      it('fetches lesson plans for unit from real API', async () => {
        // Create lesson plans
        await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
          title: 'Introduction to Fractions',
        });
        await realApiHelpers.createETFOLessonPlan(authContext, unitPlan.id, {
          title: 'Adding Fractions',
        });

        const { result } = renderHook(() => useETFOLessonPlans({ unitPlanId: unitPlan.id }), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.length).toBe(2);
        });

        result.current.data!.forEach(lesson => {
          realApiAssertions.assertValidETFOLessonPlan(lesson);
          expect(lesson.unitPlanId).toBe(unitPlan.id);
        });
      });
    });

    describe('useCreateETFOLessonPlan', () => {
      it('creates lesson plan successfully via real API', async () => {
        const { result } = renderHook(() => useCreateETFOLessonPlan(), { wrapper });

        const newLesson = testDataFactory.etfoLessonPlan(unitPlan.id, {
          title: 'New Lesson',
        });

        result.current.mutate(newLesson);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
          expect(result.current.data).toBeDefined();
        });

        const createdLesson = result.current.data;
        realApiAssertions.assertValidETFOLessonPlan(createdLesson);
        expect(createdLesson.title).toBe('New Lesson');
        expect(createdLesson.unitPlanId).toBe(unitPlan.id);
      });
    });
  });

  describe('Daybook Entries - Real API Integration', () => {
    describe('useDaybookEntries', () => {
      it('fetches daybook entries for date range from real API', async () => {
        // Create daybook entries
        await realApiHelpers.createDaybookEntry(authContext, {
          date: '2024-01-15',
          morningReflection: 'Good start',
        });
        await realApiHelpers.createDaybookEntry(authContext, {
          date: '2024-01-16',
          morningReflection: 'Another day',
        });

        const { result } = renderHook(
          () => useDaybookEntries({ startDate: '2024-01-15', endDate: '2024-01-19' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
          expect(result.current.data).toBeDefined();
          expect(result.current.data!.length).toBe(2);
        });

        result.current.data!.forEach(entry => {
          realApiAssertions.assertValidDaybookEntry(entry);
        });
      });
    });

    describe('useCreateDaybookEntry', () => {
      it('creates daybook entry successfully via real API', async () => {
        const { result } = renderHook(() => useCreateDaybookEntry(), { wrapper });

        const newEntry = testDataFactory.daybookEntry({
          date: '2024-01-15',
          morningReflection: 'New reflection',
        });

        result.current.mutate(newEntry);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
          expect(result.current.data).toBeDefined();
        });

        const createdEntry = result.current.data;
        realApiAssertions.assertValidDaybookEntry(createdEntry);
        expect(createdEntry.date).toBe('2024-01-15');
        expect(createdEntry.morningReflection).toBe('New reflection');
      });
    });
  });

  describe('Performance and Load Testing', () => {
    it('handles large datasets efficiently', async () => {
      // Seed large amount of data
      await testDataSeeder.seedLargePlanningData(authContext, 5);

      const { result } = renderHook(() => useLongRangePlans(), { wrapper });

      const startTime = performance.now();
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeDefined();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000); // 5 seconds
      expect(result.current.data!.length).toBe(5);
    });

    it('handles concurrent mutations properly', async () => {
      const { result: createResult1 } = renderHook(() => useCreateLongRangePlan(), { wrapper });
      const { result: createResult2 } = renderHook(() => useCreateLongRangePlan(), { wrapper });

      // Create two plans concurrently
      const plan1 = testDataFactory.longRangePlan({ title: 'Concurrent Plan 1' });
      const plan2 = testDataFactory.longRangePlan({ title: 'Concurrent Plan 2' });

      createResult1.current.mutate(plan1);
      createResult2.current.mutate(plan2);

      await waitFor(() => {
        expect(createResult1.current.isSuccess).toBe(true);
        expect(createResult2.current.isSuccess).toBe(true);
      });

      // Verify both plans were created
      const { result: listResult } = renderHook(() => useLongRangePlans(), { wrapper });
      
      await waitFor(() => {
        expect(listResult.current.data).toBeDefined();
        expect(listResult.current.data!.length).toBe(2);
      });
    });
  });
});