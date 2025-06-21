import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ActivityLibrary } from '../../ActivityLibrary';
import { api } from '../../../api';

// Mock the toast hook
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the API
vi.mock('../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockActivities = [
  {
    id: 1,
    titleFr: 'Lecture guidée',
    titleEn: 'Guided Reading',
    descriptionFr: 'Activité de lecture en petit groupe',
    descriptionEn: 'Small group reading activity',
    domain: 'reading',
    subject: 'francais',
    outcomeIds: ['FR4.1', 'FR4.2'],
    materialsFr: 'Livres, carnets',
    materialsEn: 'Books, notebooks',
    prepTimeMin: 20,
    groupType: 'Small group',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 2,
    titleFr: 'Écriture créative',
    titleEn: 'Creative Writing',
    descriptionFr: "Exercice d'écriture créative",
    descriptionEn: 'Creative writing exercise',
    domain: 'writing',
    subject: 'francais',
    outcomeIds: ['FR4.3'],
    prepTimeMin: 15,
    groupType: 'Individual',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z',
  },
];

describe('ActivityLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    queryClient.clear();
  });

  it('renders library header and controls', async () => {
    const mockOnCreateNew = vi.fn();
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });

    render(<ActivityLibrary showCreateButton={true} onCreateNew={mockOnCreateNew} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Activity Library')).toBeInTheDocument();
    });

    expect(screen.getByText('Browse and manage your activity templates')).toBeInTheDocument();
    expect(screen.getByText('New Activity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search activities...')).toBeInTheDocument();
  });

  it('displays activities in grid view', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockActivities });

    render(<ActivityLibrary defaultView="grid" language="en" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Guided Reading')).toBeInTheDocument();
    });

    expect(screen.getByText('Creative Writing')).toBeInTheDocument();
    expect(screen.getByText('Small group reading activity')).toBeInTheDocument();
    expect(screen.getByText('20m')).toBeInTheDocument();
    expect(screen.getByText('2 outcomes')).toBeInTheDocument();
  });

  it('shows empty state when no activities', async () => {
    const mockOnCreateNew = vi.fn();
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });

    render(<ActivityLibrary showCreateButton={true} onCreateNew={mockOnCreateNew} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('No activities found')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Get started by creating your first activity template.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Create New Activity')).toBeInTheDocument();
  });

  it('handles create new activity', async () => {
    const mockOnCreateNew = vi.fn();

    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [] });

    render(<ActivityLibrary showCreateButton={true} onCreateNew={mockOnCreateNew} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('New Activity')).toBeInTheDocument();
    });

    const newButton = screen.getByText('New Activity');
    fireEvent.click(newButton);

    expect(mockOnCreateNew).toHaveBeenCalled();
  });

  it('handles loading state', () => {
    (api.get as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ActivityLibrary />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load activity library. Please try again.'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('respects language preference', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockActivities });

    render(<ActivityLibrary language="fr" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Lecture guidée')).toBeInTheDocument();
    });

    expect(screen.getByText('Écriture créative')).toBeInTheDocument();
  });

  it('shows activity count', async () => {
    (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockActivities });

    render(<ActivityLibrary language="en" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('2 activities found')).toBeInTheDocument();
    });
  });
});
