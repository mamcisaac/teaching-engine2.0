import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DateRangeSelector } from '../DateRangeSelector';

describe('DateRangeSelector', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('strict boolean expressions', () => {
    it('should handle showCustomPicker boolean state correctly', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      // Initially custom picker should not be shown
      expect(screen.queryByLabelText('Start Date')).not.toBeInTheDocument();
      
      // Click custom range button
      const customButton = screen.getByText('Custom Range');
      fireEvent.click(customButton);
      
      // Custom picker should be shown
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    });

    it('should handle optional className prop', () => {
      const { rerender } = render(
        <DateRangeSelector {...defaultProps} className="custom-class" />
      );
      
      const container = screen.getByText('Date Range').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');
      
      // Test with undefined className
      rerender(<DateRangeSelector {...defaultProps} className={undefined} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle preset comparison with strict equality', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      // Get all preset buttons
      const thisWeekButton = screen.getByText('This Week');
      const lastWeekButton = screen.getByText('Last Week');
      
      // Initially "This Week" should be selected
      expect(thisWeekButton).toHaveClass('bg-blue-600');
      expect(lastWeekButton).not.toHaveClass('bg-blue-600');
      
      // Click "Last Week"
      fireEvent.click(lastWeekButton);
      
      // "Last Week" should now be selected
      expect(thisWeekButton).not.toHaveClass('bg-blue-600');
      expect(lastWeekButton).toHaveClass('bg-blue-600');
    });

    it('should handle date comparison in handleCustomDateChange', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      // Open custom picker
      const customButton = screen.getByText('Custom Range');
      fireEvent.click(customButton);
      
      // Get date inputs
      const startInput = screen.getByLabelText('Start Date') as HTMLInputElement;
      const endInput = screen.getByLabelText('End Date') as HTMLInputElement;
      
      // Set end date before start date
      fireEvent.change(startInput, { target: { value: '2024-01-10' } });
      fireEvent.change(endInput, { target: { value: '2024-01-05' } });
      
      // Click apply
      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);
      
      // onChange should not be called if start > end
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Set valid dates
      fireEvent.change(startInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endInput, { target: { value: '2024-01-07' } });
      fireEvent.click(applyButton);
      
      // onChange should be called
      expect(mockOnChange).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );
    });

    it('should handle preset string comparisons correctly', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      // Test navigation with different presets
      const prevButton = screen.getByTitle('Previous period');
      const nextButton = screen.getByTitle('Next period');
      
      // Click previous - should navigate and switch to custom
      fireEvent.click(prevButton);
      expect(mockOnChange).toHaveBeenCalled();
      
      // Select "This Month"
      fireEvent.click(screen.getByText('This Month'));
      mockOnChange.mockClear();
      
      // Navigate next - should handle month navigation
      fireEvent.click(nextButton);
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle empty effect cleanup properly', () => {
      const { rerender } = render(<DateRangeSelector {...defaultProps} />);
      
      // Update props to trigger effect
      const newProps = {
        ...defaultProps,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-07'),
      };
      
      // Should not throw on rerender
      expect(() => {
        rerender(<DateRangeSelector {...newProps} />);
      }).not.toThrow();
    });
  });

  describe('component behavior', () => {
    it('should render all preset buttons', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('Last Week')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('Custom Range')).toBeInTheDocument();
    });

    it('should display current date range', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      expect(screen.getByText(/Jan 1, 2024 - Jan 7, 2024/)).toBeInTheDocument();
      expect(screen.getByText('(7 days)')).toBeInTheDocument();
    });

    it('should handle preset changes correctly', () => {
      render(<DateRangeSelector {...defaultProps} />);
      
      // Click "Last Week"
      fireEvent.click(screen.getByText('Last Week'));
      
      // onChange should have been called
      expect(mockOnChange).toHaveBeenCalled();
      const [start, end] = mockOnChange.mock.calls[0];
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });
  });
});