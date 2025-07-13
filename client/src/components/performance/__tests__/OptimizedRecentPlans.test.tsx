import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OptimizedRecentPlans } from '../OptimizedRecentPlans';
import type { RecentPlan } from '../OptimizedRecentPlans';
import { vi } from 'vitest';

// Mock date functions
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago')
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('OptimizedRecentPlans', () => {
  const mockPlans: RecentPlan[] = [
    {
      id: '1',
      type: 'lesson' as const,
      title: 'Test Lesson Plan',
      subject: 'Mathematics',
      grade: 5,
      lastAccessed: '2024-01-15T10:00:00',
      progress: 75,
      status: 'in-progress' as const,
      parentTitle: 'Unit Plan'
    },
    {
      id: '2',
      type: 'unit' as const,
      title: 'Test Unit Plan',
      subject: undefined,
      grade: undefined,
      lastAccessed: '2024-01-14T10:00:00',
      progress: 50,
      status: 'draft' as const,
      parentTitle: undefined
    },
    {
      id: '3',
      type: 'long-range' as const,
      title: 'Year Plan',
      subject: 'Science',
      grade: 6,
      lastAccessed: '2024-01-13T10:00:00',
      progress: 100,
      status: 'completed' as const,
      parentTitle: ''
    }
  ];

  it('renders recent plans with all fields', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={mockPlans}
          isLoading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Lesson Plan')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Grade 5')).toBeInTheDocument();
    expect(screen.getByText('in Unit Plan')).toBeInTheDocument();
  });

  it('handles null subject gracefully', () => {
    const plansWithNullSubject = [{
      ...mockPlans[1]
    }];

    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={plansWithNullSubject}
          isLoading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Unit Plan')).toBeInTheDocument();
    // Should not render subject when null
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('handles null grade gracefully', () => {
    const plansWithNullGrade = [{
      ...mockPlans[1]
    }];

    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={plansWithNullGrade}
          isLoading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Test Unit Plan')).toBeInTheDocument();
    // Should not render grade when null
    expect(screen.queryByText(/Grade/)).not.toBeInTheDocument();
  });

  it('handles empty parentTitle gracefully', () => {
    const plansWithEmptyParent = [{
      ...mockPlans[2]
    }];

    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={plansWithEmptyParent}
          isLoading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Year Plan')).toBeInTheDocument();
    // Should not render "in" text when parentTitle is empty
    expect(screen.queryByText(/^in /)).not.toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={[]}
          isLoading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Plans')).toBeInTheDocument();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('handles undefined isLoading as false', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={mockPlans}
          isLoading={undefined}
        />
      </TestWrapper>
    );

    // Should render plans, not loading state
    expect(screen.getByText('Test Lesson Plan')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('shows empty state when no plans', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={[]}
          isLoading={false}
        />
      </TestWrapper>
    );

    expect(screen.getByText('No recent plans found')).toBeInTheDocument();
    expect(screen.getByText('Start by creating a new lesson, unit, or long-range plan.')).toBeInTheDocument();
  });

  it('renders status badges correctly', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={mockPlans}
          isLoading={false}
        />
      </TestWrapper>
    );

    // Check for status badges
    expect(screen.getByText('75%')).toBeInTheDocument(); // in-progress
    expect(screen.getByText('Draft')).toBeInTheDocument(); // draft
    expect(screen.getByText('Completed')).toBeInTheDocument(); // completed
  });

  it('handles compact mode', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={mockPlans}
          isLoading={false}
          compact={true}
        />
      </TestWrapper>
    );

    // Should still render but with compact styling
    expect(screen.getByText('Test Lesson Plan')).toBeInTheDocument();
  });

  it('respects showViewAll prop', () => {
    render(
      <TestWrapper>
        <OptimizedRecentPlans
          plans={mockPlans}
          isLoading={false}
          showViewAll={false}
        />
      </TestWrapper>
    );

    // Should not show "View all" button when showViewAll is false
    expect(screen.queryByText('View all')).not.toBeInTheDocument();
  });
});