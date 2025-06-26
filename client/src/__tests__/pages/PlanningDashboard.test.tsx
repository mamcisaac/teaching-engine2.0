import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import PlanningDashboard from '../../pages/PlanningDashboard';
import { renderWithAuth } from '../../test-utils';
import * as workflowHook from '../../hooks/useWorkflowState';
import * as plannerStore from '../../stores/weeklyPlannerStore';

// Mock the workflow state hook
vi.mock('../../hooks/useWorkflowState', () => ({
  useWorkflowState: vi.fn(),
  ETFOLevel: {
    CURRICULUM_EXPECTATIONS: 'CURRICULUM_EXPECTATIONS',
    LONG_RANGE_PLANS: 'LONG_RANGE_PLANS',
    UNIT_PLANS: 'UNIT_PLANS',
    LESSON_PLANS: 'LESSON_PLANS',
    DAYBOOK_ENTRIES: 'DAYBOOK_ENTRIES',
  },
  ETFO_LEVEL_PATHS: {
    CURRICULUM_EXPECTATIONS: '/curriculum',
    LONG_RANGE_PLANS: '/planner/long-range',
    UNIT_PLANS: '/planner/units',
    LESSON_PLANS: '/planner/lessons',
    DAYBOOK_ENTRIES: '/planner/daybook',
  },
}));

// Mock the weekly planner store
vi.mock('../../stores/weeklyPlannerStore', () => ({
  useWeeklyPlannerStore: vi.fn(),
}));

