/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file AILessonPlanPanel.test.tsx
 * @description Comprehensive tests for AILessonPlanPanel component including AI interactions,
 * lesson generation, suggestion handling, and error states.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AILessonPlanPanel } from '../AILessonPlanPanel';
import { renderWithProviders } from '@/test-utils';

// Mock the AI hooks
const mockGenerateLesson = vi.fn();
const mockGenerateSuggestions = vi.fn();

vi.mock('../../hooks/useAIPlanningAssistant', () => ({
  useAIPlanningAssistant: () => ({
    generateLesson: mockGenerateLesson,
    generateSuggestions: mockGenerateSuggestions,
    isLoading: false,
    error: null,
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

// Mock toast
const mockToast = vi.fn();
vi.mock('../ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock the AILoadingIndicator
vi.mock('./AILoadingIndicator', () => ({
  AILoadingIndicator: ({ preset }: unknown) => (
    <div data-testid="ai-loading" data-preset={preset}>
      Loading AI content...
    </div>
  ),
  AI_LOADING_PRESETS: {
    LESSON_GENERATION: 'lesson-generation',
    SUGGESTION_GENERATION: 'suggestion-generation',
  },
}));

// Mock the AIErrorBoundary
vi.mock('./AIErrorBoundary', () => ({
  WithAIErrorBoundary: ({ children }: unknown) => <div data-testid="ai-error-boundary">{children}</div>,
}));

describe('AILessonPlanPanel', () => {
  const user = userEvent.setup();
  const mockOnSuggestionAccepted = vi.fn();
  const mockOnLessonGenerated = vi.fn();

  const defaultProps = {
    lessonTitle: 'Introduction to Fractions',
    subject: 'Mathematics',
    grade: 3,
    duration: 60,
    learningGoals: ['Understand basic fractions', 'Identify fraction parts'],
    unitContext: {
      title: 'Number Sense Unit',
      bigIdeas: ['Numbers can be represented in different ways'],
      expectations: [
        {
          id: 'exp-1',
          code: 'B1.1',
          description: 'demonstrate understanding of fractions',
        },
      ],
    },
    onSuggestionAccepted: mockOnSuggestionAccepted,
    onLessonGenerated: mockOnLessonGenerated,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    mockGenerateLesson.mockResolvedValue({
      mindsOn: {
        activities: ['Hook activity'],
        duration: 10,
        materials: ['Fraction cards'],
      },
      handsOn: {
        activities: ['Main activity'],
        duration: 40,
        materials: ['Manipulatives'],
      },
      mindsOnReflection: {
        activities: ['Reflection activity'],
        duration: 10,
        materials: ['Exit tickets'],
      },
    });
    mockGenerateSuggestions.mockResolvedValue({
      type: 'mindson',
      content: ['Start with a fraction pizza', 'Use visual manipulatives'],
      rationale: 'Visual learning helps with fraction concepts',
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByText('AI Lesson Planning Assistant')).toBeInTheDocument();
      expect(screen.getByTestId('ai-error-boundary')).toBeInTheDocument();
    });

    it('should render form fields with initial values', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByDisplayValue('Introduction to Fractions')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument();
      expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    });

    it('should render learning goals', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByText('Understand basic fractions')).toBeInTheDocument();
      expect(screen.getByText('Identify fraction parts')).toBeInTheDocument();
    });

    it('should render unit context when provided', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByText('Number Sense Unit')).toBeInTheDocument();
      expect(screen.getByText('B1.1')).toBeInTheDocument();
    });

    it('should render tabs for different AI features', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByText('Quick Generate')).toBeInTheDocument();
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Customize')).toBeInTheDocument();
    });
  });

  describe('AI Status Integration', () => {
    it('should show disabled state when AI is not available', () => {
      vi.mocked(require('../../hooks/useAIStatus').useAIStatus).mockReturnValue({
        canUseAI: false,
        aiDisabledReason: 'API quota exceeded',
      });

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByText(/AI features are currently disabled/)).toBeInTheDocument();
      expect(screen.getByText('API quota exceeded')).toBeInTheDocument();
    });

    it('should enable AI features when available', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Quick Generate Tab', () => {
    it('should generate complete lesson plan', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateLesson).toHaveBeenCalledWith({
          title: 'Introduction to Fractions',
          subject: 'Mathematics',
          grade: 3,
          duration: 60,
          learningGoals: ['Understand basic fractions', 'Identify fraction parts'],
          unitContext: defaultProps.unitContext,
          lessonType: 'new_concept',
        });
      });

      expect(mockOnLessonGenerated).toHaveBeenCalledWith({
        mindsOn: {
          activities: ['Hook activity'],
          duration: 10,
          materials: ['Fraction cards'],
        },
        handsOn: {
          activities: ['Main activity'],
          duration: 40,
          materials: ['Manipulatives'],
        },
        mindsOnReflection: {
          activities: ['Reflection activity'],
          duration: 10,
          materials: ['Exit tickets'],
        },
      });
    });

    it('should show loading indicator during generation', async () => {
      mockGenerateLesson.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      await user.click(generateButton);

      expect(screen.getByTestId('ai-loading')).toBeInTheDocument();
      expect(screen.getByTestId('ai-loading')).toHaveAttribute('data-preset', 'lesson-generation');
    });

    it('should handle generation errors', async () => {
      mockGenerateLesson.mockRejectedValueOnce(new Error('API Error'));

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Generation Failed',
          description: 'Failed to generate lesson plan. Please try again.',
          variant: 'destructive',
        });
      });
    });

    it('should update form fields', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'New Lesson Title');

      expect(titleInput).toHaveValue('New Lesson Title');
    });

    it('should update lesson type', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const lessonTypeSelect = screen.getByLabelText(/lesson type/i);
      await user.selectOptions(lessonTypeSelect, 'review');

      expect(lessonTypeSelect).toHaveValue('review');
    });
  });

  describe('Suggestions Tab', () => {
    it('should generate suggestions for different sections', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      const mindsOnButton = screen.getByRole('button', { name: /minds on suggestions/i });
      await user.click(mindsOnButton);

      await waitFor(() => {
        expect(mockGenerateSuggestions).toHaveBeenCalledWith({
          type: 'mindson',
          context: expect.objectContaining({
            title: 'Introduction to Fractions',
            subject: 'Mathematics',
            grade: 3,
          }),
        });
      });
    });

    it('should display suggestion results', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      const mindsOnButton = screen.getByRole('button', { name: /minds on suggestions/i });
      await user.click(mindsOnButton);

      await waitFor(() => {
        expect(screen.getByText('Start with a fraction pizza')).toBeInTheDocument();
        expect(screen.getByText('Use visual manipulatives')).toBeInTheDocument();
        expect(
          screen.getByText('Visual learning helps with fraction concepts'),
        ).toBeInTheDocument();
      });
    });

    it('should allow accepting individual suggestions', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      const mindsOnButton = screen.getByRole('button', { name: /minds on suggestions/i });
      await user.click(mindsOnButton);

      await waitFor(() => {
        expect(screen.getByText('Start with a fraction pizza')).toBeInTheDocument();
      });

      const acceptButtons = screen.getAllByRole('button', { name: /accept/i });
      await user.click(acceptButtons[0]);

      expect(mockOnSuggestionAccepted).toHaveBeenCalledWith('mindson', [
        'Start with a fraction pizza',
      ]);
    });

    it('should allow accepting all suggestions', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      const mindsOnButton = screen.getByRole('button', { name: /minds on suggestions/i });
      await user.click(mindsOnButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
      });

      const acceptAllButton = screen.getByRole('button', { name: /accept all/i });
      await user.click(acceptAllButton);

      expect(mockOnSuggestionAccepted).toHaveBeenCalledWith('mindson', [
        'Start with a fraction pizza',
        'Use visual manipulatives',
      ]);
    });

    it('should generate different types of suggestions', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      // Test different suggestion types
      const suggestionTypes = [
        { button: /hands on suggestions/i, type: 'handson' },
        { button: /assessment suggestions/i, type: 'assessments' },
        { button: /differentiation suggestions/i, type: 'differentiation' },
        { button: /materials suggestions/i, type: 'materials' },
      ];

      for (const { button, type } of suggestionTypes) {
        const suggestionButton = screen.getByRole('button', { name: button });
        await user.click(suggestionButton);

        await waitFor(() => {
          expect(mockGenerateSuggestions).toHaveBeenCalledWith({
            type,
            context: expect.objectContaining({
              title: 'Introduction to Fractions',
            }),
          });
        });

        vi.clearAllMocks();
      }
    });
  });

  describe('Customize Tab', () => {
    it('should render customization options', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const customizeTab = screen.getByText('Customize');
      await user.click(customizeTab);

      expect(screen.getByText('Time Allocation')).toBeInTheDocument();
      expect(screen.getByText('Focus Areas')).toBeInTheDocument();
      expect(screen.getByText('Teaching Strategies')).toBeInTheDocument();
    });

    it('should update time allocation sliders', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const customizeTab = screen.getByText('Customize');
      await user.click(customizeTab);

      const mindsOnSlider = screen.getByLabelText(/minds on duration/i);
      expect(mindsOnSlider).toBeInTheDocument();
    });

    it('should generate lesson with custom parameters', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const customizeTab = screen.getByText('Customize');
      await user.click(customizeTab);

      // Modify some settings first
      const focusCheckbox = screen.getByLabelText(/hands-on activities/i);
      await user.click(focusCheckbox);

      const generateButton = screen.getByRole('button', { name: /generate with customizations/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateLesson).toHaveBeenCalledWith(
          expect.objectContaining({
            customizations: expect.objectContaining({
              focusAreas: expect.arrayContaining(['hands-on']),
            }),
          }),
        );
      });
    });
  });

  describe('Learning Goals Management', () => {
    it('should add new learning goals', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const addGoalButton = screen.getByRole('button', { name: /add learning goal/i });
      await user.click(addGoalButton);

      const newGoalInput = screen.getByPlaceholderText(/enter learning goal/i);
      await user.type(newGoalInput, 'New learning goal');

      const saveButton = screen.getByRole('button', { name: /save goal/i });
      await user.click(saveButton);

      expect(screen.getByText('New learning goal')).toBeInTheDocument();
    });

    it('should remove learning goals', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const removeButtons = screen.getAllByRole('button', { name: /remove goal/i });
      await user.click(removeButtons[0]);

      expect(screen.queryByText('Understand basic fractions')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      expect(screen.getByLabelText(/lesson title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/grade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);
      titleInput.focus();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/subject/i)).toHaveFocus();
    });

    it('should have proper tab semantics', () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('should announce loading states to screen readers', async () => {
      mockGenerateLesson.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      await user.click(generateButton);

      const loadingIndicator = screen.getByTestId('ai-loading');
      expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Performance', () => {
    it('should not regenerate on every render', () => {
      const { rerender } = renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      rerender(<AILessonPlanPanel {...defaultProps} />);

      // Should not have made additional API calls
      expect(mockGenerateLesson).not.toHaveBeenCalled();
      expect(mockGenerateSuggestions).not.toHaveBeenCalled();
    });

    it('should debounce form input changes', async () => {
      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const titleInput = screen.getByLabelText(/lesson title/i);

      // Type multiple characters quickly
      await user.type(titleInput, 'abc');

      // Should not trigger multiple regenerations
      expect(mockGenerateLesson).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGenerateSuggestions.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const suggestionsTab = screen.getByText('Suggestions');
      await user.click(suggestionsTab);

      const mindsOnButton = screen.getByRole('button', { name: /minds on suggestions/i });
      await user.click(mindsOnButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate suggestions/i)).toBeInTheDocument();
      });
    });

    it('should handle malformed API responses', async () => {
      mockGenerateLesson.mockResolvedValueOnce(null);

      renderWithProviders(<AILessonPlanPanel {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate complete lesson/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: 'destructive',
          }),
        );
      });
    });
  });
});
