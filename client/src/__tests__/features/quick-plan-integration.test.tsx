/**
 * End-to-end integration tests for Quick Plan feature
 * Testing the complete flow from curriculum page to lesson creation
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { SimpleCurriculumPage } from '../../pages/SimpleCurriculumPage';
import { QuickLessonPage } from '../../pages/QuickLessonPage';
import { STORAGE_KEYS } from '../../constants/subjects';
import * as useETFOPlanning from '../../hooks/useETFOPlanning';

vi.mock('../../hooks/useETFOPlanning');
vi.mock('sonner');

describe('Quick Plan Feature - End-to-End Integration', () => {
  let queryClient: QueryClient;
  const mockCreateLesson = vi.fn();
  
  const mockExpectations = [
    {
      id: 'exp1',
      code: 'FI-1.1',
      subject: 'Français (Immersion)',
      description: 'identify simple greetings',
      grade: 1,
      strand: 'Communication',
      substrand: 'Oral'
    },
    {
      id: 'exp2',
      code: 'MA-1.1',
      subject: 'Mathématiques',
      description: 'count to 10',
      grade: 1,
      strand: 'Number Sense',
      substrand: 'Counting'
    }
  ];

  const mockUnitPlans = [
    { id: 'unit1', title: 'Unit 1: Greetings' }
  ];

  const mockLessonPlans = [
    {
      id: 'lesson1',
      expectations: [{ expectationId: 'exp2' }]
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup mocks
    vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
      data: mockExpectations,
      isLoading: false,
      error: null
    } as any);

    vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
      data: mockLessonPlans,
      isLoading: false
    } as any);

    vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
      data: mockUnitPlans,
      isLoading: false
    } as any);

    vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
      mutateAsync: mockCreateLesson,
      isLoading: false
    } as any);

    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(['Français (Immersion)', 'Mathématiques']));
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderApp = (initialRoute = '/curriculum') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/curriculum" element={<SimpleCurriculumPage />} />
            <Route path="/planner/quick-lesson" element={<QuickLessonPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Complete User Flow', () => {
    it('should complete flow: view curriculum → click Quick Plan → create lesson with expectation', async () => {
      // Step 1: Start on curriculum page
      renderApp('/curriculum');

      // Verify curriculum page loads with expectations
      await waitFor(() => {
        expect(screen.getByText('FI-1.1')).toBeInTheDocument();
        expect(screen.getByText('identify simple greetings')).toBeInTheDocument();
      });

      // Step 2: Find and click Quick Plan button for uncovered expectation
      const quickPlanButtons = screen.getAllByRole('button', { name: /Quick Plan/i });
      expect(quickPlanButtons.length).toBeGreaterThan(0);
      
      // Click the first Quick Plan button (for exp1 which is uncovered)
      await userEvent.click(quickPlanButtons[0]);

      // Step 3: Verify navigation to QuickLessonPage with expectationId
      // Note: In real app, this would navigate, but in test we need to manually trigger
      // Simulate navigation by re-rendering with the new route
      const { unmount } = renderApp('/curriculum');
      unmount();
      renderApp('/planner/quick-lesson?expectationId=exp1');

      // Step 4: Verify expectation is linked
      await waitFor(() => {
        expect(screen.getByText('Linked Curriculum Expectation')).toBeInTheDocument();
        expect(screen.getByText('FI-1.1')).toBeInTheDocument();
      });

      // Step 5: Verify learning goals are pre-populated
      const learningGoalsInput = screen.getByPlaceholderText(/What will students learn/);
      expect(learningGoalsInput).toHaveValue('Students will identify simple greetings');

      // Step 6: Fill in remaining required fields
      await userEvent.type(screen.getByLabelText(/Lesson Title/), 'Introduction to Greetings');
      await userEvent.selectOptions(screen.getByLabelText(/Unit Plan/), 'unit1');

      // Step 7: Submit the form
      const submitButton = screen.getByRole('button', { name: /Create Quick Lesson/i });
      await userEvent.click(submitButton);

      // Step 8: Verify lesson creation includes expectationId
      await waitFor(() => {
        expect(mockCreateLesson).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Introduction to Greetings',
            unitPlanId: 'unit1',
            learningGoals: 'Students will identify simple greetings',
            expectationIds: ['exp1']
          })
        );
      });
    });

    it('should show Quick Plan buttons only for uncovered expectations', async () => {
      // Arrange - exp2 is covered, exp1 is not
      renderApp('/curriculum');

      // Assert
      await waitFor(() => {
        // Find the expectation rows
        const exp1Row = screen.getByText('FI-1.1').closest('div');
        const exp2Row = screen.getByText('MA-1.1').closest('div');

        // exp1 should have Quick Plan button (uncovered)
        expect(exp1Row).toContainElement(screen.getByRole('button', { name: /Quick Plan/i }));
        
        // exp2 should show "Covered" badge instead
        expect(exp2Row).toContainElement(screen.getByText('✓ Covered'));
      });
    });
  });

  describe('Grade Level Integration', () => {
    it('should use consistent grade across curriculum and lesson pages', async () => {
      // Arrange - Set Grade 3 in localStorage
      localStorage.setItem(STORAGE_KEYS.TEACHER_GRADE, '3');

      const grade3Expectations = mockExpectations.map(exp => ({ ...exp, grade: 3 }));
      
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockImplementation(({ grade }) => {
        expect(grade).toBe(3); // Verify grade 3 is requested
        return {
          data: grade === 3 ? grade3Expectations : [],
          isLoading: false,
          error: null
        } as any;
      });

      // Act - Render curriculum page
      renderApp('/curriculum');

      // Assert - Curriculum page requests Grade 3
      await waitFor(() => {
        expect(useETFOPlanning.useCurriculumExpectations).toHaveBeenCalledWith({ grade: 3 });
      });

      // Navigate to Quick Lesson page
      const { unmount } = renderApp('/curriculum');
      unmount();
      renderApp('/planner/quick-lesson?expectationId=exp1');

      // Assert - Quick Lesson page also requests Grade 3
      await waitFor(() => {
        expect(useETFOPlanning.useCurriculumExpectations).toHaveBeenLastCalledWith({ grade: 3 });
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle curriculum API errors gracefully', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Network error')
      } as any);

      // Act
      renderApp('/curriculum');

      // Assert - Should show helpful message, not crash
      await waitFor(() => {
        expect(screen.getByText(/No curriculum expectations found/i)).toBeInTheDocument();
      });
    });

    it('should handle lesson creation errors', async () => {
      // Arrange
      mockCreateLesson.mockRejectedValue(new Error('Server error'));
      
      renderApp('/planner/quick-lesson');

      // Act
      await userEvent.type(screen.getByLabelText(/Lesson Title/), 'Test');
      await userEvent.selectOptions(screen.getByLabelText(/Unit Plan/), 'unit1');
      await userEvent.click(screen.getByRole('button', { name: /Create Quick Lesson/i }));

      // Assert - Error should be handled
      await waitFor(() => {
        expect(screen.getByText(/Failed to create lesson/i)).toBeInTheDocument();
      });
    });
  });
});