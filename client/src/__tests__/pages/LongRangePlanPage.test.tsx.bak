/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { LongRangePlanPage } from '../../pages/LongRangePlanPage';
import { renderWithAuth } from '../../test-utils';
import * as reactQuery from '@tanstack/react-query';
import * as aiPlanningHooks from '../../hooks/useAIPlanningAssistant';

// Mock the useQuery and useMutation hooks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock the API
vi.mock('../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => mockNavigate,
  };
});

// Mock the AI planning assistant hook
vi.mock('../../hooks/useAIPlanningAssistant', () => ({
  useAIPlanningAssistant: vi.fn(() => ({
    generateLongRangeGoals: {
      mutateAsync: vi.fn(),
      error: null,
    },
    isGenerating: false,
  })),
}));

// Mock the dialog component
vi.mock('../../components/Dialog', () => {
  return {
    __esModule: true,
    default: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children: React.ReactNode;
    }) => (open ? <div data-testid="dialog">{children}</div> : null),
  };
});

// Mock the BlankTemplateQuickActions component
vi.mock('../../components/printing/BlankTemplatePrinter', () => ({
  BlankTemplateQuickActions: ({ templateType, schoolInfo }: any) => (
    <div data-testid={`blank-template-${templateType}`}>
      Quick Actions for {schoolInfo.academicYear}
    </div>
  ),
}));

// Mock AI suggestion panel
vi.mock('../../components/planning/AISuggestionPanel', () => ({
  __esModule: true,
  default: ({ title, onGenerate, onAcceptSuggestion, onAcceptAll }: any) => (
    <div data-testid="ai-suggestion-panel">
      <h3>{title}</h3>
      <button onClick={onGenerate}>Generate</button>
      <button onClick={() => { void onAcceptSuggestion('Test suggestion'); }}>Accept Suggestion</button>
      <button onClick={onAcceptAll}>Accept All</button>
    </div>
  ),
}));

