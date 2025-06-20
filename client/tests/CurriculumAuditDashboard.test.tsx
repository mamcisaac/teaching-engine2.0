import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>,
  );
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
    expect(screen.getByText('2 (67%)')).toBeInTheDocument(); // Covered
    expect(screen.getByText('1 (33%)')).toBeInTheDocument(); // Assessed
    expect(screen.getByText('1')).toBeInTheDocument(); // Not covered
  });

  it('displays outcome coverage table', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Coverage')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Domain')).toBeInTheDocument();
    expect(screen.getByText('Covered')).toBeInTheDocument();
    expect(screen.getByText('Assessed')).toBeInTheDocument();

    // Check outcome data
    expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    expect(
      screen.getByText('Students will demonstrate oral communication skills'),
    ).toBeInTheDocument();
    expect(screen.getByText('Oral Language')).toBeInTheDocument();
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
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Open subject filter
    const subjectSelect =
      screen.getByDisplayValue('Select subject') || screen.getByText('Select subject');
    fireEvent.click(subjectSelect);

    // Select French
    const frenchOption = screen.getByText('French');
    fireEvent.click(frenchOption);

    // Verify API is called with subject filter
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('subject=FRA'));
    });
  });

  it('filters by term', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Open term filter
    const termSelect = screen.getByDisplayValue('Select term') || screen.getByText('Select term');
    fireEvent.click(termSelect);

    // Select Term 1
    const term1Option = screen.getByText('Term 1');
    fireEvent.click(term1Option);

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
    // Mock window.URL and document methods for download
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    const mockClick = vi.fn();

    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });

    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
      style: {},
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

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

    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    // Click CSV export button
    const csvButton = screen.getByText('CSV');
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('export?format=csv'),
        expect.objectContaining({ responseType: 'text' }),
      );
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    // Mock loading state
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<CurriculumAuditDashboard />);

    expect(screen.getByText('Loading coverage data...')).toBeInTheDocument();
  });

  it('applies row color classes based on outcome status', async () => {
    renderWithProviders(<CurriculumAuditDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FRA-1-001')).toBeInTheDocument();
    });

    // Check that rows have appropriate styling classes
    const tableRows = screen.getAllByRole('row');

    // Find the row containing FRA-1-002 (not covered - should have red background)
    const uncoveredRow = tableRows.find((row) => row.textContent?.includes('FRA-1-002'));
    expect(uncoveredRow).toHaveClass('bg-red-50');

    // Find the row containing MAT-1-001 (overused without assessment - should have yellow background)
    const overusedRow = tableRows.find((row) => row.textContent?.includes('MAT-1-001'));
    expect(overusedRow).toHaveClass('bg-yellow-50');

    // Find the row containing FRA-1-001 (covered and assessed - should have green background)
    const goodRow = tableRows.find((row) => row.textContent?.includes('FRA-1-001'));
    expect(goodRow).toHaveClass('bg-green-50');
  });
});
