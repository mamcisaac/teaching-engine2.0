import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OralRoutineSummary } from '../OralRoutineSummary';

// Mock the routine stats hook
vi.mock('../../api/domains/routine/hooks', () => ({
  useRoutineStats: vi.fn(),
}));

import { useRoutineStats } from '../../api/domains/routine/hooks';

describe('OralRoutineSummary', () => {
  const mockUseRoutineStats = useRoutineStats as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when data is loading', () => {
    mockUseRoutineStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    const loadingElement = screen.getByTestId('loading-skeleton');
    expect(loadingElement).toHaveClass('animate-pulse');
  });

  it('renders empty state when no routines exist', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 0,
        completedRoutines: 0,
        averageEngagement: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('No routines scheduled this week')).toBeInTheDocument();
  });

  it('renders stats when data is loaded successfully', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 10,
        completedRoutines: 8,
        averageEngagement: 0.75,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('75% avg')).toBeInTheDocument();
    expect(screen.getByText('80% complete')).toBeInTheDocument();
  });

  it('handles null stats data', () => {
    mockUseRoutineStats.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('No routines scheduled this week')).toBeInTheDocument();
  });

  it('shows correct completion icon for high completion rate', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 10,
        completedRoutines: 9,
        averageEngagement: 0.9,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('handles zero average engagement correctly', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 5,
        completedRoutines: 2,
        averageEngagement: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('0% avg')).toBeInTheDocument();
  });

  it('handles undefined average engagement', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 5,
        completedRoutines: 2,
        averageEngagement: undefined,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary />);
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    mockUseRoutineStats.mockReturnValue({
      data: {
        totalRoutines: 5,
        completedRoutines: 3,
        averageEngagement: 0.6,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<OralRoutineSummary className="custom-class" />);
    
    const container = screen.getByText('This week\'s progress').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });
});