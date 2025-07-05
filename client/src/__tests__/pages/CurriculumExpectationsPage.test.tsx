/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import CurriculumExpectationsPage from '../../pages/CurriculumExpectationsPage';
import { renderWithAuth } from '../../test-utils';

// Mock the ETFO planning hooks
vi.mock('../../hooks/useETFOPlanning', () => ({
  useCurriculumExpectations: vi.fn(),
  useUpdateCurriculumExpectation: vi.fn(),
  useDeleteCurriculumExpectation: vi.fn(),
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

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock window.confirm
global.confirm = vi.fn(() => true);

describe('CurriculumExpectationsPage', () => {
  const user = userEvent.setup();

  const mockExpectations = [
    {
      id: 'exp-1',
      code: 'B1.1',
      type: 'specific',
      description: 'demonstrate an understanding of addition and subtraction',
      descriptionFr: "démontrer une compréhension de l'addition et de la soustraction",
      strand: 'Number',
      substrand: 'Number Sense',
      subject: 'Mathematics',
      grade: 3,
      coverage: {
        percentage: 75,
        lessonCount: 3,
      },
    },
    {
      id: 'exp-2',
      code: 'B1.2',
      type: 'specific',
      description: 'solve problems involving multiplication',
      strand: 'Number',
      substrand: 'Number Operations',
      subject: 'Mathematics',
      grade: 3,
      coverage: null,
    },
    {
      id: 'exp-3',
      code: 'A1.1',
      type: 'overall',
      description: 'read and demonstrate comprehension of texts',
      strand: 'Reading',
      subject: 'Language Arts',
      grade: 3,
      coverage: {
        percentage: 90,
        lessonCount: 5,
      },
    },
    {
      id: 'exp-4',
      code: 'C1.1',
      type: 'specific',
      description: 'investigate properties of materials',
      strand: 'Understanding Matter',
      subject: 'Science',
      grade: 2,
      coverage: null,
    },
  ];

  const mockHooks = {
    useCurriculumExpectations: vi.fn(),
    useUpdateCurriculumExpectation: vi.fn(),
    useDeleteCurriculumExpectation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Setup mock implementations
    const etfoHooks = require('../../hooks/useETFOPlanning');
    Object.entries(mockHooks).forEach(([key, mock]) => {
      etfoHooks[key] = mock;
    });

    // Default mock returns
    mockHooks.useCurriculumExpectations.mockReturnValue({
      data: mockExpectations,
      isLoading: false,
      error: null,
    });

    mockHooks.useUpdateCurriculumExpectation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockHooks.useDeleteCurriculumExpectation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it('renders curriculum expectations page with header', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByText('Curriculum Expectations')).toBeInTheDocument();
    expect(screen.getByText(/browse and manage curriculum expectations/i)).toBeInTheDocument();
  });

  it('displays import curriculum button', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByRole('button', { name: /import curriculum/i })).toBeInTheDocument();
  });

  it('shows filter controls', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByText('Filter Expectations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by code or description...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all subjects/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all grades/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all types/i })).toBeInTheDocument();
  });

  it('displays subject tabs', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByRole('tab', { name: 'Language Arts' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Mathematics' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Science' })).toBeInTheDocument();
  });

  it('shows expectations in table format', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    // Check table headers
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Strand')).toBeInTheDocument();
    expect(screen.getByText('Coverage')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check expectation data
    expect(screen.getByText('B1.1')).toBeInTheDocument();
    expect(
      screen.getByText('demonstrate an understanding of addition and subtraction'),
    ).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Number Sense')).toBeInTheDocument();
  });

  it('displays expectation types with correct badges', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const specificBadges = screen.getAllByText('specific');
    const overallBadges = screen.getAllByText('overall');

    expect(specificBadges.length).toBeGreaterThan(0);
    expect(overallBadges.length).toBeGreaterThan(0);
  });

  it('shows coverage information', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getAllByText('Not planned')).toHaveLength(2);
  });

  it('displays French descriptions when available', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    expect(
      screen.getByText("démontrer une compréhension de l'addition et de la soustraction"),
    ).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const searchInput = screen.getByPlaceholderText('Search by code or description...');
    await user.type(searchInput, 'addition');

    expect(searchInput).toHaveValue('addition');

    // Should trigger hook with search parameter
    expect(mockHooks.useCurriculumExpectations).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'addition',
      }),
    );
  });

  it('filters by subject', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const subjectSelect = screen.getByRole('button', { name: /all subjects/i });
    await user.click(subjectSelect);

    const mathOption = screen.getByRole('option', { name: 'Mathematics' });
    await user.click(mathOption);

    expect(mockHooks.useCurriculumExpectations).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Mathematics',
      }),
    );
  });

  it('filters by grade', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const gradeSelect = screen.getByRole('button', { name: /all grades/i });
    await user.click(gradeSelect);

    const grade3Option = screen.getByRole('option', { name: 'Grade 3' });
    await user.click(grade3Option);

    expect(mockHooks.useCurriculumExpectations).toHaveBeenCalledWith(
      expect.objectContaining({
        grade: 3,
      }),
    );
  });

  it('opens edit dialog when edit button is clicked', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg')); // Find edit icon

    if (editButton) {
      await user.click(editButton);
    }

    expect(screen.getByText('Edit Curriculum Expectation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B1.1')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('demonstrate an understanding of addition and subtraction'),
    ).toBeInTheDocument();
  });

  it('updates expectation when edit form is submitted', async () => {
    const mockUpdateAsync = vi.fn().mockResolvedValue({});
    mockHooks.useUpdateCurriculumExpectation.mockReturnValue({
      mutateAsync: mockUpdateAsync,
      isPending: false,
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    // Open edit dialog
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg'));

    if (editButton) {
      await user.click(editButton);
    }

    // Modify description
    const descriptionField = screen.getByDisplayValue(
      'demonstrate an understanding of addition and subtraction',
    );
    await user.clear(descriptionField);
    await user.type(descriptionField, 'Updated description');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(mockUpdateAsync).toHaveBeenCalledWith({
      id: 'exp-1',
      data: {
        description: 'Updated description',
        descriptionFr: "démontrer une compréhension de l'addition et de la soustraction",
        strand: 'Number',
        substrand: 'Number Sense',
      },
    });
  });

  it('cancels edit when cancel button is clicked', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    // Open edit dialog
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg'));

    if (editButton) {
      await user.click(editButton);
    }

    expect(screen.getByText('Edit Curriculum Expectation')).toBeInTheDocument();

    // Cancel edit
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByText('Edit Curriculum Expectation')).not.toBeInTheDocument();
  });

  it('deletes expectation when delete is confirmed', async () => {
    const mockDeleteAsync = vi.fn().mockResolvedValue({});
    mockHooks.useDeleteCurriculumExpectation.mockReturnValue({
      mutateAsync: mockDeleteAsync,
      isPending: false,
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    // Find delete button (trash icon)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.getAttribute('class')?.includes('trash'),
    );

    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this expectation? This will remove it from all linked plans.',
    );
    expect(mockDeleteAsync).toHaveBeenCalledWith('exp-1');
  });

  it('does not delete when deletion is cancelled', async () => {
    global.confirm = vi.fn(() => false);
    const mockDeleteAsync = vi.fn();
    mockHooks.useDeleteCurriculumExpectation.mockReturnValue({
      mutateAsync: mockDeleteAsync,
      isPending: false,
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    // Find delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg')?.getAttribute('class')?.includes('trash'),
    );

    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(global.confirm).toHaveBeenCalled();
    expect(mockDeleteAsync).not.toHaveBeenCalled();
  });

  it('navigates to curriculum import page', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const importButton = screen.getByRole('button', { name: /import curriculum/i });
    await user.click(importButton);

    expect(mockNavigate).toHaveBeenCalledWith('/curriculum-import');
  });

  it('shows loading state', () => {
    mockHooks.useCurriculumExpectations.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    expect(screen.getByText('Loading expectations...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockHooks.useCurriculumExpectations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    expect(
      screen.getByText('Failed to load curriculum expectations. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no expectations', () => {
    mockHooks.useCurriculumExpectations.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithAuth(<CurriculumExpectationsPage />);

    expect(
      screen.getByText('No expectations found. Import a curriculum to get started.'),
    ).toBeInTheDocument();
  });

  it('switches between subject tabs', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    const scienceTab = screen.getByRole('tab', { name: 'Science' });
    await user.click(scienceTab);

    // Should show science expectations
    expect(screen.getByText('Science Expectations')).toBeInTheDocument();
    expect(screen.getByText('investigate properties of materials')).toBeInTheDocument();
  });

  it('displays expectation counts per subject', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    // Mathematics should have 2 expectations
    expect(screen.getByText('2 expectations')).toBeInTheDocument();
    // Language Arts should have 1 expectation
    expect(screen.getByText('1 expectations')).toBeInTheDocument();
  });

  it('handles edit form with all fields', async () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    // Open edit dialog
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find((btn) => btn.querySelector('svg'));

    if (editButton) {
      await user.click(editButton);
    }

    // Check all form fields are present
    expect(screen.getByDisplayValue('B1.1')).toBeDisabled(); // Code is disabled
    expect(screen.getByDisplayValue('specific')).toBeDisabled(); // Type is disabled
    expect(screen.getByLabelText('Description (English)')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (French)')).toBeInTheDocument();
    expect(screen.getByLabelText('Strand')).toBeInTheDocument();
    expect(screen.getByLabelText('Substrand (Optional)')).toBeInTheDocument();

    // Fill French description
    const frenchField = screen.getByLabelText('Description (French)');
    await user.clear(frenchField);
    await user.type(frenchField, 'Description française mise à jour');

    // Modify strand
    const strandField = screen.getByDisplayValue('Number');
    await user.clear(strandField);
    await user.type(strandField, 'Updated Strand');

    // Check values are updated
    expect(frenchField).toHaveValue('Description française mise à jour');
    expect(strandField).toHaveValue('Updated Strand');
  });

  it('groups expectations correctly by subject', () => {
    renderWithAuth(<CurriculumExpectationsPage />);

    // Mathematics tab should be first (alphabetically)
    const mathTab = screen.getByRole('tab', { name: 'Mathematics' });
    expect(mathTab).toBeInTheDocument();

    // Click on Language Arts tab
    const languageTab = screen.getByRole('tab', { name: 'Language Arts' });
    expect(languageTab).toBeInTheDocument();
  });
});
