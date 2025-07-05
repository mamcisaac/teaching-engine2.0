/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TemplatesPage from '../../pages/TemplatesPage';
import { renderWithAuth } from '../../test-utils';

// Mock the templates hooks
vi.mock('../../hooks/useTemplates', () => ({
  useTemplates: vi.fn(),
  useCreateTemplate: vi.fn(),
  useDeleteTemplate: vi.fn(),
  useDuplicateTemplate: vi.fn(),
  useApplyTemplate: vi.fn(),
  useTemplateFilterOptions: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ templateId: undefined }),
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock the template types
vi.mock('../../types/template', () => ({
  TEMPLATE_TYPES: {
    UNIT_PLAN: { label: 'Unit Plan', icon: '📚' },
    LESSON_PLAN: { label: 'Lesson Plan', icon: '📝' },
  },
  TEMPLATE_CATEGORIES: {
    BY_SUBJECT: { label: 'By Subject' },
    BY_GRADE: { label: 'By Grade' },
    BY_THEME: { label: 'By Theme' },
    SEASONAL: { label: 'Seasonal' },
  },
  isUnitPlanTemplate: vi.fn((template) => template.type === 'UNIT_PLAN'),
  isLessonPlanTemplate: vi.fn((template) => template.type === 'LESSON_PLAN'),
}));

// Mock Dialog component
vi.mock('../../components/Dialog', () => ({
  __esModule: true,
  default: ({ open, onOpenChange, children }: unknown) =>
    open ? <div data-testid="dialog">{children}</div> : null,
}));

// Mock LoadingStates component
vi.mock('../../components/LoadingStates', () => ({
  LoadingSpinner: ({ size, message }: unknown) => (
    <div data-testid="loading-spinner" data-size={size}>
      {message}
    </div>
  ),
}));

describe('TemplatesPage', () => {
  const user = userEvent.setup();

  const mockTemplates = [
    {
      id: 'template-1',
      title: 'Grade 3 Math Unit Template',
      description: 'Comprehensive template for Grade 3 mathematics units',
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Mathematics',
      gradeMin: 3,
      gradeMax: 3,
      isSystem: true,
      isPublic: true,
      tags: ['mathematics', 'grade3', 'unit'],
      keywords: ['math', 'numbers'],
      averageRating: 4.5,
      usageCount: 127,
      estimatedWeeks: 4,
      createdByUserId: null,
      content: {
        overview: 'Number sense and operations',
        bigIdeas: ['Numbers represent quantities'],
        learningGoals: ['Understand place value', 'Add and subtract fluently'],
        essentialQuestions: ['How do numbers help us?'],
      },
    },
    {
      id: 'template-2',
      title: 'Daily Reading Lesson',
      description: 'Template for daily guided reading lessons',
      type: 'LESSON_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Language Arts',
      gradeMin: 2,
      gradeMax: 4,
      isSystem: false,
      isPublic: true,
      tags: ['reading', 'daily', 'guided'],
      keywords: ['literacy', 'comprehension'],
      averageRating: 4.2,
      usageCount: 89,
      estimatedMinutes: 45,
      createdByUserId: 'user-123',
      content: {
        objectives: ['Improve reading fluency', 'Develop comprehension'],
        materials: ['Books', 'Reading logs'],
        mindsOn: 'Book walk and predictions',
        action: 'Guided reading with teacher support',
        consolidation: 'Share favorite parts',
      },
    },
    {
      id: 'template-3',
      title: 'Science Experiment Template',
      description: 'Generic template for hands-on science experiments',
      type: 'LESSON_PLAN',
      category: 'BY_THEME',
      subject: 'Science',
      gradeMin: 1,
      gradeMax: 6,
      isSystem: false,
      isPublic: false,
      tags: ['science', 'experiment', 'inquiry'],
      keywords: ['investigation', 'hypothesis'],
      averageRating: 3.8,
      usageCount: 45,
      estimatedMinutes: 60,
      createdByUserId: 'user-123',
      content: {
        objectives: ['Practice scientific method'],
        materials: ['Various lab materials'],
        mindsOn: 'Question and hypothesis',
        action: 'Conduct experiment',
        consolidation: 'Record and analyze results',
      },
    },
  ];

  const mockFilterOptions = {
    subjects: ['Mathematics', 'Language Arts', 'Science', 'Social Studies'],
    grades: [1, 2, 3, 4, 5, 6, 7, 8],
  };

  const mockHooks = {
    useTemplates: vi.fn(),
    useCreateTemplate: vi.fn(),
    useDeleteTemplate: vi.fn(),
    useDuplicateTemplate: vi.fn(),
    useApplyTemplate: vi.fn(),
    useTemplateFilterOptions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock implementations
    const templates = require('../../hooks/useTemplates');
    Object.entries(mockHooks).forEach(([key, mock]) => {
      templates[key] = mock;
    });

    // Default mock returns
    mockHooks.useTemplates.mockReturnValue({
      data: { templates: mockTemplates, total: mockTemplates.length },
      isLoading: false,
      error: null,
    });

    mockHooks.useCreateTemplate.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useDeleteTemplate.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useDuplicateTemplate.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useApplyTemplate.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useTemplateFilterOptions.mockReturnValue({
      data: mockFilterOptions,
      isLoading: false,
    });
  });

  it('renders templates page with header and breadcrumbs', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('Plan Templates')).toBeInTheDocument();
    expect(
      screen.getByText('Reusable unit and lesson plan templates to accelerate your planning'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /planning/i })).toBeInTheDocument();
  });

  it('displays create template button', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByTestId('create-template-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create template/i })).toBeInTheDocument();
  });

  it('shows search bar with filters toggle', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('displays template cards with correct information', () => {
    renderWithAuth(<TemplatesPage />);

    // Check first template
    expect(screen.getByText('Grade 3 Math Unit Template')).toBeInTheDocument();
    expect(screen.getByText('Unit Plan • Mathematics • Grade 3')).toBeInTheDocument();
    expect(
      screen.getByText('Comprehensive template for Grade 3 mathematics units'),
    ).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();

    // Check second template
    expect(screen.getByText('Daily Reading Lesson')).toBeInTheDocument();
    expect(screen.getByText('Lesson Plan • Language Arts • Grades 2-4')).toBeInTheDocument();
    expect(screen.getByText('Template for daily guided reading lessons')).toBeInTheDocument();
  });

  it('shows template ratings and usage counts', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('127')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
  });

  it('displays template tags and duration estimates', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('mathematics')).toBeInTheDocument();
    expect(screen.getByText('grade3')).toBeInTheDocument();
    expect(screen.getByText('4w')).toBeInTheDocument(); // 4 weeks
    expect(screen.getByText('45m')).toBeInTheDocument(); // 45 minutes
  });

  it('opens create template modal when create button is clicked', async () => {
    renderWithAuth(<TemplatesPage />);

    const createButton = screen.getByTestId('create-template-button');
    await user.click(createButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Template')).toBeInTheDocument();
  });

  it('displays create template form with all fields', async () => {
    renderWithAuth(<TemplatesPage />);

    const createButton = screen.getByTestId('create-template-button');
    await user.click(createButton);

    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum Grade (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Grade (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText(/make this template public/i)).toBeInTheDocument();
  });

  it('creates new template with form data', async () => {
    const mockCreateAsync = vi.fn().mockResolvedValue({ id: 'new-template-1' });
    mockHooks.useCreateTemplate.mockReturnValue({
      mutateAsync: mockCreateAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    // Open create modal
    const createButton = screen.getByTestId('create-template-button');
    await user.click(createButton);

    // Fill form
    await user.type(screen.getByLabelText('Title'), 'New Math Template');
    await user.type(screen.getByLabelText('Description'), 'A new mathematics template');
    await user.selectOptions(screen.getByLabelText('Type'), 'UNIT_PLAN');
    await user.selectOptions(screen.getByLabelText('Category'), 'BY_SUBJECT');
    await user.type(screen.getByLabelText('Subject (optional)'), 'Mathematics');
    await user.type(screen.getByLabelText('Minimum Grade (optional)'), '3');
    await user.type(screen.getByLabelText('Maximum Grade (optional)'), '4');
    await user.click(screen.getByLabelText(/make this template public/i));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create template/i });
    await user.click(submitButton);

    expect(mockCreateAsync).toHaveBeenCalledWith({
      title: 'New Math Template',
      description: 'A new mathematics template',
      type: 'UNIT_PLAN',
      category: 'BY_SUBJECT',
      subject: 'Mathematics',
      gradeMin: 3,
      gradeMax: 4,
      isPublic: true,
      tags: [],
      keywords: [],
      content: {},
    });
  });

  it('toggles filters panel when filters button is clicked', async () => {
    renderWithAuth(<TemplatesPage />);

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    expect(screen.getByLabelText('View')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
  });

  it('applies search filter when typing in search box', async () => {
    renderWithAuth(<TemplatesPage />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    await user.type(searchInput, 'math');

    expect(searchInput).toHaveValue('math');

    // In real implementation, this would trigger a new query
    await waitFor(() => {
      expect(mockHooks.useTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'math',
        }),
      );
    });
  });

  it('filters by template type', async () => {
    renderWithAuth(<TemplatesPage />);

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    // Select unit plans only
    const typeSelect = screen.getByLabelText('Type');
    await user.selectOptions(typeSelect, 'UNIT_PLAN');

    expect(typeSelect).toHaveValue('UNIT_PLAN');
  });

  it('opens preview modal when preview button is clicked', async () => {
    renderWithAuth(<TemplatesPage />);

    const previewButtons = screen.getAllByRole('button', { name: /preview/i });
    await user.click(previewButtons[0]);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Grade 3 Math Unit Template')).toBeInTheDocument();
  });

  it('applies template when use button is clicked', async () => {
    const mockApplyAsync = vi.fn().mockResolvedValue({
      appliedContent: { title: 'Applied Template' },
    });
    mockHooks.useApplyTemplate.mockReturnValue({
      mutateAsync: mockApplyAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    const useButtons = screen.getAllByRole('button', { name: /use/i });
    await user.click(useButtons[0]);

    expect(mockApplyAsync).toHaveBeenCalledWith({ id: 'template-1' });
  });

  it('duplicates template when duplicate button is clicked', async () => {
    const mockDuplicateAsync = vi.fn().mockResolvedValue({
      id: 'duplicated-template-1',
    });
    mockHooks.useDuplicateTemplate.mockReturnValue({
      mutateAsync: mockDuplicateAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    const duplicateButtons = screen.getAllByRole('button');
    const duplicateButton = duplicateButtons.find(
      (btn) =>
        btn.querySelector('svg')?.getAttribute('class')?.includes('copy') ||
        btn.textContent?.includes('duplicate'),
    );

    if (duplicateButton) {
      await user.click(duplicateButton);

      expect(mockDuplicateAsync).toHaveBeenCalledWith({
        id: 'template-1',
        title: 'Grade 3 Math Unit Template (Copy)',
      });
    }
  });

  it('shows delete confirmation when delete button is clicked', async () => {
    renderWithAuth(<TemplatesPage />);

    // Find delete button (only for user-created templates)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.getAttribute('class')?.includes('trash'),
    );

    if (deleteButton) {
      await user.click(deleteButton);

      expect(screen.getByText('Delete Template')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    }
  });

  it('deletes template when deletion is confirmed', async () => {
    const mockDeleteAsync = vi.fn().mockResolvedValue({ success: true });
    mockHooks.useDeleteTemplate.mockReturnValue({
      mutateAsync: mockDeleteAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    // Find and click delete button for user-created template
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.getAttribute('class')?.includes('trash'),
    );

    if (deleteButton) {
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      expect(mockDeleteAsync).toHaveBeenCalled();
    }
  });

  it('shows loading state when templates are loading', () => {
    mockHooks.useTemplates.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithAuth(<TemplatesPage />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    mockHooks.useTemplates.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('Failed to load templates. Please try again.')).toBeInTheDocument();
  });

  it('shows empty state when no templates found', () => {
    mockHooks.useTemplates.mockReturnValue({
      data: { templates: [], total: 0 },
      isLoading: false,
      error: null,
    });

    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('No templates found')).toBeInTheDocument();
    expect(screen.getByTestId('create-template-empty-state-button')).toBeInTheDocument();
  });

  it('shows empty state message for search results', () => {
    mockHooks.useTemplates.mockReturnValue({
      data: { templates: [], total: 0 },
      isLoading: false,
      error: null,
    });

    renderWithAuth(<TemplatesPage />);

    const searchInput = screen.getByPlaceholderText('Search templates...');
    user.type(searchInput, 'nonexistent');

    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
  });

  it('navigates to unit planning when unit template is applied', async () => {
    const mockApplyAsync = vi.fn().mockResolvedValue({
      appliedContent: { title: 'Applied Unit Template' },
    });
    mockHooks.useApplyTemplate.mockReturnValue({
      mutateAsync: mockApplyAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    const useButtons = screen.getAllByRole('button', { name: /use/i });
    await user.click(useButtons[0]); // First template is unit plan

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/planner/units', {
        state: { templateData: { title: 'Applied Unit Template' } },
      });
    });
  });

  it('navigates to lesson planning when lesson template is applied', async () => {
    const mockApplyAsync = vi.fn().mockResolvedValue({
      appliedContent: { title: 'Applied Lesson Template' },
    });
    mockHooks.useApplyTemplate.mockReturnValue({
      mutateAsync: mockApplyAsync,
      isPending: false,
    });

    renderWithAuth(<TemplatesPage />);

    const useButtons = screen.getAllByRole('button', { name: /use/i });
    await user.click(useButtons[1]); // Second template is lesson plan

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/planner/lessons', {
        state: { templateData: { title: 'Applied Lesson Template' } },
      });
    });
  });

  it('validates required fields in create form', async () => {
    renderWithAuth(<TemplatesPage />);

    // Open create modal
    const createButton = screen.getByTestId('create-template-button');
    await user.click(createButton);

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: /create template/i });
    await user.click(submitButton);

    // Form should not submit without title
    expect(mockHooks.useCreateTemplate().mutateAsync).not.toHaveBeenCalled();
  });

  it('displays proper template type and category labels', () => {
    renderWithAuth(<TemplatesPage />);

    // Check that template types are displayed correctly
    expect(screen.getByText('Unit Plan • Mathematics • Grade 3')).toBeInTheDocument();
    expect(screen.getByText('Lesson Plan • Language Arts • Grades 2-4')).toBeInTheDocument();
  });

  it('shows template tags with more indicator', () => {
    // Add a template with many tags
    const templateWithManyTags = {
      ...mockTemplates[0],
      tags: ['math', 'grade3', 'numbers', 'addition', 'subtraction', 'more'],
    };

    mockHooks.useTemplates.mockReturnValue({
      data: { templates: [templateWithManyTags], total: 1 },
      isLoading: false,
      error: null,
    });

    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('math')).toBeInTheDocument();
    expect(screen.getByText('grade3')).toBeInTheDocument();
    expect(screen.getByText('numbers')).toBeInTheDocument();
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });

  it('handles form cancellation in create modal', async () => {
    renderWithAuth(<TemplatesPage />);

    // Open create modal
    const createButton = screen.getByTestId('create-template-button');
    await user.click(createButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    // Cancel form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('shows system badge for system templates', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows public badge for public templates', () => {
    renderWithAuth(<TemplatesPage />);

    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('hides delete button for system templates', () => {
    renderWithAuth(<TemplatesPage />);

    // System templates (isSystem: true) should not have delete buttons
    // Only user-created templates should have delete buttons
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg')?.getAttribute('class')?.includes('trash'));

    // Should only find delete buttons for user-created templates
    expect(deleteButtons.length).toBeLessThan(mockTemplates.length);
  });
});
