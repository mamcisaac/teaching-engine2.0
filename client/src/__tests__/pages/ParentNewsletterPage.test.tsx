import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { startOfWeek, endOfWeek } from 'date-fns';
import ParentNewsletterPage from '../../pages/ParentNewsletterPage';
import { renderWithAuth } from '../../test-utils';

// Mock date-fns functions
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  const mockDate = new Date('2024-01-15');

  return {
    ...actual,
    startOfWeek: vi.fn(() => mockDate),
    endOfWeek: vi.fn(() => new Date('2024-01-21')),
  };
});

// Mock the newsletter hooks
vi.mock('../../hooks/useNewsletterData', () => ({
  useStudents: vi.fn(),
  useGenerateNewsletter: vi.fn(),
  useSaveNewsletterDraft: vi.fn(),
  useNewsletterDrafts: vi.fn(),
  useNewsletter: vi.fn(),
  useSendNewsletter: vi.fn(),
  useDeleteNewsletter: vi.fn(),
  useRegenerateNewsletter: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: undefined }),
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock components
vi.mock('../../components/StudentSelector', () => ({
  __esModule: true,
  default: ({ recipients, selectedRecipientIds, onChange, isLoading, helpText }: any) => (
    <div data-testid="newsletter-recipient-selector">
      <div>{helpText}</div>
      {recipients.map((student: any) => (
        <label key={student.id}>
          <input
            type="checkbox"
            checked={selectedRecipientIds.includes(student.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selectedRecipientIds, student.id]);
              } else {
                onChange(selectedRecipientIds.filter((id: number) => id !== student.id));
              }
            }}
          />
          {student.name}
        </label>
      ))}
      {isLoading && <div>Loading students...</div>}
    </div>
  ),
}));

vi.mock('../../components/DateRangeSelector', () => ({
  __esModule: true,
  default: ({ startDate, endDate, onChange }: any) => (
    <div data-testid="date-range-selector">
      <input
        type="date"
        value={startDate.toISOString().split('T')[0]}
        onChange={(e) => onChange(new Date(e.target.value), endDate)}
        data-testid="start-date"
      />
      <input
        type="date"
        value={endDate.toISOString().split('T')[0]}
        onChange={(e) => onChange(startDate, new Date(e.target.value))}
        data-testid="end-date"
      />
    </div>
  ),
}));

vi.mock('../../components/NewsletterEditor', () => ({
  __esModule: true,
  default: ({ draft, onSave, onSend, onRegenerate, isGenerating }: any) => (
    <div data-testid="newsletter-editor">
      <h2>{draft.title}</h2>
      <div>Tone: {draft.tone}</div>
      <div>Students: {draft.studentIds.length}</div>
      {draft.sections?.map((section: any, index: number) => (
        <div key={index}>
          <h3>{section.title}</h3>
          <p>{section.content}</p>
        </div>
      ))}
      <button onClick={() => onSave(draft)} disabled={isGenerating}>
        Save Draft
      </button>
      <button onClick={() => onSend(draft)} disabled={isGenerating}>
        Send Newsletter
      </button>
      <button onClick={() => onRegenerate('friendly')} disabled={isGenerating}>
        Regenerate
      </button>
    </div>
  ),
}));

