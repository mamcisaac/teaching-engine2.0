import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentPlans } from '../RecentPlans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { format } from 'date-fns';

// Mock the recent plans API
vi.mock('../../../api/domains/planning', () => ({
  planningApi: {
    getRecentPlans: vi.fn(),
  },
}));

// Import the mocked module
import { planningApi } from '../../../api/domains/planning';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RecentPlans', () => {
  const mockRecentPlans = [
    {
      id: 'rp-1',
      planId: 'lrp-1',
      planType: 'long-range' as const,
      lastAccessedAt: new Date('2024-09-20T10:00:00Z'),
      accessCount: 5,
      planDetails: {
        title: 'Grade 5 Math Year Plan',
        description: 'Comprehensive math curriculum for the year',
        status: 'active' as const,
        progress: 75,
        startDate: '2024-09-01',
        endDate: '2025-06-30',
      },
    },
    {
      id: 'rp-2',
      planId: 'up-1',
      planType: 'unit' as const,
      lastAccessedAt: new Date('2024-09-19T15:30:00Z'),
      accessCount: 12,
      planDetails: {
        title: 'Number Patterns Unit',
        description: 'Exploring patterns and algebra',
        status: 'in-progress' as const,
        progress: 40,
        startDate: '2024-09-15',
        endDate: '2024-10-15',
      },
    },
    {
      id: 'rp-3',
      planId: 'lp-1',
      planType: 'lesson' as const,
      lastAccessedAt: new Date('2024-09-18T08:00:00Z'),
      accessCount: 3,
      planDetails: {
        title: 'Introduction to Fractions',
        description: 'First lesson on fractions',
        status: 'completed' as const,
        progress: 100,
        date: '2024-09-18',
      },
    },
    {
      id: 'rp-4',
      planId: 'db-1',
      planType: 'daybook' as const,
      lastAccessedAt: new Date('2024-09-17T16:00:00Z'),
      accessCount: 2,
      planDetails: {
        title: 'Daily Reflection - Sept 17',
        description: 'Reflection on fraction lesson',
        status: 'draft' as const,
        progress: 0,
        date: '2024-09-17',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading and Error States', () => {
    it('should show loading state while fetching plans', async () => {
      vi.mocked(planningApi.getRecentPlans).mockImplementation(() => 
        new Promise(() => {}) // Never resolves to keep loading
      );

      render(<RecentPlans />, { wrapper: createWrapper() });

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading recent plans/i)).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(planningApi.getRecentPlans).mockRejectedValue(
        new Error('Failed to fetch recent plans')
      );

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading recent plans/i)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should retry fetching on error button click', async () => {
      const user = userEvent.setup();
      vi.mocked(planningApi.getRecentPlans)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading recent plans/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      });

      expect(planningApi.getRecentPlans).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no recent plans', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue([]);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no recent plans/i)).toBeInTheDocument();
        expect(screen.getByText(/your recently accessed plans will appear here/i)).toBeInTheDocument();
      });

      // Should show call-to-action button
      expect(screen.getByRole('link', { name: /create new plan/i })).toBeInTheDocument();
    });
  });

  describe('Plan Display', () => {
    it('should display all recent plans with correct information', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check all plan titles are displayed
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
        expect(screen.getByText('Number Patterns Unit')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
        expect(screen.getByText('Daily Reflection - Sept 17')).toBeInTheDocument();
      });

      // Check descriptions
      expect(screen.getByText('Comprehensive math curriculum for the year')).toBeInTheDocument();
      expect(screen.getByText('Exploring patterns and algebra')).toBeInTheDocument();
    });

    it('should display correct icons for each plan type', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for plan type indicators (icons or badges)
        expect(screen.getByTestId('icon-long-range')).toBeInTheDocument();
        expect(screen.getByTestId('icon-unit')).toBeInTheDocument();
        expect(screen.getByTestId('icon-lesson')).toBeInTheDocument();
        expect(screen.getByTestId('icon-daybook')).toBeInTheDocument();
      });
    });

    it('should display progress indicators correctly', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check progress percentages
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
        
        // Draft should show 0% or "Draft" status
        const draftElement = screen.getByText(/draft/i);
        expect(draftElement).toBeInTheDocument();
      });
    });

    it('should display status badges with correct styling', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check status badges
        const activeStatus = screen.getByText('active');
        const inProgressStatus = screen.getByText('in-progress');
        const completedStatus = screen.getByText('completed');
        const draftStatus = screen.getByText('draft');

        // Check styling classes
        expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800');
        expect(inProgressStatus).toHaveClass('bg-blue-100', 'text-blue-800');
        expect(completedStatus).toHaveClass('bg-gray-100', 'text-gray-800');
        expect(draftStatus).toHaveClass('bg-yellow-100', 'text-yellow-800');
      });
    });

    it('should format dates correctly', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check date formatting for long-range plan
        expect(screen.getByText('Sep 1, 2024 - Jun 30, 2025')).toBeInTheDocument();
        
        // Check date formatting for unit plan
        expect(screen.getByText('Sep 15 - Oct 15, 2024')).toBeInTheDocument();
        
        // Check single date for lesson and daybook
        expect(screen.getByText('Sep 18, 2024')).toBeInTheDocument();
        expect(screen.getByText('Sep 17, 2024')).toBeInTheDocument();
      });
    });

    it('should show last accessed time', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should show relative time for recent access
        expect(screen.getByText(/accessed.*ago/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should navigate to plan details when clicking view details', async () => {
      const user = userEvent.setup();
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      });

      // Find and click the first "View Details" link
      const viewDetailsLinks = screen.getAllByRole('link', { name: /view details/i });
      expect(viewDetailsLinks[0]).toHaveAttribute('href', '/long-range-plans/lrp-1');
      
      await user.click(viewDetailsLinks[0]);
      // Navigation would happen through React Router
    });

    it('should have correct navigation links for each plan type', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /view details/i });
        
        expect(links[0]).toHaveAttribute('href', '/long-range-plans/lrp-1');
        expect(links[1]).toHaveAttribute('href', '/unit-plans/up-1');
        expect(links[2]).toHaveAttribute('href', '/lesson-plans/lp-1');
        expect(links[3]).toHaveAttribute('href', '/daybook/db-1');
      });
    });

    it('should handle refresh action', async () => {
      const user = userEvent.setup();
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      });

      // Find and click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Should refetch data
      expect(planningApi.getRecentPlans).toHaveBeenCalledTimes(2);
    });
  });

  describe('Filtering and Sorting', () => {
    it('should allow filtering by plan type', async () => {
      const user = userEvent.setup();
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans showFilters={true} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      });

      // Click filter for unit plans only
      const unitFilter = screen.getByRole('button', { name: /unit plans/i });
      await user.click(unitFilter);

      // Should only show unit plans
      expect(screen.getByText('Number Patterns Unit')).toBeInTheDocument();
      expect(screen.queryByText('Grade 5 Math Year Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Introduction to Fractions')).not.toBeInTheDocument();
    });

    it('should maintain sort order by last accessed', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        const planTitles = screen.getAllByTestId(/plan-title/);
        
        // Should be in order of last accessed (most recent first)
        expect(planTitles[0]).toHaveTextContent('Grade 5 Math Year Plan');
        expect(planTitles[1]).toHaveTextContent('Number Patterns Unit');
        expect(planTitles[2]).toHaveTextContent('Introduction to Fractions');
        expect(planTitles[3]).toHaveTextContent('Daily Reflection - Sept 17');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display in grid layout on larger screens', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        const container = screen.getByTestId('recent-plans-grid');
        expect(container).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-3');
      });
    });

    it('should handle long titles gracefully', async () => {
      const plansWithLongTitles = [{
        ...mockRecentPlans[0],
        planDetails: {
          ...mockRecentPlans[0].planDetails,
          title: 'This is an extremely long title for a long-range plan that should be truncated appropriately in the UI to maintain good visual design',
        },
      }];

      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(plansWithLongTitles);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        const title = screen.getByText(/This is an extremely long title/);
        expect(title).toHaveClass('truncate');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /recent plans/i })).toBeInTheDocument();
        
        // Each plan card should be an article
        const planCards = screen.getAllByRole('article');
        expect(planCards).toHaveLength(4);
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(mockRecentPlans);

      render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Grade 5 Math Year Plan')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      const firstLink = screen.getAllByRole('link', { name: /view details/i })[0];
      expect(firstLink).toHaveFocus();

      // Continue tabbing
      await user.tab();
      const secondLink = screen.getAllByRole('link', { name: /view details/i })[1];
      expect(secondLink).toHaveFocus();
    });

    it('should announce loading and error states to screen readers', async () => {
      vi.mocked(planningApi.getRecentPlans).mockImplementation(() => 
        new Promise(() => {}) // Keep loading
      );

      render(<RecentPlans />, { wrapper: createWrapper() });

      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
      expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of plans efficiently', async () => {
      const manyPlans = Array.from({ length: 50 }, (_, i) => ({
        id: `rp-${i}`,
        planId: `plan-${i}`,
        planType: ['long-range', 'unit', 'lesson', 'daybook'][i % 4] as any,
        lastAccessedAt: new Date(Date.now() - i * 86400000), // Each day earlier
        accessCount: Math.floor(Math.random() * 20),
        planDetails: {
          title: `Plan ${i + 1}`,
          description: `Description for plan ${i + 1}`,
          status: 'active' as const,
          progress: Math.floor(Math.random() * 100),
          startDate: '2024-09-01',
          endDate: '2024-12-31',
        },
      }));

      vi.mocked(planningApi.getRecentPlans).mockResolvedValue(manyPlans);

      const { container } = render(<RecentPlans />, { wrapper: createWrapper() });

      await waitFor(() => {
        const planCards = container.querySelectorAll('[data-testid^="plan-card-"]');
        expect(planCards.length).toBeGreaterThan(0);
      });

      // Should apply pagination or virtualization for performance
      const visibleCards = screen.getAllByRole('article');
      expect(visibleCards.length).toBeLessThanOrEqual(12); // Reasonable limit for initial display
    });
  });
});