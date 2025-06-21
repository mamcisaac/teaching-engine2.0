import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { UncoveredOutcomesPanel } from '../UncoveredOutcomesPanel';
import { apiClient } from '../../../lib/api';

// Mock the API client
vi.mock('../../../lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Add proper type for mocked functions
const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

describe('UncoveredOutcomesPanel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} {...props} />
      </QueryClientProvider>,
    );
  };

  it('should display loading state initially', () => {
    mockedGet.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display uncovered outcomes', async () => {
    const mockOutcomes = [
      {
        outcome: {
          id: '1',
          code: 'FR1.1',
          subject: 'Français',
          description: 'Comprendre des messages oraux',
          grade: 1,
        },
        suggestion: null,
      },
      {
        outcome: {
          id: '2',
          code: 'MA1.1',
          subject: 'Mathématiques',
          description: "Compter jusqu'à 20",
          grade: 1,
        },
        suggestion: null,
      },
    ];

    mockedGet.mockResolvedValue({ data: mockOutcomes } as never);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('FR1.1')).toBeInTheDocument();
      expect(screen.getByText('Comprendre des messages oraux')).toBeInTheDocument();
      expect(screen.getByText('MA1.1')).toBeInTheDocument();
      expect(screen.getByText('2 outcomes need attention')).toBeInTheDocument();
    });
  });

  it('should display success message when all outcomes are covered', async () => {
    mockedGet.mockResolvedValue({ data: [] } as never);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Tous les résultats couverts!')).toBeInTheDocument();
      expect(screen.getByText(/All curriculum outcomes have been addressed/)).toBeInTheDocument();
    });
  });

  it('should generate AI suggestion when button is clicked', async () => {
    const mockOutcome = {
      outcome: {
        id: '1',
        code: 'FR1.1',
        subject: 'Français',
        description: 'Test outcome',
        grade: 1,
      },
      suggestion: null,
    };

    const mockSuggestion = {
      id: 1,
      outcomeId: '1',
      title: 'Cherchons le printemps!',
      descriptionFr: 'Une activité sur le printemps',
      duration: 30,
      materials: ['papier', 'crayons'],
    };

    mockedGet.mockResolvedValue({ data: [mockOutcome] } as never);
    mockedPost.mockResolvedValue({ data: mockSuggestion } as never);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Suggest Activity')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Suggest Activity'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/ai-suggestions/generate', {
        outcomeId: '1',
        theme: undefined,
      });
    });
  });

  it('should call onSelectSuggestion when activity is selected', async () => {
    const mockOnSelect = vi.fn();
    const mockOutcome = {
      outcome: {
        id: '1',
        code: 'FR1.1',
        subject: 'Français',
        description: 'Test outcome',
        grade: 1,
      },
      suggestion: {
        id: 1,
        title: 'Test Activity',
        descriptionFr: 'Description',
        duration: 30,
        materials: ['paper'],
      },
    };

    mockedGet.mockResolvedValue({ data: [mockOutcome] } as never);

    renderComponent({ onSelectSuggestion: mockOnSelect });

    await waitFor(() => {
      expect(screen.getByText('Use this activity')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Use this activity'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockOutcome.suggestion);
  });

  it('should pass date filters to API', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    mockedGet.mockResolvedValue({ data: [] } as never);

    renderComponent({ startDate, endDate });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('startDate=2024-01-01'));
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('endDate=2024-01-07'));
    });
  });
});
