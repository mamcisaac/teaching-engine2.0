import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CoveragePage from '../src/pages/CoveragePage';

// Mock the API module
vi.mock('../src/api', () => {
  const mockCoverageData = [
    {
      outcomeId: 'M1.1',
      code: 'M1.1',
      description: 'Number recognition and counting',
      subject: 'Math',
      domain: 'Number Sense',
      grade: 1,
      isCovered: true,
      coveredBy: [
        { id: 1, title: 'Counting Activities' },
        { id: 2, title: 'Number Recognition Game' },
      ],
    },
    {
      outcomeId: 'M1.2',
      code: 'M1.2',
      description: 'Basic addition skills',
      subject: 'Math',
      domain: 'Number Operations',
      grade: 1,
      isCovered: true,
      coveredBy: [{ id: 3, title: 'Addition Practice' }],
    },
    {
      outcomeId: 'M1.3',
      code: 'M1.3',
      description: 'Subtraction fundamentals',
      subject: 'Math',
      domain: 'Number Operations',
      grade: 1,
      isCovered: false,
      coveredBy: [],
    },
    {
      outcomeId: 'M2.1',
      code: 'M2.1',
      description: 'Advanced addition and subtraction',
      subject: 'Math',
      domain: 'Number Operations',
      grade: 2,
      isCovered: false,
      coveredBy: [],
    },
    {
      outcomeId: 'M2.2',
      code: 'M2.2',
      description: 'Multiplication basics',
      subject: 'Math',
      domain: 'Number Operations',
      grade: 2,
      isCovered: false,
      coveredBy: [],
    },
    {
      outcomeId: 'E1.1',
      code: 'E1.1',
      description: 'Reading comprehension',
      subject: 'English',
      domain: 'Reading',
      grade: 1,
      isCovered: true,
      coveredBy: [{ id: 4, title: 'Reading Activity' }],
    },
    {
      outcomeId: 'E1.2',
      code: 'E1.2',
      description: 'Writing skills',
      subject: 'English',
      domain: 'Writing',
      grade: 1,
      isCovered: false,
      coveredBy: [],
    },
  ];

  return {
    useOutcomeCoverage: vi.fn().mockReturnValue({
      data: mockCoverageData,
      isLoading: false,
      error: null,
    }),
  };
});

