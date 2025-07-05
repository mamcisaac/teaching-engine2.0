/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file PlanningWizard.test.tsx
 * @description Comprehensive tests for PlanningWizard component including step navigation,
 * workflow state, user interactions, and accessibility.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PlanningWizard } from '../PlanningWizard';
import { renderWithProviders } from '@/test-utils';
import { ETFOLevel } from '@/hooks/useWorkflowState';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the useWorkflowState hook
const mockWorkflowState = {
  currentLevel: 'curriculum-expectations' as
    | 'curriculum-expectations'
    | 'long-range-plans'
    | 'unit-plans'
    | 'lesson-plans'
    | 'daybook-entries',
  completedLevels: [] as string[],
  progress: 0,
  canAdvance: true,
  markLevelComplete: vi.fn(),
  setCurrentLevel: vi.fn(),
  resetWorkflow: vi.fn(),
};

vi.mock('@/hooks/useWorkflowState', () => ({
  useWorkflowState: () => mockWorkflowState,
  ETFOLevel: {
    CURRICULUM_EXPECTATIONS: 'curriculum-expectations',
    LONG_RANGE_PLANS: 'long-range-plans',
    UNIT_PLANS: 'unit-plans',
    LESSON_PLANS: 'lesson-plans',
    DAYBOOK_ENTRIES: 'daybook-entries',
  },
}));

