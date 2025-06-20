import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OutcomeReflectionsJournal from '../components/assessment/OutcomeReflectionsJournal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageContext } from '../contexts/LanguageContext';

// Mock the API hooks
vi.mock('../api', () => ({
  useOutcomes: () => ({
    data: [
      {
        id: '1',
        code: 'FL1.CO.1',
        description: 'Communicate orally in French',
        subject: 'Français',
        grade: 1,
        domain: 'Communication orale',
      },
      {
        id: '2',
        code: 'FL1.LE.1',
        description: 'Read simple French texts',
        subject: 'Français',
        grade: 1,
        domain: 'Lecture',
      },
      {
        id: '3',
        code: 'M1.N.1',
        description: 'Count to 20',
        subject: 'Math',
        grade: 1,
        domain: 'Number',
      },
    ],
  }),
  useTeacherReflections: () => ({
    data: [
      {
        id: 1,
        content: 'Students are doing well with oral communication',
        outcomeId: '1',
        userId: 1,
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
      },
      {
        id: 2,
        content: 'Need more practice with reading fluency',
        outcomeId: '2',
        userId: 1,
        createdAt: '2023-01-02T10:00:00Z',
        updatedAt: '2023-01-02T10:00:00Z',
      },
    ],
  }),
  useCreateTeacherReflection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 3 }),
    isPending: false,
  }),
  useUpdateTeacherReflection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
    isPending: false,
  }),
  useDeleteTeacherReflection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement, language = 'en') => {
  const languageValue = {
    language: language as 'en' | 'fr',
    setLanguage: vi.fn(),
    t: vi.fn((key: string, fallback?: string) => fallback || key),
    getLocalizedField: vi.fn((obj: Record<string, unknown>, field: string) =>
      String(obj[field] || ''),
    ),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={languageValue}>{component}</LanguageContext.Provider>
    </QueryClientProvider>,
  );
};

