import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaginatedDataTable } from '../PaginatedDataTable';

import { vi } from 'vitest';

// Mock fetch function
const mockFetch = vi.fn();

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PaginatedDataTable', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('loads first page of data on mount', async () => {
    const mockData = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })),
      total: 100,
      page: 1,
      totalPages: 10,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sortBy: undefined,
        sortOrder: 'asc',
        filters: {},
      });
    });

    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
  });

  it('navigates to next page when next button is clicked', async () => {
    const mockData = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })),
      total: 100,
      page: 1,
      totalPages: 10,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    // Mock second page data
    const page2Data = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: i + 10, name: `Item ${i + 10}` })),
      total: 100,
      page: 2,
      totalPages: 10,
    };

    mockFetch.mockResolvedValue(page2Data);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        sortBy: undefined,
        sortOrder: 'asc',
        filters: {},
      });
    });
  });

  it('sorts data when column header is clicked', async () => {
    const mockData = {
      items: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Item ${i}` })),
      total: 100,
      page: 1,
      totalPages: 10,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Name'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        filters: {},
      });
    });
  });

  it('applies filters correctly', async () => {
    const mockData = {
      items: Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Filtered Item ${i}` })),
      total: 5,
      page: 1,
      totalPages: 1,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name', filterable: true },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Filtered Item 0')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/filter by name/i);
    fireEvent.change(filterInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sortBy: undefined,
        sortOrder: 'asc',
        filters: { name: 'test' },
      });
    });
  });

  it('displays loading state while fetching data', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });
  });

  it('handles empty results gracefully', async () => {
    const mockData = {
      items: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });

  it('handles sortable and filterable flags correctly', async () => {
    const mockData = {
      items: [{ id: 1, name: 'Test', category: 'A' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: false },
      { key: 'category', label: 'Category', filterable: true },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    // ID column should be sortable (has cursor-pointer class)
    const idHeader = screen.getByText('ID').closest('th');
    expect(idHeader).toHaveClass('cursor-pointer');

    // Name column should not be sortable
    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).not.toHaveClass('cursor-pointer');

    // Category column should have filter input
    expect(screen.getByPlaceholderText(/filter by category/i)).toBeInTheDocument();
  });

  it('handles null and undefined values in cells', async () => {
    const mockData = {
      items: [
        { id: 1, name: null, category: undefined },
        { id: 2, name: 'Item 2', category: 'Category B' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    mockFetch.mockResolvedValue(mockData);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    // Check that null/undefined values are rendered as empty strings
    const cells = screen.getAllByRole('cell');
    const nameCellContent = cells[1].textContent;
    const categoryCellContent = cells[2].textContent;
    
    expect(nameCellContent).toBe('');
    expect(categoryCellContent).toBe('');
  });

  it('shows loading overlay when refetching data', async () => {
    const mockData = {
      items: [{ id: 1, name: 'Item 1' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch
      .mockResolvedValueOnce(mockData)
      .mockReturnValueOnce(pendingPromise);

    const columns = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name', sortable: true },
    ];

    render(
      <TestWrapper>
        <PaginatedDataTable
          columns={columns}
          fetchData={mockFetch}
          pageSize={10}
        />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    // Click to sort (triggers refetch)
    fireEvent.click(screen.getByText('Name'));

    // Loading overlay should appear while keeping existing data visible
    await waitFor(() => {
      const loadingOverlay = screen.queryByTestId('loading-skeleton');
      expect(loadingOverlay).toBeInTheDocument();
    });

    // Resolve the promise to complete the test
    resolvePromise(mockData);
  });
});