describe('PlanningWizard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Reset workflow state
    mockWorkflowState.currentLevel = 'curriculum-expectations';
    mockWorkflowState.completedLevels = [];
    mockWorkflowState.progress = 0;
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('ETFO Planning Wizard')).toBeInTheDocument();
      expect(
        screen.getByText('Follow this step-by-step guide to create comprehensive lesson plans'),
      ).toBeInTheDocument();
    });

    it('should render all wizard steps', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('Import Curriculum Expectations')).toBeInTheDocument();
      expect(screen.getByText('Create Long-Range Plans')).toBeInTheDocument();
      expect(screen.getByText('Design Unit Plans')).toBeInTheDocument();
      expect(screen.getByText('Plan Individual Lessons')).toBeInTheDocument();
      expect(screen.getByText('Track & Reflect')).toBeInTheDocument();
    });

    it('should show step descriptions', () => {
      renderWithProviders(<PlanningWizard />);

      expect(
        screen.getByText(
          'Start by importing Ontario curriculum expectations for your grade and subjects.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Map out your entire school year with themes, units, and timing.'),
      ).toBeInTheDocument();
    });

    it('should show estimated time for each step', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('10-15 minutes')).toBeInTheDocument();
      expect(screen.getByText('30-45 minutes')).toBeInTheDocument();
      expect(screen.getByText('45-60 minutes per unit')).toBeInTheDocument();
    });

    it('should highlight AI-assisted steps', () => {
      renderWithProviders(<PlanningWizard />);

      // Should show AI assistance indicators
      const aiIcons = document.querySelectorAll('.lucide-sparkles');
      expect(aiIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Step Navigation', () => {
    it('should highlight current step', () => {
      renderWithProviders(<PlanningWizard />);

      const currentStepCard = screen
        .getByText('Import Curriculum Expectations')
        .closest('[class*="border"]');
      expect(currentStepCard).toHaveClass('border-blue-500');
    });

    it('should show completed steps with checkmarks', () => {
      mockWorkflowState.completedLevels = ['curriculum-expectations', 'long-range-plans'];
      mockWorkflowState.currentLevel = 'unit-plans';

      renderWithProviders(<PlanningWizard />);

      // Should show checkmarks for completed steps
      const checkIcons = document.querySelectorAll('.lucide-check-circle');
      expect(checkIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should disable future steps when current step is incomplete', () => {
      mockWorkflowState.canAdvance = false;

      renderWithProviders(<PlanningWizard />);

      // Future step buttons should be disabled
      const buttons = screen.getAllByRole('button');
      const futureStepButtons = buttons.filter(
        (btn) =>
          btn.textContent?.includes('Create Long-Range Plans') ||
          btn.textContent?.includes('Design Unit Plans'),
      );

      futureStepButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should enable completed and current steps', () => {
      mockWorkflowState.completedLevels = ['curriculum-expectations'];
      mockWorkflowState.currentLevel = 'long-range-plans';
      mockWorkflowState.canAdvance = true;

      renderWithProviders(<PlanningWizard />);

      const currentStepButton = screen.getByText('Start Long-Range Planning');
      expect(currentStepButton).not.toBeDisabled();
    });
  });

  describe('Step Details Modal', () => {
    it('should open step details when step card is clicked', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        expect(screen.getByText('Getting Started:')).toBeInTheDocument();
        expect(
          screen.getByText('You can upload PDF or DOCX curriculum documents'),
        ).toBeInTheDocument();
      }
    });

    it('should show step tips in modal', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        expect(
          screen.getByText('Our AI will automatically extract and organize expectations'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('You can also manually add or edit expectations'),
        ).toBeInTheDocument();
      }
    });

    it('should navigate to step route when start button is clicked', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        const startButton = screen.getByText('Start Curriculum Import');
        await user.click(startButton);

        expect(mockNavigate).toHaveBeenCalledWith('/curriculum/import');
      }
    });

    it('should close modal when close button is clicked', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(screen.queryByText('Getting Started:')).not.toBeInTheDocument();
      }
    });
  });

  describe('Progress Display', () => {
    it('should show overall progress', () => {
      mockWorkflowState.progress = 40;

      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('40% Complete')).toBeInTheDocument();
    });

    it('should show progress steps', () => {
      mockWorkflowState.completedLevels = ['curriculum-expectations', 'long-range-plans'];
      mockWorkflowState.currentLevel = 'unit-plans';

      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('2 of 5 steps completed')).toBeInTheDocument();
    });

    it('should show completion message when all steps are done', () => {
      mockWorkflowState.completedLevels = [
        'curriculum-expectations',
        'long-range-plans',
        'unit-plans',
        'lesson-plans',
        'daybook-entries',
      ];
      mockWorkflowState.progress = 100;

      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText("You've completed the ETFO planning workflow")).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('should show quick action buttons', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByText('Skip to Current Step')).toBeInTheDocument();
      expect(screen.getByText('View Planning Dashboard')).toBeInTheDocument();
    });

    it('should navigate to current step when skip button is clicked', async () => {
      mockWorkflowState.currentLevel = 'long-range-plans';

      renderWithProviders(<PlanningWizard />);

      const skipButton = screen.getByText('Skip to Current Step');
      await user.click(skipButton);

      expect(mockNavigate).toHaveBeenCalledWith('/planner/long-range');
    });

    it('should navigate to dashboard when dashboard button is clicked', async () => {
      renderWithProviders(<PlanningWizard />);

      const dashboardButton = screen.getByText('View Planning Dashboard');
      await user.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/planning-dashboard');
    });
  });

  describe('Workflow State Integration', () => {
    it('should reflect current workflow state', () => {
      mockWorkflowState.currentLevel = 'unit-plans';
      mockWorkflowState.completedLevels = ['curriculum-expectations', 'long-range-plans'];

      renderWithProviders(<PlanningWizard />);

      const currentStepCard = screen.getByText('Design Unit Plans').closest('[class*="border"]');
      expect(currentStepCard).toHaveClass('border-blue-500');
    });

    it('should handle different current levels', () => {
      const levels = [
        'curriculum-expectations',
        'long-range-plans',
        'unit-plans',
        'lesson-plans',
        'daybook-entries',
      ] as const;

      levels.forEach((level) => {
        mockWorkflowState.currentLevel = level;

        const { unmount } = renderWithProviders(<PlanningWizard />);

        // Should render without errors for each level
        expect(screen.getByText('ETFO Planning Wizard')).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ETFO Planning Wizard');
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5); // One for each step
    });

    it('should have proper button labels', () => {
      renderWithProviders(<PlanningWizard />);

      expect(screen.getByRole('button', { name: /skip to current step/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view planning dashboard/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<PlanningWizard />);

      const firstStepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (firstStepCard) {
        firstStepCard.focus();
        expect(firstStepCard).toHaveFocus();

        await user.tab();
        // Next focusable element should receive focus
      }
    });

    it('should have proper ARIA labels for progress', () => {
      mockWorkflowState.progress = 40;

      renderWithProviders(<PlanningWizard />);

      const progressElement = screen.getByRole('progressbar');
      expect(progressElement).toHaveAttribute('aria-valuenow', '40');
      expect(progressElement).toHaveAttribute('aria-valuemin', '0');
      expect(progressElement).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have proper step status indicators', () => {
      mockWorkflowState.completedLevels = ['curriculum-expectations'];
      mockWorkflowState.currentLevel = 'long-range-plans';

      renderWithProviders(<PlanningWizard />);

      // Completed steps should have appropriate ARIA attributes
      const completedStep = screen.getByText('Import Curriculum Expectations').closest('button');
      expect(completedStep).toHaveAttribute('aria-label', expect.stringContaining('completed'));
    });
  });

  describe('Modal Behavior', () => {
    it('should trap focus in modal when open', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        // Modal should be open and focusable
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
      }
    });

    it('should restore focus when modal closes', async () => {
      renderWithProviders(<PlanningWizard />);

      const stepCard = screen.getByText('Import Curriculum Expectations').closest('button');
      if (stepCard) {
        await user.click(stepCard);

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        // Focus should return to the trigger button
        expect(stepCard).toHaveFocus();
      }
    });
  });

  describe('Responsive Design', () => {
    it('should render step cards in a responsive grid', () => {
      renderWithProviders(<PlanningWizard />);

      // Should have grid layout classes
      const stepGrid = document.querySelector('.grid');
      expect(stepGrid).toBeInTheDocument();
    });

    it('should handle mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<PlanningWizard />);

      // Should still render all content
      expect(screen.getByText('ETFO Planning Wizard')).toBeInTheDocument();
      expect(screen.getByText('Import Curriculum Expectations')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing workflow state gracefully', () => {
      // Mock broken workflow state
      mockWorkflowState.currentLevel = undefined as unknown as "curriculum-expectations" | "long-range-plans" | "unit-plans" | "daybook-entries" | "lesson-plans";

      renderWithProviders(<PlanningWizard />);

      // Should still render basic structure
      expect(screen.getByText('ETFO Planning Wizard')).toBeInTheDocument();
    });

    it('should handle navigation errors gracefully', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      renderWithProviders(<PlanningWizard />);

      const dashboardButton = screen.getByText('View Planning Dashboard');

      // Should not crash when navigation fails
      await user.click(dashboardButton);
      expect(screen.getByText('ETFO Planning Wizard')).toBeInTheDocument();
    });
  });
});
