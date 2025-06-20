/**
 * Curriculum Heatmap Component Tests
 *
 * Tests heatmap visualization, interactions, and export functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CurriculumHeatmap from '../CurriculumHeatmap';
import * as api from '../../../api';
import * as analyticsExport from '../../../utils/analyticsExport';

// Mock the API and export utilities
vi.mock('../../../api');
vi.mock('../../../utils/analyticsExport');

const mockHeatmapData = {
  outcomes: [
    {
      id: 'math-1',
      code: 'M.NS.1',
      label: 'Number Sense 1',
      subject: 'Mathematics',
      domain: 'Number Sense',
    },
    {
      id: 'math-2',
      code: 'M.NS.2',
      label: 'Number Sense 2',
      subject: 'Mathematics',
      domain: 'Number Sense',
    },
    {
      id: 'sci-1',
      code: 'S.LS.1',
      label: 'Life Systems 1',
      subject: 'Science',
      domain: 'Life Systems',
    },
  ],
  weeks: [1, 2, 3, 4, 5],
  grid: {
    'math-1': { 1: 2, 2: 0, 3: 1, 4: 3, 5: 0 },
    'math-2': { 1: 0, 2: 1, 3: 0, 4: 2, 5: 1 },
    'sci-1': { 1: 1, 2: 2, 3: 0, 4: 0, 5: 1 },
  },
  metadata: {
    viewMode: 'planned',
    totalOutcomes: 3,
    totalWeeks: 5,
    coveragePercentage: 53,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('CurriculumHeatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.api.get as any).mockResolvedValue({ data: mockHeatmapData });
  });

  it('should render loading state initially', () => {
    renderWithQueryClient(<CurriculumHeatmap />);
    expect(screen.getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('should render heatmap after loading', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('Curriculum Coverage Heatmap')).toBeTruthy();
      expect(screen.getByText('53% coverage across 3 outcomes')).toBeTruthy();
    });
  });

  it('should display view mode toggle buttons', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Planned' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Taught' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Assessed' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Reinforced' })).toBeTruthy();
    });
  });

  it('should switch view modes when buttons are clicked', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const taughtButton = screen.getByRole('button', { name: 'Taught' });
      fireEvent.click(taughtButton);
    });

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith(expect.stringContaining('viewMode=taught'));
    });
  });

  it('should render outcome rows with correct data', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      // Check outcome codes
      expect(screen.getByText('M.NS.1')).toBeTruthy();
      expect(screen.getByText('M.NS.2')).toBeTruthy();
      expect(screen.getByText('S.LS.1')).toBeTruthy();

      // Check outcome labels
      expect(screen.getByText('Number Sense 1')).toBeTruthy();
      expect(screen.getByText('Number Sense 2')).toBeTruthy();
      expect(screen.getByText('Life Systems 1')).toBeTruthy();
    });
  });

  it('should render week headers', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      mockHeatmapData.weeks.forEach((week) => {
        expect(screen.getByText(week.toString())).toBeTruthy();
      });
    });
  });

  it('should filter outcomes when dropdown is used', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const filterSelect = screen.getByRole('combobox');
      fireEvent.change(filterSelect, { target: { value: 'math-1' } });
    });

    // Should make new API call with selected outcome
    expect(api.api.get).toHaveBeenCalledTimes(2);
  });

  it('should update week range when inputs change', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const startWeekInput = screen.getByDisplayValue('1');
      const endWeekInput = screen.getByDisplayValue('20');

      fireEvent.change(startWeekInput, { target: { value: '5' } });
      fireEvent.change(endWeekInput, { target: { value: '10' } });
    });

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith(expect.stringContaining('startWeek=5&endWeek=10'));
    });
  });

  it('should display summary statistics', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy(); // Total Outcomes
      expect(screen.getByText('53%')).toBeTruthy(); // Coverage
      expect(screen.getByText('5')).toBeTruthy(); // Weeks Analyzed
    });
  });

  it('should handle export to CSV', async () => {
    const mockExport = vi.spyOn(analyticsExport, 'exportCurriculumHeatmap');
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: 'Export Data' });
      fireEvent.click(exportButton);
    });

    expect(mockExport).toHaveBeenCalledWith(
      mockHeatmapData,
      'csv',
      expect.objectContaining({
        subtitle: expect.stringContaining('planned view'),
        includeMetadata: true,
      }),
    );
  });

  it('should handle export to PDF', async () => {
    const mockExport = vi.spyOn(analyticsExport, 'exportCurriculumHeatmap');
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: 'Export Report' });
      fireEvent.click(exportButton);
    });

    expect(mockExport).toHaveBeenCalledWith(
      mockHeatmapData,
      'pdf',
      expect.objectContaining({
        subtitle: expect.stringContaining('Generated on'),
        includeMetadata: true,
      }),
    );
  });

  it('should show error state when API fails', async () => {
    (api.api.get as any).mockRejectedValue(new Error('API Error'));
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('Error loading heatmap')).toBeTruthy();
      expect(screen.getByText('Please try again later')).toBeTruthy();
    });
  });

  it('should show empty state when no data', async () => {
    (api.api.get as any).mockResolvedValue({ data: null });
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('No curriculum data available')).toBeTruthy();
    });
  });

  it('should pass filters to API correctly', async () => {
    renderWithQueryClient(
      <CurriculumHeatmap teacherId={123} subject="Mathematics" domain="Number Sense" />,
    );

    await waitFor(() => {
      expect(api.api.get).toHaveBeenCalledWith(expect.stringContaining('teacherId=123'));
      expect(api.api.get).toHaveBeenCalledWith(expect.stringContaining('subject=Mathematics'));
      expect(api.api.get).toHaveBeenCalledWith(expect.stringContaining('domain=Number%20Sense'));
    });
  });

  it('should show color legend', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      expect(screen.getByText('Coverage:')).toBeTruthy();
      expect(screen.getByText('None')).toBeTruthy();
      expect(screen.getByText('Low')).toBeTruthy();
      expect(screen.getByText('High')).toBeTruthy();
    });
  });

  it('should handle hover interactions on cells', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      const cells = screen.getAllByTitle(/Week \d+: \d+ planned event/);
      expect(cells.length).toBeGreaterThan(0);

      // Check tooltip content
      const firstCell = cells[0];
      expect(firstCell.title).toMatch(/Week \d+: \d+ planned event\(s\)/);
    });
  });

  it('should display cells with correct intensity colors', async () => {
    renderWithQueryClient(<CurriculumHeatmap />);

    await waitFor(() => {
      // Check that cells with different counts have different colors
      const cells = screen.getAllByTitle(/Week \d+:/);

      // Find cells with 0 events (should have gray background)
      const zeroCells = cells.filter((cell) => cell.title.includes(': 0 planned'));
      zeroCells.forEach((cell) => {
        expect(cell).toHaveClass('bg-gray-100');
      });

      // Find cells with events (should have blue backgrounds)
      const eventCells = cells.filter((cell) => !cell.title.includes(': 0 planned'));
      eventCells.forEach((cell) => {
        expect(cell.className).toMatch(/bg-blue-\d+/);
      });
    });
  });
});
