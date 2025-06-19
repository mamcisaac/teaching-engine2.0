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

  // Use dates relative to current date to ensure they're in the default viewing range
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
  const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 10);

  const mockEvents: api.TimelineEvent[] = [
    {
      id: 'act-1',
      date: twoWeeksAgo.toISOString(),
      type: 'activity',
      label: 'Writing Exercise',
      linkedOutcomeIds: ['CO.1'],
      subjectId: 1,
    },
    {
      id: 'assess-1',
      date: oneWeekAgo.toISOString(),
      type: 'assessment',
      label: 'Oral Presentation',
      linkedOutcomeIds: ['CO.2'],
      metadata: { score: 85 },
    },
    {
      id: 'theme-1',
      date: oneMonthAgo.toISOString(),
      type: 'theme',
      label: 'Space Exploration',
      linkedOutcomeIds: ['CO.1', 'CO.2'],
      metadata: { endDate: nextMonth.toISOString() },
    },
    {
      id: 'newsletter-1',
      date: yesterday.toISOString(),
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
      targetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
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
      // Check that week headers are present (format: "Week of [date]")
      const weekHeaders = screen.getAllByText(/Week of/);
      expect(weekHeaders.length).toBeGreaterThan(0);
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
    // The theme should show "Through [next month date]"
    expect(screen.getByText(/Through/)).toBeInTheDocument();
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
    } as unknown as ReturnType<typeof api.useTimelineEvents>);
    vi.mocked(api.useTimelineSummary).mockReturnValue({
      data: null,
      isLoading: true,
    } as unknown as ReturnType<typeof api.useTimelineSummary>);

    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display empty state when no events', () => {
    vi.mocked(api.useTimelineEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof api.useTimelineEvents>);

    renderComponent();
    expect(screen.getByText('No timeline events found for this period.')).toBeInTheDocument();
  });

  it('should display linked outcome IDs for events', () => {
    renderComponent();

    // The events display their linked outcome IDs
    const co1Elements = screen.getAllByText('CO.1');
    expect(co1Elements.length).toBeGreaterThan(0);

    const co2Elements = screen.getAllByText(/CO\.2/);
    expect(co2Elements.length).toBeGreaterThan(0);
  });

  it('should apply correct styling to different event types', () => {
    renderComponent();

    // Check that event type specific classes are applied
    const activityElement = screen.getByText('Writing Exercise').closest('.bg-blue-100');
    expect(activityElement).toBeInTheDocument();

    const assessmentElement = screen.getByText('Oral Presentation').closest('.bg-purple-100');
    expect(assessmentElement).toBeInTheDocument();

    const themeElement = screen.getByText('Space Exploration').closest('.bg-green-100');
    expect(themeElement).toBeInTheDocument();

    const newsletterElement = screen.getByText('January Newsletter').closest('.bg-yellow-100');
    expect(newsletterElement).toBeInTheDocument();
  });
});