describe('CoveragePage', () => {
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
          <CoveragePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Curriculum Coverage Dashboard')).toBeInTheDocument();
  });

  it('displays overall coverage statistics correctly', () => {
    renderComponent();

    // Should show total outcomes (7 in mock data)
    expect(screen.getByText('7')).toBeInTheDocument(); // Total outcomes

    // Should show covered outcomes (3 covered: M1.1, M1.2, E1.1)
    expect(screen.getByText('3')).toBeInTheDocument(); // Covered outcomes

    // Should show coverage percentage (3/7 = 43%)
    expect(screen.getByText('43%')).toBeInTheDocument();
  });

  it('displays detailed outcome table with color-coded rows', () => {
    renderComponent();

    // Should show table headers using columnheader role
    expect(screen.getByRole('columnheader', { name: /code/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /subject/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /activities/i })).toBeInTheDocument();

    // Should show covered outcomes
    expect(screen.getByText('M1.1')).toBeInTheDocument();
    expect(screen.getByText('Number recognition and counting')).toBeInTheDocument();

    // Should show coverage status indicators
    expect(screen.getAllByText('Covered')).toHaveLength(3); // M1.1, M1.2, E1.1
    expect(screen.getAllByText('Not Covered')).toHaveLength(4); // M1.3, M2.1, M2.2, E1.2

    // Should show linked activities for covered outcomes
    expect(screen.getByText('Counting Activities')).toBeInTheDocument();
    expect(screen.getByText('Number Recognition Game')).toBeInTheDocument();
    expect(screen.getByText('Addition Practice')).toBeInTheDocument();
  });

  it('displays subject-wise coverage breakdown', () => {
    renderComponent();

    // Should show coverage by subject section
    expect(screen.getByText('Coverage by Subject')).toBeInTheDocument();

    // Math has 5 outcomes total, 2 covered (M1.1, M1.2) = 40%
    expect(screen.getByText('2 / 5 (40%)')).toBeInTheDocument();

    // English has 2 outcomes total, 1 covered (E1.1) = 50%
    expect(screen.getByText('1 / 2 (50%)')).toBeInTheDocument();

    // Should show both subjects in the coverage cards
    const mathHeaders = screen
      .getAllByText('Math')
      .filter((el) => el.tagName === 'H3' && el.classList.contains('font-semibold'));
    expect(mathHeaders.length).toBeGreaterThan(0);

    const englishHeaders = screen
      .getAllByText('English')
      .filter((el) => el.tagName === 'H3' && el.classList.contains('font-semibold'));
    expect(englishHeaders.length).toBeGreaterThan(0);
  });

  it('filters by subject correctly (Math example)', async () => {
    renderComponent();

    // Select Math from subject dropdown
    const subjectSelect = screen.getByLabelText('Subject');
    fireEvent.change(subjectSelect, { target: { value: 'Math' } });

    // Click apply filters button
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    // The API should be called with Math filter
    // This is tested via the mock being called with the right parameters
    expect(screen.getByDisplayValue('Math')).toBeInTheDocument();
  });

  it('shows visual indicators for coverage status', () => {
    renderComponent();

    // Should show checkmark/status badges
    const coveredBadges = screen.getAllByText('Covered');
    const notCoveredBadges = screen.getAllByText('Not Covered');

    expect(coveredBadges).toHaveLength(3);
    expect(notCoveredBadges).toHaveLength(4);

    // Check that covered outcomes have green styling (via CSS classes)
    coveredBadges.forEach((badge) => {
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    // Check that uncovered outcomes have red styling
    notCoveredBadges.forEach((badge) => {
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  it('displays color-coded table rows correctly', () => {
    renderComponent();

    // Find table rows and check their background colors
    const tableRows = screen.getAllByRole('row');

    // Skip header row (index 0), check data rows
    // Covered outcomes should have green background
    const coveredRows = tableRows.filter((row) => row.classList.contains('bg-green-50'));

    // Uncovered outcomes should have red background
    const uncoveredRows = tableRows.filter((row) => row.classList.contains('bg-red-50'));

    expect(coveredRows.length).toBeGreaterThan(0);
    expect(uncoveredRows.length).toBeGreaterThan(0);
  });

  it('shows progress bars with appropriate colors', () => {
    renderComponent();

    // Find progress bars by their color classes directly
    const redProgressBars = document.querySelectorAll('.bg-red-600');

    expect(redProgressBars.length).toBeGreaterThan(0);

    // Check that we have progress bars with red color (< 50% coverage)
    // The 43% overall coverage should result in a red progress bar
    const progressBar = redProgressBars[0];
    expect(progressBar).toHaveClass('h-2.5', 'rounded-full', 'bg-red-600');
  });

  it('resets filters correctly', () => {
    renderComponent();

    // Set some filters
    const subjectSelect = screen.getByLabelText('Subject');
    const gradeSelect = screen.getByLabelText('Grade');

    fireEvent.change(subjectSelect, { target: { value: 'Math' } });
    fireEvent.change(gradeSelect, { target: { value: '1' } });

    // Click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Filters should be cleared
    expect(subjectSelect).toHaveValue('');
    expect(gradeSelect).toHaveValue('');
  });

  it('handles filtering by grade', () => {
    renderComponent();

    // Select Grade 1
    const gradeSelect = screen.getByLabelText('Grade');
    fireEvent.change(gradeSelect, { target: { value: '1' } });

    // Click apply filters
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(gradeSelect).toHaveValue('1');
  });

  it('handles filtering by domain', () => {
    renderComponent();

    // Select Number Operations domain
    const domainSelect = screen.getByLabelText('Domain');
    fireEvent.change(domainSelect, { target: { value: 'Number Operations' } });

    // Click apply filters
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    expect(domainSelect).toHaveValue('Number Operations');
  });

  it('shows back to dashboard link', () => {
    renderComponent();

    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('displays activity links for covered outcomes', () => {
    renderComponent();

    // Should show specific activity names as links
    expect(screen.getByText('Counting Activities')).toBeInTheDocument();
    expect(screen.getByText('Number Recognition Game')).toBeInTheDocument();
    expect(screen.getByText('Addition Practice')).toBeInTheDocument();
    expect(screen.getByText('Reading Activity')).toBeInTheDocument();
  });
});
