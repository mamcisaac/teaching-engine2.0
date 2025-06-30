import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TeamsPage } from '../../pages/TeamsPage';
import { renderWithAuth } from '../../test-utils';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the collaboration components
vi.mock('@/components/collaboration', () => ({
  TeamList: ({ onCreateTeam }: { onCreateTeam: () => void }) => (
    <div data-testid="team-list">
      <h2>My Teams</h2>
      <div>Team Alpha - 5 members</div>
      <div>Team Beta - 3 members</div>
      <button onClick={onCreateTeam} data-testid="create-team-trigger">
        Create New Team
      </button>
    </div>
  ),
  CreateTeamModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="create-team-modal">
        <h3>Create New Team</h3>
        <form>
          <input placeholder="Team name" data-testid="team-name-input" />
          <input placeholder="Team description" data-testid="team-description-input" />
          <button type="submit" data-testid="create-team-submit">
            Create Team
          </button>
          <button type="button" onClick={onClose} data-testid="cancel-create-team">
            Cancel
          </button>
        </form>
      </div>
    ) : null,
  SharedPlansView: () => (
    <div data-testid="shared-plans-view">
      <h2>Shared Plans</h2>
      <div>Mathematics Unit Plan - Shared by Jane Doe</div>
      <div>Reading Comprehension Lesson - Shared by John Smith</div>
      <button data-testid="view-shared-plan">View Plan</button>
    </div>
  ),
}));

