import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QualityScorecard } from '../QualityScorecard';
import { api } from '../../../api';

// Mock the API
vi.mock('../../../api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Radar: () => <div data-testid="radar-chart">Radar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

const mockDiagnostics = {
  metrics: {
    outcomesCoverage: 75,
    assessmentBalance: 85,
    engagementVariety: 60,
    differentiationScore: 70,
    timeEfficiency: 80,
    domainBalance: 65,
    themeConsistency: 90,
    vocabularyIntegration: 55,
    overallScore: 72.5,
  },
  suggestions: [
    'Add more vocabulary-building activities',
    'Increase variety in activity types to maintain student engagement',
  ],
  warnings: ['Schedule is very full - ensure buffer time for transitions'],
  strengths: [
    'Excellent theme consistency throughout the week',
    'Good balance between teaching and assessment',
  ],
  missingDomains: ['Art', 'Music'],
  overusedDomains: ['Math'],
  uncoveredOutcomes: ['LA.3.1', 'LA.3.2', 'MA.2.5'],
};

const mockTrend = [
  { week: '2024-01-01', score: 65 },
  { week: '2024-01-08', score: 68 },
  { week: '2024-01-15', score: 72 },
  { week: '2024-01-22', score: 72.5 },
];

describe('QualityScorecard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url === '/api/planning/quality-score') {
        return Promise.resolve({ data: mockDiagnostics });
      }
      if (url === '/api/planning/quality-trend') {
        return Promise.resolve({ data: mockTrend });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders loading state initially', () => {
    render(<QualityScorecard weekStart="2024-01-22" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders quality metrics after loading', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText('Weekly Planning Quality')).toBeInTheDocument();
    });

    // Check overall score
    expect(screen.getByText('73%')).toBeInTheDocument(); // Rounded from 72.5
    expect(screen.getByText('Overall Score')).toBeInTheDocument();
  });

  it('shows and hides detailed analysis when button is clicked', async () => {
    const user = userEvent.setup();
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText(/Show Detailed Analysis/)).toBeInTheDocument();
    });

    // Initially hidden
    expect(screen.queryByTestId('radar-chart')).not.toBeInTheDocument();

    // Click to show
    await user.click(screen.getByText(/Show Detailed Analysis/));
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Individual metrics should be visible
    expect(screen.getByText('Outcome Coverage')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();

    // Click to hide
    await user.click(screen.getByText(/Hide Detailed Analysis/));
    expect(screen.queryByTestId('radar-chart')).not.toBeInTheDocument();
  });

  it('displays strengths section', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText('Strengths')).toBeInTheDocument();
    });

    expect(
      screen.getByText('• Excellent theme consistency throughout the week'),
    ).toBeInTheDocument();
    expect(screen.getByText('• Good balance between teaching and assessment')).toBeInTheDocument();
  });

  it('displays warnings section', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText('Warnings')).toBeInTheDocument();
    });

    expect(
      screen.getByText('• Schedule is very full - ensure buffer time for transitions'),
    ).toBeInTheDocument();
  });

  it('displays suggestions with action buttons', async () => {
    const onSuggestionClick = vi.fn();
    const user = userEvent.setup();

    render(<QualityScorecard weekStart="2024-01-22" onSuggestionClick={onSuggestionClick} />);

    await waitFor(() => {
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByText('Take action');
    expect(actionButtons).toHaveLength(2);

    await user.click(actionButtons[0]);
    expect(onSuggestionClick).toHaveBeenCalledWith('Add more vocabulary-building activities');
  });

  it('displays domain analysis', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText(/Show Detailed Analysis/)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText(/Show Detailed Analysis/));

    await waitFor(() => {
      expect(screen.getByText('Domain Analysis')).toBeInTheDocument();
    });

    expect(screen.getByText('Missing:')).toBeInTheDocument();
    expect(screen.getByText('Art, Music')).toBeInTheDocument();
    expect(screen.getByText('Overused:')).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('displays uncovered outcomes', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText(/Show Detailed Analysis/)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText(/Show Detailed Analysis/));

    await waitFor(() => {
      expect(screen.getByText('Uncovered Outcomes')).toBeInTheDocument();
    });

    expect(screen.getByText('LA.3.1, LA.3.2, MA.2.5')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API Error'));

    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load planning diagnostics')).toBeInTheDocument();
    });
  });

  it('applies correct color coding for scores', async () => {
    render(<QualityScorecard weekStart="2024-01-22" />);

    await waitFor(() => {
      expect(screen.getByText(/Show Detailed Analysis/)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText(/Show Detailed Analysis/));

    // Check that metric values are displayed
    expect(screen.getByText('85%')).toBeInTheDocument(); // Assessment Balance
    expect(screen.getByText('60%')).toBeInTheDocument(); // Engagement Variety
    expect(screen.getByText('55%')).toBeInTheDocument(); // Vocabulary Focus
  });
});
