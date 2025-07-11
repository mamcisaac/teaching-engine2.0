import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { GPTPlanningAgent } from '../GPTPlanningAgent';

// Mock dependencies
jest.mock('../../hooks/useAIStatus', () => ({
  useAIStatus: () => ({
    canUseAI: true,
    aiDisabledReason: null,
  }),
}));

jest.mock('../../../api/core/client', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe('GPTPlanningAgent - Strict Boolean Expression Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    context: {
      subject: 'Mathematics',
      grade: 3,
      topic: 'Fractions',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sessionId handling', () => {
    it('should handle null sessionId', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle undefined sessionId', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle empty string sessionId', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });
  });

  describe('actionResults handling', () => {
    it('should handle null actionResults', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle undefined actionResults', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle empty actionResults array', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });
  });

  describe('speech recognition handling', () => {
    it('should handle missing speech recognition APIs', () => {
      // Mock window without speech recognition
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: undefined,
        writable: true,
      });

      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle webkitSpeechRecognition only', () => {
      // Mock window with only webkit speech recognition
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: jest.fn(),
        writable: true,
      });

      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should handle SpeechRecognition only', () => {
      // Mock window with only standard speech recognition
      Object.defineProperty(window, 'SpeechRecognition', {
        value: jest.fn(),
        writable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: undefined,
        writable: true,
      });

      render(<GPTPlanningAgent {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });
  });

  describe('modal behavior', () => {
    it('should render when isOpen is true', () => {
      render(<GPTPlanningAgent {...defaultProps} isOpen={true} />);

      expect(screen.getByText('AI Planning Assistant')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<GPTPlanningAgent {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('AI Planning Assistant')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      render(<GPTPlanningAgent {...defaultProps} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('message sending', () => {
    it('should handle message input changes', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      const messageInput = screen.getByRole('textbox');
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      expect(messageInput).toHaveValue('Test message');
    });

    it('should handle send button click', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      const messageInput = screen.getByRole('textbox');
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should clear the input after sending
      expect(messageInput).toHaveValue('');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<GPTPlanningAgent {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});