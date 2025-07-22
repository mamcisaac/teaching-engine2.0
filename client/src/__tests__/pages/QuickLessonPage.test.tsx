/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { QuickLessonPage } from '../../pages/QuickLessonPage';
import { renderWithAuth } from '../../test-utils';

// Mock the ETFO planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useCreateETFOLessonPlan: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock onboarding components
vi.mock('../../components/onboarding', () => ({
  OnboardingTooltip: ({ children, title, content }: { children: React.ReactNode; title: string; content: string }) => (
    <div data-testid="onboarding-tooltip" title={`${title}: ${content}`}>
      {children}
    </div>
  ),
}));

// Mock feature tutorial hook
vi.mock('../../hooks/useFeatureTutorial', () => ({
  useShowContextualHints: vi.fn(() => false),
}));

// Mock the lesson plan form
vi.mock('../../components/forms/LessonPlanForm', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel, isSubmitting, showUnitPlanSelector, initialData }: { 
    onSubmit: (data: unknown) => void; 
    onCancel: () => void; 
    isSubmitting: boolean; 
    showUnitPlanSelector: boolean; 
    initialData: { title?: string; date: string; duration: number; assessmentType?: string; isSubFriendly?: boolean } 
  }) => (
    <div data-testid="lesson-plan-form">
      <h3>Lesson Plan Form</h3>
      <div>Show Unit Plan Selector: {showUnitPlanSelector ? 'Yes' : 'No'}</div>
      <div>Initial Title: {initialData.title ?? 'Empty'}</div>
      <div>Initial Date: {initialData.date}</div>
      <div>Duration: {initialData.duration} minutes</div>
      <div>Assessment Type: {initialData.assessmentType}</div>
      <div>Sub Friendly: {initialData.isSubFriendly ? 'Yes' : 'No'}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            title: 'Test Lesson',
            date: '2024-01-15',
            duration: 60,
            materials: ['Test materials'],
            accommodations: ['Test accommodations'],
            modifications: ['Test modifications'],
            extensions: ['Test extensions'],
            assessmentType: 'formative',
            isSubFriendly: false,
            expectationIds: ['exp-1'],
          });
        }}
      >
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Lesson'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  ),
}));

