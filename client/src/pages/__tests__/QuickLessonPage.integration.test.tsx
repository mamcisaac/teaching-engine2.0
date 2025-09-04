/**
 * Integration tests for Quick Plan feature
 * Following TDD principles - these tests describe expected behavior
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

import { QuickLessonPage } from '../QuickLessonPage';
import { STORAGE_KEYS } from '../../constants/subjects';
import * as useETFOPlanning from '../../hooks/useETFOPlanning';

// Mock dependencies
vi.mock('sonner');
vi.mock('../../hooks/useETFOPlanning');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('QuickLessonPage - Quick Plan Feature', () => {
  let queryClient: QueryClient;
  const mockCreateMutation = vi.fn();
  
  const mockExpectation = {
    id: 'exp123',
    code: 'FI-1.1',
    subject: 'Français (Immersion)',
    description: 'identify and respond to simple greetings and expressions of courtesy in French',
    grade: 1,
    strand: 'Communication',
    substrand: 'Oral Communication'
  };

  const mockUnitPlans = [
    { id: 'unit1', title: 'Les salutations' },
    { id: 'unit2', title: 'Ma famille' }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup mocks
    vi.mocked(useETFOPlanning.useUnitPlans).mockReturnValue({
      data: mockUnitPlans,
      isLoading: false,
      error: null
    } as any);

    vi.mocked(useETFOPlanning.useCreateETFOLessonPlan).mockReturnValue({
      mutateAsync: mockCreateMutation,
      isLoading: false
    } as any);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithProviders = (initialRoute = '/planner/quick-lesson') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/planner/quick-lesson" element={<QuickLessonPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Curriculum Expectation Linking', () => {
    it('should load and display linked expectation when expectationId is in URL', async () => {
      // Arrange - Mock successful expectation fetch
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [mockExpectation],
        isLoading: false,
        isError: false
      } as any);

      // Act - Render with expectationId in URL
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert - Expectation details should be displayed
      await waitFor(() => {
        expect(screen.getByText('Linked Curriculum Expectation')).toBeInTheDocument();
        expect(screen.getByText('FI-1.1')).toBeInTheDocument();
        expect(screen.getByText('Français (Immersion)', { exact: false })).toBeInTheDocument();
        expect(screen.getByText(/identify and respond to simple greetings/)).toBeInTheDocument();
      });
    });

    it('should pre-populate learning goals from linked expectation', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [mockExpectation],
        isLoading: false,
        isError: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert - Learning goals should be auto-populated
      await waitFor(() => {
        const learningGoalsInput = screen.getByPlaceholderText(/What will students learn/);
        expect(learningGoalsInput).toHaveValue(
          'Students will identify and respond to simple greetings and expressions of courtesy in french'
        );
      });
    });

    it('should show warning for invalid expectation ID', async () => {
      // Arrange - Mock empty expectations (ID not found)
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [{ ...mockExpectation, id: 'different-id' }],
        isLoading: false,
        isError: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=invalid123');

      // Assert - Should show invalid expectation warning
      await waitFor(() => {
        expect(screen.getByText('Invalid Curriculum Expectation')).toBeInTheDocument();
        expect(screen.getByText(/The linked expectation ID could not be found/)).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching expectation', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert
      expect(screen.getByText('Loading curriculum expectation details...')).toBeInTheDocument();
    });

    it('should handle expectation fetch errors gracefully', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error Loading Expectation')).toBeInTheDocument();
        expect(screen.getByText(/Failed to load curriculum expectations/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction During Loading', () => {
    it('should disable submit button while expectations are loading', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert
      const submitButton = screen.getByRole('button', { name: /Loading\.\.\./ });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveStyle({ cursor: 'not-allowed' });
    });

    it('should reduce form opacity during loading', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false
      } as any);

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Assert
      const form = screen.getByRole('form', { hidden: true }) || 
                   document.querySelector('form');
      expect(form).toHaveStyle({ opacity: '0.7', pointerEvents: 'none' });
    });
  });

  describe('Grade Level Configuration', () => {
    it('should use teacher grade from localStorage when available', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEYS.TEACHER_GRADE, '3');
      const mockGrade3Expectations = [
        { ...mockExpectation, grade: 3, id: 'grade3-exp' }
      ];

      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockImplementation(({ grade }) => {
        expect(grade).toBe(3); // Verify it's requesting grade 3
        return {
          data: mockGrade3Expectations,
          isLoading: false,
          isError: false
        } as any;
      });

      // Act
      renderWithProviders('/planner/quick-lesson');

      // Assert - Should request grade 3 expectations
      await waitFor(() => {
        expect(useETFOPlanning.useCurriculumExpectations).toHaveBeenCalledWith({ grade: 3 });
      });
    });

    it('should default to Grade 1 when no teacher grade is stored', async () => {
      // Arrange - No localStorage value set
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockImplementation(({ grade }) => {
        expect(grade).toBe(1); // Verify it defaults to grade 1
        return {
          data: [mockExpectation],
          isLoading: false,
          isError: false
        } as any;
      });

      // Act
      renderWithProviders('/planner/quick-lesson');

      // Assert
      await waitFor(() => {
        expect(useETFOPlanning.useCurriculumExpectations).toHaveBeenCalledWith({ grade: 1 });
      });
    });
  });

  describe('Lesson Creation with Expectations', () => {
    it('should include expectationIds in lesson creation payload', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [mockExpectation],
        isLoading: false,
        isError: false
      } as any);

      mockCreateMutation.mockResolvedValue({ id: 'new-lesson' });

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      // Fill in required fields
      await userEvent.type(screen.getByLabelText(/Lesson Title/), 'French Greetings');
      await userEvent.selectOptions(screen.getByLabelText(/Unit Plan/), 'unit1');

      // Submit form
      await userEvent.click(screen.getByRole('button', { name: /Create Quick Lesson/ }));

      // Assert
      await waitFor(() => {
        expect(mockCreateMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'French Greetings',
            unitPlanId: 'unit1',
            expectationIds: ['exp123']
          })
        );
      });
    });

    it('should not include expectationIds for invalid expectation', async () => {
      // Arrange - Invalid expectation ID
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [], // No matching expectation
        isLoading: false,
        isError: false
      } as any);

      mockCreateMutation.mockResolvedValue({ id: 'new-lesson' });

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=invalid');

      await userEvent.type(screen.getByLabelText(/Lesson Title/), 'Test Lesson');
      await userEvent.selectOptions(screen.getByLabelText(/Unit Plan/), 'unit1');
      await userEvent.click(screen.getByRole('button', { name: /Create Quick Lesson/ }));

      // Assert - Should not include expectationIds
      await waitFor(() => {
        expect(mockCreateMutation).toHaveBeenCalledWith(
          expect.objectContaining({
            expectationIds: []
          })
        );
      });
    });

    it('should navigate to curriculum page after successful creation', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useCurriculumExpectations).mockReturnValue({
        data: [mockExpectation],
        isLoading: false,
        isError: false
      } as any);

      mockCreateMutation.mockResolvedValue({ id: 'new-lesson' });

      // Act
      renderWithProviders('/planner/quick-lesson?expectationId=exp123');

      await userEvent.type(screen.getByLabelText(/Lesson Title/), 'Test');
      await userEvent.selectOptions(screen.getByLabelText(/Unit Plan/), 'unit1');
      await userEvent.click(screen.getByRole('button', { name: /Create Quick Lesson/ }));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/curriculum');
        expect(toast.success).toHaveBeenCalledWith('Quick lesson created successfully!');
      });
    });
  });
});