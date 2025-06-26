import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ETFOLessonPlanPage from '../../pages/ETFOLessonPlanPage';
import { renderWithAuth, mockLessonPlan, mockUnitPlan } from '../../test-utils';
import * as etfoHooks from '../../hooks/useETFOPlanning';

// Mock the planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useUnitPlan: vi.fn(),
  useETFOLessonPlans: vi.fn(),
  useETFOLessonPlan: vi.fn(),
  useCreateETFOLessonPlan: vi.fn(),
  useUpdateETFOLessonPlan: vi.fn(),
  useDeleteETFOLessonPlan: vi.fn(),
}));

// Mock the auto-save hook
vi.mock('../../hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    saveStatus: 'saved',
    lastSaved: new Date(),
    isSaving: false,
  })),
  useUnsavedChangesWarning: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ unitId: '1', lessonId: '1' }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock lazy-loaded components
vi.mock('../../components/ai/AILessonPlanPanel', () => ({
  AILessonPlanPanel: () => <div data-testid="ai-lesson-plan-panel">AI Panel</div>,
}));

vi.mock('../../components/ai/AIErrorBoundary', () => ({
  WithAIErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ai-error-boundary">{children}</div>
  ),
}));

describe('ETFOLessonPlanPage', () => {
  const user = userEvent.setup();

  const mockHooks = {
    useUnitPlan: vi.fn(),
    useETFOLessonPlans: vi.fn(),
    useETFOLessonPlan: vi.fn(),
    useCreateETFOLessonPlan: vi.fn(),
    useUpdateETFOLessonPlan: vi.fn(),
    useDeleteETFOLessonPlan: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementations
    Object.entries(mockHooks).forEach(([key, mock]) => {
      (etfoHooks as any)[key] = mock;
    });

    mockHooks.useUnitPlan.mockReturnValue({
      data: mockUnitPlan,
      isLoading: false,
      error: null,
    });

    mockHooks.useETFOLessonPlans.mockReturnValue({
      data: [mockLessonPlan],
      isLoading: false,
      error: null,
    });

    mockHooks.useETFOLessonPlan.mockReturnValue({
      data: mockLessonPlan,
      isLoading: false,
      error: null,
    });

    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    mockHooks.useUpdateETFOLessonPlan.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });

    mockHooks.useDeleteETFOLessonPlan.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  it('renders page with unit plan and lesson plans', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Unit')).toBeInTheDocument();
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  it('displays loading state when data is loading', () => {
    mockHooks.useUnitPlan.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<ETFOLessonPlanPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    mockHooks.useUnitPlan.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load unit plan'),
    });

    renderWithAuth(<ETFOLessonPlanPage />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('shows create lesson modal when add button is clicked', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const addButton = screen.getByRole('button', { name: /add.*lesson/i });
    await user.click(addButton);

    expect(screen.getByText(/create.*lesson/i)).toBeInTheDocument();
  });

  it('creates new lesson with form data', async () => {
    const mockCreateMutate = vi.fn();
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<ETFOLessonPlanPage />);

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add.*lesson/i });
    await user.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Lesson');

    const subjectInput = screen.getByLabelText(/subject/i);
    await user.type(subjectInput, 'Mathematics');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Lesson',
        subject: 'Mathematics',
        unitId: '1',
      })
    );
  });

  it('allows editing existing lesson', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    // Find and click edit button for existing lesson
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Should show edit form
    expect(screen.getByDisplayValue('Test Lesson')).toBeInTheDocument();
  });

  it('updates lesson when edit form is submitted', async () => {
    const mockUpdateMutate = vi.fn();
    mockHooks.useUpdateETFOLessonPlan.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<ETFOLessonPlanPage />);

    // Open edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Modify title
    const titleInput = screen.getByDisplayValue('Test Lesson');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Lesson');

    // Submit changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        title: 'Updated Lesson',
      })
    );
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('deletes lesson when deletion is confirmed', async () => {
    const mockDeleteMutate = vi.fn();
    mockHooks.useDeleteETFOLessonPlan.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
      error: null,
    });

    renderWithAuth(<ETFOLessonPlanPage />);

    // Open delete confirmation
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockDeleteMutate).toHaveBeenCalledWith('1');
  });

  it('navigates back to unit when back button is clicked', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const backButton = screen.getByRole('link', { name: /back to unit/i });
    expect(backButton).toHaveAttribute('href', '/planning/unit-plans/1');
  });

  it('displays lesson plan tabs correctly', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /planning/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ai assistant/i })).toBeInTheDocument();
    });
  });

  it('switches between tabs when clicked', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    await waitFor(() => {
      const planningTab = screen.getByRole('tab', { name: /planning/i });
      user.click(planningTab);
    });

    // Should show planning content
    expect(screen.getByText(/learning objectives/i)).toBeInTheDocument();
  });

  it('loads AI assistant panel when AI tab is selected', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    await waitFor(() => {
      const aiTab = screen.getByRole('tab', { name: /ai assistant/i });
      user.click(aiTab);
    });

    expect(screen.getByTestId('ai-lesson-plan-panel')).toBeInTheDocument();
  });

  it('shows auto-save indicator', () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });

  it('handles print functionality', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const printButton = screen.getByRole('button', { name: /print/i });
    expect(printButton).toBeInTheDocument();
    
    // Note: Actual print functionality would require more complex mocking
    // of the print utilities and window.print
  });

  it('handles lesson plan export', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('validates required fields in create form', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add.*lesson/i });
    await user.click(addButton);

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });

  it('handles lesson plan duplication', async () => {
    renderWithAuth(<ETFOLessonPlanPage />);

    const duplicateButton = screen.getByRole('button', { name: /duplicate/i });
    await user.click(duplicateButton);

    // Should create a copy with modified title
    expect(mockHooks.useCreateETFOLessonPlan().mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Copy'),
      })
    );
  });
});