import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndContext } from '@dnd-kit/core';
import { AIActivityGeneratorPanel } from '../AIActivityGeneratorPanel';

// Mock API
vi.mock('../../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockOutcome = {
  id: 'test-1',
  code: 'T1.1',
  description: 'Test outcome',
  grade: 1,
  subject: 'Test Subject'
};

const mockAnalysis = {
  totalOutcomes: 10,
  coveredOutcomes: 5,
  coveragePercentage: 50,
  priorityGaps: [
    {
      outcome: mockOutcome,
      priority: 100
    }
  ]
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <DndContext onDragEnd={() => {}}>
        {children}
      </DndContext>
    </QueryClientProvider>
  );
};

describe('AIActivityGeneratorPanel', () => {
  const defaultProps = {
    selectedOutcomes: ['test-1'],
    onOutcomesChange: vi.fn(),
    onActivityDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    const { api } = require('../../../api');
    api.get.mockResolvedValue({
      data: { data: mockAnalysis }
    });
    api.post.mockResolvedValue({
      data: { 
        data: [{
          id: 1,
          title: 'Generated Activity',
          descriptionFr: 'Description française',
          materials: ['papier', 'crayons'],
          duration: 30,
          outcome: mockOutcome,
          subject: 'Test Subject'
        }]
      }
    });
  });

  it('renders with default collapsed state', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('AI Activity Generator')).toBeInTheDocument();
    expect(screen.getByText('(50% coverage)')).toBeInTheDocument();
  });

  it('expands when header is clicked', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    expect(screen.getByPlaceholderText('e.g., Winter, Animals, Community')).toBeInTheDocument();
    expect(screen.getByText('Generate Activities')).toBeInTheDocument();
  });

  it('shows selected outcomes when provided', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    expect(screen.getByText('Selected Outcomes (1)')).toBeInTheDocument();
    expect(screen.getByText('test-1')).toBeInTheDocument();
  });

  it('allows theme input', async () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    const themeInput = screen.getByPlaceholderText('e.g., Winter, Animals, Community');
    fireEvent.change(themeInput, { target: { value: 'Animals' } });
    
    expect(themeInput).toHaveValue('Animals');
  });

  it('allows complexity selection', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    const complexitySelect = screen.getByDisplayValue('Moderate');
    fireEvent.change(complexitySelect, { target: { value: 'simple' } });
    
    expect(complexitySelect).toHaveValue('simple');
  });

  it('toggles between individual and series generation', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    const seriesRadio = screen.getByLabelText('Series');
    fireEvent.click(seriesRadio);
    
    expect(screen.getByText('Activities in Series')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('disables generate button when no outcomes selected', () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel 
          {...defaultProps} 
          selectedOutcomes={[]} 
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    const generateButton = screen.getByText('Generate Activities');
    expect(generateButton).toBeDisabled();
  });

  it('calls API when generate button is clicked', async () => {
    const { api } = require('../../../api');
    
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    const generateButton = screen.getByText('Generate Activities');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/ai/activities/generate', {
        outcomeIds: ['test-1'],
        complexity: 'moderate',
        generateSeries: false,
      });
    });
  });

  it('displays generated activities', async () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    fireEvent.click(screen.getByText('Generate Activities'));
    
    await waitFor(() => {
      expect(screen.getByText('Generated Activities')).toBeInTheDocument();
      expect(screen.getByText('Generated Activity')).toBeInTheDocument();
    });
  });

  it('shows priority coverage gaps', async () => {
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    
    await waitFor(() => {
      expect(screen.getByText('Priority Coverage Gaps')).toBeInTheDocument();
      expect(screen.getByText('T1.1')).toBeInTheDocument();
      expect(screen.getByText('Test outcome')).toBeInTheDocument();
    });
  });

  it('calls onActivityDrop when activity is accepted', async () => {
    const mockOnActivityDrop = vi.fn();
    
    render(
      <TestWrapper>
        <AIActivityGeneratorPanel 
          {...defaultProps} 
          onActivityDrop={mockOnActivityDrop}
        />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('AI Activity Generator'));
    fireEvent.click(screen.getByText('Generate Activities'));
    
    await waitFor(() => {
      const acceptButton = screen.getByTitle('Accept activity');
      fireEvent.click(acceptButton);
      
      expect(mockOnActivityDrop).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Generated Activity'
        })
      );
    });
  });
});