// Mock react-router-dom Link
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('PlanningDashboard', () => {
  const user = userEvent.setup();

  const mockWorkflowState = {
    progress: [
      { step: 'Long Range Plans', progressPercentage: 80, completed: true },
      { step: 'Unit Plans', progressPercentage: 60, completed: false },
      { step: 'Lesson Plans', progressPercentage: 40, completed: false },
      { step: 'Weekly Plans', progressPercentage: 20, completed: false },
      { step: 'Daily Plans', progressPercentage: 10, completed: false },
    ],
    currentStep: 1,
    isComplete: false,
  };

  const mockPlannerStore = {
    isLoading: false,
    isSaving: false,
    hasOfflineChanges: false,
    undoHistory: ['action1'],
    redoHistory: [],
    autoSave: true,
    theme: 'light',
    undo: vi.fn(),
    redo: vi.fn(),
    saveToServer: vi.fn(),
    syncWithServer: vi.fn(),
    resetToDefaults: vi.fn(),
    saveToHistory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    (workflowHook.useWorkflowState as any).mockReturnValue({
      workflowState: mockWorkflowState,
    });

    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue(mockPlannerStore);
  });

  it('renders dashboard with workflow progress', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/planning dashboard/i)).toBeInTheDocument();
    expect(screen.getByText('Long Range Plans')).toBeInTheDocument();
    expect(screen.getByText('Unit Plans')).toBeInTheDocument();
    expect(screen.getByText('Lesson Plans')).toBeInTheDocument();
  });

  it('displays overall workflow progress percentage', () => {
    renderWithAuth(<PlanningDashboard />);

    // Average of [80, 60, 40, 20, 10] = 42%
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('shows individual step progress with visual indicators', () => {
    renderWithAuth(<PlanningDashboard />);

    // Long Range Plans should show as completed
    const completedStep = screen.getByText('Long Range Plans').closest('[data-testid="progress-step"]');
    expect(completedStep).toHaveClass('completed');

    // Unit Plans should show as in progress
    const inProgressStep = screen.getByText('Unit Plans').closest('[data-testid="progress-step"]');
    expect(inProgressStep).toHaveClass('in-progress');
  });

  it('displays quick action buttons for each planning level', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByRole('link', { name: /create long range plan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create unit plan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create lesson plan/i })).toBeInTheDocument();
  });

  it('shows auto-save indicator and status', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
  });

  it('displays undo/redo controls when history exists', () => {
    renderWithAuth(<PlanningDashboard />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).not.toBeDisabled(); // Has undo history

    const redoButton = screen.getByRole('button', { name: /redo/i });
    expect(redoButton).toBeInTheDocument();
    expect(redoButton).toBeDisabled(); // No redo history
  });

  it('handles undo action when clicked', async () => {
    renderWithAuth(<PlanningDashboard />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    await user.click(undoButton);

    expect(mockPlannerStore.undo).toHaveBeenCalled();
  });

  it('handles redo action when clicked', async () => {
    // Mock store with redo history
    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue({
      ...mockPlannerStore,
      redoHistory: ['action1'],
    });

    renderWithAuth(<PlanningDashboard />);

    const redoButton = screen.getByRole('button', { name: /redo/i });
    expect(redoButton).not.toBeDisabled();
    
    await user.click(redoButton);

    expect(mockPlannerStore.redo).toHaveBeenCalled();
  });

  it('shows offline indicator when there are offline changes', () => {
    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue({
      ...mockPlannerStore,
      hasOfflineChanges: true,
    });

    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    expect(screen.getByText(/offline changes/i)).toBeInTheDocument();
  });

  it('handles sync with server when sync button is clicked', async () => {
    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue({
      ...mockPlannerStore,
      hasOfflineChanges: true,
    });

    renderWithAuth(<PlanningDashboard />);

    const syncButton = screen.getByRole('button', { name: /sync/i });
    await user.click(syncButton);

    expect(mockPlannerStore.syncWithServer).toHaveBeenCalled();
  });

  it('displays curriculum coverage components', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByTestId('etfo-planning-coverage')).toBeInTheDocument();
    expect(screen.getByTestId('curriculum-expectation-coverage')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue({
      ...mockPlannerStore,
      isLoading: true,
    });

    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows saving indicator when saving', () => {
    (plannerStore.useWeeklyPlannerStore as any).mockReturnValue({
      ...mockPlannerStore,
      isSaving: true,
    });

    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('opens settings modal when settings button is clicked', async () => {
    renderWithAuth(<PlanningDashboard />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/auto.?save/i)).toBeInTheDocument();
  });

  it('toggles auto-save setting', async () => {
    renderWithAuth(<PlanningDashboard />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    // Toggle auto-save
    const autoSaveCheckbox = screen.getByLabelText(/auto.?save/i);
    await user.click(autoSaveCheckbox);

    // Settings would be updated through store
    expect(autoSaveCheckbox).toBeChecked(); // Reflects current state
  });

  it('handles reset to defaults when confirm button is clicked', async () => {
    renderWithAuth(<PlanningDashboard />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    // Click reset
    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    await user.click(resetButton);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Confirm reset
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockPlannerStore.resetToDefaults).toHaveBeenCalled();
  });

  it('displays recent activity summary', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    // Would show recent plans created, lessons updated, etc.
  });

  it('shows upcoming deadlines and reminders', () => {
    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/upcoming deadlines/i)).toBeInTheDocument();
  });

  it('handles navigation to specific planning pages', () => {
    renderWithAuth(<PlanningDashboard />);

    // Check navigation links
    const longRangePlanLink = screen.getByRole('link', { name: /long range plans/i });
    expect(longRangePlanLink).toHaveAttribute('href', '/planning/long-range-plans');

    const unitPlanLink = screen.getByRole('link', { name: /unit plans/i });
    expect(unitPlanLink).toHaveAttribute('href', '/planning/unit-plans');

    const lessonPlanLink = screen.getByRole('link', { name: /lesson plans/i });
    expect(lessonPlanLink).toHaveAttribute('href', '/planning/etfo-lesson-plans');
  });

  it('displays workflow completion celebration when all steps complete', () => {
    (workflowHook.useWorkflowState as any).mockReturnValue({
      workflowState: {
        ...mockWorkflowState,
        isComplete: true,
        progress: mockWorkflowState.progress.map(p => ({ ...p, completed: true, progressPercentage: 100 })),
      },
    });

    renderWithAuth(<PlanningDashboard />);

    expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('handles manual save when save button is clicked', async () => {
    renderWithAuth(<PlanningDashboard />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockPlannerStore.saveToServer).toHaveBeenCalled();
  });

  it('shows theme selector in settings', async () => {
    renderWithAuth(<PlanningDashboard />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/light/i)).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
  });
});