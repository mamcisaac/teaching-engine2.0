import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { AIWeeklyPlanModal } from '../AIWeeklyPlanModal';

// Mock dependencies
jest.mock('../../../hooks/useAIStatus', () => ({
  useAIStatus: () => ({
    canUseAI: true,
    aiDisabledReason: null,
  }),
}));

jest.mock('../../../hooks/useWeeklyPlanMutation', () => ({
  useWeeklyPlanMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('AIWeeklyPlanModal - Strict Boolean Expression Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedWeek: {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-07'),
    },
    unitContext: {
      id: 'unit-1',
      title: 'Test Unit',
      subject: 'Mathematics',
      grade: 3,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error handling', () => {
    it('should handle API error with null message', () => {
      const { useWeeklyPlanMutation } = require('../../../hooks/useWeeklyPlanMutation');
      useWeeklyPlanMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: {
          response: {
            data: {
              error: null,
            },
          },
        },
      });

      render(<AIWeeklyPlanModal {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('Generate Weekly Plan')).toBeInTheDocument();
    });

    it('should handle API error with undefined message', () => {
      const { useWeeklyPlanMutation } = require('../../../hooks/useWeeklyPlanMutation');
      useWeeklyPlanMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: {
          response: {
            data: {
              error: undefined,
            },
          },
        },
      });

      render(<AIWeeklyPlanModal {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('Generate Weekly Plan')).toBeInTheDocument();
    });

    it('should handle API error with empty string message', () => {
      const { useWeeklyPlanMutation } = require('../../../hooks/useWeeklyPlanMutation');
      useWeeklyPlanMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: {
          response: {
            data: {
              error: '',
            },
          },
        },
      });

      render(<AIWeeklyPlanModal {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('Generate Weekly Plan')).toBeInTheDocument();
    });

    it('should handle API error with valid message', () => {
      const { useWeeklyPlanMutation } = require('../../../hooks/useWeeklyPlanMutation');
      useWeeklyPlanMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        error: {
          response: {
            data: {
              error: 'Custom error message',
            },
          },
        },
      });

      render(<AIWeeklyPlanModal {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('Generate Weekly Plan')).toBeInTheDocument();
    });
  });

  describe('modal behavior', () => {
    it('should render when isOpen is true', () => {
      render(<AIWeeklyPlanModal {...defaultProps} isOpen={true} />);

      expect(screen.getByText('Generate Weekly Plan')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<AIWeeklyPlanModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Generate Weekly Plan')).not.toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<AIWeeklyPlanModal {...defaultProps} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AIWeeklyPlanModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});