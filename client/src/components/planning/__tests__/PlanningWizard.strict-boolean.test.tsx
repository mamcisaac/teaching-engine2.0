import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { ETFOLevel } from '@/hooks/useWorkflowState';

import { PlanningWizard } from '../PlanningWizard';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PlanningWizard - Strict Boolean Expressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAIAssisted property handling', () => {
    it('should render AI-Assisted badge only when isAIAssisted is explicitly true', () => {
      render(
        <MemoryRouter>
          <PlanningWizard />
        </MemoryRouter>
      );

      // Count AI-Assisted badges - should only show for steps with isAIAssisted: true
      const aiAssistedBadges = screen.getAllByText('AI-Assisted');
      expect(aiAssistedBadges).toHaveLength(3); // curriculum, unit plans, lesson plans

      // Verify specific steps don't show AI badge
      const step2 = screen.getByText('Step 2: Create Long-Range Plans');
      const step2Container = step2.closest('.flex-1');
      expect(step2Container?.textContent).not.toContain('AI-Assisted');

      const step5 = screen.getByText('Step 5: Track & Reflect');
      const step5Container = step5.closest('.flex-1');
      expect(step5Container?.textContent).not.toContain('AI-Assisted');
    });

    it('should handle undefined isAIAssisted property without rendering badge', () => {
      render(
        <MemoryRouter>
          <PlanningWizard />
        </MemoryRouter>
      );

      // Long-range plans step has undefined isAIAssisted
      const longRangeStep = screen.getByText('Create Long-Range Plans').closest('.flex-1');
      const badges = longRangeStep?.querySelectorAll('[class*="bg-indigo-100"]') || [];
      
      // Should not find any AI badge
      const hasAIBadge = Array.from(badges).some(badge => badge.textContent?.includes('AI-Assisted'));
      expect(hasAIBadge).toBe(false);
    });
  });

  describe('progress indicator styling', () => {
    it('should apply correct styles based on step position and completion status', () => {
      const completedLevels = [ETFOLevel.CURRICULUM_EXPECTATIONS];
      
      render(
        <MemoryRouter>
          <PlanningWizard completedLevels={completedLevels} />
        </MemoryRouter>
      );

      // Get all progress bars
      const progressContainer = screen.getByText('Planning Wizard').closest('.relative');
      const progressBars = progressContainer?.querySelectorAll('.flex-1.h-2.rounded-full') || [];

      expect(progressBars).toHaveLength(5);

      // First bar (current step) should be indigo
      expect(progressBars[0]).toHaveClass('bg-indigo-600');

      // Second bar should be gray (not completed, not current)
      expect(progressBars[1]).toHaveClass('bg-gray-200');
    });

    it('should handle completedLevels.includes() check properly', () => {
      const completedLevels = [
        ETFOLevel.CURRICULUM_EXPECTATIONS,
        ETFOLevel.LONG_RANGE_PLANS
      ];
      
      render(
        <MemoryRouter>
          <PlanningWizard completedLevels={completedLevels} currentLevel={ETFOLevel.UNIT_PLANS} />
        </MemoryRouter>
      );

      const progressContainer = screen.getByText('Planning Wizard').closest('.relative');
      const progressBars = progressContainer?.querySelectorAll('.flex-1.h-2.rounded-full') || [];

      // First two should be green (completed)
      expect(progressBars[0]).toHaveClass('bg-green-600');
      expect(progressBars[1]).toHaveClass('bg-green-600');
      
      // Third should be indigo (current)
      expect(progressBars[2]).toHaveClass('bg-indigo-600');
      
      // Rest should be gray
      expect(progressBars[3]).toHaveClass('bg-gray-200');
      expect(progressBars[4]).toHaveClass('bg-gray-200');
    });
  });

  describe('step completion status', () => {
    it('should show completed message only when step is truly completed', () => {
      const completedLevels = [ETFOLevel.CURRICULUM_EXPECTATIONS];
      
      render(
        <MemoryRouter>
          <PlanningWizard completedLevels={completedLevels} />
        </MemoryRouter>
      );

      // Should show completed message for first step
      expect(screen.getByText(/You've completed this step!/)).toBeInTheDocument();
      
      // Should show "Revisit" button instead of "Start"
      const buttons = screen.getAllByRole('button');
      const revisitButton = buttons.find(btn => btn.textContent?.includes('Revisit This Step'));
      expect(revisitButton).toBeInTheDocument();
    });

    it('should not show completed message for incomplete steps', () => {
      render(
        <MemoryRouter>
          <PlanningWizard completedLevels={[]} />
        </MemoryRouter>
      );

      // Should not show any completed messages
      expect(screen.queryByText(/You've completed this step!/)).not.toBeInTheDocument();
      
      // Should show "Start" button
      const buttons = screen.getAllByRole('button');
      const startButton = buttons.find(btn => btn.textContent?.includes('Start This Step'));
      expect(startButton).toBeInTheDocument();
    });
  });

  describe('navigation button states', () => {
    it('should disable Previous button only on first step', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <PlanningWizard />
        </MemoryRouter>
      );

      // Initially on first step
      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();

      // Go to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Previous should now be enabled
      expect(previousButton).toBeEnabled();
    });

    it('should show Finish button only on last step', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <PlanningWizard />
        </MemoryRouter>
      );

      // Navigate to last step
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      // Click Next 4 times to reach last step
      for (let i = 0; i < 4; i++) {
        await user.click(nextButton);
      }

      // Should show Finish instead of Next
      expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
    });
  });

  describe('onClose callback handling', () => {
    it('should call onClose when Finish is clicked on last step', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(
        <MemoryRouter>
          <PlanningWizard onClose={onClose} />
        </MemoryRouter>
      );

      // Navigate to last step
      const nextButton = screen.getByRole('button', { name: /next/i });
      for (let i = 0; i < 4; i++) {
        await user.click(nextButton);
      }

      // Click Finish
      const finishButton = screen.getByRole('button', { name: /finish/i });
      await user.click(finishButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined onClose gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter>
          <PlanningWizard />
        </MemoryRouter>
      );

      // Navigate to last step
      const nextButton = screen.getByRole('button', { name: /next/i });
      for (let i = 0; i < 4; i++) {
        await user.click(nextButton);
      }

      // Click Finish - should not throw error
      const finishButton = screen.getByRole('button', { name: /finish/i });
      await expect(user.click(finishButton)).resolves.not.toThrow();
    });
  });
});