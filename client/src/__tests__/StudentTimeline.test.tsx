import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentTimeline from '../components/StudentTimeline';
import * as api from '../api';

// Mock the API module
vi.mock('../api', () => ({
  useTimelineEvents: vi.fn(),
  useTimelineSummary: vi.fn(),
  useSubjects: vi.fn(),
  useOutcomes: vi.fn(),
  useThematicUnits: vi.fn(),
}));

describe('StudentTimeline', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const mockEvents: api.TimelineEvent[] = [
    {
      id: 'act-1',
      date: '2024-01-15T00:00:00Z',
      type: 'activity',
      label: 'Writing Exercise',
      linkedOutcomeIds: ['CO.1'],
      subjectId: 1,
    },
    {
      id: 'assess-1',
      date: '2024-01-20T00:00:00Z',
      type: 'assessment',
      label: 'Oral Presentation',
      linkedOutcomeIds: ['CO.2'],
      metadata: { score: 85 },
    },
    {
      id: 'theme-1',
      date: '2024-01-10T00:00:00Z',
      type: 'theme',
      label: 'Space Exploration',
      linkedOutcomeIds: ['CO.1', 'CO.2'],
      metadata: { endDate: '2024-02-10T00:00:00Z' },
    },
    {
      id: 'newsletter-1',
      date: '2024-01-25T00:00:00Z',
      type: 'newsletter',
      label: 'January Newsletter',
      linkedOutcomeIds: ['CO.1'],
    },
  ];

  const mockSummary: api.TimelineSummary = {
    totalOutcomes: 10,
    coveredOutcomes: 2,
    coveragePercentage: 20,
    nextMilestone: {
      id: 1,
      title: 'Oral Storytelling',
      targetDate: '2024-02-01T00:00:00Z',
    },
  };

  const mockSubjects = [
    { id: 1, name: 'French' },
    { id: 2, name: 'Math' },
  ];

  const mockOutcomes = [
    { id: 'CO.1', code: 'CO.1', description: 'Reading comprehension' },
    { id: 'CO.2', code: 'CO.2', description: 'Oral communication' },
  ];

  const mockThemes = [
    { id: 1, title: 'Space Exploration' },
    { id: 2, title: 'Community Helpers' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.useTimelineEvents).mockReturnValue({
      data: mockEvents,
      isLoading: false,
    } as ReturnType<typeof api.useTimelineEvents>);
    vi.mocked(api.useTimelineSummary).mockReturnValue({
      data: mockSummary,
      isLoading: false,
    } as ReturnType<typeof api.useTimelineSummary>);
    vi.mocked(api.useSubjects).mockReturnValue({ data: mockSubjects } as ReturnType<
      typeof api.useSubjects
    >);
    vi.mocked(api.useOutcomes).mockReturnValue({ data: mockOutcomes } as ReturnType<
      typeof api.useOutcomes
    >);
    vi.mocked(api.useThematicUnits).mockReturnValue({ data: mockThemes } as ReturnType<
      typeof api.useThematicUnits
    >);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <StudentTimeline />
      </QueryClientProvider>,
    );
  };

  it('should render the timeline header', () => {
    renderComponent();
    expect(screen.getByText('Learning Timeline')).toBeInTheDocument();
  });

  it('should display the summary statistics', () => {
    renderComponent();
    expect(screen.getByText('Outcome Coverage')).toBeInTheDocument();
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should display the next milestone', () => {
    renderComponent();
    expect(screen.getByText('Next Milestone')).toBeInTheDocument();
    expect(screen.getByText('Oral Storytelling')).toBeInTheDocument();
  });

  it('should display timeline events grouped by week', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Week of Jan 08, 2024')).toBeInTheDocument();
      expect(screen.getByText('Week of Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Week of Jan 22, 2024')).toBeInTheDocument();
    });
  });

  it('should display different event types with correct labels', () => {
    renderComponent();

    expect(screen.getByText('Writing Exercise')).toBeInTheDocument();
    expect(screen.getByText('Oral Presentation')).toBeInTheDocument();
    expect(screen.getByText('Space Exploration')).toBeInTheDocument();
    expect(screen.getByText('January Newsletter')).toBeInTheDocument();
  });

  it('should display assessment scores when available', () => {
    renderComponent();
    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
  });

  it('should show theme end dates', () => {
    renderComponent();
    expect(screen.getByText('Through Feb 10, 2024')).toBeInTheDocument();
  });

  it('should toggle filters when filter button is clicked', () => {
    renderComponent();

    const filterButton = screen.getByText('Filters');
    expect(screen.queryByLabelText('Subject')).not.toBeInTheDocument();

    fireEvent.click(filterButton);
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Outcome')).toBeInTheDocument();
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();
  });

  it('should update filters when selections change', () => {
    renderComponent();

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    const subjectSelect = screen.getByLabelText('Subject');
    fireEvent.change(subjectSelect, { target: { value: '1' } });

    expect(vi.mocked(api.useTimelineEvents)).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectId: '1',
      }),
    );
  });

  it('should navigate timeline periods', () => {
    renderComponent();

    const prevButton = screen.getByText('Previous 3 Months');
    fireEvent.click(prevButton);

    // Check that the API was called with updated date range
    expect(vi.mocked(api.useTimelineEvents)).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
      }),
    );
  });

  it('should display loading state', () => {
    vi.mocked(api.useTimelineEvents).mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof api.useTimelineEvents>);
    vi.mocked(api.useTimelineSummary).mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof api.useTimelineSummary>);

    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display empty state when no events', () => {
    vi.mocked(api.useTimelineEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof api.useTimelineEvents>);

    renderComponent();
    expect(screen.getByText('No timeline events found for this period.')).toBeInTheDocument();
  });

  it('should display linked outcome IDs for events', () => {
    renderComponent();

    // The events display their linked outcome IDs
    expect(screen.getByText('CO.1')).toBeInTheDocument();
    expect(screen.getByText('CO.2')).toBeInTheDocument();
  });

  it('should apply correct styling to different event types', () => {
    renderComponent();

    // Check that event type specific classes are applied
    const activityElement = screen.getByText('Writing Exercise').closest('div')?.parentElement;
    expect(activityElement).toHaveClass('bg-blue-100');

    const assessmentElement = screen.getByText('Oral Presentation').closest('div')?.parentElement;
    expect(assessmentElement).toHaveClass('bg-purple-100');

    const themeElement = screen.getByText('Space Exploration').closest('div')?.parentElement;
    expect(themeElement).toHaveClass('bg-green-100');

    const newsletterElement = screen.getByText('January Newsletter').closest('div')?.parentElement;
    expect(newsletterElement).toHaveClass('bg-yellow-100');
  });
});
