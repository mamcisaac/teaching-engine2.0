import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateFilters from '../TemplateFilters';
import type { TemplateSearchOptions } from '../../../types/template';

// Mock the Select components
jest.mock('../../ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-container">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select"
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
}));

describe('TemplateFilters - Strict Boolean Expressions', () => {
  const mockOnFiltersChange = jest.fn();
  const defaultFilters: TemplateSearchOptions = {
    sortBy: 'usageCount',
    sortOrder: 'desc',
  };

  const availableSubjects = ['Math', 'Science', 'English'];
  const availableGrades = [1, 2, 3, 4, 5];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Active Filters Check', () => {
    it('should not show clear button when no filters are active', () => {
      render(
        <TemplateFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should show clear button when type filter is set', () => {
      const filters = { ...defaultFilters, type: 'UNIT_PLAN' as const };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when category filter is set', () => {
      const filters = { ...defaultFilters, category: 'CORE' as const };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when subject filter is set', () => {
      const filters = { ...defaultFilters, subject: 'Math' };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when gradeMin is set', () => {
      const filters = { ...defaultFilters, gradeMin: 3 };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when gradeMax is set', () => {
      const filters = { ...defaultFilters, gradeMax: 5 };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when search is set', () => {
      const filters = { ...defaultFilters, search: 'test' };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should show clear button when tags array is not empty', () => {
      const filters = { ...defaultFilters, tags: ['math', 'algebra'] };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should not show clear button when tags is empty array', () => {
      const filters = { ...defaultFilters, tags: [] };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should not show clear button when tags is undefined', () => {
      const filters = { ...defaultFilters, tags: undefined };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should handle null values in filters correctly', () => {
      const filters = { 
        ...defaultFilters, 
        type: null as any,
        category: null as any,
        subject: null as any,
        gradeMin: null as any,
        gradeMax: null as any,
        search: null as any,
        tags: null as any,
      };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should handle empty string search correctly', () => {
      const filters = { ...defaultFilters, search: '' };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should handle zero values for grades correctly', () => {
      const filters = { ...defaultFilters, gradeMin: 0, gradeMax: 0 };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      // Grade 0 (kindergarten) is a valid grade, so it should show clear button
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Search Input', () => {
    it('should display empty string when search is undefined', () => {
      render(
        <TemplateFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      const searchInput = screen.getByPlaceholderText('Search templates...') as HTMLInputElement;
      expect(searchInput.value).toBe('');
    });

    it('should display empty string when search is null', () => {
      const filters = { ...defaultFilters, search: null as any };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      const searchInput = screen.getByPlaceholderText('Search templates...') as HTMLInputElement;
      expect(searchInput.value).toBe('');
    });

    it('should display search value when it exists', () => {
      const filters = { ...defaultFilters, search: 'test search' };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      const searchInput = screen.getByPlaceholderText('Search templates...') as HTMLInputElement;
      expect(searchInput.value).toBe('test search');
    });
  });

  describe('Clear Filters', () => {
    it('should reset all filters when clear button is clicked', () => {
      const filters = { 
        ...defaultFilters, 
        type: 'UNIT_PLAN' as const,
        category: 'CORE' as const,
        subject: 'Math',
        gradeMin: 2,
        gradeMax: 4,
        search: 'test',
        tags: ['math'],
      };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      fireEvent.click(screen.getByText('Clear All'));
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        sortBy: 'usageCount',
        sortOrder: 'desc',
      });
    });
  });

  describe('Checkbox Filters', () => {
    it('should handle isSystem checkbox when unchecked', () => {
      render(
        <TemplateFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const checkbox = screen.getByLabelText('System Templates Only') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should handle isSystem checkbox when checked', () => {
      const filters = { ...defaultFilters, isSystem: true };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const checkbox = screen.getByLabelText('System Templates Only') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should update isSystem to undefined when unchecked', () => {
      const filters = { ...defaultFilters, isSystem: true };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const checkbox = screen.getByLabelText('System Templates Only');
      fireEvent.click(checkbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filters,
        isSystem: undefined,
      });
    });

    it('should handle isPublic checkbox correctly', () => {
      render(
        <TemplateFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const checkbox = screen.getByLabelText('Public Templates Only');
      fireEvent.click(checkbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        isPublic: true,
      });
    });
  });

  describe('Select Inputs', () => {
    it('should handle type select with null value', async () => {
      const filters = { ...defaultFilters, type: null as any };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const selects = screen.getAllByTestId('select');
      expect(selects[0]).toHaveValue('all');
    });

    it('should handle grade selects with null values', () => {
      const filters = { ...defaultFilters, gradeMin: null as any, gradeMax: null as any };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const selects = screen.getAllByTestId('select');
      // Grade min select (4th select)
      expect(selects[3]).toHaveValue('all');
      // Grade max select (5th select)
      expect(selects[4]).toHaveValue('all');
    });

    it('should handle sortBy with null value', () => {
      const filters = { ...defaultFilters, sortBy: null as any };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const selects = screen.getAllByTestId('select');
      // Sort by select (6th select)
      expect(selects[5]).toHaveValue('usageCount');
    });

    it('should handle sortOrder with null value', () => {
      const filters = { ...defaultFilters, sortOrder: null as any };
      render(
        <TemplateFilters
          filters={filters}
          onFiltersChange={mockOnFiltersChange}
          availableSubjects={availableSubjects}
          availableGrades={availableGrades}
        />
      );
      
      const selects = screen.getAllByTestId('select');
      // Sort order select (7th select)
      expect(selects[6]).toHaveValue('desc');
    });
  });
});