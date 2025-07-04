import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitPlanCard } from '../UnitPlanCard';
import { BrowserRouter } from 'react-router-dom';
import { format } from 'date-fns';

// Mock router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('UnitPlanCard', () => {
  const mockUnitPlan = {
    id: 'unit-1',
    title: 'Number Patterns and Algebra',
    description: 'Exploring patterns and early algebra concepts for Grade 5',
    longRangePlanId: 'lrp-1',
    userId: 1,
    startDate: new Date('2024-09-15'),
    endDate: new Date('2024-10-15'),
    bigIdeas: 'Patterns help us make predictions and solve problems',
    grade: 5,
    subjects: ['Mathematics'],
    totalHours: 24,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-14'),
    // Related data
    lessonCount: 12,
    completedLessons: 5,
    expectations: [
      { id: 'exp-1', code: 'A1.1', description: 'Identify and describe patterns' },
      { id: 'exp-2', code: 'A1.2', description: 'Extend and create patterns' },
      { id: 'exp-3', code: 'A1.3', description: 'Use patterns to solve problems' },
    ],
    resources: [
      { id: 'res-1', title: 'Pattern blocks', type: 'manipulative' },
      { id: 'res-2', title: 'Graphing paper', type: 'material' },
    ],
  };

  const defaultProps = {
    unitPlan: mockUnitPlan,
    onEdit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Display', () => {
    it('should render unit plan title and description', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('Number Patterns and Algebra')).toBeInTheDocument();
      expect(screen.getByText('Exploring patterns and early algebra concepts for Grade 5')).toBeInTheDocument();
    });

    it('should display date range correctly', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      // Should format dates nicely
      expect(screen.getByText(/Sep 15 - Oct 15, 2024/)).toBeInTheDocument();
    });

    it('should show duration in weeks', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      // 30 days = ~4 weeks
      expect(screen.getByText(/4 weeks/i)).toBeInTheDocument();
    });

    it('should display big ideas section', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('Big Ideas')).toBeInTheDocument();
      expect(screen.getByText('Patterns help us make predictions and solve problems')).toBeInTheDocument();
    });

    it('should show grade and subject information', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/Grade 5/)).toBeInTheDocument();
      expect(screen.getByText(/Mathematics/)).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('should display total hours', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText(/hours/i)).toBeInTheDocument();
    });

    it('should show lesson count and progress', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText(/lessons/i)).toBeInTheDocument();
      
      // Progress: 5/12 completed
      expect(screen.getByText('5/12')).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it('should display progress percentage', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      // 5/12 = ~42%
      expect(screen.getByText(/42%/)).toBeInTheDocument();
    });

    it('should show progress bar', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '42');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should display expectation count', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/expectations/i)).toBeInTheDocument();
    });

    it('should handle zero metrics gracefully', () => {
      const unitPlanNoProgress = {
        ...mockUnitPlan,
        lessonCount: 0,
        completedLessons: 0,
        expectations: [],
      };

      render(<UnitPlanCard unitPlan={unitPlanNoProgress} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to unit plan details when clicking view details', async () => {
      const user = userEvent.setup();
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const viewDetailsLink = screen.getByRole('link', { name: /view details/i });
      expect(viewDetailsLink).toHaveAttribute('href', '/unit-plans/unit-1');

      await user.click(viewDetailsLink);
      // Navigation handled by React Router
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      
      render(<UnitPlanCard unitPlan={mockUnitPlan} onEdit={onEdit} />, { wrapper: createWrapper() });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockUnitPlan);
    });

    it('should not show edit button if onEdit is not provided', () => {
      render(<UnitPlanCard unitPlan={mockUnitPlan} />, { wrapper: createWrapper() });

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should expand/collapse expectation details', async () => {
      const user = userEvent.setup();
      render(<UnitPlanCard {...defaultProps} showExpectations={true} />, { wrapper: createWrapper() });

      // Initially collapsed
      expect(screen.queryByText('A1.1')).not.toBeInTheDocument();

      // Click to expand
      const expandButton = screen.getByRole('button', { name: /show expectations/i });
      await user.click(expandButton);

      // Should show expectation codes
      expect(screen.getByText('A1.1')).toBeInTheDocument();
      expect(screen.getByText('A1.2')).toBeInTheDocument();
      expect(screen.getByText('A1.3')).toBeInTheDocument();

      // Click to collapse
      await user.click(expandButton);
      expect(screen.queryByText('A1.1')).not.toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show completed status when all lessons are done', () => {
      const completedUnit = {
        ...mockUnitPlan,
        completedLessons: 12, // All 12 lessons completed
      };

      render(<UnitPlanCard unitPlan={completedUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      expect(screen.getByText(/100%/)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toHaveClass('text-green-600');
    });

    it('should show in-progress status for partial completion', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const progressElement = screen.getByText(/42%/);
      expect(progressElement).toHaveClass('text-blue-600');
    });

    it('should show not-started status when no lessons completed', () => {
      const notStartedUnit = {
        ...mockUnitPlan,
        completedLessons: 0,
      };

      render(<UnitPlanCard unitPlan={notStartedUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      expect(screen.getByText(/0%/)).toBeInTheDocument();
      expect(screen.getByText(/not started/i)).toBeInTheDocument();
    });

    it('should highlight overdue units', () => {
      const overdueUnit = {
        ...mockUnitPlan,
        endDate: new Date('2024-01-01'), // Past date
        completedLessons: 5, // Not completed
      };

      render(<UnitPlanCard unitPlan={overdueUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      const card = screen.getByRole('article');
      expect(card).toHaveClass('border-red-300');
      expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    });

    it('should show upcoming badge for future units', () => {
      const futureUnit = {
        ...mockUnitPlan,
        startDate: new Date('2025-01-01'), // Future date
      };

      render(<UnitPlanCard unitPlan={futureUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when specified', () => {
      render(<UnitPlanCard {...defaultProps} compact={true} />, { wrapper: createWrapper() });

      // Should still show essential information
      expect(screen.getByText('Number Patterns and Algebra')).toBeInTheDocument();
      expect(screen.getByText(/42%/)).toBeInTheDocument();

      // But hide some details
      expect(screen.queryByText('Big Ideas')).not.toBeInTheDocument();
      expect(screen.queryByText(mockUnitPlan.description)).not.toBeInTheDocument();
    });

    it('should truncate long titles in compact mode', () => {
      const longTitleUnit = {
        ...mockUnitPlan,
        title: 'This is an extremely long unit title that should be truncated in compact mode to maintain layout',
      };

      render(<UnitPlanCard unitPlan={longTitleUnit} onEdit={vi.fn()} compact={true} />, { wrapper: createWrapper() });

      const title = screen.getByText(/This is an extremely long unit title/);
      expect(title).toHaveClass('truncate');
    });
  });

  describe('Resource Display', () => {
    it('should show resource count when resources exist', () => {
      render(<UnitPlanCard {...defaultProps} showResources={true} />, { wrapper: createWrapper() });

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/resources/i)).toBeInTheDocument();
    });

    it('should list resources when expanded', async () => {
      const user = userEvent.setup();
      render(<UnitPlanCard {...defaultProps} showResources={true} />, { wrapper: createWrapper() });

      const resourceButton = screen.getByRole('button', { name: /show resources/i });
      await user.click(resourceButton);

      expect(screen.getByText('Pattern blocks')).toBeInTheDocument();
      expect(screen.getByText('Graphing paper')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing description gracefully', () => {
      const noDescriptionUnit = {
        ...mockUnitPlan,
        description: null,
      };

      render(<UnitPlanCard unitPlan={noDescriptionUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      expect(screen.getByText('Number Patterns and Algebra')).toBeInTheDocument();
      // Should not crash, just not show description
    });

    it('should handle invalid dates', () => {
      const invalidDateUnit = {
        ...mockUnitPlan,
        startDate: new Date('invalid'),
        endDate: new Date('invalid'),
      };

      render(<UnitPlanCard unitPlan={invalidDateUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      // Should show fallback or handle gracefully
      expect(screen.queryByText(/Invalid Date/)).not.toBeInTheDocument();
    });

    it('should handle very long big ideas text', () => {
      const longBigIdeasUnit = {
        ...mockUnitPlan,
        bigIdeas: 'This is an extremely long big ideas text that goes on and on and on with many concepts and ideas that should be displayed properly without breaking the layout of the card component even when it contains multiple sentences and paragraphs of educational content.',
      };

      render(<UnitPlanCard unitPlan={longBigIdeasUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      const bigIdeas = screen.getByText(/This is an extremely long big ideas text/);
      expect(bigIdeas).toBeInTheDocument();
      // Should have proper text wrapping
      expect(bigIdeas.closest('div')).not.toHaveClass('truncate');
    });

    it('should calculate progress correctly with edge values', () => {
      const edgeCases = [
        { completedLessons: 0, lessonCount: 0, expected: '0%' },
        { completedLessons: 10, lessonCount: 0, expected: '100%' }, // Prevent division by zero
        { completedLessons: 15, lessonCount: 10, expected: '100%' }, // Cap at 100%
      ];

      edgeCases.forEach(({ completedLessons, lessonCount, expected }) => {
        const { unmount } = render(
          <UnitPlanCard 
            unitPlan={{ ...mockUnitPlan, completedLessons, lessonCount }} 
            onEdit={vi.fn()} 
          />,
          { wrapper: createWrapper() }
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Number Patterns and Algebra'));

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', expect.stringContaining('Progress'));
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      // Tab to view details link
      await user.tab();
      expect(screen.getByRole('link', { name: /view details/i })).toHaveFocus();

      // Tab to edit button
      await user.tab();
      expect(screen.getByRole('button', { name: /edit/i })).toHaveFocus();
    });

    it('should announce status to screen readers', () => {
      const overdueUnit = {
        ...mockUnitPlan,
        endDate: new Date('2024-01-01'),
        completedLessons: 5,
      };

      render(<UnitPlanCard unitPlan={overdueUnit} onEdit={vi.fn()} />, { wrapper: createWrapper() });

      const status = screen.getByText(/overdue/i);
      expect(status).toHaveAttribute('role', 'status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for different screen sizes', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const card = screen.getByRole('article');
      // Should have responsive classes
      expect(card).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });

    it('should stack metrics vertically on small screens', () => {
      render(<UnitPlanCard {...defaultProps} />, { wrapper: createWrapper() });

      const metricsContainer = screen.getByTestId('unit-metrics');
      expect(metricsContainer).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4');
    });
  });

  describe('Loading States', () => {
    it('should show skeleton loader when data is loading', () => {
      render(<UnitPlanCard loading={true} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('unit-card-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Number Patterns and Algebra')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(
        <UnitPlanCard 
          {...defaultProps} 
          className="custom-class shadow-xl" 
        />,
        { wrapper: createWrapper() }
      );

      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-class', 'shadow-xl');
    });

    it('should merge custom styles with default styles', () => {
      render(
        <UnitPlanCard 
          {...defaultProps} 
          style={{ backgroundColor: 'rgb(255, 0, 0)' }} 
        />,
        { wrapper: createWrapper() }
      );

      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
    });
  });
});