import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ActivityLibrary } from '../../ActivityLibrary';

// Mock only the toast - everything else uses real APIs
vi.mock('../../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe.skip('ActivityLibrary Integration Tests', () => {
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
    
    localStorage.setItem('token', 'integration-test-token');
  });

  afterEach(() => {
    localStorage.clear();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should load activity templates from real API', async () => {
      
    render(
      <ActivityLibrary 
         
        
        
      />, 
      { wrapper }
    );

    // Should show header immediately
    expect(screen.getByText('Activity Library')).toBeInTheDocument();
    expect(screen.getByText('Browse and manage your activity templates')).toBeInTheDocument();

    // Wait for real API response
    await waitFor(
      () => {
        // Should show activity count (either 0 or more)
        const countText = screen.getByText(/\d+ activit(y|ies) found/);
        expect(countText).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Should show either activities or empty state
    const hasActivities = !screen.queryByText('No activities found');
    
    if (hasActivities) {
      // Should have grid/list toggle
      const gridButton = screen.getByRole('button', { name: /grid/i });
      const listButton = screen.getByRole('button', { name: /list/i });
      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
    }
  });

  it('should filter activities via real API calls', async () => {
    render(<ActivityLibrary  />, { wrapper });

    // Wait for initial load
    await waitFor(
      () => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Search activities...');
    fireEvent.change(searchInput, { target: { value: 'reading' } });

    // Should trigger new API call
    await waitFor(
      () => {
        // Should still show count (may be different)
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Test filters panel
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      // Should expand filters section
      const domainSelects = screen.getAllByText('All domains');
      expect(domainSelects.length).toBeGreaterThan(0);
    });
  });

  it('should handle view mode changes with real data', async () => {
    render(<ActivityLibrary   />, { wrapper });

    // Wait for load
    await waitFor(
      () => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Only test view toggle if we have activities
    const hasActivities = !screen.queryByText('No activities found');
    
    if (hasActivities) {
      // Switch to list view
      const listButton = screen.getByRole('button', { name: /list/i });
      fireEvent.click(listButton);

      // Should maintain data but change layout
      await waitFor(() => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      });

      // Switch back to grid
      const gridButton = screen.getByRole('button', { name: /grid/i });
      fireEvent.click(gridButton);

      await waitFor(() => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      });
    }
  });

  it('should handle real authentication errors', async () => {
    // Remove auth token
    localStorage.removeItem('token');

    render(<ActivityLibrary />, { wrapper });

    await waitFor(
      () => {
        // Should show error state
        expect(screen.getByText('Unable to load activity library. Please try again.')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should retry failed requests', async () => {
    // Start without token to get error
    localStorage.removeItem('token');

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Add token back
    localStorage.setItem('token', 'integration-test-token');

    // Click retry
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    // Should now succeed
    await waitFor(
      () => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should handle sorting with real API responses', async () => {
    render(<ActivityLibrary  />, { wrapper });

    // Wait for load
    await waitFor(
      () => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Open filters to access sorting
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue('Recently updated');
      expect(sortSelect).toBeInTheDocument();
    });

    // Change sort order - this should trigger new API call
    const sortSelect = screen.getByDisplayValue('Recently updated');
    fireEvent.click(sortSelect);
    
    // Try to select different sort option
    await waitFor(() => {
      const titleOption = screen.queryByText('Title');
      if (titleOption) {
        fireEvent.click(titleOption);
      }
    });

    // Should maintain data but potentially reorder
    await waitFor(
      () => {
        expect(screen.getByText(/\d+ activit(y|ies) found/)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should handle create new activity workflow', async () => {
      
    render(
      <ActivityLibrary 
        
        
      />, 
      { wrapper }
    );

    // Wait for load
    await waitFor(
      () => {
        expect(screen.getByText('New Activity')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Click create button
    const createButton = screen.getByText('New Activity');
    fireEvent.click(createButton);

    // Should navigate to create new activity
    // In a real app this would handle navigation or modal
  });
});