describe('LongRangePlanPage', () => {
  const user = userEvent.setup();

  const mockLongRangePlans = [
    {
      id: 'plan-1',
      title: 'Grade 3 Mathematics Year Plan',
      titleFr: 'Plan annuel de mathématiques de 3e année',
      academicYear: '2024-2025',
      term: 'Full Year',
      grade: 3,
      subject: 'Mathematics',
      description: 'Comprehensive mathematics curriculum for Grade 3',
      goals: 'Develop number sense and problem-solving skills',
      themes: ['Number Sense', 'Geometry', 'Data Management'],
      overarchingQuestions: 'How do we use numbers in everyday life?',
      assessmentOverview: 'Formative and summative assessments',
      resourceNeeds: 'Manipulatives, calculators, math journals',
      professionalGoals: 'Improve differentiation strategies',
      _count: {
        unitPlans: 4,
        expectations: 12,
      },
    },
    {
      id: 'plan-2',
      title: 'Grade 3 Language Arts',
      academicYear: '2024-2025',
      term: 'Full Year',
      grade: 3,
      subject: 'Language Arts',
      description: 'Reading, writing, and oral communication',
      _count: {
        unitPlans: 6,
        expectations: 18,
      },
    },
  ];

  // Mock implementations
  const mockUseQuery = vi.fn();
  const mockUseMutation = vi.fn();
  const mockUseQueryClient = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup query and mutation mocks
    (reactQuery.useQuery as any).mockImplementation(mockUseQuery);
    (reactQuery.useMutation as any).mockImplementation(mockUseMutation);
    (reactQuery.useQueryClient as any).mockImplementation(mockUseQueryClient);

    // Default successful state
    mockUseQuery.mockReturnValue({
      data: mockLongRangePlans,
      isLoading: false,
      error: null,
    });

    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
  });

  it('renders the long-range planning page with header', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('Long-Range Planning')).toBeInTheDocument();
    expect(
      screen.getByText('Plan your academic year with ETFO-aligned curriculum organization'),
    ).toBeInTheDocument();
  });

  it('displays academic year selector with current year', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByLabelText('Academic Year:')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/2024-2025/)).toBeInTheDocument();
  });

  it('shows create button and blank template actions', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByTestId('create-long-range-plan-button')).toBeInTheDocument();
    expect(screen.getByTestId('blank-template-long-range')).toBeInTheDocument();
  });

  it('displays existing long-range plans in a grid', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('Grade 3 Mathematics Year Plan')).toBeInTheDocument();
    expect(screen.getByText('Grade 3 Language Arts')).toBeInTheDocument();

    // Check plan details
    expect(screen.getByText('Mathematics - Grade 3')).toBeInTheDocument();
    expect(screen.getByText('Language Arts - Grade 3')).toBeInTheDocument();
    expect(screen.getByText('4 units')).toBeInTheDocument();
    expect(screen.getByText('12 expectations')).toBeInTheDocument();
  });

  it('shows empty state when no plans exist', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('No plans yet')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by creating your first long-range plan for 2024-2025'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('create-long-range-plan-empty-state-button')).toBeInTheDocument();
  });

  it('displays loading state when data is loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByRole('presentation')).toBeInTheDocument(); // Loading spinner
  });

  it('opens create modal when create button is clicked', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Long-Range Plan')).toBeInTheDocument();
  });

  it('displays create form with all required fields', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Check form fields
    expect(screen.getByLabelText('Plan Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade *')).toBeInTheDocument();
    expect(screen.getByLabelText('Term')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Learning Goals')).toBeInTheDocument();
    expect(screen.getByLabelText('Key Themes (press Enter to add)')).toBeInTheDocument();

    // ETFO-specific fields
    expect(screen.getByLabelText('Overarching Questions')).toBeInTheDocument();
    expect(screen.getByLabelText('Assessment Overview')).toBeInTheDocument();
    expect(screen.getByLabelText('Resource Needs')).toBeInTheDocument();
    expect(screen.getByLabelText('Professional Learning Goals')).toBeInTheDocument();
  });

  it('creates new long-range plan with form data', async () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    // Open create modal
    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Fill form
    await user.type(screen.getByLabelText('Plan Title *'), 'New Mathematics Plan');
    await user.type(screen.getByLabelText('Subject *'), 'Mathematics');
    await user.selectOptions(screen.getByLabelText('Grade *'), '4');
    await user.type(screen.getByLabelText('Description'), 'Grade 4 mathematics curriculum');
    await user.type(screen.getByLabelText('Learning Goals'), 'Develop advanced number concepts');

    // Add themes
    const themeInput = screen.getByLabelText('Key Themes (press Enter to add)');
    await user.type(themeInput, 'Fractions');
    await user.keyboard('{Enter}');
    await user.type(themeInput, 'Decimals');
    await user.keyboard('{Enter}');

    // Fill ETFO fields
    await user.type(
      screen.getByLabelText('Overarching Questions'),
      'How do fractions relate to everyday life?',
    );
    await user.type(
      screen.getByLabelText('Assessment Overview'),
      'Weekly assessments and portfolio',
    );
    await user.type(screen.getByLabelText('Resource Needs'), 'Fraction tiles, measuring tools');
    await user.type(
      screen.getByLabelText('Professional Learning Goals'),
      'Improve assessment strategies',
    );

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      title: 'New Mathematics Plan',
      subject: 'Mathematics',
      grade: 4,
      term: 'Full Year',
      description: 'Grade 4 mathematics curriculum',
      goals: 'Develop advanced number concepts',
      themes: ['Fractions', 'Decimals'],
      overarchingQuestions: 'How do fractions relate to everyday life?',
      assessmentOverview: 'Weekly assessments and portfolio',
      resourceNeeds: 'Fraction tiles, measuring tools',
      professionalGoals: 'Improve assessment strategies',
      academicYear: '2024-2025',
    });
  });

  it('handles theme addition and removal', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    const themeInput = screen.getByLabelText('Key Themes (press Enter to add)');

    // Add theme
    await user.type(themeInput, 'Number Sense');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Number Sense')).toBeInTheDocument();

    // Remove theme
    const removeButton = screen.getByRole('button', { name: '×' });
    await user.click(removeButton);

    expect(screen.queryByText('Number Sense')).not.toBeInTheDocument();
  });

  it('shows AI suggestions when subject and grade are filled', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Fill subject and grade
    await user.type(screen.getByLabelText('Subject *'), 'Mathematics');
    await user.selectOptions(screen.getByLabelText('Grade *'), '3');

    // Show AI suggestions
    const showAIButton = screen.getByRole('button', { name: /show ai suggestions/i });
    await user.click(showAIButton);

    expect(screen.getByTestId('ai-suggestion-panel')).toBeInTheDocument();
  });

  it('generates AI suggestions for learning goals', async () => {
    const mockGenerateGoals = vi.fn().mockResolvedValue({
      suggestions: ['Develop number sense', 'Understand place value'],
    });

    (aiPlanningHooks.useAIPlanningAssistant as any).mockReturnValue({
      generateLongRangeGoals: {
        mutateAsync: mockGenerateGoals,
        error: null,
      },
      isGenerating: false,
    });

    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Fill subject and grade
    await user.type(screen.getByLabelText('Subject *'), 'Mathematics');
    await user.selectOptions(screen.getByLabelText('Grade *'), '3');

    // Show AI suggestions
    const showAIButton = screen.getByRole('button', { name: /show ai suggestions/i });
    await user.click(showAIButton);

    // Generate suggestions
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await user.click(generateButton);

    expect(mockGenerateGoals).toHaveBeenCalledWith({
      subject: 'Mathematics',
      grade: 3,
      termLength: 40,
    });
  });

  it('accepts AI suggestions into form', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Fill subject and grade
    await user.type(screen.getByLabelText('Subject *'), 'Mathematics');
    await user.selectOptions(screen.getByLabelText('Grade *'), '3');

    // Show AI suggestions
    const showAIButton = screen.getByRole('button', { name: /show ai suggestions/i });
    await user.click(showAIButton);

    // Accept suggestion
    const acceptButton = screen.getByRole('button', { name: /accept suggestion/i });
    await user.click(acceptButton);

    // Should update the goals field
    const goalsField = screen.getByLabelText('Learning Goals');
    expect(goalsField).toHaveValue('Test suggestion');
  });

  it('filters plans by academic year', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const yearSelector = screen.getByDisplayValue(/2024-2025/);
    await user.selectOptions(yearSelector, '2023-2024');

    // Should trigger new query with different year
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['long-range-plans', '2023-2024'],
      }),
    );
  });

  it('navigates to unit plans when plan card is clicked', () => {
    renderWithAuth(<LongRangePlanPage />);

    const planLink = screen.getByRole('link', { name: /grade 3 mathematics year plan/i });
    expect(planLink).toHaveAttribute('href', '/planner/long-range/plan-1/units');
  });

  it('displays plan themes as badges', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('Number Sense')).toBeInTheDocument();
    expect(screen.getByText('Geometry')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
  });

  it('shows "more themes" indicator when plans have many themes', () => {
    const planWithManyThemes = {
      ...mockLongRangePlans[0],
      themes: ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5'],
    };

    mockUseQuery.mockReturnValue({
      data: [planWithManyThemes],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('closes modal and resets form after successful creation', async () => {
    const mockMutate = vi.fn((data: unknown, { onSuccess }: { onSuccess: () => void }) => {
      // Simulate successful mutation
      onSuccess();
    });

    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    // Fill minimum required fields
    await user.type(screen.getByLabelText('Plan Title *'), 'Test Plan');
    await user.type(screen.getByLabelText('Subject *'), 'Mathematics');

    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    // Modal should close
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('handles form cancellation', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('handles different term options', async () => {
    renderWithAuth(<LongRangePlanPage />);

    const createButton = screen.getByTestId('create-long-range-plan-button');
    await user.click(createButton);

    const termSelector = screen.getByLabelText('Term');

    expect(screen.getByRole('option', { name: 'Full Year' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Term 1 (Sep-Jan)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Term 2 (Feb-Jun)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Semester 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Semester 2' })).toBeInTheDocument();

    await user.selectOptions(termSelector, 'Term 1');
    expect(termSelector).toHaveValue('Term 1');
  });

  it('calculates academic year based on current date', () => {
    // Mock date to July (after June, so should show next academic year)
    const mockDate = new Date('2024-07-15');
    vi.setSystemTime(mockDate);

    renderWithAuth(<LongRangePlanPage />);

    const yearSelector = screen.getByDisplayValue(/2024-2025/);
    expect(yearSelector).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('displays plan counts correctly', () => {
    renderWithAuth(<LongRangePlanPage />);

    expect(screen.getByText('4 units')).toBeInTheDocument();
    expect(screen.getByText('12 expectations')).toBeInTheDocument();
    expect(screen.getByText('6 units')).toBeInTheDocument();
    expect(screen.getByText('18 expectations')).toBeInTheDocument();
  });
});
