import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExpectationSelector } from '../ExpectationSelector';

// Mock the hook
vi.mock('../../../hooks/useETFOPlanning', () => ({
  useCurriculumExpectations: vi.fn(),
}));

const mockExpectations = [
  {
    id: '1',
    code: 'A1.1',
    description: 'Understanding algebraic expressions',
    strand: 'Algebra',
    substrand: 'Expressions',
    type: 'Specific',
  },
  {
    id: '2',
    code: 'A1.2',
    description: 'Solving linear equations',
    strand: 'Algebra',
    substrand: 'Equations',
    type: 'Specific',
  },
  {
    id: '3',
    code: 'G1.1',
    description: 'Properties of shapes',
    strand: 'Geometry',
    substrand: null,
    type: 'Overall',
  },
  {
    id: '4',
    code: 'G1.2',
    description: 'Calculating area and perimeter',
    strand: 'Geometry',
    substrand: null,
    type: 'Specific',
  },
];

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ExpectationSelector', () => {
  const mockOnChange = vi.fn();
  const mockUseCurriculumExpectations = require('../../../hooks/useETFOPlanning').useCurriculumExpectations;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurriculumExpectations.mockReturnValue({
      data: mockExpectations,
      isLoading: false,
    });
  });

  const renderSelector = (props: Partial<Parameters<typeof ExpectationSelector>[0]> = {}) => {
    return renderWithQueryClient(
      <ExpectationSelector
        selectedIds={[]}
        onChange={mockOnChange}
        {...props}
      />
    );
  };

  describe('Initial State', () => {
    it('should display label when provided', () => {
      renderSelector({ label: 'Select Expectations' });
      
      expect(screen.getByText('Select Expectations')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      renderSelector({ label: 'Select Expectations', required: true });
      
      const label = screen.getByText('Select Expectations');
      expect(label).toHaveClass('after:content-[\'*\']');
    });

    it('should display placeholder when no items selected', () => {
      renderSelector({ placeholder: 'Choose expectations...' });
      
      expect(screen.getByText('Choose expectations...')).toBeInTheDocument();
    });

    it('should display selection count when items are selected', () => {
      renderSelector({ selectedIds: ['1', '2'] });
      
      expect(screen.getByText('2 expectations selected')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      renderSelector({ disabled: true });
      
      const button = screen.getByRole('combobox');
      expect(button).toBeDisabled();
    });

    it('should show error styling when error is provided', () => {
      renderSelector({ error: 'Selection is required' });
      
      const button = screen.getByRole('combobox');
      expect(button).toHaveClass('border-red-500');
      expect(screen.getByText('Selection is required')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading message when data is loading', async () => {
      mockUseCurriculumExpectations.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      expect(screen.getByText('Loading expectations...')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter expectations by code', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, 'A1');
      
      expect(screen.getByText('A1.1')).toBeInTheDocument();
      expect(screen.getByText('A1.2')).toBeInTheDocument();
      expect(screen.queryByText('G1.1')).not.toBeInTheDocument();
      expect(screen.queryByText('G1.2')).not.toBeInTheDocument();
    });

    it('should filter expectations by description', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, 'area');
      
      expect(screen.getByText('G1.2')).toBeInTheDocument();
      expect(screen.queryByText('A1.1')).not.toBeInTheDocument();
    });

    it('should filter expectations by strand', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, 'geometry');
      
      expect(screen.getByText('G1.1')).toBeInTheDocument();
      expect(screen.getByText('G1.2')).toBeInTheDocument();
      expect(screen.queryByText('A1.1')).not.toBeInTheDocument();
    });

    it('should filter expectations by substrand', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, 'equations');
      
      expect(screen.getByText('A1.2')).toBeInTheDocument();
      expect(screen.queryByText('A1.1')).not.toBeInTheDocument();
    });

    it('should show no results message when search yields no results', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, 'nonexistent');
      
      expect(screen.getByText('No expectations found')).toBeInTheDocument();
    });
  });

  describe('Strand Expansion', () => {
    it('should expand and collapse strands', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Initially, strands should be collapsed
      expect(screen.queryByText('Understanding algebraic expressions')).not.toBeInTheDocument();
      
      // Click to expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      expect(screen.getByText('Understanding algebraic expressions')).toBeInTheDocument();
      expect(screen.getByText('Solving linear equations')).toBeInTheDocument();
      
      // Click again to collapse
      fireEvent.click(algebraStrand);
      
      expect(screen.queryByText('Understanding algebraic expressions')).not.toBeInTheDocument();
    });

    it('should auto-expand strands with selected expectations', async () => {
      renderSelector({ selectedIds: ['1'] });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Algebra strand should be auto-expanded because it has a selected expectation
      await waitFor(() => {
        expect(screen.getByText('Understanding algebraic expressions')).toBeInTheDocument();
      });
    });
  });

  describe('Selection - Multi-select Mode', () => {
    it('should allow selecting multiple expectations', async () => {
      renderSelector({ multiSelect: true });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      // Select first expectation
      const firstExpectation = screen.getByText('Understanding algebraic expressions');
      fireEvent.click(firstExpectation);
      
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
      
      // Select second expectation
      const secondExpectation = screen.getByText('Solving linear equations');
      fireEvent.click(secondExpectation);
      
      expect(mockOnChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('should allow deselecting expectations', async () => {
      renderSelector({ selectedIds: ['1', '2'], multiSelect: true });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      // Deselect first expectation
      const firstExpectation = screen.getByText('Understanding algebraic expressions');
      fireEvent.click(firstExpectation);
      
      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });

    it('should show clear all button when items are selected', async () => {
      renderSelector({ selectedIds: ['1', '2'], multiSelect: true });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const clearButton = screen.getByText('Clear all');
      fireEvent.click(clearButton);
      
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Selection - Single-select Mode', () => {
    it('should only allow selecting one expectation', async () => {
      renderSelector({ multiSelect: false });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      // Select expectation
      const expectation = screen.getByText('Understanding algebraic expressions');
      fireEvent.click(expectation);
      
      expect(mockOnChange).toHaveBeenCalledWith(['1']);
    });

    it('should close popover after selection in single-select mode', async () => {
      renderSelector({ multiSelect: false });
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      // Select expectation
      const expectation = screen.getByText('Understanding algebraic expressions');
      fireEvent.click(expectation);
      
      await waitFor(() => {
        expect(screen.queryByText('Search by code, description, or strand...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Selected Expectations Display', () => {
    it('should display selected expectations below the selector', () => {
      renderSelector({ selectedIds: ['1', '3'] });
      
      // Should see the selected expectations displayed
      expect(screen.getByText('Understanding algebraic expressions')).toBeInTheDocument();
      expect(screen.getByText('Properties of shapes')).toBeInTheDocument();
      expect(screen.getByText('A1.1')).toBeInTheDocument();
      expect(screen.getByText('G1.1')).toBeInTheDocument();
    });

    it('should allow removing expectations from the display', () => {
      renderSelector({ selectedIds: ['1', '2'], multiSelect: true });
      
      // Find and click the remove button for the first expectation
      const removeButtons = screen.getAllByRole('button', { name: '' });
      // Skip the main combobox button
      const firstRemoveButton = removeButtons[1];
      fireEvent.click(firstRemoveButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(['2']);
    });
  });

  describe('Substrand Display', () => {
    it('should display substrand headers', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Algebra strand
      const algebraStrand = screen.getByText('Algebra');
      fireEvent.click(algebraStrand);
      
      expect(screen.getByText('Expressions')).toBeInTheDocument();
      expect(screen.getByText('Equations')).toBeInTheDocument();
    });

    it('should not display "General" substrand header', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Geometry strand (has null substrands)
      const geometryStrand = screen.getByText('Geometry');
      fireEvent.click(geometryStrand);
      
      expect(screen.queryByText('General')).not.toBeInTheDocument();
    });
  });

  describe('Type Badges', () => {
    it('should display type badges when type is present', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Expand Geometry strand
      const geometryStrand = screen.getByText('Geometry');
      fireEvent.click(geometryStrand);
      
      expect(screen.getByText('Overall')).toBeInTheDocument();
      expect(screen.getByText('Specific')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined type gracefully', async () => {
      const expectationsWithoutType = [{
        ...mockExpectations[0],
        type: undefined,
      }];
      
      mockUseCurriculumExpectations.mockReturnValue({
        data: expectationsWithoutType,
        isLoading: false,
      });
      
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      // Should not crash and should display the expectation
      expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    it('should handle empty search query', async () => {
      renderSelector();
      
      const button = screen.getByRole('combobox');
      fireEvent.click(button);
      
      const searchInput = screen.getByPlaceholderText('Search by code, description, or strand...');
      await userEvent.type(searchInput, '   '); // Just spaces
      
      // Should show all expectations
      expect(screen.getByText('Algebra')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
    });
  });
});