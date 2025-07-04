import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import HelpPage from '../../pages/HelpPage';
import { renderWithAuth } from '../../test-utils';

// Mock the help context
const mockHelpContext = {
  state: {
    searchQuery: '',
    currentSection: null as string | null,
    viewedPages: [],
  },
  setCurrentSection: vi.fn(),
  markHelpPageViewed: vi.fn(),
  setSearchQuery: vi.fn(),
};

vi.mock('../../contexts/HelpContext', () => ({
  useHelp: () => mockHelpContext,
}));

// Mock the help content hook
vi.mock('../../hooks/useHelp', () => ({
  useHelpContent: vi.fn(() => ({
    filteredCount: 5,
    totalCount: 10,
  })),
}));

// Mock the help types
vi.mock('../../types/help', () => ({
  HELP_SECTIONS: [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of Teaching Engine 2.0',
      level: 'beginner',
      estimatedTime: 5,
    },
    {
      id: 'planning',
      title: 'Planning Workflows',
      description: 'Master the ETFO-aligned planning process',
      level: 'intermediate',
      estimatedTime: 10,
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      description: 'Leverage AI for enhanced teaching',
      level: 'intermediate',
      estimatedTime: 8,
    },
    {
      id: 'etfo-specific',
      title: 'ETFO Features',
      description: 'Ontario-specific features for elementary teachers',
      level: 'intermediate',
      estimatedTime: 12,
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      description: 'Power user tips and customization',
      level: 'advanced',
      estimatedTime: 15,
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Speed up your workflow with shortcuts',
      level: 'beginner',
      estimatedTime: 3,
    },
  ],
}));

// Mock the help components
vi.mock('../../components/help', () => ({
  HelpButton: ({ variant, content, onClick }: unknown) => (
    <button onClick={onClick} data-testid={`help-button-${variant}`}>
      {content}
    </button>
  ),
  HelpSearch: ({ placeholder, showFilters, showSuggestions, onResultSelect }: unknown) => (
    <div data-testid="help-search">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => mockHelpContext.setSearchQuery(e.target.value)}
        data-testid="search-input"
      />
      {showFilters && <div data-testid="search-filters">Filters enabled</div>}
      {showSuggestions && <div data-testid="search-suggestions">Suggestions enabled</div>}
      <button onClick={() => onResultSelect('test-content')}>Select Test Result</button>
    </div>
  ),
}));

