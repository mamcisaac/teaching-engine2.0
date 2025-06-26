import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import UnitPlansPage from '../../pages/UnitPlansPage';
import { renderWithAuth, mockUnitPlan } from '../../test-utils';
import * as etfoHooks from '../../hooks/useETFOPlanning';
import * as api from '../../api';

// Mock the planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useLongRangePlan: vi.fn(),
  useLongRangePlans: vi.fn(),
  useUnitPlans: vi.fn(),
  useUnitPlan: vi.fn(),
  useCreateUnitPlan: vi.fn(),
  useUpdateUnitPlan: vi.fn(),
}));

// Mock the unit plan form hook
vi.mock('../../hooks/useUnitPlanForm', () => ({
  useUnitPlanForm: vi.fn(() => ({
    formData: mockUnitPlan,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    isValid: true,
    errors: {},
  })),
}));

// Mock the API
vi.mock('../../api', () => ({
  useCurriculumExpectations: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ longRangePlanId: '1', unitId: '1' }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock lazy-loaded components
vi.mock('../../components/ai/AIUnitPlanPanel', () => ({
  AIUnitPlanPanel: () => <div data-testid="ai-unit-plan-panel">AI Unit Panel</div>,
}));

vi.mock('../../components/ai/AIErrorBoundary', () => ({
  WithAIErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ai-error-boundary">{children}</div>
  ),
}));

describe('UnitPlansPage', () => {
  const user = userEvent.setup();

  const mockHooks = {
    useLongRangePlan: vi.fn(),
    useLongRangePlans: vi.fn(),
    useUnitPlans: vi.fn(),
    useUnitPlan: vi.fn(),
    useCreateUnitPlan: vi.fn(),
    useUpdateUnitPlan: vi.fn(),
  };

  const mockLongRangePlan = {
    id: '1',
    title: 'Grade 3 Mathematics',
    grade: '3',
    subject: 'Mathematics',
    year: '2024',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    Object.entries(mockHooks).forEach(([key, mock]) => {
      (etfoHooks as any)[key] = mock;
    });

    mockHooks.useLongRangePlan.mockReturnValue({
      data: mockLongRangePlan,
      isLoading: false,
      error: null,
    });

    mockHooks.useUnitPlans.mockReturnValue({
      data: [mockUnitPlan],
      isLoading: false,
      error: null,
    });

    mockHooks.useUnitPlan.mockReturnValue({
      data: mockUnitPlan,
      isLoading: false,
      error: null,
    });

    mockHooks.useCreateUnitPlan.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    mockHooks.useUpdateUnitPlan.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    (api.useCurriculumExpectations as any).mockReturnValue({
      data: [
        {
          id: '1',
          code: 'A1.1',
          description: 'Number sense expectation',
          subject: 'Mathematics',
          grade: '3',
        },
      ],
      isLoading: false,
      error: null,
    });
  });

  it('renders page with long range plan and unit plans', async () => {
    renderWithAuth(<UnitPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('Grade 3 Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
    });
  });

  it('displays loading state when data is loading', () => {
    mockHooks.useLongRangePlan.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<UnitPlansPage />);

    expect(screen.getByTestId('unit-plan-skeleton')).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    mockHooks.useLongRangePlan.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load long range plan'),
    });

    renderWithAuth(<UnitPlansPage />);

    expect(screen.getByText(/error loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no unit plans exist', () => {
    mockHooks.useUnitPlans.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<UnitPlansPage />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no unit plans/i)).toBeInTheDocument();
  });

  it('opens create unit plan modal when add button is clicked', async () => {
    renderWithAuth(<UnitPlansPage />);

    const addButton = screen.getByRole('button', { name: /add.*unit/i });
    await user.click(addButton);

    expect(screen.getByText(/create.*unit/i)).toBeInTheDocument();
  });

  it('creates new unit plan with form data', async () => {
    const mockCreateMutate = vi.fn();
    mockHooks.useCreateUnitPlan.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<UnitPlansPage />);

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add.*unit/i });
    await user.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Unit Plan');

    const overviewTextarea = screen.getByLabelText(/overview/i);
    await user.type(overviewTextarea, 'Unit overview');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Unit Plan',
        overview: 'Unit overview',
        longRangePlanId: '1',
      })
    );
  });

  it('displays unit plan cards with correct information', async () => {
    renderWithAuth(<UnitPlansPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      expect(screen.getByText('Test overview')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Grade 3')).toBeInTheDocument();
    });
  });

  it('navigates to lesson plans when unit is clicked', async () => {
    renderWithAuth(<UnitPlansPage />);

    const unitCard = screen.getByText('Test Unit');
    await user.click(unitCard);

    // Should navigate to lesson plans page (mocked as Link)
    const lessonPlansLink = screen.getByRole('link', { name: /view lessons/i });
    expect(lessonPlansLink).toHaveAttribute('href', '/planning/etfo-lesson-plans/1');
  });

  it('opens edit mode when edit button is clicked', async () => {
    renderWithAuth(<UnitPlansPage />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should show edit form
    expect(screen.getByDisplayValue('Test Unit')).toBeInTheDocument();
  });

  it('updates unit plan when edit form is submitted', async () => {
    const mockUpdateMutate = vi.fn();
    mockHooks.useUpdateUnitPlan.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<UnitPlansPage />);

    // Open edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Unit');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Unit');

    // Submit changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        title: 'Updated Unit',
      })
    );
  });

  it('displays unit plan tabs correctly', async () => {
    renderWithAuth(<UnitPlansPage />);

    // Click on a unit to open detailed view
    const unitCard = screen.getByText('Test Unit');
    await user.click(unitCard);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /planning/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ai assistant/i })).toBeInTheDocument();
    });
  });

  it('switches between tabs when clicked', async () => {
    renderWithAuth(<UnitPlansPage />);

    const unitCard = screen.getByText('Test Unit');
    await user.click(unitCard);

    await waitFor(() => {
      const planningTab = screen.getByRole('tab', { name: /planning/i });
      user.click(planningTab);
    });

    // Should show planning content
    expect(screen.getByText(/curriculum expectations/i)).toBeInTheDocument();
  });

  it('loads AI assistant panel when AI tab is selected', async () => {
    renderWithAuth(<UnitPlansPage />);

    const unitCard = screen.getByText('Test Unit');
    await user.click(unitCard);

    await waitFor(() => {
      const aiTab = screen.getByRole('tab', { name: /ai assistant/i });
      user.click(aiTab);
    });

    expect(screen.getByTestId('ai-unit-plan-panel')).toBeInTheDocument();
  });

  it('handles print functionality', async () => {
    renderWithAuth(<UnitPlansPage />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();
  });

  it('handles unit plan export', async () => {
    renderWithAuth(<UnitPlansPage />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('validates required fields in create form', async () => {
    renderWithAuth(<UnitPlansPage />);

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add.*unit/i });
    await user.click(addButton);

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('shows curriculum expectations in planning tab', async () => {
    renderWithAuth(<UnitPlansPage />);

    const unitCard = screen.getByText('Test Unit');
    await user.click(unitCard);

    const planningTab = screen.getByRole('tab', { name: /planning/i });
    await user.click(planningTab);

    expect(screen.getByText('A1.1')).toBeInTheDocument();
    expect(screen.getByText('Number sense expectation')).toBeInTheDocument();
  });

  it('handles duration field changes', async () => {
    renderWithAuth(<UnitPlansPage />);

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add.*unit/i });
    await user.click(addButton);

    const durationInput = screen.getByLabelText(/duration/i);
    await user.type(durationInput, '6');

    expect(durationInput).toHaveValue('6');
  });

  it('displays auto-save indicator', () => {
    renderWithAuth(<UnitPlansPage />);

    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
  });

  it('shows loading skeleton while unit plans are loading', () => {
    mockHooks.useUnitPlans.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<UnitPlansPage />);

    expect(screen.getByTestId('unit-plan-skeleton')).toBeInTheDocument();
  });
});