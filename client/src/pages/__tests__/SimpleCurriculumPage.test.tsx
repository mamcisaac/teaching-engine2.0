import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SimpleCurriculumPage } from '../SimpleCurriculumPage';
import { vi } from 'vitest';

// Mock the navigation hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the data hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useCurriculumExpectations: () => ({
    data: [
      { id: '1', code: 'FL1.1', subject: 'Français', strand: 'Lecture', description: 'Lire des textes simples' },
      { id: '2', code: 'MA1.1', subject: 'Mathématiques', strand: 'Nombres', description: 'Compter jusqu\'à 100' },
    ],
    isLoading: false,
    error: null,
  }),
  useETFOLessonPlans: () => ({
    data: [
      { id: 'lesson1', expectations: [{ expectation: { id: '1' } }] } // FL1.1 is covered
    ],
  }),
  useUnitPlans: () => ({
    data: [],
  }),
}));

describe('SimpleCurriculumPage - Quick Plan Button', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SimpleCurriculumPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should show Quick Plan button for uncovered expectations', async () => {
    renderPage();

    await waitFor(() => {
      // MA1.1 should have Quick Plan button (not covered)
      const quickPlanButtons = screen.getAllByText('Quick Plan');
      expect(quickPlanButtons).toHaveLength(1);
    });
  });

  it('should NOT show Quick Plan button for covered expectations', async () => {
    renderPage();

    await waitFor(() => {
      // FL1.1 should have checkmark (covered)
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(1);
    });
  });

  it('should navigate to quick lesson page with expectationId when Quick Plan is clicked', async () => {
    renderPage();

    await waitFor(() => {
      const quickPlanButton = screen.getByRole('button', { name: /Create lesson plan for MA1.1/i });
      fireEvent.click(quickPlanButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/planner/quick-lesson?expectationId=2');
  });

  it('should have proper accessibility attributes on Quick Plan button', async () => {
    renderPage();

    await waitFor(() => {
      const quickPlanButton = screen.getByRole('button', { name: /Create lesson plan for MA1.1/i });
      
      // Check accessibility attributes
      expect(quickPlanButton).toHaveAttribute('aria-label', 'Create lesson plan for MA1.1');
      expect(quickPlanButton).toHaveAttribute('title', 'Create a lesson plan for MA1.1');
      expect(quickPlanButton).toHaveClass('quick-plan-btn');
    });
  });
});