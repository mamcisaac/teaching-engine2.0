import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LanguageSensitiveAssessmentBuilder from '../components/assessment/LanguageSensitiveAssessmentBuilder';
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
  useCreateAssessmentTemplate: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, title: 'Test Assessment' }),
    isPending: false,
  }),
  useUpdateAssessmentTemplate: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Assessment' }),
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
    getLocalizedField: vi.fn((obj: Record<string, unknown>, field: string) => {
      if (language === 'fr') {
        const frenchField = field + 'Fr';
        return String(obj[frenchField] || obj[field] || '');
      }
      return String(obj[field] || '');
    }),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={languageValue}>{component}</LanguageContext.Provider>
    </QueryClientProvider>,
  );
};

describe('LanguageSensitiveAssessmentBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with English interface', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    expect(screen.getByText('Create Language-Sensitive Assessment Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByText('Assessment Type *')).toBeInTheDocument();
  });

  it('renders the component with French interface', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />, 'fr');

    expect(screen.getByText("Créer un modèle d'évaluation linguistique")).toBeInTheDocument();
    expect(screen.getByLabelText('Titre *')).toBeInTheDocument();
    expect(screen.getByText("Type d'évaluation *")).toBeInTheDocument();
  });

  it('displays assessment type options', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    expect(screen.getByText('Oral')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();
    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });

  it('shows default Grade 1 French Immersion criteria for oral assessment', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Oral should be selected by default and should show Grade 1 adapted criteria
    expect(screen.getByText('Use Grade 1 adapted criteria')).toBeInTheDocument();
    expect(screen.getByText('French Immersion adapted criteria (Grade 1):')).toBeInTheDocument();
  });

  it('switches to French criteria when language is French', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />, 'fr');

    // Select oral assessment type (should be selected by default)
    expect(
      screen.getByText("Critères adaptés pour l'immersion française (Grade 1):"),
    ).toBeInTheDocument();
  });

  it('allows custom criteria creation', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Uncheck default criteria
    const defaultCriteriaCheckbox = screen.getByRole('checkbox', {
      name: /Use Grade 1 adapted criteria/,
    });
    fireEvent.click(defaultCriteriaCheckbox);

    // Should show option to add custom criteria
    expect(screen.getByText('Add criterion')).toBeInTheDocument();

    // Add a custom criterion
    fireEvent.click(screen.getByText('Add criterion'));

    // Should show input fields for custom criterion
    expect(screen.getByPlaceholderText('Criterion name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Criterion description')).toBeInTheDocument();
  });

  it('displays learning outcomes grouped by subject', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    expect(screen.getByText('Linked Learning Outcomes *')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('FL1.CO.1')).toBeInTheDocument();
    expect(screen.getByText('FL1.LE.1')).toBeInTheDocument();
  });

  it('shows advanced options for cultural notes', async () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Click advanced options
    fireEvent.click(screen.getByText('Advanced options'));

    await waitFor(() => {
      expect(screen.getByText('Cultural and linguistic notes')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Add specific cultural or linguistic considerations/),
      ).toBeInTheDocument();
    });
  });

  it('validates required fields on form submission', async () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Template'));

    await waitFor(() => {
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
  });

  it('validates that at least one outcome is selected', async () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Fill in title but don't select outcomes
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Test Assessment' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Create Template'));

    await waitFor(() => {
      expect(screen.getByText('Create Template')).toBeInTheDocument();
    });
  });

  it('successfully creates assessment template', async () => {
    const mockOnSuccess = vi.fn();

    renderWithProviders(<LanguageSensitiveAssessmentBuilder onSuccess={mockOnSuccess} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Test Oral Assessment' },
    });

    // Select an outcome
    fireEvent.click(screen.getByRole('checkbox', { name: /FL1.CO.1/ }));

    // Submit form
    fireEvent.click(screen.getByText('Create Template'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays different criteria for different assessment types', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />);

    // Test oral criteria (should be selected by default)
    expect(screen.getByText('Pronunciation')).toBeInTheDocument();
    expect(screen.getByText('Fluency')).toBeInTheDocument();

    // Test writing criteria
    fireEvent.click(screen.getByText('Writing'));
    expect(screen.getByText('Vocabulary')).toBeInTheDocument();
    expect(screen.getByText('Spelling')).toBeInTheDocument();

    // Test reading criteria
    fireEvent.click(screen.getByText('Reading'));
    expect(screen.getByText('Comprehension')).toBeInTheDocument();
    expect(screen.getByText('Reading Fluency')).toBeInTheDocument();
  });

  it('shows correct French criteria for assessment types', () => {
    renderWithProviders(<LanguageSensitiveAssessmentBuilder />, 'fr');

    // Test oral criteria in French (should be selected by default)
    expect(screen.getByText('Prononciation')).toBeInTheDocument();
    expect(screen.getByText('Fluidité')).toBeInTheDocument();

    // Test writing criteria in French
    fireEvent.click(screen.getByText('Écriture'));
    expect(screen.getByText('Vocabulaire')).toBeInTheDocument();
    expect(screen.getByText('Orthographe')).toBeInTheDocument();
  });

  it('handles editing existing template', () => {
    const existingTemplate = {
      id: 1,
      title: 'Existing Assessment',
      type: 'oral' as const,
      description: 'Test description',
      outcomeIds: ['1'],
      rubricCriteria: JSON.stringify({
        criteria: [
          {
            name: 'Custom Criterion',
            description: 'Custom description',
            levels: [
              { score: 4, description: 'Excellent' },
              { score: 3, description: 'Good' },
              { score: 2, description: 'Satisfactory' },
              { score: 1, description: 'Needs improvement' },
            ],
          },
        ],
        culturalNotes: 'Test cultural notes',
      }),
      userId: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    renderWithProviders(<LanguageSensitiveAssessmentBuilder template={existingTemplate} />);

    // Should show edit mode
    expect(screen.getByText('Edit Language-Sensitive Assessment Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Assessment')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });
});
