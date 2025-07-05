import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { VirtualizedList } from '../VirtualizedList';

// Mock data generator
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
    description: `Description for item ${i}`,
    category: i % 3 === 0 ? 'Category A' : i % 3 === 1 ? 'Category B' : 'Category C',
    date: new Date(Date.now() - i * 86400000).toISOString(),
  }));
};

describe('VirtualizedList', () => {
  it('renders only visible items with large dataset', async () => {
    const mockData = generateMockData(1000);
    const renderItem = vi.fn(({ item }) => (
      <div data-testid={`item-${item.id}`} key={item.id}>
        {item.title}
      </div>
    ));

    render(
      <VirtualizedList
        items={mockData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    // Should only render visible items (approximately 8-10 items for 400px height with 50px item height)
    expect(renderItem).toHaveBeenCalledTimes(expect.any(Number));
    expect(renderItem.mock.calls.length).toBeLessThan(20);
    expect(renderItem.mock.calls.length).toBeGreaterThan(5);
  });

  it('maintains scroll position when items are updated', async () => {
    const mockData = generateMockData(100);
    const renderItem = ({ item }) => (
      <div data-testid={`item-${item.id}`} key={item.id}>
        {item.title}
      </div>
    );

    const { rerender } = render(
      <VirtualizedList
        items={mockData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    const container = screen.getByTestId('virtualized-list-container');
    
    // Scroll to middle
    fireEvent.scroll(container, { target: { scrollTop: 1000 } });
    
    await waitFor(() => {
      expect(container.scrollTop).toBe(1000);
    });

    // Update data
    const updatedData = generateMockData(120);
    rerender(
      <VirtualizedList
        items={updatedData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    // Scroll position should be maintained
    expect(container.scrollTop).toBe(1000);
  });

  it('handles empty data gracefully', () => {
    const renderItem = ({ item }) => <div>{item.title}</div>;

    render(
      <VirtualizedList
        items={[]}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('virtualized-list-container')).toBeInTheDocument();
  });

  it('calls onScrollEnd when scrolling stops', async () => {
    const mockData = generateMockData(100);
    const onScrollEnd = vi.fn();
    const renderItem = ({ item }) => <div>{item.title}</div>;

    render(
      <VirtualizedList
        items={mockData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
        onScrollEnd={onScrollEnd}
      />
    );

    const container = screen.getByTestId('virtualized-list-container');
    
    // Simulate scroll
    fireEvent.scroll(container, { target: { scrollTop: 500 } });
    
    // Wait for debounced scroll end
    await waitFor(() => {
      expect(onScrollEnd).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it('optimizes rendering performance with memoization', () => {
    const mockData = generateMockData(50);
    const renderItem = vi.fn(({ item }) => <div>{item.title}</div>);

    const { rerender } = render(
      <VirtualizedList
        items={mockData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    const initialCallCount = renderItem.mock.calls.length;

    // Re-render with same data
    rerender(
      <VirtualizedList
        items={mockData}
        itemHeight={50}
        height={400}
        renderItem={renderItem}
      />
    );

    // Should not re-render items unnecessarily
    expect(renderItem.mock.calls.length).toBe(initialCallCount);
  });
});