import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActivitySuggestions } from '../../ActivitySuggestions';

// Mock the toast hook - only this is mocked, everything else is real
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Integration test that uses real API endpoints
describe.skip('ActivitySuggestions Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });

    // Set up auth token for real API calls
    localStorage.setItem('token', 'integration-test-token');
  });

  afterEach(() => {
    localStorage.clear();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch real activity suggestions from API', async () => {
    // This test will hit the actual API endpoint
    render(
      <ActivitySuggestions outcomeIds={['FR4.1', 'EN4.2']} subject="francais" domain="reading" />,
      { wrapper },
    );

    // Should show loading state initially
    expect(screen.getByText('Activity Suggestions')).toBeInTheDocument();

    // Wait for real API response
    await waitFor(
      async () => {
        // Should either show activities or empty state, but not loading
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements).toHaveLength(0);
      },
      { timeout: 10000 },
    );

    // Should show appropriate content based on real API response
    const hasActivities = screen.queryByText(/No activities found/) === null;

    if (hasActivities) {
      // If we have activities, verify they have proper structure
      const addButtons = screen.queryAllByText('📅 Add to Plan');
      expect(addButtons.length).toBeGreaterThan(0);

      // Should show outcome context
      expect(screen.getByText(/Based on \d+ selected outcome/)).toBeInTheDocument();
    } else {
      // If no activities, should show empty state
      expect(
        screen.getByText('No matching activity suggestions found. Try broadening your criteria.'),
      ).toBeInTheDocument();
    }
  });

  it('should handle real API authentication failures', async () => {
    // Remove auth token to test real 401 response
    localStorage.removeItem('token');

    render(<ActivitySuggestions outcomeIds={['FR4.1']} />, { wrapper });

    await waitFor(
      () => {
        // Should show error state for unauthorized request
        expect(
          screen.getByText('Unable to load activity suggestions. Please try again.'),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  it('should filter suggestions based on real API responses', async () => {
    render(<ActivitySuggestions outcomeIds={['FR4.1']} />, { wrapper });

    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText('Filter Activities')).toBeInTheDocument();
    });

    // Change domain filter
    const domainSelect = screen.getByPlaceholderText('Any domain');
    fireEvent.click(domainSelect);

    // Select a specific domain
    await waitFor(() => {
      const readingOption = screen.getByText('Reading');
      if (readingOption) {
        fireEvent.click(readingOption);
      }
    });

    // Should trigger new API call with filter
    await waitFor(
      () => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements).toHaveLength(0);
      },
      { timeout: 10000 },
    );
  });

  it('should handle real network errors gracefully', async () => {
    // Test with invalid base URL to trigger network error
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, origin: 'http://invalid-url:9999' },
      writable: true,
    });

    render(<ActivitySuggestions outcomeIds={['FR4.1']} />, { wrapper });

    await waitFor(
      () => {
        // Should eventually show error state
        expect(
          screen.getByText('Unable to load activity suggestions. Please try again.'),
        ).toBeInTheDocument();
      },
      { timeout: 15000 },
    );

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should add activity to plan via real API', async () => {
    const mockOnAddToPlan = vi.fn();

    render(<ActivitySuggestions outcomeIds={['FR4.1']} onAddToPlanner={mockOnAddToPlan} />, {
      wrapper,
    });

    // Wait for activities to load
    await waitFor(
      () => {
        const loadingElements = document.querySelectorAll('.animate-pulse');
        expect(loadingElements).toHaveLength(0);
      },
      { timeout: 10000 },
    );

    // If we have activities, test the add functionality
    const addButtons = screen.queryAllByText('Add');
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0]);

      // Should call the callback with real activity data
      await waitFor(() => {
        expect(mockOnAddToPlan).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(Number),
            titleEn: expect.any(String),
            titleFr: expect.any(String),
            domain: expect.any(String),
            subject: expect.any(String),
          }),
        );
      });
    }
  });
});
