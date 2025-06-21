import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ActivitySuggestions } from '../../ActivitySuggestions';
import { useActivitySuggestions } from '../../../api';

// Mock the toast hook
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the API hooks
vi.mock('../../../api', () => ({
  useActivitySuggestions: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('ActivitySuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock loading state
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: true,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: true,
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      status: 'loading',
      fetchStatus: 'fetching',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1']} 
      />, 
      { wrapper }
    );

    expect(screen.getByText('Activity Suggestions')).toBeInTheDocument();
    // Check for loading animation - component shows divs with animate-pulse class
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays suggestions when data loads', async () => {
    const mockSuggestions = [
      {
        id: 1,
        titleFr: 'Activité 1',
        titleEn: 'Activity 1',
        descriptionFr: 'Description FR',
        descriptionEn: 'Description EN',
        domain: 'reading',
        subject: 'english',
        outcomeIds: ['EN4.1'],
        groupType: 'Small group',
        prepTimeMin: 15,
        relevanceScore: 0.85,
      },
    ];

    // Mock suggestions data
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: mockSuggestions,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      status: 'success',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['EN4.1']} 
      />, 
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
      expect(screen.getByText('Description EN')).toBeInTheDocument();
      expect(screen.getByText('High Match')).toBeInTheDocument();
      expect(screen.getByText('⏱️ 15min')).toBeInTheDocument();
    });
  });

  it('handles add to plan action', async () => {
    const mockAddToPlanner = vi.fn();
    const mockSuggestions = [
      {
        id: 1,
        titleFr: 'Activité 1',
        titleEn: 'Activity 1',
        descriptionFr: 'Description FR',
        descriptionEn: 'Description EN',
        domain: 'reading',
        subject: 'english',
        outcomeIds: ['EN4.1'],
        groupType: 'Small group',
      },
    ];

    // Mock suggestions data
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: mockSuggestions,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      status: 'success',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['EN4.1']} 
        onAddToPlanner={mockAddToPlanner}
      />, 
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeInTheDocument();
    });

    const addButton = screen.getByText('📅 Add to Plan');
    fireEvent.click(addButton);

    expect(mockAddToPlanner).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      titleEn: 'Activity 1',
      domain: 'reading',
      subject: 'english',
    }));
  });

  it('shows show more button when suggestions exceed limit', async () => {
    // Mock suggestions that exceed the default limit
    const manySuggestions = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      titleFr: `Activité ${i + 1}`,
      titleEn: `Activity ${i + 1}`,
      descriptionFr: 'Description FR',
      descriptionEn: 'Description EN',
      domain: 'reading',
      subject: 'english',
      outcomeIds: ['EN4.1'],
      groupType: 'Small group',
    }));

    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: manySuggestions.slice(0, 5), // Show only first 5
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      status: 'success',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['EN4.1']} 
      />, 
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock error state
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Server error'),
      isError: true,
      isSuccess: false,
      failureCount: 1,
      failureReason: new Error('Server error'),
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      status: 'error',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1']} 
      />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(screen.getByText('Failed to load suggestions. Please try again later.')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows empty state when no suggestions', async () => {
    // Mock empty suggestions
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      status: 'success',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1']} 
      />, 
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('No matching activity suggestions found. Try broadening your criteria.')).toBeInTheDocument();
    });
  });

  it('respects language preference', async () => {
    const mockSuggestions = [
      {
        id: 1,
        titleFr: 'Titre Français',
        titleEn: 'English Title',
        descriptionFr: 'Description française',
        descriptionEn: 'English description',
        domain: 'reading',
        subject: 'francais',
        outcomeIds: ['FR4.1'],
        groupType: 'Whole class',
      },
    ];

    // Mock suggestions with French data
    vi.mocked(useActivitySuggestions).mockReturnValue({
      data: mockSuggestions,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      failureCount: 0,
      failureReason: null,
      refetch: vi.fn(),
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isPaused: false,
      isPlaceholderData: false,
      isPending: false,
      isInitialLoading: false,
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      status: 'success',
      fetchStatus: 'idle',
    });

    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1']} 
      />, 
      { wrapper }
    );

    await waitFor(() => {
      // The component shows both English and French titles
      expect(screen.getByText('English Title')).toBeInTheDocument();
      expect(screen.getByText('Titre Français')).toBeInTheDocument();
      // But only English description is shown
      expect(screen.getByText('English description')).toBeInTheDocument();
    });
  });
});