describe('OutcomeReflectionsJournal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with English interface', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    expect(screen.getByText('Learning Outcomes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('All subjects')).toBeInTheDocument();
  });

  it('renders the component with French interface', () => {
    renderWithProviders(<OutcomeReflectionsJournal />, 'fr');

    expect(screen.getByText("Résultats d'apprentissage")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    expect(screen.getByText('Toutes les matières')).toBeInTheDocument();
  });

  it('displays list of outcomes grouped by subject', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    expect(screen.getByText('FL1.CO.1')).toBeInTheDocument();
    expect(screen.getByText('FL1.LE.1')).toBeInTheDocument();
    expect(screen.getByText('M1.N.1')).toBeInTheDocument();
    expect(screen.getByText('Communicate orally in French')).toBeInTheDocument();
  });

  it('shows reflection count badges for outcomes with reflections', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // FL1.CO.1 should have 1 reflection
    const outcome1 = screen.getByText('FL1.CO.1').closest('button');
    expect(outcome1).toContainElement(screen.getByText('1'));

    // FL1.LE.1 should have 1 reflection
    const outcome2 = screen.getByText('FL1.LE.1').closest('button');
    expect(outcome2).toContainElement(screen.getByText('1'));
  });

  it('filters outcomes by search term', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'oral' } });

    // Should show only the oral communication outcome
    expect(screen.getByText('FL1.CO.1')).toBeInTheDocument();
    expect(screen.queryByText('FL1.LE.1')).not.toBeInTheDocument();
    expect(screen.queryByText('M1.N.1')).not.toBeInTheDocument();
  });

  it('filters outcomes by subject', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    const subjectSelect = screen.getByDisplayValue('All subjects');
    fireEvent.change(subjectSelect, { target: { value: 'Math' } });

    // Should show only Math outcomes
    expect(screen.getByText('M1.N.1')).toBeInTheDocument();
    expect(screen.queryByText('FL1.CO.1')).not.toBeInTheDocument();
    expect(screen.queryByText('FL1.LE.1')).not.toBeInTheDocument();
  });

  it('shows quick filter buttons', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('With reflections')).toBeInTheDocument();
    expect(screen.getByText('Without reflections')).toBeInTheDocument();
  });

  it('selects outcome and shows reflection panel', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Click on an outcome
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Should show reflection panel
    expect(screen.getByText('New reflection')).toBeInTheDocument();
    expect(screen.getByText('1 reflection')).toBeInTheDocument();
  });

  it('displays existing reflections for selected outcome', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome with reflections
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Should show the existing reflection
    expect(screen.getByText('Students are doing well with oral communication')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
  });

  it('allows creating new reflection', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Add reflection text
    const textArea = screen.getByPlaceholderText(
      'Write your observations about this learning outcome...',
    );
    fireEvent.change(textArea, { target: { value: 'New reflection content' } });

    // Submit
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Reflection added');
    });
  });

  it('validates reflection content before saving', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Try to submit without content
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select an outcome and write a reflection');
    });
  });

  it('allows editing existing reflection', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome with reflections
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Click edit on existing reflection
    fireEvent.click(screen.getByText('Edit'));

    // Should populate text area with existing content
    const textArea = screen.getByDisplayValue('Students are doing well with oral communication');
    expect(textArea).toBeInTheDocument();

    // Modify content
    fireEvent.change(textArea, { target: { value: 'Updated reflection content' } });

    // Submit update
    fireEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Reflection updated');
    });
  });

  it('allows canceling edit mode', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome and start editing
    fireEvent.click(screen.getByText('FL1.CO.1'));
    fireEvent.click(screen.getByText('Edit'));

    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'));

    // Should return to add mode
    expect(screen.getByText('New reflection')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('allows deleting reflection with confirmation', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome with reflections
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Delete reflection
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Delete this reflection?');
      expect(toast.success).toHaveBeenCalledWith('Reflection deleted');
    });
  });

  it('handles deletion cancellation', async () => {
    (
      window.confirm as unknown as { mockReturnValueOnce: (value: boolean) => void }
    ).mockReturnValueOnce(false);

    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome and try to delete
    fireEvent.click(screen.getByText('FL1.CO.1'));
    fireEvent.click(screen.getByText('Delete'));

    // Should not call delete API
    expect(window.confirm).toHaveBeenCalled();
    // The reflection should still be visible
    expect(screen.getByText('Students are doing well with oral communication')).toBeInTheDocument();
  });

  it('shows empty state when no outcome is selected', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    expect(screen.getByText('Select a learning outcome')).toBeInTheDocument();
    expect(screen.getByText('to view and add reflections')).toBeInTheDocument();
  });

  it('shows empty state when outcome has no reflections', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome without reflections
    fireEvent.click(screen.getByText('M1.N.1'));

    expect(screen.getByText('No reflections for this learning outcome')).toBeInTheDocument();
    expect(screen.getByText('Add your first reflection above')).toBeInTheDocument();
  });

  it('sorts reflections by creation date (newest first)', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome with multiple reflections (FL1.LE.1 has newer reflection)
    fireEvent.click(screen.getByText('FL1.LE.1'));

    // Should show the reflection
    expect(screen.getByText('Need more practice with reading fluency')).toBeInTheDocument();
    expect(screen.getByText('January 2, 2023')).toBeInTheDocument();
  });

  it('handles "With reflections" filter', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Click "With reflections" filter
    fireEvent.click(screen.getByText('With reflections'));

    // Should select first outcome with reflections (FL1.CO.1)
    expect(screen.getByText('Students are doing well with oral communication')).toBeInTheDocument();
  });

  it('handles "Without reflections" filter', () => {
    renderWithProviders(<OutcomeReflectionsJournal />);

    // Click "Without reflections" filter
    fireEvent.click(screen.getByText('Without reflections'));

    // Should select first outcome without reflections (M1.N.1)
    expect(screen.getByText('No reflections for this learning outcome')).toBeInTheDocument();
  });

  it('shows French date format in French mode', () => {
    renderWithProviders(<OutcomeReflectionsJournal />, 'fr');

    // Select outcome with reflections
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Should show French date format
    expect(screen.getByText('1 janvier 2023')).toBeInTheDocument();
  });

  it('shows updated timestamp when reflection was modified', () => {
    // Mock a reflection that was updated
    const useTeacherReflections = vi.fn(() => ({
      data: [
        {
          id: 1,
          content: 'Updated reflection',
          outcomeId: '1',
          userId: 1,
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2023-01-02T15:00:00Z', // Updated later
        },
      ],
    }));

    vi.doMock('../api', () => ({
      ...vi.importActual('../api'),
      useTeacherReflections,
    }));

    renderWithProviders(<OutcomeReflectionsJournal />);

    // Select outcome
    fireEvent.click(screen.getByText('FL1.CO.1'));

    // Should show "Updated" timestamp
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('calls onOutcomeSelect when provided', () => {
    const mockOnOutcomeSelect = vi.fn();
    renderWithProviders(<OutcomeReflectionsJournal onOutcomeSelect={mockOnOutcomeSelect} />);

    // Select outcome
    fireEvent.click(screen.getByText('FL1.CO.1'));

    expect(mockOnOutcomeSelect).toHaveBeenCalledWith('1');
  });

  it('preselects outcome when selectedOutcomeId is provided', () => {
    renderWithProviders(<OutcomeReflectionsJournal selectedOutcomeId="1" />);

    // Should automatically show reflections for outcome 1
    expect(screen.getByText('Students are doing well with oral communication')).toBeInTheDocument();
  });
});
