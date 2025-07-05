import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ProgressiveDataLoader } from '../ProgressiveDataLoader';

describe('ProgressiveDataLoader', () => {
  it('loads initial batch of data on mount', async () => {
    const mockLoadData = vi.fn().mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` })),
      hasMore: true,
    });

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    );

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith(0, 20);
      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 19')).toBeInTheDocument();
    });
  });

  it('loads more data when load more button is clicked', async () => {
    const mockLoadData = vi.fn()
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` })),
        hasMore: true,
      })
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i + 20, title: `Item ${i + 20}` })),
        hasMore: false,
      });

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /load more/i }));

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith(20, 20);
      expect(screen.getByText('Item 20')).toBeInTheDocument();
      expect(screen.getByText('Item 39')).toBeInTheDocument();
    });

    // Load more button should be hidden when no more data
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('automatically loads more data when scrolling near bottom with infinite scroll', async () => {
    const mockLoadData = vi.fn()
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` })),
        hasMore: true,
      })
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i + 20, title: `Item ${i + 20}` })),
        hasMore: false,
      });

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
        infiniteScroll={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    const container = screen.getByTestId('progressive-loader-container');
    
    // Simulate scrolling near bottom
    Object.defineProperty(container, 'scrollTop', { value: 800, writable: true });
    Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
    Object.defineProperty(container, 'clientHeight', { value: 400, writable: true });

    fireEvent.scroll(container);

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledWith(20, 20);
      expect(screen.getByText('Item 20')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching more data', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockLoadData = vi.fn().mockReturnValue(promise);

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    );

    // Initial loading state
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // Resolve initial load
    resolvePromise({
      data: Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` })),
      hasMore: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    // Mock loading more data
    const loadMorePromise = new Promise(() => {}); // Never resolves
    mockLoadData.mockReturnValue(loadMorePromise);

    fireEvent.click(screen.getByRole('button', { name: /load more/i }));

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    const mockLoadData = vi.fn().mockRejectedValue(new Error('Failed to load'));

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('retries loading when retry button is clicked', async () => {
    const mockLoadData = vi.fn()
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce({
        data: Array.from({ length: 20 }, (_, i) => ({ id: i, title: `Item ${i}` })),
        hasMore: false,
      });

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(mockLoadData).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  it('supports custom empty state', async () => {
    const mockLoadData = vi.fn().mockResolvedValue({
      data: [],
      hasMore: false,
    });

    const CustomEmptyState = () => <div>No items found</div>;

    render(
      <ProgressiveDataLoader
        loadData={mockLoadData}
        batchSize={20}
        renderItem={(item) => <div key={item.id}>{item.title}</div>}
        emptyState={<CustomEmptyState />}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });
});