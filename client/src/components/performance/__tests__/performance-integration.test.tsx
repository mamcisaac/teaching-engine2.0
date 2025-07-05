import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoadingSkeleton } from '../LoadingSkeleton';
import { OptimizedUnitPlanCard } from '../OptimizedUnitPlanCard';

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Simple integration tests to verify components render
describe('Performance Components Integration', () => {
  it('renders LoadingSkeleton component', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders LoadingSkeleton card variant', () => {
    render(<LoadingSkeleton variant="card" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
  });

  it('renders OptimizedUnitPlanCard with mock data', () => {
    const mockUnitPlan = {
      id: '1',
      title: 'Test Unit Plan',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      estimatedHours: 20,
      bigIdeas: 'Test big ideas',
      _count: {
        lessonPlans: 5,
        expectations: 3,
      },
      progress: {
        percentage: 50,
        completed: 2,
        total: 4,
      },
    };

    const mockOnEdit = () => {};

    render(
      <TestWrapper>
        <OptimizedUnitPlanCard
          unitPlan={mockUnitPlan}
          onEdit={mockOnEdit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Unit Plan')).toBeInTheDocument();
    expect(screen.getByText('20h')).toBeInTheDocument();
    expect(screen.getByText('5 lessons')).toBeInTheDocument();
    expect(screen.getByText('3 expectations')).toBeInTheDocument();
  });

  it('renders loading skeleton with different variants', () => {
    const { rerender } = render(<LoadingSkeleton variant="list" rows={3} />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    rerender(<LoadingSkeleton variant="table" rows={2} columns={3} />);
    expect(screen.getByTestId('skeleton-table-header')).toBeInTheDocument();

    rerender(<LoadingSkeleton variant="text" lines={4} />);
    expect(screen.getAllByTestId(/skeleton-text-line-/)).toHaveLength(4);
  });

  it('handles empty unit plan data gracefully', () => {
    const mockUnitPlan = {
      id: '1',
      title: 'Test Unit Plan',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      estimatedHours: 0,
      _count: {},
    };

    const mockOnEdit = () => {};

    render(
      <TestWrapper>
        <OptimizedUnitPlanCard
          unitPlan={mockUnitPlan}
          onEdit={mockOnEdit}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Unit Plan')).toBeInTheDocument();
    expect(screen.getByText('0h')).toBeInTheDocument();
    expect(screen.getByText('0 lessons')).toBeInTheDocument();
    expect(screen.getByText('0 expectations')).toBeInTheDocument();
  });
});