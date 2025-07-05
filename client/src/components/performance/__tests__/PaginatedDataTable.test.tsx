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
});