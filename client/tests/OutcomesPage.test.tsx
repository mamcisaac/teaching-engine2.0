import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import OutcomesPage from '../src/pages/OutcomesPage';

// Mock the API module
vi.mock('../src/api', () => {
  const mockOutcomes = [
    {
      id: 'F1.1',
      code: 'F1.1',
      subject: 'French',
      grade: 1,
      description: 'Oral communication skills in French',
      domain: 'Communication',
    },
    {
      id: 'F1.2',
      code: 'F1.2',
      subject: 'French',
      grade: 1,
      description: 'Written expression in French',
      domain: 'Communication',
    },
    {
      id: 'F2.1',
      code: 'F2.1',
      subject: 'French',
      grade: 2,
      description: 'Advanced oral communication',
      domain: 'Communication',
    },
    {
      id: 'M1.1',
      code: 'M1.1',
      subject: 'Math',
      grade: 1,
      description: 'Number recognition and counting',
      domain: 'Number Sense',
    },
    {
      id: 'M2.1',
      code: 'M2.1',
      subject: 'Math',
      grade: 2,
      description: 'Addition and subtraction',
      domain: 'Number Operations',
    },
    {
      id: 'E1.1',
      code: 'E1.1',
      subject: 'English',
      grade: 1,
      description: 'Reading comprehension skills',
      domain: 'Reading',
    },
  ];

  return {
    useOutcomes: vi.fn().mockReturnValue({
      data: mockOutcomes,
      isLoading: false,
      error: null,
    }),
  };
});

describe('OutcomesPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Suppress React 18 console errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OutcomesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Curriculum Outcomes')).toBeInTheDocument();
  });

  it('displays all outcomes in table format by default', () => {
    renderComponent();

    // Should show total count
    expect(screen.getByText('All Outcomes (6)')).toBeInTheDocument();

    // Should show table headers
    expect(screen.getByRole('columnheader', { name: /code/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /subject/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /grade/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /domain/i })).toBeInTheDocument();

    // Should show some outcome codes
    expect(screen.getByText('F1.1')).toBeInTheDocument();
    expect(screen.getByText('M1.1')).toBeInTheDocument();
  });

  it('filters by subject correctly (French example)', async () => {
    renderComponent();

    // Select French from subject dropdown
    const subjectSelect = screen.getByLabelText('Subject');
    fireEvent.change(subjectSelect, { target: { value: 'French' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for filter to apply and check results
    await waitFor(() => {
      // Should show French outcomes
      expect(screen.getByText('F1.1')).toBeInTheDocument();
      expect(screen.getByText('F1.2')).toBeInTheDocument();
      expect(screen.getByText('F2.1')).toBeInTheDocument();
    });
  });

  it('searches by keyword correctly (oral example)', async () => {
    renderComponent();

    // Enter search term
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'oral' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for search to apply
    await waitFor(() => {
      // Should show outcomes containing "oral"
      expect(screen.getByText('Oral communication skills in French')).toBeInTheDocument();
      expect(screen.getByText('Advanced oral communication')).toBeInTheDocument();
    });
  });

  it('filters by grade correctly', async () => {
    renderComponent();

    // Select Grade 1
    const gradeSelect = screen.getByLabelText('Grade');
    fireEvent.change(gradeSelect, { target: { value: '1' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for filter to apply
    await waitFor(() => {
      // Should show Grade 1 outcomes
      expect(screen.getByText('F1.1')).toBeInTheDocument();
      expect(screen.getByText('M1.1')).toBeInTheDocument();
      expect(screen.getByText('E1.1')).toBeInTheDocument();
    });
  });

  it('filters by domain correctly', async () => {
    renderComponent();

    // Select Communication domain
    const domainSelect = screen.getByLabelText('Domain');
    fireEvent.change(domainSelect, { target: { value: 'Communication' } });

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for filter to apply
    await waitFor(() => {
      // Should show Communication domain outcomes
      expect(screen.getByText('Oral communication skills in French')).toBeInTheDocument();
      expect(screen.getByText('Advanced oral communication')).toBeInTheDocument();
    });
  });

  it('can switch between view modes', () => {
    renderComponent();

    // Should start in table mode
    expect(screen.getByRole('columnheader', { name: /code/i })).toBeInTheDocument();

    // Switch to cards view
    const cardsButton = screen.getByText('Cards');
    fireEvent.click(cardsButton);

    // Should show subject group headers and outcome counts
    expect(screen.getByText('3 outcomes')).toBeInTheDocument(); // French has 3 outcomes
    expect(screen.getByText('2 outcomes')).toBeInTheDocument(); // Math has 2 outcomes

    // Switch to details view
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);

    // Should show detailed view (table headers should disappear)
    expect(screen.queryByRole('columnheader', { name: /code/i })).not.toBeInTheDocument();
  });

  it('resets filters correctly', async () => {
    renderComponent();

    // Set some filters
    const subjectSelect = screen.getByLabelText('Subject');
    fireEvent.change(subjectSelect, { target: { value: 'French' } });

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'oral' } });

    // Click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Filters should be cleared
    expect(subjectSelect).toHaveValue('');
    expect(searchInput).toHaveValue('');
  });

  it('handles search on Enter key', async () => {
    renderComponent();

    // Enter search term
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'oral' } });

    // Press Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    // Search should be triggered (same as clicking search button)
    await waitFor(() => {
      expect(screen.getByText('Oral communication skills in French')).toBeInTheDocument();
    });
  });

  it('shows navigation links', () => {
    renderComponent();

    // Should show link to coverage dashboard
    expect(screen.getByText('View Coverage Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });
});
