/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { CurriculumAuditDashboard } from '../src/components/CurriculumAuditDashboard';
import { api } from '../src/api';

// Mock the API
vi.mock('../src/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockCoverageData = [
  {
    outcomeId: '1',
    outcomeCode: 'FRA-1-001',
    outcomeDescription: 'Students will demonstrate oral communication skills',
    domain: 'Oral Language',
    coveredCount: 3,
    assessed: true,
    lastUsed: '2024-01-15T00:00:00.000Z',
  },
  {
    outcomeId: '2',
    outcomeCode: 'FRA-1-002',
    outcomeDescription: 'Students will read grade-appropriate texts',
    domain: 'Reading',
    coveredCount: 0,
    assessed: false,
    lastUsed: null,
  },
  {
    outcomeId: '3',
    outcomeCode: 'MAT-1-001',
    outcomeDescription: 'Students will count to 100',
    domain: 'Number Sense',
    coveredCount: 5,
    assessed: false,
    lastUsed: '2024-01-20T00:00:00.000Z',
  },
];

const mockSummaryData = {
  total: 3,
  covered: 2,
  assessed: 1,
  overused: 1,
  uncovered: 1,
  coveragePercentage: 67,
  assessmentPercentage: 33,
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );

  return { ...utils, queryClient };
};

describe('CurriculumAuditDashboard', () => {
  beforeEach(() => {
    // Mock successful API responses
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url.includes('/audit/curriculum-coverage/summary')) {
        return Promise.resolve({ data: mockSummaryData });
      } else if (url.includes('/audit/curriculum-coverage')) {
        return Promise.resolve({ data: mockCoverageData });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    cleanup();
  });

  it('renders the dashboard title', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    expect(screen.getByText('Curriculum Coverage Audit')).toBeInTheDocument();
  });

  it('displays summary statistics', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Coverage Summary')).toBeInTheDocument();
    });

    expect(screen.getByText('3')).toBeInTheDocument(); // Total outcomes
    expect(screen.getByText(/2 \(67%\)/)).toBeInTheDocument(); // Covered
    expect(screen.getByText(/1 \(33%\)/)).toBeInTheDocument(); // Assessed
    expect(screen.getByText('1')).toBeInTheDocument(); // Not covered
  });

  it('displays outcome coverage table', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Coverage')).toBeInTheDocument();
    });

    // Wait for table data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading coverage data...')).not.toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByRole('columnheader', { name: 'Outcome' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Domain' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Covered' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Assessed' })).toBeInTheDocument();

    // Check outcome data
    expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    expect(
      screen.getByText('Students will demonstrate oral communication skills'),
    ).toBeInTheDocument();
    // Use a more specific query for the table cell containing "Oral Language"
    const domainCells = screen.getAllByRole('cell');
    const oralLanguageCell = domainCells.find((cell) => cell.textContent === 'Oral Language');
    expect(oralLanguageCell).toBeInTheDocument();
    expect(screen.getByText('FRA-1-002')).toBeInTheDocument();
    expect(screen.getByText('MAT-1-001')).toBeInTheDocument();
  });

  it('shows correct coverage status indicators', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Count checkmarks and X marks in the table
    const checkmarks = screen.getAllByText('✅');
    const xMarks = screen.getAllByText('❌');

    // Should have checkmarks for covered/assessed outcomes
    expect(checkmarks.length).toBeGreaterThan(0);
    // Should have X marks for not covered/not assessed outcomes
    expect(xMarks.length).toBeGreaterThan(0);
  });

  it('filters by subject', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    // Find the subject select - it's the second select element
    const selectElements = screen.getAllByRole('combobox');
    const subjectSelect = selectElements[1]; // Second select is subject

    fireEvent.change(subjectSelect, { target: { value: 'FRA' } });

    // Verify API is called with subject filter
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('subject=FRA'));
    });
  });

  it('filters by term', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    // Find the term select - it's the first select element
    const selectElements = screen.getAllByRole('combobox');
    const termSelect = selectElements[0]; // First select is term

    fireEvent.change(termSelect, { target: { value: 'term1' } });

    // Verify API is called with term filter
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('term=term1'));
    });
  });

  it('shows only uncovered outcomes when checkbox is checked', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Initially all outcomes should be visible
    expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    expect(screen.getByText('FRA-1-002')).toBeInTheDocument();
    expect(screen.getByText('MAT-1-001')).toBeInTheDocument();

    // Check "Show only uncovered" checkbox
    const uncoveredCheckbox = screen.getByLabelText('Show only uncovered');
    fireEvent.click(uncoveredCheckbox);

    // Only uncovered outcome should be visible (FRA-1-002 has coveredCount: 0)
    await waitFor(() => {
      expect(screen.queryByText('FRA-1-001')).not.toBeInTheDocument();
      expect(screen.getByText('FRA-1-002')).toBeInTheDocument();
      expect(screen.queryByText('MAT-1-001')).not.toBeInTheDocument();
    });
  });

  it('shows only unassessed outcomes when checkbox is checked', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Check "Show only unassessed" checkbox
    const unassessedCheckbox = screen.getByLabelText('Show only unassessed');
    fireEvent.click(unassessedCheckbox);

    // Only unassessed outcomes should be visible
    // (FRA-1-002 and MAT-1-001 have assessed: false)
    await waitFor(() => {
      expect(screen.queryByText('FRA-1-001')).not.toBeInTheDocument();
      expect(screen.getByText('FRA-1-002')).toBeInTheDocument();
      expect(screen.getByText('MAT-1-001')).toBeInTheDocument();
    });
  });

  it('handles export functionality', async () => {
    // Mock only the parts we need for export functionality
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();

    // Store original functions
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;

    // Override URL methods
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock export API response
    vi.mocked(api.get).mockImplementation((url: string): Promise<{ data: unknown }> => {
      if (url.includes('export?format=csv')) {
        return Promise.resolve({ data: 'Outcome Code,Description\nFRA-1-001,Test outcome' });
      } else if (url.includes('/audit/curriculum-coverage/summary')) {
        return Promise.resolve({ data: mockSummaryData });
      } else if (url.includes('/audit/curriculum-coverage')) {
        return Promise.resolve({ data: mockCoverageData });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { unmount } = renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/CSV/)).toBeInTheDocument();
    });

    // Click CSV export button
    const csvButton = screen.getByText(/CSV/);
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('export?format=csv'),
        expect.objectContaining({ responseType: 'text' }),
      );
    });

    // Verify download functionality was triggered
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    // Restore original functions
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;

    // Clean up
    unmount();
  });

  it('displays loading state', () => {
    // Mock loading state
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<CurriculumAuditDashboard />);

    expect(screen.getByText('Loading coverage data...')).toBeInTheDocument();
  });

  it('applies row color classes based on outcome status', async () => {
    const { unmount } = renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Check that rows have appropriate styling classes
    const tableRows = screen.getAllByRole('row');

    // Find the row containing FRA-1-002 (not covered - should have red background)
    const uncoveredRow = tableRows.find((row) => row.textContent?.includes('FRA-1-002'));
    expect(uncoveredRow).toHaveClass('bg-red-100');

    // Find the row containing MAT-1-001 (overused without assessment - should have yellow background)
    const overusedRow = tableRows.find((row) => row.textContent?.includes('MAT-1-001'));
    expect(overusedRow).toHaveClass('bg-yellow-100');

    // Find the row containing FRA-1-001 (covered and assessed - should have green background)
    const goodRow = tableRows.find((row) => row.textContent?.includes('FRA-1-001'));
    expect(goodRow).toHaveClass('bg-green-100');

    unmount();
  });
});