describe('QuickLessonPage', () => {
  const user = userEvent.setup();

  const mockHooks = {
    useCreateETFOLessonPlan: vi.fn(),
    useShowContextualHints: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock implementations
    const etfoHooks = require('../../hooks/useETFOPlanning');
    const tutorialHooks = require('../../hooks/useFeatureTutorial');

    etfoHooks.useCreateETFOLessonPlan = mockHooks.useCreateETFOLessonPlan;
    tutorialHooks.useShowContextualHints = mockHooks.useShowContextualHints;

    // Default mock returns
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useShowContextualHints.mockReturnValue(false);
  });

  it('renders quick lesson page with header', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByText('Quick Lesson Planner')).toBeInTheDocument();
    expect(
      screen.getByText('Create a standalone lesson plan without requiring a unit plan'),
    ).toBeInTheDocument();
  });

  it('displays back button to dashboard', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('shows quick lesson info banner', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByText('Quick Lesson Mode')).toBeInTheDocument();
    expect(
      screen.getByText(/perfect for emergency planning, substitute teacher lessons/i),
    ).toBeInTheDocument();
  });

  it('displays benefit cards', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByText('⚡ No Prerequisites')).toBeInTheDocument();
    expect(
      screen.getByText('Create lessons without needing long-range or unit plans'),
    ).toBeInTheDocument();

    expect(screen.getByText('🎯 ETFO Aligned')).toBeInTheDocument();
    expect(
      screen.getByText('Still follows three-part lesson structure and curriculum expectations'),
    ).toBeInTheDocument();

    expect(screen.getByText('🔗 Link Later')).toBeInTheDocument();
    expect(
      screen.getByText('Optionally connect to unit plans when you create them'),
    ).toBeInTheDocument();
  });

  it('renders lesson plan form with correct props', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByTestId('lesson-plan-form')).toBeInTheDocument();
    expect(screen.getByText('Show Unit Plan Selector: No')).toBeInTheDocument();
    expect(screen.getByText('Initial Title: Empty')).toBeInTheDocument();
    expect(screen.getByText('Duration: 60 minutes')).toBeInTheDocument();
    expect(screen.getByText('Assessment Type: formative')).toBeInTheDocument();
    expect(screen.getByText('Sub Friendly: No')).toBeInTheDocument();
  });

  it('creates quick lesson when form is submitted', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'lesson-1' });
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithAuth(<QuickLessonPage />);

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      title: 'Test Lesson',
      date: '2024-01-15',
      duration: 60,
      materials: ['Test materials'],
      accommodations: ['Test accommodations'],
      modifications: ['Test modifications'],
      extensions: ['Test extensions'],
      assessmentType: 'formative',
      isSubFriendly: false,
      expectationIds: ['exp-1'],
      unitPlanId: null,
      isStandalone: true,
    });
  });

  it('shows success message and navigates after creation', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'lesson-1' });
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    const { toast } = require('sonner');

    renderWithAuth(<QuickLessonPage />);

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Quick lesson created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/planner/etfo-lessons');
    });
  });

  it('handles creation error', async () => {
    const mockMutateAsync = vi.fn().mockRejectedValue(new Error('Creation failed'));
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    const { toast } = require('sonner');

    renderWithAuth(<QuickLessonPage />);

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create lesson. Please try again.');
    });
  });

  it('navigates back when back button is clicked', async () => {
    renderWithAuth(<QuickLessonPage />);

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/planner');
  });

  it('navigates back when form is cancelled', async () => {
    renderWithAuth(<QuickLessonPage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/planner');
  });

  it('shows loading state during submission', async () => {
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('shows onboarding tooltip when hints are enabled', () => {
    mockHooks.useShowContextualHints.mockReturnValue(true);

    renderWithAuth(<QuickLessonPage />);

    const tooltip = screen.getByTestId('onboarding-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute(
      'title',
      'Quick Lesson Planning: Perfect for Grade 1 French Immersion! Create bilingual lessons quickly with AI assistance.',
    );
  });

  it('does not show onboarding tooltip when hints are disabled', () => {
    mockHooks.useShowContextualHints.mockReturnValue(false);

    renderWithAuth(<QuickLessonPage />);

    expect(screen.queryByTestId('onboarding-tooltip')).not.toBeInTheDocument();
  });

  it('displays proper form card layout', () => {
    renderWithAuth(<QuickLessonPage />);

    expect(screen.getByText('Create Quick Lesson Plan')).toBeInTheDocument();
    expect(
      screen.getByText('Fill out the essential details. Optional fields can be completed later.'),
    ).toBeInTheDocument();
  });

  it('sets correct initial form data', () => {
    renderWithAuth(<QuickLessonPage />);

    // Today's date should be set
    const today = new Date().toISOString().split('T')[0];
    expect(screen.getByText(`Initial Date: ${today}`)).toBeInTheDocument();
  });

  it('maintains state during submission', async () => {
    let resolvePromise: (value: unknown) => void;
    const mockMutateAsync = vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithAuth(<QuickLessonPage />);

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    await user.click(submitButton);

    // Should show submitting state
    expect(screen.getByText('Creating...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({ id: 'lesson-1' });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles form cancellation correctly', async () => {
    renderWithAuth(<QuickLessonPage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Should not call any mutation
    expect(mockHooks.useCreateETFOLessonPlan().mutateAsync).not.toHaveBeenCalled();

    await user.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith('/planner');
  });

  it('displays proper page layout and styling', () => {
    renderWithAuth(<QuickLessonPage />);

    const container = screen.getByText('Quick Lesson Planner').closest('div');
    expect(container?.parentElement).toHaveClass(
      'max-w-6xl',
      'mx-auto',
      'px-4',
      'sm:px-6',
      'lg:px-8',
      'py-8',
    );
  });

  it('shows benefit cards in grid layout', () => {
    renderWithAuth(<QuickLessonPage />);

    const benefitCards = screen.getByText('⚡ No Prerequisites').closest('div')
      ?.parentElement?.parentElement;
    expect(benefitCards).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'mb-8');
  });

  it('passes correct standalone lesson data to API', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'lesson-1' });
    mockHooks.useCreateETFOLessonPlan.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    renderWithAuth(<QuickLessonPage />);

    const submitButton = screen.getByRole('button', { name: /create lesson/i });
    await user.click(submitButton);

    const calledData = mockMutateAsync.mock.calls[0][0];
    expect(calledData.unitPlanId).toBeNull();
    expect(calledData.isStandalone).toBe(true);
  });
});
