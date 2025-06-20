import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import EvidenceQuickEntry from '../components/evidence/EvidenceQuickEntry';
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
    ],
  }),
  useStudents: () => ({
    data: [
      {
        id: 1,
        firstName: 'Marie',
        lastName: 'Dubois',
        grade: 1,
        userId: 1,
        parentContacts: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
      {
        id: 2,
        firstName: 'Jean',
        lastName: 'Martin',
        grade: 1,
        userId: 1,
        parentContacts: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
    ],
  }),
  useCreateStudentReflection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1 }),
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

// Mock navigator.mediaDevices
const mockMediaDevices = {
  getUserMedia: vi.fn(),
};

Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices,
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

describe('EvidenceQuickEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with English interface', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    expect(screen.getByText('Quick Evidence Entry')).toBeInTheDocument();
    expect(screen.getByText('Select Students')).toBeInTheDocument();
    expect(screen.getByText('Observed Evidence')).toBeInTheDocument();
  });

  it('renders the component with French interface', () => {
    renderWithProviders(<EvidenceQuickEntry />, 'fr');

    expect(screen.getByText("Saisie rapide d'évidence")).toBeInTheDocument();
    expect(screen.getByText('Sélectionner les élèves')).toBeInTheDocument();
    expect(screen.getByText('Évidence observée')).toBeInTheDocument();
  });

  it('displays list of students', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByText('Jean Martin')).toBeInTheDocument();
    expect(screen.getAllByText('Grade 1')).toHaveLength(2);
  });

  it('allows selecting individual students', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    fireEvent.click(marieCheckbox);

    expect(marieCheckbox).toBeChecked();
    expect(screen.getByText('Selected: Marie Dubois')).toBeInTheDocument();
  });

  it('allows selecting all students', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const selectAllButton = screen.getByText('Select all');
    fireEvent.click(selectAllButton);

    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    const jeanCheckbox = screen.getByLabelText('Jean Martin Grade 1');

    expect(marieCheckbox).toBeChecked();
    expect(jeanCheckbox).toBeChecked();
    expect(screen.getByText('Selected: Marie Dubois, Jean Martin')).toBeInTheDocument();
  });

  it('deselects all students when clicking "Deselect all"', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    // First select all
    const selectAllButton = screen.getByText('Select all');
    fireEvent.click(selectAllButton);

    // Then deselect all
    const deselectAllButton = screen.getByText('Deselect all');
    fireEvent.click(deselectAllButton);

    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    const jeanCheckbox = screen.getByLabelText('Jean Martin Grade 1');

    expect(marieCheckbox).not.toBeChecked();
    expect(jeanCheckbox).not.toBeChecked();
  });

  it('displays quick suggestions in quick mode', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    expect(screen.getByText('Quick suggestions:')).toBeInTheDocument();
    expect(screen.getByText('Excellent work today!')).toBeInTheDocument();
    expect(screen.getByText('Good effort, keep it up!')).toBeInTheDocument();
    expect(screen.getByText('Needs more practice')).toBeInTheDocument();
  });

  it('displays French suggestions in French mode', () => {
    renderWithProviders(<EvidenceQuickEntry />, 'fr');

    expect(screen.getByText('Suggestions rapides:')).toBeInTheDocument();
    expect(screen.getByText("Excellent travail aujourd'hui!")).toBeInTheDocument();
    expect(screen.getByText('Bon effort, continue comme ça!')).toBeInTheDocument();
    expect(screen.getByText('A besoin de plus de pratique')).toBeInTheDocument();
  });

  it('fills text area when clicking a quick suggestion', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const suggestion = screen.getByText('Excellent work today!');
    fireEvent.click(suggestion);

    const textArea = screen.getByPlaceholderText('Describe what you observed...');
    expect(textArea).toHaveValue('Excellent work today!');
  });

  it('allows emoji selection', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const happyEmoji = screen.getByText('😊');
    fireEvent.click(happyEmoji);

    // The emoji button should be selected (have blue border)
    expect(happyEmoji.parentElement).toHaveClass('border-blue-500');
  });

  it('toggles emoji selection', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const happyEmoji = screen.getByText('😊');

    // Select emoji
    fireEvent.click(happyEmoji);
    expect(happyEmoji.parentElement).toHaveClass('border-blue-500');

    // Deselect emoji
    fireEvent.click(happyEmoji);
    expect(happyEmoji.parentElement).not.toHaveClass('border-blue-500');
  });

  it('shows voice recording controls', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    expect(screen.getByText('Voice note:')).toBeInTheDocument();
    expect(screen.getByText('🎤 Record')).toBeInTheDocument();
  });

  it('handles voice recording start and stop', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    const mockMediaRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      state: 'recording',
      ondataavailable: null,
      onstop: null,
    };

    mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);
    (global as unknown as { MediaRecorder: unknown }).MediaRecorder = vi.fn(
      () => mockMediaRecorder,
    );

    renderWithProviders(<EvidenceQuickEntry />);

    const recordButton = screen.getByText('🎤 Record');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(screen.getByText('⏹️ Stop')).toBeInTheDocument();
      expect(screen.getByText('Recording...')).toBeInTheDocument();
    });
  });

  it('shows outcome search when enabled', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(screen.getByPlaceholderText('Search outcomes...')).toBeInTheDocument();
    expect(screen.getByText('FL1.CO.1')).toBeInTheDocument();
  });

  it('validates that students are selected before submission', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<EvidenceQuickEntry />);

    // Add some evidence text
    const textArea = screen.getByPlaceholderText('Describe what you observed...');
    fireEvent.change(textArea, { target: { value: 'Test evidence' } });

    // Try to submit without selecting students
    const saveButton = screen.getByText('Save Evidence');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select at least one student');
    });
  });

  it('validates that evidence text or emoji is provided', async () => {
    const { toast } = await import('sonner');
    renderWithProviders(<EvidenceQuickEntry />);

    // Select a student
    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    fireEvent.click(marieCheckbox);

    // Try to submit without evidence text or emoji
    const saveButton = screen.getByText('Save Evidence');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please add text or select an emoji');
    });
  });

  it('successfully saves evidence for selected students', async () => {
    const { toast } = await import('sonner');
    const mockOnSuccess = vi.fn();

    renderWithProviders(<EvidenceQuickEntry onSuccess={mockOnSuccess} />);

    // Select students
    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    const jeanCheckbox = screen.getByLabelText('Jean Martin Grade 1');
    fireEvent.click(marieCheckbox);
    fireEvent.click(jeanCheckbox);

    // Add evidence text
    const textArea = screen.getByPlaceholderText('Describe what you observed...');
    fireEvent.change(textArea, { target: { value: 'Great participation today!' } });

    // Select an emoji
    const happyEmoji = screen.getByText('😊');
    fireEvent.click(happyEmoji);

    // Submit
    const saveButton = screen.getByText('Save Evidence');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Evidence recorded for 2 student(s)');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('resets form after successful submission', async () => {
    renderWithProviders(<EvidenceQuickEntry />);

    // Select student and add evidence
    const marieCheckbox = screen.getByLabelText('Marie Dubois Grade 1');
    fireEvent.click(marieCheckbox);

    const textArea = screen.getByPlaceholderText('Describe what you observed...');
    fireEvent.change(textArea, { target: { value: 'Test evidence' } });

    const happyEmoji = screen.getByText('😊');
    fireEvent.click(happyEmoji);

    // Submit
    const saveButton = screen.getByText('Save Evidence');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(marieCheckbox).not.toBeChecked();
      expect(textArea).toHaveValue('');
      expect(happyEmoji.parentElement).not.toHaveClass('border-blue-500');
    });
  });

  it('handles quick mode toggle', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    const quickModeCheckbox = screen.getByLabelText('Quick mode');
    expect(quickModeCheckbox).toBeChecked();

    // Disable quick mode
    fireEvent.click(quickModeCheckbox);
    expect(quickModeCheckbox).not.toBeChecked();

    // Quick suggestions should no longer be visible
    expect(screen.queryByText('Quick suggestions:')).not.toBeInTheDocument();
  });

  it('searches and filters outcomes', () => {
    renderWithProviders(<EvidenceQuickEntry />);

    // Open outcome search
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    // Search for specific outcome
    const searchInput = screen.getByPlaceholderText('Search outcomes...');
    fireEvent.change(searchInput, { target: { value: 'oral' } });

    // Should show matching outcome
    expect(screen.getByText('FL1.CO.1')).toBeInTheDocument();
    expect(screen.getByText('Communicate orally in French')).toBeInTheDocument();
  });
});