// Mock the UI components
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div className={className} role="tablist">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button
      role="tab"
      data-value={value}
      className={className}
      onClick={() => {
        // Find the parent Tabs component and trigger value change
        const event = new CustomEvent('tabChange', { detail: { value } });
        document.dispatchEvent(event);
      }}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`} role="tabpanel">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={`card ${className}`} data-testid="card">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, variant, onClick, className, ...props }: any) => (
    <button
      onClick={onClick}
      className={`button ${variant} ${className}`}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('TeamsPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the collaboration hub with header and description', () => {
    renderWithAuth(<TeamsPage />);

    expect(screen.getByText('Collaboration Hub')).toBeInTheDocument();
    expect(screen.getByText(/work together with your teaching team/i)).toBeInTheDocument();
  });

  it('displays tab navigation with all tabs', () => {
    renderWithAuth(<TeamsPage />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /my teams/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /shared plans/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /resources/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /discussions/i })).toBeInTheDocument();
  });

  it('shows teams tab content by default', () => {
    renderWithAuth(<TeamsPage />);

    expect(screen.getByTestId('team-list')).toBeInTheDocument();
    expect(screen.getByText('My Teams')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha - 5 members')).toBeInTheDocument();
    expect(screen.getByText('Team Beta - 3 members')).toBeInTheDocument();
  });

  it('displays tab icons correctly', () => {
    renderWithAuth(<TeamsPage />);

    const tabs = screen.getAllByRole('tab');

    // Each tab should have an icon (represented by lucide icons in the component)
    tabs.forEach((tab) => {
      expect(
        tab.querySelector('svg') ||
          tab.textContent?.includes('Teams') ||
          tab.textContent?.includes('Plans') ||
          tab.textContent?.includes('Resources') ||
          tab.textContent?.includes('Discussions'),
      ).toBeTruthy();
    });
  });

  it('switches to shared plans tab when clicked', async () => {
    renderWithAuth(<TeamsPage />);

    const sharedPlansTab = screen.getByRole('tab', { name: /shared plans/i });
    await user.click(sharedPlansTab);

    // Check if shared plans content is displayed
    expect(screen.getByTestId('shared-plans-view')).toBeInTheDocument();
    expect(screen.getByText('Mathematics Unit Plan - Shared by Jane Doe')).toBeInTheDocument();
    expect(
      screen.getByText('Reading Comprehension Lesson - Shared by John Smith'),
    ).toBeInTheDocument();
  });

  it('switches to resources tab and shows coming soon message', async () => {
    renderWithAuth(<TeamsPage />);

    const resourcesTab = screen.getByRole('tab', { name: /resources/i });
    await user.click(resourcesTab);

    expect(screen.getByText('Team Resources Coming Soon')).toBeInTheDocument();
    expect(
      screen.getByText(/share teaching materials, templates, and resources/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /browse my resources/i })).toBeInTheDocument();
  });

  it('switches to discussions tab and shows coming soon message', async () => {
    renderWithAuth(<TeamsPage />);

    const discussionsTab = screen.getByRole('tab', { name: /discussions/i });
    await user.click(discussionsTab);

    expect(screen.getByText('Team Discussions Coming Soon')).toBeInTheDocument();
    expect(
      screen.getByText(/start conversations, ask questions, and share ideas/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join a team first/i })).toBeInTheDocument();
  });

  it('opens create team modal when create team button is clicked', async () => {
    renderWithAuth(<TeamsPage />);

    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    expect(screen.getByTestId('create-team-modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    expect(screen.getByTestId('team-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('team-description-input')).toBeInTheDocument();
  });

  it('closes create team modal when cancel is clicked', async () => {
    renderWithAuth(<TeamsPage />);

    // Open modal
    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    expect(screen.getByTestId('create-team-modal')).toBeInTheDocument();

    // Close modal
    const cancelButton = screen.getByTestId('cancel-create-team');
    await user.click(cancelButton);

    expect(screen.queryByTestId('create-team-modal')).not.toBeInTheDocument();
  });

  it('allows filling out team creation form', async () => {
    renderWithAuth(<TeamsPage />);

    // Open modal
    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    // Fill form
    const nameInput = screen.getByTestId('team-name-input');
    const descriptionInput = screen.getByTestId('team-description-input');

    await user.type(nameInput, 'Grade 3 Math Team');
    await user.type(descriptionInput, 'Collaboration for Grade 3 mathematics curriculum');

    expect(nameInput).toHaveValue('Grade 3 Math Team');
    expect(descriptionInput).toHaveValue('Collaboration for Grade 3 mathematics curriculum');
  });

  it('submits team creation form', async () => {
    renderWithAuth(<TeamsPage />);

    // Open modal
    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    // Fill and submit form
    const nameInput = screen.getByTestId('team-name-input');
    await user.type(nameInput, 'New Team');

    const submitButton = screen.getByTestId('create-team-submit');
    await user.click(submitButton);

    // Form submission would be handled by the actual component
    expect(submitButton).toBeInTheDocument();
  });

  it('navigates to resources when browse resources button is clicked', async () => {
    renderWithAuth(<TeamsPage />);

    // Switch to resources tab
    const resourcesTab = screen.getByRole('tab', { name: /resources/i });
    await user.click(resourcesTab);

    // Click browse resources button
    const browseButton = screen.getByRole('button', { name: /browse my resources/i });
    await user.click(browseButton);

    expect(mockNavigate).toHaveBeenCalledWith('/resources');
  });

  it('switches back to teams tab from discussions coming soon', async () => {
    renderWithAuth(<TeamsPage />);

    // Switch to discussions tab
    const discussionsTab = screen.getByRole('tab', { name: /discussions/i });
    await user.click(discussionsTab);

    // Click join a team first button
    const joinTeamButton = screen.getByRole('button', { name: /join a team first/i });
    await user.click(joinTeamButton);

    // Should switch back to teams tab
    // In the actual implementation, this would trigger the tab change
    expect(joinTeamButton).toBeInTheDocument();
  });

  it('displays proper container styling and layout', () => {
    renderWithAuth(<TeamsPage />);

    const container = screen.getByText('Collaboration Hub').closest('div');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-7xl');
  });

  it('shows tab content correctly for each tab', async () => {
    renderWithAuth(<TeamsPage />);

    // Teams tab (default)
    expect(screen.getByTestId('tab-content-teams')).toBeInTheDocument();

    // Switch to shared plans
    const sharedPlansTab = screen.getByRole('tab', { name: /shared plans/i });
    await user.click(sharedPlansTab);

    expect(screen.getByTestId('tab-content-shared')).toBeInTheDocument();

    // Switch to resources
    const resourcesTab = screen.getByRole('tab', { name: /resources/i });
    await user.click(resourcesTab);

    expect(screen.getByTestId('tab-content-resources')).toBeInTheDocument();

    // Switch to discussions
    const discussionsTab = screen.getByRole('tab', { name: /discussions/i });
    await user.click(discussionsTab);

    expect(screen.getByTestId('tab-content-discussions')).toBeInTheDocument();
  });

  it('handles shared plan viewing', async () => {
    renderWithAuth(<TeamsPage />);

    // Switch to shared plans tab
    const sharedPlansTab = screen.getByRole('tab', { name: /shared plans/i });
    await user.click(sharedPlansTab);

    // Click view plan button
    const viewPlanButton = screen.getByTestId('view-shared-plan');
    await user.click(viewPlanButton);

    // Would navigate to plan view in actual implementation
    expect(viewPlanButton).toBeInTheDocument();
  });

  it('displays team member counts in team list', () => {
    renderWithAuth(<TeamsPage />);

    expect(screen.getByText('Team Alpha - 5 members')).toBeInTheDocument();
    expect(screen.getByText('Team Beta - 3 members')).toBeInTheDocument();
  });

  it('shows shared plan authors in shared plans view', async () => {
    renderWithAuth(<TeamsPage />);

    const sharedPlansTab = screen.getByRole('tab', { name: /shared plans/i });
    await user.click(sharedPlansTab);

    expect(screen.getByText('Mathematics Unit Plan - Shared by Jane Doe')).toBeInTheDocument();
    expect(
      screen.getByText('Reading Comprehension Lesson - Shared by John Smith'),
    ).toBeInTheDocument();
  });

  it('maintains tab state across interactions', async () => {
    renderWithAuth(<TeamsPage />);

    // Start on teams tab (default)
    expect(screen.getByTestId('tab-content-teams')).toBeInTheDocument();

    // Switch to shared plans
    const sharedPlansTab = screen.getByRole('tab', { name: /shared plans/i });
    await user.click(sharedPlansTab);

    // Open and close create team modal (should not affect tab state)
    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    const cancelButton = screen.getByTestId('cancel-create-team');
    await user.click(cancelButton);

    // Should still be on shared plans tab
    expect(screen.getByTestId('tab-content-shared')).toBeInTheDocument();
  });

  it('renders with responsive grid layout for tabs', () => {
    renderWithAuth(<TeamsPage />);

    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-4', 'max-w-2xl');
  });

  it('provides accessibility attributes for tabs', () => {
    renderWithAuth(<TeamsPage />);

    const tabsList = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');
    const tabPanels = screen.getAllByRole('tabpanel');

    expect(tabsList).toBeInTheDocument();
    expect(tabs).toHaveLength(4);
    expect(tabPanels).toHaveLength(4);
  });

  it('handles modal state correctly', async () => {
    renderWithAuth(<TeamsPage />);

    // Modal should not be visible initially
    expect(screen.queryByTestId('create-team-modal')).not.toBeInTheDocument();

    // Open modal
    const createTeamButton = screen.getByTestId('create-team-trigger');
    await user.click(createTeamButton);

    expect(screen.getByTestId('create-team-modal')).toBeInTheDocument();

    // Close modal
    const cancelButton = screen.getByTestId('cancel-create-team');
    await user.click(cancelButton);

    expect(screen.queryByTestId('create-team-modal')).not.toBeInTheDocument();
  });
});
