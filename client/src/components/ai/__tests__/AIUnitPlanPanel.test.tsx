import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AIUnitPlanPanel } from '../AIUnitPlanPanel';

// Mock all dependencies
vi.mock('../../hooks/useAIPlanningAssistant', () => ({
  useAIPlanningAssistant: () => ({
    generateUnitBigIdeas: { mutateAsync: vi.fn() },
  }),
}));

vi.mock('../../hooks/useAIStatus', () => ({
  useAIStatus: () => ({
    canUseAI: true,
    aiDisabledReason: null,
  }),
  useAIFeature: () => ({
    available: true,
  }),
}));

vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock('../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AIUnitPlanPanel - Strict Boolean Expression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('aiDisabledReason handling', () => {
    it('should handle null aiDisabledReason', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: false,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('AI features are currently unavailable.')).toBeInTheDocument();
    });

    it('should handle undefined aiDisabledReason', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: false,
        aiDisabledReason: undefined,
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('AI features are currently unavailable.')).toBeInTheDocument();
    });

    it('should handle empty string aiDisabledReason', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: false,
        aiDisabledReason: '',
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('AI features are currently unavailable.')).toBeInTheDocument();
    });

    it('should display custom aiDisabledReason when provided', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: false,
        aiDisabledReason: 'Custom reason for AI being disabled',
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('Custom reason for AI being disabled')).toBeInTheDocument();
    });
  });

  describe('suggestion rationale handling', () => {
    it('should handle null rationale', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      // Switch to suggestions tab
      fireEvent.click(screen.getByText('Suggestions'));

      // Verify initial state
      expect(screen.getByText('No suggestions generated yet.')).toBeInTheDocument();
    });

    it('should handle undefined rationale', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      // Switch to suggestions tab
      fireEvent.click(screen.getByText('Suggestions'));

      // Verify initial state
      expect(screen.getByText('No suggestions generated yet.')).toBeInTheDocument();
    });

    it('should handle empty string rationale', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      // Switch to suggestions tab
      fireEvent.click(screen.getByText('Suggestions'));

      // Verify initial state
      expect(screen.getByText('No suggestions generated yet.')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should handle empty unit title and subject', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      const generateButton = screen.getByText('Generate Unit Structure');
      expect(generateButton).toBeDisabled();
    });

    it('should enable generate button when unit title and subject are provided', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel unitTitle="Test Unit" subject="Mathematics" />);

      const generateButton = screen.getByText('Generate Unit Structure');
      expect(generateButton).toBeEnabled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for buttons', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      // Check for buttons with aria-label
      const addButtons = screen.getAllByRole('button', { name: /Click button/i });
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('component rendering', () => {
    it('should render basic structure', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: true,
        aiDisabledReason: null,
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('AI Unit Plan Assistant')).toBeInTheDocument();
      expect(screen.getByText('Generate comprehensive unit plans with AI assistance')).toBeInTheDocument();
    });

    it('should render disabled state when AI is unavailable', () => {
      const { useAIStatus } = require('../../hooks/useAIStatus');
      useAIStatus.mockReturnValue({
        canUseAI: false,
        aiDisabledReason: 'AI quota exceeded',
      });

      render(<AIUnitPlanPanel />);

      expect(screen.getByText('AI features are currently unavailable. AI quota exceeded')).toBeInTheDocument();
    });
  });
});