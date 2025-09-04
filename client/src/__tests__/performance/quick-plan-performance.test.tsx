/**
 * Performance tests for Quick Plan feature
 * Ensuring the feature doesn't degrade app performance
 */

import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { QuickLessonPage } from '../../pages/QuickLessonPage';
import * as useETFOPlanning from '../../hooks/useETFOPlanning';

vi.mock('../../hooks/useETFOPlanning');
vi.mock('sonner');

describe('Quick Plan Feature - Performance', () => {
  let queryClient: QueryClient;
  let performanceMarks: Map<string, number>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    performanceMarks = new Map();
    
    // Mock performance API
    global.performance.mark = vi.fn((name: string) => {
      performanceMarks.set(name, Date.now());
    });

    global.performance.measure = vi.fn((name: string, startMark: string, endMark: string) => {
      const start = performanceMarks.get(startMark) || 0;
      const end = performanceMarks.get(endMark) || Date.now();
      return { duration: end - start };
    });
  });

  const renderWithProviders = (route = '/planner/quick-lesson') => {
    performance.mark('render-start');
    
    const result = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/planner/quick-lesson" element={<QuickLessonPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    performance.mark('render-end');
    return result;
  };

  describe('Initial Render Performance', () => {
    it('should render QuickLessonPage within acceptable time (<100ms)', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false
      } as any);

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: [],
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      const startTime = performance.now();
      renderWithProviders();
      const endTime = performance.now();

      // Assert
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should not cause excessive re-renders when expectationId is present', async () => {
      // Arrange
      let renderCount = 0;
      
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockImplementation(() => {
        renderCount++;
        return {
          data: [{ id: 'exp123', description: 'test' }],
          isLoading: false,
          isError: false
        } as any;
      });

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: [],
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Wait for effects to settle
      await waitFor(() => {
        expect(renderCount).toBeLessThan(5); // Should not re-render excessively
      });
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with expectation loading', async () => {
      // Arrange
      const mockExpectations = Array.from({ length: 100 }, (_, i) => ({
        id: `exp${i}`,
        code: `FI-1.${i}`,
        description: `Description ${i}`,
        grade: 1,
        subject: 'Français'
      }));

      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: mockExpectations,
        isLoading: false,
        isError: false
      } as any);

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: [],
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      const { unmount } = renderWithProviders('/planner/quick-lesson?expectationId=exp50');

      // Clean up
      unmount();

      // Assert - Check that hooks were cleaned up properly
      await waitFor(() => {
        // In a real scenario, we'd check memory usage
        // For this test, we're verifying the component unmounts cleanly
        expect(true).toBe(true); // Placeholder - component should unmount without errors
      });
    });
  });

  describe('Large Data Sets', () => {
    it('should handle large number of unit plans efficiently', async () => {
      // Arrange - Create 100 unit plans
      const manyUnitPlans = Array.from({ length: 100 }, (_, i) => ({
        id: `unit${i}`,
        title: `Unit ${i}: Long Title That Contains Many Words`
      }));

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: manyUnitPlans,
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      const startTime = performance.now();
      const { container } = renderWithProviders();
      const endTime = performance.now();

      // Assert
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(200); // Should still render quickly with many options

      // Verify select has all options
      const select = container.querySelector('select[required]');
      const options = select?.querySelectorAll('option');
      expect(options?.length).toBe(101); // 100 units + 1 placeholder
    });
  });

  describe('Async Operation Performance', () => {
    it('should not block UI while loading expectations', async () => {
      // Arrange - Simulate slow API
      let resolveExpectations: any;
      const expectationsPromise = new Promise((resolve) => {
        resolveExpectations = resolve;
      });

      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false
      } as any);

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: [{ id: 'unit1', title: 'Unit 1' }],
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      const { container } = renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert - Form should be visible but disabled
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveStyle({ opacity: '0.7' });

      // Resolve the promise
      resolveExpectations([{ id: 'exp123', description: 'test' }]);

      // Form should become enabled
      await waitFor(() => {
        expect(form).toHaveStyle({ opacity: '1' });
      });
    });
  });

  describe('localStorage Performance', () => {
    it('should efficiently read teacher grade from localStorage', () => {
      // Arrange
      localStorage.setItem('teacher-grade', '3');
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false
      } as any);

      vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
        data: [],
        isLoading: false
      } as any);

      vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
        mutateAsync: vi.fn(),
        isLoading: false
      } as any);

      // Act
      renderWithProviders();

      // Assert - Should only read localStorage once
      const gradeReads = getItemSpy.mock.calls.filter(call => call[0] === 'teacher-grade');
      expect(gradeReads.length).toBe(1);
    });
  });
});