describe('ParentNewsletterPage', () => {
  const user = userEvent.setup();

  const mockStudents = [
    { id: 1, name: 'Alice Johnson', grade: 3 },
    { id: 2, name: 'Bob Smith', grade: 3 },
    { id: 3, name: 'Charlie Brown', grade: 3 },
  ];

  const mockNewsletterDrafts = [
    {
      id: 'draft-1',
      title: 'Weekly Newsletter - January 15',
      studentIds: [1, 2],
      dateFrom: new Date('2024-01-15'),
      dateTo: new Date('2024-01-21'),
      tone: 'friendly',
      sections: [
        { title: 'Learning Highlights', content: 'Students worked on fractions' },
        { title: 'Upcoming Events', content: 'Field trip next Friday' },
      ],
      isDraft: true,
    },
    {
      id: 'draft-2',
      title: 'Math Progress Update',
      studentIds: [3],
      dateFrom: new Date('2024-01-08'),
      dateTo: new Date('2024-01-14'),
      tone: 'formal',
      sections: [],
      isDraft: false,
    },
  ];

  const mockHooks = {
    useStudents: vi.fn(),
    useGenerateNewsletter: vi.fn(),
    useSaveNewsletterDraft: vi.fn(),
    useNewsletterDrafts: vi.fn(),
    useNewsletter: vi.fn(),
    useSendNewsletter: vi.fn(),
    useDeleteNewsletter: vi.fn(),
    useRegenerateNewsletter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock implementations
    const newsletters = require('../../hooks/useNewsletterData');
    Object.entries(mockHooks).forEach(([key, mock]) => {
      newsletters[key] = mock;
    });

    // Default mock returns
    mockHooks.useStudents.mockReturnValue({
      data: mockStudents,
      isLoading: false,
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useSaveNewsletterDraft.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useNewsletterDrafts.mockReturnValue({
      data: mockNewsletterDrafts,
      isLoading: false,
    });

    mockHooks.useNewsletter.mockReturnValue({
      data: null,
      isLoading: false,
    });

    mockHooks.useSendNewsletter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useDeleteNewsletter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useRegenerateNewsletter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('renders newsletter planning form by default', () => {
    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByText('Plan Parent Newsletter')).toBeInTheDocument();
    expect(screen.getByText('📝 Newsletter Planning Tool')).toBeInTheDocument();
    expect(
      screen.getByText(/this tool helps you plan and draft newsletter content/i),
    ).toBeInTheDocument();
  });

  it('displays newsletter recipients selector', () => {
    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByTestId('newsletter-recipient-selector')).toBeInTheDocument();
    expect(screen.getByText('Newsletter Recipients')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('displays date range selector', () => {
    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByTestId('start-date')).toBeInTheDocument();
    expect(screen.getByTestId('end-date')).toBeInTheDocument();
  });

  it('shows tone selection options', () => {
    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByText('Tone of Communication')).toBeInTheDocument();
    expect(screen.getByText('Friendly')).toBeInTheDocument();
    expect(screen.getByText('Formal')).toBeInTheDocument();
    expect(screen.getByText('Informative')).toBeInTheDocument();
  });

  it('allows selecting tone', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const formalTone = screen.getByText('Formal').closest('button');
    await user.click(formalTone!);

    expect(formalTone).toHaveClass('border-blue-500');
  });

  it('allows adding and removing focus areas', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const focusInput = screen.getByPlaceholderText(/add a focus area/i);
    await user.type(focusInput, 'Reading');

    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    expect(screen.getByText('Reading')).toBeInTheDocument();

    // Remove the focus area
    const removeButton = screen.getByRole('button', { name: '×' });
    await user.click(removeButton);

    expect(screen.queryByText('Reading')).not.toBeInTheDocument();
  });

  it('allows adding focus areas with Enter key', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const focusInput = screen.getByPlaceholderText(/add a focus area/i);
    await user.type(focusInput, 'Math');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('shows advanced options checkboxes', () => {
    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByText('Include in Newsletter')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /student artifacts/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /student reflections/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /learning goals/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /upcoming events/i })).toBeInTheDocument();
  });

  it('disables generate button when no students selected', () => {
    renderWithAuth(<ParentNewsletterPage />);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    expect(generateButton).toBeDisabled();
  });

  it('enables generate button when students are selected', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    // Select a student
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    expect(generateButton).not.toBeDisabled();
  });

  it('generates newsletter with selected parameters', async () => {
    const mockGenerateAsync = vi.fn().mockResolvedValue({
      sections: [
        { title: 'Learning Activities', content: 'Students explored addition concepts' },
        { title: 'Progress Updates', content: 'Great improvement in math skills' },
      ],
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: mockGenerateAsync,
      isPending: false,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Select students and parameters
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);
    const bobCheckbox = screen.getByRole('checkbox', { name: /bob smith/i });
    await user.click(bobCheckbox);

    // Add focus area
    const focusInput = screen.getByPlaceholderText(/add a focus area/i);
    await user.type(focusInput, 'Mathematics');
    await user.keyboard('{Enter}');

    // Generate newsletter
    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    expect(mockGenerateAsync).toHaveBeenCalledWith({
      studentIds: [1, 2],
      from: expect.any(Date),
      to: expect.any(Date),
      tone: 'friendly',
      focusAreas: ['Mathematics'],
      includeArtifacts: true,
      includeReflections: true,
      includeLearningGoals: true,
      includeUpcomingEvents: false,
    });
  });

  it('shows newsletter editor after generation', async () => {
    const mockGenerateAsync = vi.fn().mockResolvedValue({
      sections: [{ title: 'Learning Activities', content: 'Students explored addition concepts' }],
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: mockGenerateAsync,
      isPending: false,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Select students and generate
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-editor')).toBeInTheDocument();
    });

    expect(screen.getByText('Learning Activities')).toBeInTheDocument();
    expect(screen.getByText('Students explored addition concepts')).toBeInTheDocument();
  });

  it('shows error when no students selected for generation', async () => {
    const { toast } = require('sonner');

    renderWithAuth(<ParentNewsletterPage />);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    expect(toast.error).toHaveBeenCalledWith('Please select at least one newsletter recipient');
  });

  it('displays existing newsletter drafts when no active newsletter', () => {
    mockHooks.useNewsletter.mockReturnValue({
      data: null,
      isLoading: false,
    });

    // Mock to show drafts list instead of form
    const ParentNewsletterPageComponent = require('../../pages/ParentNewsletterPage').default;

    // Mock useParams to not have an ID (should show drafts list)
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({ id: undefined });

    renderWithAuth(<ParentNewsletterPageComponent />);

    // Should show the planning form when no ID is provided
    expect(screen.getByText('Plan Parent Newsletter')).toBeInTheDocument();
  });

  it('saves newsletter draft', async () => {
    const mockSaveAsync = vi.fn().mockResolvedValue({
      id: 'saved-draft-1',
      title: 'Parent Newsletter - 1/15/2024',
    });

    mockHooks.useSaveNewsletterDraft.mockReturnValue({
      mutateAsync: mockSaveAsync,
      isPending: false,
    });

    const mockGenerateAsync = vi.fn().mockResolvedValue({
      sections: [{ title: 'Test', content: 'Content' }],
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: mockGenerateAsync,
      isPending: false,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Generate newsletter first
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-editor')).toBeInTheDocument();
    });

    // Save the draft
    const saveButton = screen.getByRole('button', { name: /save draft/i });
    await user.click(saveButton);

    expect(mockSaveAsync).toHaveBeenCalled();
  });

  it('sends newsletter', async () => {
    const mockSendAsync = vi.fn().mockResolvedValue({ success: true });

    mockHooks.useSendNewsletter.mockReturnValue({
      mutateAsync: mockSendAsync,
      isPending: false,
    });

    // Mock existing newsletter with ID
    const existingNewsletter = {
      id: 'newsletter-1',
      title: 'Test Newsletter',
      studentIds: [1],
      dateFrom: new Date(),
      dateTo: new Date(),
      tone: 'friendly',
      sections: [{ title: 'Test', content: 'Content' }],
      isDraft: true,
    };

    mockHooks.useNewsletter.mockReturnValue({
      data: existingNewsletter,
      isLoading: false,
    });

    // Mock useParams to return an ID
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({ id: 'newsletter-1' });

    renderWithAuth(<ParentNewsletterPage />);

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-editor')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send newsletter/i });
    await user.click(sendButton);

    expect(mockSendAsync).toHaveBeenCalledWith({ newsletterId: 'newsletter-1' });
  });

  it('regenerates newsletter with new tone', async () => {
    const mockRegenerateAsync = vi.fn().mockResolvedValue({
      sections: [{ title: 'Regenerated', content: 'New content' }],
    });

    mockHooks.useRegenerateNewsletter.mockReturnValue({
      mutateAsync: mockRegenerateAsync,
      isPending: false,
    });

    const mockGenerateAsync = vi.fn().mockResolvedValue({
      sections: [{ title: 'Test', content: 'Content' }],
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: mockGenerateAsync,
      isPending: false,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Generate newsletter first
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-editor')).toBeInTheDocument();
    });

    // Regenerate with new tone
    const regenerateButton = screen.getByRole('button', { name: /regenerate/i });
    await user.click(regenerateButton);

    expect(mockRegenerateAsync).toHaveBeenCalled();
  });

  it('navigates on cancel', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/newsletters');
  });

  it('shows loading state during generation', async () => {
    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Select students
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
  });

  it('handles date range changes', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');

    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-01-10');

    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-01-16');

    expect(startDateInput).toHaveValue('2024-01-10');
    expect(endDateInput).toHaveValue('2024-01-16');
  });

  it('toggles advanced options', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const artifactsCheckbox = screen.getByRole('checkbox', { name: /student artifacts/i });
    const reflectionsCheckbox = screen.getByRole('checkbox', { name: /student reflections/i });

    expect(artifactsCheckbox).toBeChecked();
    expect(reflectionsCheckbox).toBeChecked();

    await user.click(artifactsCheckbox);
    await user.click(reflectionsCheckbox);

    expect(artifactsCheckbox).not.toBeChecked();
    expect(reflectionsCheckbox).not.toBeChecked();
  });

  it('prevents duplicate focus areas', async () => {
    renderWithAuth(<ParentNewsletterPage />);

    const focusInput = screen.getByPlaceholderText(/add a focus area/i);

    // Add first focus area
    await user.type(focusInput, 'Reading');
    await user.keyboard('{Enter}');

    // Try to add the same focus area again
    await user.type(focusInput, 'Reading');
    await user.keyboard('{Enter}');

    // Should only have one instance
    const readingTags = screen.getAllByText('Reading');
    expect(readingTags).toHaveLength(1);
  });

  it('shows students loading state', () => {
    mockHooks.useStudents.mockReturnValue({
      data: [],
      isLoading: true,
    });

    renderWithAuth(<ParentNewsletterPage />);

    expect(screen.getByText('Loading students...')).toBeInTheDocument();
  });

  it('updates URL when newsletter is saved for first time', async () => {
    const mockSaveAsync = vi.fn().mockResolvedValue({
      id: 'new-newsletter-123',
      title: 'Saved Newsletter',
    });

    mockHooks.useSaveNewsletterDraft.mockReturnValue({
      mutateAsync: mockSaveAsync,
      isPending: false,
    });

    const mockGenerateAsync = vi.fn().mockResolvedValue({
      sections: [{ title: 'Test', content: 'Content' }],
    });

    mockHooks.useGenerateNewsletter.mockReturnValue({
      mutateAsync: mockGenerateAsync,
      isPending: false,
    });

    renderWithAuth(<ParentNewsletterPage />);

    // Generate and save newsletter
    const aliceCheckbox = screen.getByRole('checkbox', { name: /alice johnson/i });
    await user.click(aliceCheckbox);

    const generateButton = screen.getByRole('button', { name: /generate newsletter/i });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('newsletter-editor')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save draft/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/newsletters/new-newsletter-123', {
        replace: true,
      });
    });
  });
});
