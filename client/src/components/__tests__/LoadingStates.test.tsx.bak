import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { 
  LoadingSpinner, 
  PageLoader, 
  CardSkeleton, 
  TableSkeleton,
  FormSkeleton,
  TabContentSkeleton,
  LessonPlanSkeleton,
  UnitPlanSkeleton,
  EmptyState,
  RetryLoad
} from '../LoadingStates';

describe('LoadingStates', () => {
  describe('LoadingSpinner', () => {
    describe('strict boolean expressions', () => {
      it('should handle message prop with explicit checks', () => {
        const { rerender } = render(<LoadingSpinner />);
        
        // No message - should not render message
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
        
        // With message
        rerender(<LoadingSpinner message="Loading data..." />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
        
        // With undefined message
        rerender(<LoadingSpinner message={undefined} />);
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
        
        // With empty string message (should not render)
        rerender(<LoadingSpinner message="" />);
        expect(screen.queryByText(/^$/)).not.toBeInTheDocument();
      });

      it('should handle size prop with default value', () => {
        render(<LoadingSpinner />);
        
        const spinner = screen.getByRole('status', { hidden: true });
        expect(spinner).toHaveClass('h-8 w-8'); // default 'md' size
      });

      it('should handle optional className prop', () => {
        const { rerender } = render(<LoadingSpinner className="custom-class" />);
        
        const container = screen.getByRole('status', { hidden: true }).parentElement;
        expect(container).toHaveClass('custom-class');
        
        // With undefined className
        rerender(<LoadingSpinner className={undefined} />);
        expect(container).toBeInTheDocument();
      });
    });

    describe('component behavior', () => {
      it('should render with different sizes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />);
        let spinner = screen.getByRole('status', { hidden: true });
        expect(spinner).toHaveClass('h-4 w-4');
        
        rerender(<LoadingSpinner size="md" />);
        spinner = screen.getByRole('status', { hidden: true });
        expect(spinner).toHaveClass('h-8 w-8');
        
        rerender(<LoadingSpinner size="lg" />);
        spinner = screen.getByRole('status', { hidden: true });
        expect(spinner).toHaveClass('h-12 w-12');
      });
    });
  });

  describe('EmptyState', () => {
    describe('strict boolean expressions', () => {
      it('should handle optional icon prop with explicit checks', () => {
        const { rerender } = render(
          <EmptyState title="No data" description="Add some data to get started" />
        );
        
        // No icon - icon container should not render
        expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
        
        // With icon
        rerender(
          <EmptyState 
            icon={<div data-testid="custom-icon">Icon</div>} 
            title="No data" 
            description="Add some data" 
          />
        );
        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        
        // With null icon
        rerender(
          <EmptyState 
            icon={null} 
            title="No data" 
            description="Add some data" 
          />
        );
        expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
      });

      it('should handle optional action prop with explicit checks', () => {
        const { rerender } = render(
          <EmptyState title="No data" description="Add some data to get started" />
        );
        
        // No action - action container should not render
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        
        // With action
        rerender(
          <EmptyState 
            title="No data" 
            description="Add some data" 
            action={<button>Add Data</button>}
          />
        );
        expect(screen.getByText('Add Data')).toBeInTheDocument();
        
        // With null action
        rerender(
          <EmptyState 
            title="No data" 
            description="Add some data" 
            action={null}
          />
        );
        expect(screen.queryByText('Add Data')).not.toBeInTheDocument();
      });
    });

    describe('component behavior', () => {
      it('should render title and description', () => {
        render(
          <EmptyState 
            title="No results found" 
            description="Try adjusting your search criteria" 
          />
        );
        
        expect(screen.getByText('No results found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
      });
    });
  });

  describe('RetryLoad', () => {
    it('should handle retry callback', () => {
      const mockRetry = vi.fn();
      render(<RetryLoad onRetry={mockRetry} />);
      
      const button = screen.getByText('Try Again');
      fireEvent.click(button);
      
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should display custom message', () => {
      render(<RetryLoad onRetry={() => {}} message="Network error occurred" />);
      
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should display default message when not provided', () => {
      render(<RetryLoad onRetry={() => {}} />);
      
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  describe('Skeleton components', () => {
    it('should render CardSkeleton with specified count', () => {
      render(<CardSkeleton count={3} />);
      
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(3);
    });

    it('should render TableSkeleton with specified rows and columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={5} />);
      
      // Check header columns
      const headerCells = container.querySelectorAll('.bg-gray-50 .flex > div');
      expect(headerCells).toHaveLength(5);
      
      // Check body rows
      const bodyRows = container.querySelectorAll('.divide-y > div');
      expect(bodyRows).toHaveLength(3);
    });

    it('should render PageLoader with custom message', () => {
      render(<PageLoader message="Loading your data..." />);
      
      expect(screen.getByText('Loading your data...')).toBeInTheDocument();
    });

    it('should render FormSkeleton', () => {
      const { container } = render(<FormSkeleton />);
      
      // Should have form field skeletons
      const fieldSkeletons = container.querySelectorAll('.space-y-6 > div');
      expect(fieldSkeletons.length).toBeGreaterThan(0);
    });

    it('should render TabContentSkeleton', () => {
      const { container } = render(<TabContentSkeleton />);
      
      // Should have content skeletons
      const contentLines = container.querySelectorAll('.space-y-4 > div');
      expect(contentLines.length).toBeGreaterThan(0);
    });

    it('should render LessonPlanSkeleton with three sections', () => {
      render(<LessonPlanSkeleton />);
      
      // Should have 3 cards for lesson sections
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(3);
    });

    it('should render UnitPlanSkeleton', () => {
      render(<UnitPlanSkeleton />);
      
      // Should render 6 card skeletons
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(6);
    });
  });
});