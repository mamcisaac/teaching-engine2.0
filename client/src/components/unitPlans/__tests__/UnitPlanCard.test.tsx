import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitPlanCard } from '../UnitPlanCard';
import { BrowserRouter } from 'react-router-dom';
import type { UnitPlan } from '../../../hooks/useETFOPlanning';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('UnitPlanCard', () => {
  const mockUnitPlan: UnitPlan = {
    id: 'unit-1',
    title: 'Number Patterns and Algebra',
    description: 'Exploring patterns, variables, and algebraic thinking',
    longRangePlanId: 'lrp-1',
    startDate: '2024-09-15',
    endDate: '2024-10-15',
    estimatedHours: 20,
    bigIdeas: 'Patterns exist everywhere in mathematics and can be represented in multiple ways',
    essentialQuestions: [
      'How do patterns help us understand the world?',
      'What is the relationship between patterns and algebra?'
    ],
    assessmentPlan: 'Formative assessments throughout, summative pattern project',
    successCriteria: [
      'I can identify and extend patterns',
      'I can create algebraic expressions',
      'I can solve simple equations'
    ],
    expectations: [
      { expectation: { id: 'exp-1', code: 'A1.1', description: 'Identify patterns' } as unknown },
      { expectation: { id: 'exp-2', code: 'A1.2', description: 'Extend patterns' } as unknown },
    ],
    resources: [
      { id: 'res-1', unitPlanId: 'unit-1', title: 'Pattern Blocks', type: 'manipulative' } as unknown,
      { id: 'res-2', unitPlanId: 'unit-1', title: 'Algebra Tiles', type: 'manipulative' } as unknown,
    ],
    _count: {
      lessonPlans: 12,
      expectations: 8,
      resources: 5,
    },
    progress: {
      total: 12,
      completed: 7,
      percentage: 58,
    },
  };

  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render unit plan title', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Number Patterns and Algebra')).toBeInTheDocument();
    });

    it('should render unit plan duration', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('20 hours')).toBeInTheDocument();
    });

    it('should render date range', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      // Check that dates are displayed (format may vary)
      expect(screen.getByText(/9\/15\/2024.*10\/15\/2024/)).toBeInTheDocument();
    });

    it('should render big ideas when present', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Big Ideas')).toBeInTheDocument();
      expect(screen.getByText(/Patterns exist everywhere/)).toBeInTheDocument();
    });

    it('should not render big ideas section when not present', () => {
      const unitWithoutBigIdeas = { ...mockUnitPlan, bigIdeas: undefined };
      
      render(
        <UnitPlanCard unitPlan={unitWithoutBigIdeas} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('Big Ideas')).not.toBeInTheDocument();
    });

    it('should render lesson and expectation counts', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('12 lessons')).toBeInTheDocument();
      expect(screen.getByText('8 expectations')).toBeInTheDocument();
    });

    it('should handle missing counts gracefully', () => {
      const unitWithoutCounts = { ...mockUnitPlan, _count: undefined };
      
      render(
        <UnitPlanCard unitPlan={unitWithoutCounts} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('0 lessons')).toBeInTheDocument();
      expect(screen.getByText('0 expectations')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockUnitPlan);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should navigate to unit detail page when title is clicked', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const titleLink = screen.getByRole('link', { name: 'Number Patterns and Algebra' });
      expect(titleLink).toHaveAttribute('href', '/planner/units/unit-1');
    });
  });

  describe('Progress Display', () => {
    it('should show progress bar when progress data is available', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '58');
      expect(screen.getByText('58%')).toBeInTheDocument();
    });

    it('should not show progress bar when progress data is not available', () => {
      const unitWithoutProgress = { ...mockUnitPlan, progress: undefined };
      
      render(
        <UnitPlanCard unitPlan={unitWithoutProgress} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should indicate when unit is completed', () => {
      const completedUnit = {
        ...mockUnitPlan,
        progress: { total: 12, completed: 12, percentage: 100 },
      };
      
      render(
        <UnitPlanCard unitPlan={completedUnit} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should handle different date formats', () => {
      const unitWithDifferentDates = {
        ...mockUnitPlan,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
      };
      
      render(
        <UnitPlanCard unitPlan={unitWithDifferentDates} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      // Should show December dates
      expect(screen.getByText(/12\/1\/2024.*12\/31\/2024/)).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const unitWithInvalidDates = {
        ...mockUnitPlan,
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      };
      
      render(
        <UnitPlanCard unitPlan={unitWithInvalidDates} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      // Should not crash and show some date indicator
      expect(screen.getByText(/Invalid Date/)).toBeInTheDocument();
    });
  });

  describe('Styling and Hover Effects', () => {
    it('should have hover effect on card', () => {
      const { container } = render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });

    it('should apply appropriate styling for hours badge', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const hoursBadge = screen.getByText('20 hours');
      expect(hoursBadge).toHaveClass('bg-indigo-100', 'text-indigo-800');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unit with minimal data', () => {
      const minimalUnit: UnitPlan = {
        id: 'unit-minimal',
        title: 'Minimal Unit',
        longRangePlanId: 'lrp-1',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
      };
      
      render(
        <UnitPlanCard unitPlan={minimalUnit} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Minimal Unit')).toBeInTheDocument();
      expect(screen.getByText('0 hours')).toBeInTheDocument();
      expect(screen.getByText('0 lessons')).toBeInTheDocument();
      expect(screen.getByText('0 expectations')).toBeInTheDocument();
    });

    it('should truncate long big ideas text', () => {
      const unitWithLongBigIdeas = {
        ...mockUnitPlan,
        bigIdeas: 'This is a very long big ideas text that should be truncated. '.repeat(10),
      };
      
      render(
        <UnitPlanCard unitPlan={unitWithLongBigIdeas} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const bigIdeasText = screen.getByText(/This is a very long big ideas text/);
      expect(bigIdeasText).toHaveClass('line-clamp-2');
    });

    it('should handle null description gracefully', () => {
      const unitWithNullDescription = {
        ...mockUnitPlan,
        description: null as unknown,
      };
      
      render(
        <UnitPlanCard unitPlan={unitWithNullDescription} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      // Should render without crashing
      expect(screen.getByText('Number Patterns and Algebra')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels', () => {
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toHaveAttribute('aria-label', expect.stringContaining('Edit'));
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Unit progress');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(
        <UnitPlanCard unitPlan={mockUnitPlan} onEdit={mockOnEdit} />,
        { wrapper: createWrapper() }
      );

      // Tab to title link
      await user.tab();
      const titleLink = screen.getByRole('link', { name: 'Number Patterns and Algebra' });
      expect(titleLink).toHaveFocus();

      // Tab to edit button
      await user.tab();
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).toHaveFocus();

      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalled();
    });
  });
});