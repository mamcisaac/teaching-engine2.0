/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentPlans } from '../RecentPlans';
import { BrowserRouter } from 'react-router-dom';
import type { RecentPlan } from '../RecentPlans';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('RecentPlans', () => {
  const mockRecentPlans: RecentPlan[] = [
    {
      id: 'rp-1',
      type: 'long-range',
      title: 'Grade 5 Math Year Plan',
      subject: 'Mathematics',
      grade: 5,
      lastAccessed: new Date('2024-09-20T10:00:00Z'),
      progress: 75,
      status: 'in-progress',
    },
    {
      id: 'rp-2',
      type: 'unit',
      title: 'Number Patterns Unit',
      subject: 'Mathematics',
      grade: 5,
      lastAccessed: new Date('2024-09-19T15:30:00Z'),
      progress: 40,
      status: 'in-progress',
      parentTitle: 'Grade 5 Math Year Plan',
    },
    {
      id: 'rp-3',
      type: 'lesson',
      title: 'Introduction to Fractions',
      subject: 'Mathematics',
      grade: 5,
      lastAccessed: new Date('2024-09-18T08:00:00Z'),
      progress: 100,
      status: 'completed',
      parentTitle: 'Number Patterns Unit',
    },
    {
      id: 'rp-4',
      type: 'daybook',
      title: 'Daily Reflection - Sept 17',
      lastAccessed: new Date('2024-09-17T16:00:00Z'),
      status: 'draft',
    },
  ];

  describe('Basic Rendering', () => {
    it('should render the component with plans', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Recent Plans')).toBeInTheDocument();
      expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      expect(screen.getByText('Number Patterns Unit')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      expect(screen.getByText('Daily Reflection - Sept 17')).toBeInTheDocument();
    });

    it('should show empty state when no plans', () => {
      render(
        <RecentPlans plans={[]} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/no recent plans/i)).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      render(
        <RecentPlans plans={[]} isLoading />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      // Check for loading skeletons
      const loadingElements = screen.getAllByTestId('loading-skeleton');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Plan Type Display', () => {
    it('should display correct icons for each plan type', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check for plan type labels
      expect(screen.getByText('Long-Range Plan')).toBeInTheDocument();
      expect(screen.getByText('Unit Plan')).toBeInTheDocument();
      expect(screen.getByText('Lesson Plan')).toBeInTheDocument();
      expect(screen.getByText('Daybook Entry')).toBeInTheDocument();
    });

    it('should show subject and grade when available', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check for subject and grade info
      expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Grade 5').length).toBeGreaterThan(0);
    });

    it('should show parent title when available', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Unit should show under long-range plan
      const unitCard = screen.getByText('Number Patterns Unit').closest('.plan-card');
      expect(unitCard).toHaveTextContent('Grade 5 Math Year Plan');

      // Lesson should show under unit
      const lessonCard = screen.getByText('Introduction to Fractions').closest('.plan-card');
      expect(lessonCard).toHaveTextContent('Number Patterns Unit');
    });
  });

  describe('Progress Indicators', () => {
    it('should show progress bars for plans with progress', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check for progress indicators
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);

      // Check specific progress values
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should apply correct status styling', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check status badges
      expect(screen.getAllByText('In Progress').length).toBe(2);
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should show relative time for last accessed', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check for relative time displays (e.g., "2 days ago")
      const timeElements = screen.getAllByText(/ago/i);
      expect(timeElements.length).toBe(mockRecentPlans.length);
    });
  });

  describe('Navigation', () => {
    it('should have correct links for each plan type', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check links exist
      const longRangeLink = screen.getByText('Grade 5 Math Year Plan').closest('a');
      expect(longRangeLink).toHaveAttribute('href', expect.stringContaining('/planner/long-range/rp-1'));

      const unitLink = screen.getByText('Number Patterns Unit').closest('a');
      expect(unitLink).toHaveAttribute('href', expect.stringContaining('/planner/units/rp-2'));

      const lessonLink = screen.getByText('Introduction to Fractions').closest('a');
      expect(lessonLink).toHaveAttribute('href', expect.stringContaining('/planner/etfo-lessons/rp-3'));

      const daybookLink = screen.getByText('Daily Reflection - Sept 17').closest('a');
      expect(daybookLink).toHaveAttribute('href', expect.stringContaining('/planner/daybook/rp-4'));
    });

    it('should show hover state on plan cards', async () => {
      const user = userEvent.setup();
      
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      const planCard = screen.getByText('Grade 5 Math Year Plan').closest('.plan-card');
      await user.hover(planCard!);

      // Check for hover styling (implementation dependent)
      expect(planCard).toHaveClass('hover:shadow-md');
    });
  });

  describe('Filtering and Sorting', () => {
    it('should display plans in order of last accessed', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      const planTitles = screen.getAllByRole('heading', { level: 3 });
      const titles = planTitles.map(el => el.textContent);

      // Should be ordered by lastAccessed date (most recent first)
      expect(titles[0]).toBe('Grade 5 Math Year Plan');
      expect(titles[1]).toBe('Number Patterns Unit');
      expect(titles[2]).toBe('Introduction to Fractions');
      expect(titles[3]).toBe('Daily Reflection - Sept 17');
    });

    it('should limit display to most recent plans', () => {
      const manyPlans: RecentPlan[] = Array.from({ length: 20 }, (_, i) => ({
        id: `plan-${i}`,
        type: 'lesson',
        title: `Lesson ${i}`,
        lastAccessed: new Date(2024, 8, 20 - i),
        status: 'draft',
      }));

      render(
        <RecentPlans plans={manyPlans} />,
        { wrapper: createWrapper() }
      );

      // Should only show limited number of plans (e.g., 10)
      const displayedPlans = screen.getAllByRole('heading', { level: 3 });
      expect(displayedPlans.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply custom className when provided', () => {
      const { container } = render(
        <RecentPlans plans={mockRecentPlans} className="custom-class" />,
        { wrapper: createWrapper() }
      );

      const component = container.querySelector('.recent-plans');
      expect(component).toHaveClass('custom-class');
    });

    it('should show view all link when there are plans', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      const viewAllLink = screen.getByRole('link', { name: /view all plans/i });
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink).toHaveAttribute('href', '/planner');
    });

    it('should not show view all link when no plans', () => {
      render(
        <RecentPlans plans={[]} />,
        { wrapper: createWrapper() }
      );

      const viewAllLink = screen.queryByRole('link', { name: /view all plans/i });
      expect(viewAllLink).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Check for section label
      const section = screen.getByRole('region', { name: /recent plans/i });
      expect(section).toBeInTheDocument();

      // Check progress bars have labels
      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('aria-label');
        expect(bar).toHaveAttribute('aria-valuenow');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <RecentPlans plans={mockRecentPlans} />,
        { wrapper: createWrapper() }
      );

      // Tab through plan links
      await user.tab();
      const firstLink = screen.getByText('Grade 5 Math Year Plan').closest('a');
      expect(firstLink).toHaveFocus();

      await user.tab();
      const secondLink = screen.getByText('Number Patterns Unit').closest('a');
      expect(secondLink).toHaveFocus();
    });
  });
});