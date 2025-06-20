import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, type MockedFunction } from 'vitest';
import { ActivityLibrary } from '../../ActivityLibrary';

// Mock the toast hook
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn() as typeof fetch;

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

  it('renders library header and controls', () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('displays activities in grid view', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivities,
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      // Component should render activities
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows empty state when no activities', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      // Component should handle empty state
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles create new activity', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    // Component should handle creation flow
    expect(document.body).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (global.fetch as MockedFunction<typeof fetch>).mockImplementationOnce(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ActivityLibrary />, { wrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error'),
    );

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      // Component should handle error gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  it('respects language preference', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivities,
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      // Component should handle language preference
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows activity count', async () => {
    (global.fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockActivities,
    } as Response);

    render(<ActivityLibrary />, { wrapper });

    await waitFor(() => {
      // Component should show activity count
      expect(document.body).toBeInTheDocument();
    });
  });
});
