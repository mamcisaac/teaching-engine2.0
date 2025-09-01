import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { CurriculumCoverageDashboard } from '../CurriculumCoverageDashboard';

// Mock the API client
vi.mock('../../api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock recharts components (they don't work well in tests)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div>Pie Chart</div>,
  Cell: () => <div>Cell</div>,
  Tooltip: () => <div>Tooltip</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Legend: () => <div>Legend</div>,
  RadialBarChart: ({ children }: any) => <div>{children}</div>,
  RadialBar: () => <div>RadialBar</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div>Line</div>,
  Area: () => <div>Area</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
}));

const mockCoverageData = {
  success: true,
  data: {
    overall: {
      total: 100,
      covered: 75,
      uncovered: 25,
      percentage: 75,
    },
    bySubject: [
      {
        subject: 'Français (Immersion)',
        total: 20,
        covered: 18,
        percentage: 90,
        uncoveredExpectations: [],
      },
      {
        subject: 'Mathématiques',
        total: 30,
        covered: 20,
        percentage: 67,
        uncoveredExpectations: [
          {
            id: '1',
            code: 'M1.1',
            description: 'Count to 100',
            priority: 'high' as const,
          },
        ],
      },
    ],
    byStrand: [],
  },
};

const mockUncoveredData = {
  success: true,
  data: {
    expectations: [
      {
        id: '1',
        code: 'M1.1',
        description: 'Count to 100',
        descriptionFr: 'Compter jusqu\'à 100',
        subject: 'Mathématiques',
        grade: 1,
        strand: 'Number Sense',
        priority: 'high' as const,
        suggestedDuration: 45,
        suggestedActivities: ['Counting games', 'Number songs'],
      },
    ],
    total: 25,
    hasMore: true,
  },
};

describe('CurriculumCoverageDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Setup API mocks
    const { apiClient } = require('../../api/core/client');
    apiClient.get.mockImplementation((url: string) => {
      if (url.includes('/api/curriculum-coverage/uncovered')) {
        return Promise.resolve(mockUncoveredData);
      }
      if (url.includes('/api/curriculum-coverage')) {
        return Promise.resolve(mockCoverageData);
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CurriculumCoverageDashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render the dashboard header', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Curriculum Coverage Dashboard')).toBeInTheDocument();
    });
  });

  it('should display overall coverage statistics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total Expectations')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Covered')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('should display tabs for different views', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('By Subject')).toBeInTheDocument();
      expect(screen.getByText('By Strand')).toBeInTheDocument();
      expect(screen.getByText('Uncovered')).toBeInTheDocument();
      expect(screen.getByText('Trends')).toBeInTheDocument();
    });
  });

  it('should display export button', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Export Report')).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    // Mock loading state
    const { apiClient } = require('../../api/core/client');
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display subject coverage data', async () => {
    renderComponent();

    await waitFor(() => {
      // Check for French subject
      expect(screen.getByText('Français (Immersion)')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
      
      // Check for Math subject
      expect(screen.getByText('Mathématiques')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });
});