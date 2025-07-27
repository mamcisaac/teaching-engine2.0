import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders default skeleton layout', () => {
    render(<LoadingSkeleton />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toHaveClass('animate-pulse');
  });

  it('renders card variant with title and content areas', () => {
    render(<LoadingSkeleton variant="card" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // Should have title and content skeleton areas
    const titleSkeleton = screen.getByTestId('skeleton-title');
    const contentSkeleton = screen.getByTestId('skeleton-content');
    
    expect(titleSkeleton).toBeInTheDocument();
    expect(contentSkeleton).toBeInTheDocument();
  });

  it('renders list variant with multiple rows', () => {
    render(<LoadingSkeleton variant="list" rows={5} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // Should have 5 skeleton rows
    const rows = screen.getAllByTestId(/skeleton-row-/);
    expect(rows).toHaveLength(5);
  });

  it('renders table variant with headers and rows', () => {
    render(<LoadingSkeleton variant="table" rows={3} columns={4} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // Should have header skeleton
    const header = screen.getByTestId('skeleton-table-header');
    expect(header).toBeInTheDocument();
    
    // Should have correct number of rows and columns
    const rows = screen.getAllByTestId(/skeleton-table-row-/);
    expect(rows).toHaveLength(3);
    
    // Each row should have 4 cells
    rows.forEach((row, index) => {
      const cells = screen.getAllByTestId(`skeleton-table-cell-${index}-`);
      expect(cells).toHaveLength(4);
    });
  });

  it('renders text variant with multiple lines', () => {
    render(<LoadingSkeleton variant="text" lines={3} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // Should have 3 text lines
    const lines = screen.getAllByTestId(/skeleton-text-line-/);
    expect(lines).toHaveLength(3);
  });

  it('applies custom className', () => {
    render(<LoadingSkeleton className="custom-skeleton" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSkeleton size="sm" />);
    
    let skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('h-4'); // Small size
    
    rerender(<LoadingSkeleton size="md" />);
    skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('h-6'); // Medium size
    
    rerender(<LoadingSkeleton size="lg" />);
    skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('h-8'); // Large size
  });

  it('renders without animation when specified', () => {
    render(<LoadingSkeleton animate={false} />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).not.toHaveClass('animate-pulse');
  });

  it('renders avatar variant with circular shape', () => {
    render(<LoadingSkeleton variant="avatar" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders with custom height and width', () => {
    render(<LoadingSkeleton height="100px" width="200px" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveStyle({
      height: '100px',
      width: '200px',
    });
  });

  it('supports accessibility features', () => {
    render(<LoadingSkeleton aria-label="Loading content" />);
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    expect(skeleton).toHaveAttribute('role', 'status');
  });

  it('renders complex layout with mixed content types', () => {
    render(
      <LoadingSkeleton 
        variant="complex"
        layout={[
          { type: 'avatar', size: 'md' },
          { type: 'text', lines: 2 },
          { type: 'button', width: '100px' },
        ]}
      />
    );
    
    const skeleton = screen.getByTestId('loading-skeleton');
    expect(skeleton).toBeInTheDocument();
    
    // Should have avatar, text, and button skeleton components
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-button')).toBeInTheDocument();
  });
});