import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AILessonPlanPanel } from '../AILessonPlanPanel';
import { useAIPlanningAssistant } from '../../../hooks/useAIPlanningAssistant';
import { useAIStatus, useAIFeature } from '../../../hooks/useAIStatus';
import { useToast } from '../../ui/use-toast';

// Mock dependencies
vi.mock('../../../hooks/useAIPlanningAssistant');
vi.mock('../../../hooks/useAIStatus');
vi.mock('../../ui/use-toast');
vi.mock('../AIErrorBoundary', () => ({
  WithAIErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('../AILoadingIndicator', () => ({
  AILoadingIndicator: () => null,
  AI_LOADING_PRESETS: {
    GENERATING_LESSON_PLAN: {},
  },
}));

// Mock navigator.clipboard
const mockClipboardWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWriteText,
  },
});

describe('AILessonPlanPanel - Async Behavior Tests', () => {
  const mockToast = vi.fn();
  const mockGenerateLessonActivities = vi.fn();
  const mockGenerateMaterialsList = vi.fn();
  const mockGenerateAssessmentStrategies = vi.fn();
  const mockOnLessonGenerated = vi.fn();
  const mockOnSuggestionAccepted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboardWriteText.mockResolvedValue(undefined);
    
    // Mock hooks
    vi.mocked(useToast).mockReturnValue({ toast: mockToast } as any);
    vi.mocked(useAIStatus).mockReturnValue({
      canUseAI: true,
      aiDisabledReason: null,
    });
    vi.mocked(useAIFeature).mockReturnValue({
      available: true,
      enabled: true,
      loading: false,
    });
    vi.mocked(useAIPlanningAssistant).mockReturnValue({
      generateLessonActivities: {
        mutateAsync: mockGenerateLessonActivities,
        isLoading: false,
      },
      generateMaterialsList: {
        mutateAsync: mockGenerateMaterialsList,
        isLoading: false,
      },
      generateAssessmentStrategies: {
        mutateAsync: mockGenerateAssessmentStrategies,
        isLoading: false,
      },
    } as any);
  });

  describe('Async Event Handler Tests', () => {
    it('should handle generateThreePartLesson click without promise rejection', async () => {
      const user = userEvent.setup();
      const mockActivitiesResult = {
        suggestions: ['Activity 1', 'Activity 2'],
        rationale: 'Test rationale',
      };
      const mockMaterialsResult = {
        suggestions: ['Material 1', 'Material 2'],
      };

      mockGenerateLessonActivities.mockResolvedValue(mockActivitiesResult);
      mockGenerateMaterialsList.mockResolvedValue(mockMaterialsResult);

      render(
        <AILessonPlanPanel
          lessonTitle="Test Lesson"
          learningGoals={['Goal 1']}
          onLessonGenerated={mockOnLessonGenerated}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate 3-part lesson/i });
      
      // This should not cause unhandled promise rejection
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateLessonActivities).toHaveBeenCalledTimes(3); // Minds-on, Hands-on, Reflection
      });

      expect(mockOnLessonGenerated).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Three-Part Lesson Generated',
        description: 'Complete lesson structure has been created with AI assistance.',
      });
    });

    it('should handle errors in generateThreePartLesson gracefully', async () => {
      const user = userEvent.setup();
      const error = new Error('AI generation failed');
      mockGenerateLessonActivities.mockRejectedValue(error);

      render(
        <AILessonPlanPanel
          lessonTitle="Test Lesson"
          learningGoals={['Goal 1']}
          onLessonGenerated={mockOnLessonGenerated}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate 3-part lesson/i });
      
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Generation Failed',
          description: 'AI generation failed',
          variant: 'destructive',
        });
      });

      expect(mockOnLessonGenerated).not.toHaveBeenCalled();
    });

    it('should properly handle void operator for generateSuggestions', async () => {
      const user = userEvent.setup();
      const mockResult = {
        suggestions: ['Material 1', 'Material 2'],
        rationale: 'Test materials',
      };
      mockGenerateMaterialsList.mockResolvedValue(mockResult);

      render(
        <AILessonPlanPanel
          lessonTitle="Test Lesson"
          learningGoals={['Goal 1']}
        />
      );

      const materialsButton = screen.getByRole('button', { name: /materials/i });
      
      // Click should not cause unhandled promise rejection due to void operator
      await user.click(materialsButton);

      await waitFor(() => {
        expect(mockGenerateMaterialsList).toHaveBeenCalled();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Suggestions Generated',
        description: 'Generated 2 materials suggestions.',
      });
    });

    it('should handle clipboard copy operation properly', async () => {
      const user = userEvent.setup();
      
      // First generate some suggestions
      const mockResult = {
        suggestions: ['Test suggestion 1'],
        rationale: 'Test rationale',
      };
      mockGenerateMaterialsList.mockResolvedValue(mockResult);

      render(<AILessonPlanPanel lessonTitle="Test Lesson" learningGoals={['Goal 1']} />);

      // Generate suggestions first
      const materialsButton = screen.getByRole('button', { name: /materials/i });
      await user.click(materialsButton);

      await waitFor(() => {
        expect(mockGenerateMaterialsList).toHaveBeenCalled();
      });

      // Switch to suggestions tab
      const suggestionsTab = screen.getByRole('tab', { name: /suggestions/i });
      await user.click(suggestionsTab);

      // Find and click copy button
      const copyButtons = screen.getAllByRole('button');
      const copyButton = copyButtons.find(btn => {
        const svgElement = btn.querySelector('svg');
        return svgElement && svgElement.classList.contains('lucide-copy');
      });
      
      expect(copyButton).toBeDefined();
      
      // Click copy - this should handle the promise properly
      await user.click(copyButton!);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith('Test suggestion 1');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copied',
        description: 'Suggestion copied to clipboard.',
      });
    });

    it('should handle clipboard copy failure gracefully', async () => {
      const user = userEvent.setup();
      mockClipboardWriteText.mockRejectedValue(new Error('Clipboard access denied'));
      
      // First generate some suggestions
      const mockResult = {
        suggestions: ['Test suggestion 1'],
        rationale: 'Test rationale',
      };
      mockGenerateMaterialsList.mockResolvedValue(mockResult);

      render(<AILessonPlanPanel lessonTitle="Test Lesson" learningGoals={['Goal 1']} />);

      // Generate suggestions first
      const materialsButton = screen.getByRole('button', { name: /materials/i });
      await user.click(materialsButton);

      await waitFor(() => {
        expect(mockGenerateMaterialsList).toHaveBeenCalled();
      });

      // Switch to suggestions tab
      const suggestionsTab = screen.getByRole('tab', { name: /suggestions/i });
      await user.click(suggestionsTab);

      // Find and click copy button
      const copyButtons = screen.getAllByRole('button');
      const copyButton = copyButtons.find(btn => {
        const svgElement = btn.querySelector('svg');
        return svgElement && svgElement.classList.contains('lucide-copy');
      });
      
      // Click copy - should not cause unhandled rejection
      await user.click(copyButton!);

      await waitFor(() => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith('Test suggestion 1');
      });

      // The current implementation doesn't handle clipboard errors, 
      // but the click should not cause an unhandled promise rejection
    });

    it('should validate async function without await is handled properly', async () => {
      const user = userEvent.setup();
      
      render(
        <AILessonPlanPanel
          lessonTitle=""
          learningGoals={[]}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate 3-part lesson/i });
      
      // Click with missing required data - should show toast without making API calls
      await user.click(generateButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Missing Information',
        description: 'Please provide a lesson title and at least one learning goal.',
        variant: 'destructive',
      });

      expect(mockGenerateLessonActivities).not.toHaveBeenCalled();
    });
  });

  describe('Parallel Promise Execution', () => {
    it('should execute lesson generation promises in parallel', async () => {
      const user = userEvent.setup();
      const mockActivitiesResult = {
        suggestions: ['Activity'],
        rationale: 'Test',
      };
      const mockMaterialsResult = {
        suggestions: ['Material'],
      };

      // Add delays to simulate async operations
      mockGenerateLessonActivities.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockActivitiesResult), 100))
      );
      mockGenerateMaterialsList.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockMaterialsResult), 50))
      );

      render(
        <AILessonPlanPanel
          lessonTitle="Test Lesson"
          learningGoals={['Goal 1']}
          onLessonGenerated={mockOnLessonGenerated}
        />
      );

      const startTime = Date.now();
      const generateButton = screen.getByRole('button', { name: /generate 3-part lesson/i });
      
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockOnLessonGenerated).toHaveBeenCalled();
      });

      const elapsedTime = Date.now() - startTime;
      
      // If executed in parallel, should complete in ~150ms (100ms for activities + 50ms for materials)
      // If sequential, would take 350ms (3*100ms + 50ms)
      expect(elapsedTime).toBeLessThan(200);
      
      // All three activity generations should have been called
      expect(mockGenerateLessonActivities).toHaveBeenCalledTimes(3);
      expect(mockGenerateMaterialsList).toHaveBeenCalledTimes(1);
    });
  });
});