import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AIWeeklyPlanModal } from '../AIWeeklyPlanModal';
// import * as weeklyPlanHooks from '../../../hooks/useWeeklyPlanMutation'; // Hook doesn't exist

// Mock dependencies
vi.mock('../../../hooks/useAIStatus', () => ({
  useAIStatus: () => ({
    canUseAI: true,
    aiDisabledReason: null,
  }),
}));

// Mock useWeeklyPlanMutation since the hook doesn't exist
const mockUseWeeklyPlanMutation = vi.fn(() => ({
  mutate: vi.fn(),
  isLoading: false,
  error: null,
}));

vi.mock('../../../hooks/useWeeklyPlanMutation', () => ({
  useWeeklyPlanMutation: mockUseWeeklyPlanMutation,
}));

describe('AIWeeklyPlanModal - Strict Boolean Expression Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    weekStart: '2023-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('error handling', () => {
    it('should handle API error with null message', () => {
            mockUseWeeklyPlanMutation.mockReturnValue({
        mutate: vi.fn(),
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
            mockUseWeeklyPlanMutation.mockReturnValue({
        mutate: vi.fn(),
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
            mockUseWeeklyPlanMutation.mockReturnValue({
        mutate: vi.fn(),
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
            mockUseWeeklyPlanMutation.mockReturnValue({
        mutate: vi.fn(),
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
      const mockOnClose = vi.fn();
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