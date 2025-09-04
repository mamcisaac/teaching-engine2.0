/**
 * Tests for WeekViewPage
 * Verifying empty states and loading behavior
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WeekViewPage } from '../WeekViewPage';
import * as useETFOPlanning from '../../hooks/useETFOPlanning';

// Mock dependencies
vi.mock('../../hooks/useETFOPlanning');

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span>Calendar Icon</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Clock: () => <span>Clock</span>,
  BookOpen: () => <span>BookOpen</span>,
  Plus: () => <span>Plus</span>,
}));

describe('WeekViewPage', () => {
  let queryClient: QueryClient;
  const mockNavigate = vi.fn();

  const mockLessonsWithData = [
    {
      id: 'lesson1',
      title: 'French Lesson',
      titleFr: 'Leçon de français',
      date: new Date().toISOString(),
      duration: 45,
      slotNumber: 1,
      unitPlan: {
        id: 'unit1',
        title: 'Les salutations',
        longRangePlan: {
          subject: 'Français (Immersion)'
        }
      }
    },
    {
      id: 'lesson2',
      title: 'Math Lesson',
      date: new Date().toISOString(),
      duration: 45,
      slotNumber: 2,
      unitPlan: {
        id: 'unit2',
        title: 'Numbers',
        longRangePlan: {
          subject: 'Mathématiques'
        }
      }
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Mock useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<WeekViewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  describe('Loading State', () => {
    it('should show loading spinner and message while fetching lessons', () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: true,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      expect(screen.getByText('Loading lessons...')).toBeInTheDocument();
      // Check for spinner (animation class)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show empty state while loading', () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: true,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      expect(screen.queryByText('No Lessons Planned')).not.toBeInTheDocument();
      expect(screen.queryByText('Create Your First Lesson')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no lessons exist', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No Lessons Planned')).toBeInTheDocument();
        expect(screen.getByText("You don't have any lessons scheduled for this week yet.")).toBeInTheDocument();
      });
    });

    it('should show "Create Your First Lesson" button in empty state', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Create Your First Lesson/i });
        expect(createButton).toBeInTheDocument();
      });
    });

    it('should navigate to quick lesson page when clicking create button', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      const createButton = await screen.findByRole('button', { name: /Create Your First Lesson/i });
      await userEvent.click(createButton);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/planner/quick-lesson');
    });

    it('should show BookOpen icon in empty state', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('BookOpen')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should show week grid when lessons exist', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: mockLessonsWithData,
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        // Should not show empty state
        expect(screen.queryByText('No Lessons Planned')).not.toBeInTheDocument();
        
        // Should show grid headers
        expect(screen.getByText('Lesson Slots')).toBeInTheDocument();
        expect(screen.getByText('Monday')).toBeInTheDocument();
      });
    });

    it('should display lesson titles in the grid', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: mockLessonsWithData,
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Leçon de français')).toBeInTheDocument();
        expect(screen.getByText('Math Lesson')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Controls', () => {
    it('should have previous and next week buttons', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('ChevronLeft')).toBeInTheDocument();
        expect(screen.getByText('ChevronRight')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Today/i })).toBeInTheDocument();
      });
    });

    it('should have navigation buttons to other views', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Day View/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Month View/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API errors gracefully', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch')
      } as any);

      // Act
      renderWithProviders();

      // Assert - Should still show empty state, not crash
      await waitFor(() => {
        expect(screen.getByText('No Lessons Planned')).toBeInTheDocument();
      });
    });

    it('should handle undefined data gracefully', async () => {
      // Arrange
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null
      } as any);

      // Act
      renderWithProviders();

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No Lessons Planned')).toBeInTheDocument();
      });
    });

    it('should use empty array as default for lessons', async () => {
      // Arrange - Return no data property at all
      vi.mocked(useETFOPlanning.useETFOLessonPlans).mockReturnValue({
        isLoading: false
      } as any);

      // Act
      renderWithProviders();

      // Assert - Should handle gracefully with empty state
      await waitFor(() => {
        expect(screen.getByText('No Lessons Planned')).toBeInTheDocument();
      });
    });
  });
});