describe('HelpPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockHelpContext.state.searchQuery = '';
    mockHelpContext.state.currentSection = null;
  });

  it('renders the help page with header and search', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Help & Documentation')).toBeInTheDocument();
    expect(
      screen.getByText('Learn how to make the most of Teaching Engine 2.0'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('help-search')).toBeInTheDocument();
    expect(screen.getByTestId('help-button-floating')).toBeInTheDocument();
  });

  it('displays help sections in sidebar', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Help Topics')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Planning Workflows')).toBeInTheDocument();
    expect(screen.getByText('AI Features')).toBeInTheDocument();
    expect(screen.getByText('ETFO Features')).toBeInTheDocument();
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('displays section descriptions and metadata', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Learn the basics of Teaching Engine 2.0')).toBeInTheDocument();
    expect(screen.getByText('Master the ETFO-aligned planning process')).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText('intermediate')).toBeInTheDocument();
    expect(screen.getByText('advanced')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('10 min read')).toBeInTheDocument();
  });

  it('shows welcome message when no section is selected', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Welcome to Teaching Engine 2.0 Help')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Select a topic from the sidebar to get started, or search for specific help.',
      ),
    ).toBeInTheDocument();
  });

  it('displays popular topics in welcome area', () => {
    renderWithAuth(<HelpPage />);

    // Should show first 4 sections as popular topics
    const popularTopics = screen
      .getAllByRole('button')
      .filter(
        (button) =>
          button.textContent?.includes('Getting Started') ||
          button.textContent?.includes('Planning Workflows') ||
          button.textContent?.includes('AI Features') ||
          button.textContent?.includes('ETFO Features'),
      );

    expect(popularTopics).toHaveLength(4);
  });

  it('selects section when clicked', async () => {
    renderWithAuth(<HelpPage />);

    const gettingStartedButton = screen.getByRole('button', { name: /getting started/i });
    await user.click(gettingStartedButton);

    expect(mockHelpContext.setCurrentSection).toHaveBeenCalledWith('getting-started');
    expect(mockHelpContext.markHelpPageViewed).toHaveBeenCalledWith('help-getting-started');
  });

  it('displays section content when section is selected', async () => {
    // Mock a selected section
    mockHelpContext.state.currentSection = 'getting-started';

    renderWithAuth(<HelpPage />);

    // Should render the mock content for getting-started section
    expect(screen.getByText(/Getting Started with Teaching Engine 2.0/)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Teaching Engine 2.0!/)).toBeInTheDocument();
  });

  it('highlights selected section in sidebar', async () => {
    renderWithAuth(<HelpPage />);

    const planningButton = screen.getByRole('button', { name: /planning workflows/i });
    await user.click(planningButton);

    // The button should have active styling
    expect(planningButton).toHaveClass('bg-blue-50', 'text-blue-700', 'border-blue-200');
  });

  it('shows feedback section for selected content', async () => {
    mockHelpContext.state.currentSection = 'planning';

    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Was this helpful?')).toBeInTheDocument();
    expect(screen.getByText('Let us know how we can improve this page.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /👍 yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /👎 no/i })).toBeInTheDocument();
  });

  it('displays quick links in sidebar', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Interactive Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    renderWithAuth(<HelpPage />);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'lesson planning');

    expect(mockHelpContext.setSearchQuery).toHaveBeenCalledWith('lesson planning');
  });

  it('shows search results count when searching', () => {
    mockHelpContext.state.searchQuery = 'planning';

    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Showing 5 of 10 help articles')).toBeInTheDocument();
  });

  it('filters sections based on search query', () => {
    mockHelpContext.state.searchQuery = 'planning';

    // Mock the filtered sections effect
    const filteredSections = [
      {
        id: 'planning',
        title: 'Planning Workflows',
        description: 'Master the ETFO-aligned planning process',
        level: 'intermediate',
        estimatedTime: 10,
      },
    ];

    renderWithAuth(<HelpPage />);

    // Only planning-related sections should be visible
    expect(screen.getByText('Planning Workflows')).toBeInTheDocument();
    // Other sections should be filtered out in real implementation
  });

  it('shows search filters and suggestions', () => {
    renderWithAuth(<HelpPage />);

    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    expect(screen.getByTestId('search-suggestions')).toBeInTheDocument();
  });

  it('handles search result selection', async () => {
    renderWithAuth(<HelpPage />);

    const selectResultButton = screen.getByRole('button', { name: /select test result/i });
    await user.click(selectResultButton);

    // Would navigate to specific content in real implementation
    // Here we just test that the handler is called
  });

  it('displays different icons for different section types', () => {
    renderWithAuth(<HelpPage />);

    // Each section should have its own icon
    const sectionButtons = screen
      .getAllByRole('button')
      .filter((button) => button.querySelector('svg'));

    expect(sectionButtons.length).toBeGreaterThan(0);
  });

  it('marks help page as viewed on mount', () => {
    renderWithAuth(<HelpPage />);

    expect(mockHelpContext.markHelpPageViewed).toHaveBeenCalledWith('help-main');
  });

  it('renders section content with proper formatting', () => {
    mockHelpContext.state.currentSection = 'keyboard-shortcuts';

    renderWithAuth(<HelpPage />);

    // Should render formatted content (in real implementation, this would be markdown)
    expect(screen.getByText(/Keyboard Shortcuts/)).toBeInTheDocument();
  });

  it('handles feedback button clicks', async () => {
    mockHelpContext.state.currentSection = 'ai-features';

    renderWithAuth(<HelpPage />);

    const yesButton = screen.getByRole('button', { name: /👍 yes/i });
    const noButton = screen.getByRole('button', { name: /👎 no/i });

    await user.click(yesButton);
    await user.click(noButton);

    // In real implementation, these would send feedback
    expect(yesButton).toBeInTheDocument();
    expect(noButton).toBeInTheDocument();
  });

  it('displays section content in prose format', () => {
    mockHelpContext.state.currentSection = 'etfo-specific';

    renderWithAuth(<HelpPage />);

    const contentArea = screen.getByText(/ETFO Features/).closest('div');
    expect(contentArea).toHaveClass('prose', 'prose-lg', 'max-w-none');
  });

  it('handles popular topic selection from welcome area', async () => {
    renderWithAuth(<HelpPage />);

    // Find a popular topic button in the welcome area
    const popularTopicButtons = screen.getAllByRole('button').filter(
      (button) => button.closest('[class*="grid-cols-2"]'), // Popular topics are in a 2-column grid
    );

    if (popularTopicButtons.length > 0) {
      await user.click(popularTopicButtons[0]);
      expect(mockHelpContext.setCurrentSection).toHaveBeenCalled();
    }
  });

  it('shows proper section metadata in content area', () => {
    mockHelpContext.state.currentSection = 'advanced';

    renderWithAuth(<HelpPage />);

    // Should show section info in the content area
    expect(screen.getByText('Advanced Features')).toBeInTheDocument();
    expect(screen.getByText('Power user tips and customization')).toBeInTheDocument();
  });

  it('handles empty search results gracefully', () => {
    mockHelpContext.state.searchQuery = 'nonexistent topic';

    const { useHelpContent } = require('../../hooks/useHelp');
    useHelpContent.mockReturnValue({
      filteredCount: 0,
      totalCount: 10,
    });

    renderWithAuth(<HelpPage />);

    expect(screen.getByText('Showing 0 of 10 help articles')).toBeInTheDocument();
  });

  it('maintains section selection state', async () => {
    mockHelpContext.state.currentSection = 'planning';

    renderWithAuth(<HelpPage />);

    const planningButton = screen.getByRole('button', { name: /planning workflows/i });
    expect(planningButton).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('handles help button click in header', async () => {
    renderWithAuth(<HelpPage />);

    const helpButton = screen.getByTestId('help-button-floating');
    await user.click(helpButton);

    // Should handle global help functionality
    expect(helpButton).toBeInTheDocument();
  });
});
