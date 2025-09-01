import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import PlanningCascadeView from '../PerfectCascadeView';
import { useCascadeStore } from '../../../stores/cascadeStore';

// Mock dependencies
vi.mock('../../../api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('react-responsive', () => ({
  useMediaQuery: () => false, // Default to desktop
}));

vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemSize, height, width }: any) => (
    <div data-testid="virtualized-list" style={{ height, width }}>
      {Array.from({ length: Math.min(itemCount, 10) }, (_, index) =>
        children({ index, style: { height: itemSize } })
      )}
    </div>
  ),
}));

vi.mock('react-virtualized-auto-sizer', () => ({
  default: ({ children }: any) => children({ height: 600, width: 800 }),
}));

const mockRootData = {
  longRangePlans: [
    {
      id: 'lrp-1',
      label: 'French Immersion Year Plan',
      type: 'lrp',
      hasChildren: true,
      childrenCount: 5,
      data: {
        id: 'lrp-1',
        title: 'French Immersion Year Plan',
        subject: 'Français',
        academicYear: '2024-2025',
        grade: 1,
      },
    },
  ],
  curriculumSummary: {
    total: 68,
    bySubject: {
      'Français': 15,
      'Mathématiques': 20,
    },
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PlanningCascadeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Zustand store
    useCascadeStore.setState({
      expandedNodes: new Set(),
      selectedNode: null,
      filters: {},
      searchQuery: '',
      loadingNodes: new Set(),
      errorNodes: new Map(),
    });
  });

  it('renders loading state initially', () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PlanningCascadeView />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders the cascade view with data', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Planning Cascade View')).toBeInTheDocument();
    });

    expect(screen.getByText('French Immersion Year Plan')).toBeInTheDocument();
    expect(screen.getByText(/Curriculum Expectations/)).toBeInTheDocument();
  });

  it('handles node expansion', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('French Immersion Year Plan')).toBeInTheDocument();
    });

    // Find and click expand button
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);

    // Check that node is expanded in store
    const state = useCascadeStore.getState();
    expect(state.expandedNodes.has('lrp-1')).toBe(true);
  });

  it('handles node selection', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('French Immersion Year Plan')).toBeInTheDocument();
    });

    // Click on the node
    const node = screen.getByText('French Immersion Year Plan');
    fireEvent.click(node);

    // Check that node is selected in store
    const state = useCascadeStore.getState();
    expect(state.selectedNode?.id).toBe('lrp-1');
  });

  it('handles filter changes', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Planning Cascade View')).toBeInTheDocument();
    });

    // Change academic year filter
    const yearSelect = screen.getByRole('combobox', { name: /year/i });
    fireEvent.change(yearSelect, { target: { value: '2024-2025' } });

    // Check that filter is applied in store
    const state = useCascadeStore.getState();
    expect(state.filters.academicYear).toBe('2024-2025');
  });

  it('displays error state with retry', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockRejectedValue(new Error('Network error'));

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load planning cascade/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Planning Cascade View')).toBeInTheDocument();
    });

    // Open search
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search curriculum/i);
    await userEvent.type(searchInput, 'Math');

    // Check that search query is set in store
    await waitFor(() => {
      const state = useCascadeStore.getState();
      expect(state.searchQuery).toBe('Math');
    });
  });

  it('supports keyboard navigation', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    const tree = screen.getByRole('tree');
    
    // Test arrow down navigation
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    
    // Test expand with arrow right
    fireEvent.keyDown(tree, { key: 'ArrowRight' });
    
    // Test collapse with arrow left
    fireEvent.keyDown(tree, { key: 'ArrowLeft' });
    
    // Test selection with Enter
    fireEvent.keyDown(tree, { key: 'Enter' });
  });

  it('persists and loads state from localStorage', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({ data: mockRootData });

    // Set some state in localStorage
    const savedState = {
      expandedNodes: ['lrp-1'],
      filters: { subject: 'Français' },
      viewMode: 'tree',
      showCompleted: true,
      showProgress: true,
    };
    localStorage.setItem('cascade-view-state', JSON.stringify(savedState));

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Planning Cascade View')).toBeInTheDocument();
    });

    // Check that state was loaded
    const state = useCascadeStore.getState();
    expect(state.expandedNodes.has('lrp-1')).toBe(true);
    expect(state.filters.subject).toBe('Français');
  });

  it('handles progressive data loading', async () => {
    const { apiClient } = require('../../../api/core/client');
    
    // First call returns root data
    apiClient.get.mockResolvedValueOnce({ data: mockRootData });
    
    // Second call returns children
    apiClient.get.mockResolvedValueOnce({
      data: {
        children: [
          {
            id: 'unit-1',
            label: 'Unit 1: Introduction',
            type: 'unit',
            hasChildren: false,
            data: { title: 'Unit 1: Introduction' },
          },
        ],
        pagination: { total: 1, limit: 50, offset: 0, hasMore: false },
      },
    });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('French Immersion Year Plan')).toBeInTheDocument();
    });

    // Expand the LRP node
    const expandButton = screen.getByRole('button', { name: /expand/i });
    fireEvent.click(expandButton);

    // Wait for children to load
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/node/lrp-1/children'),
        expect.any(Object)
      );
    });
  });

  it('displays empty state with CTA', async () => {
    const { apiClient } = require('../../../api/core/client');
    apiClient.get.mockResolvedValue({
      data: {
        longRangePlans: [],
        curriculumSummary: { total: 0, bySubject: {} },
      },
    });

    render(<PlanningCascadeView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/No planning data available/)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Create Your First Long Range Plan/i })).toBeInTheDocument();
  });
});