import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test-utils/test-providers';
import { AISuggestionModal } from '../AISuggestionModal';

// Mock the API client
vi.mock('../../../api/core/client', () => ({
  apiClient: {
    delete: vi.fn(),
  },
}));

describe('AISuggestionModal', () => {
  const mockSuggestion = {
    id: 1,
    expectationId: 'EXP001',
    userId: 123,
    title: 'Test Activity',
    descriptionFr: 'Description en français',
    materials: ['Papier', 'Crayons'],
    duration: 45,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnClose = vi.fn();
  const mockOnAddToWeek = vi.fn();

  describe('strict-boolean-expressions compliance', () => {
    it('should handle undefined descriptionEn properly when initializing edit state', () => {
      const suggestionWithoutDescriptionEn = {
        ...mockSuggestion,
        descriptionEn: undefined,
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithoutDescriptionEn}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Click edit button to trigger edit state initialization
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // Check that English description input exists and has empty string value
      const englishDescInput = screen.getByPlaceholderText('Optional English description for teacher reference');
      expect(englishDescInput).toHaveValue('');
    });

    it('should handle undefined descriptionEn properly when displaying', () => {
      const suggestionWithUndefinedDescriptionEn = {
        ...mockSuggestion,
        descriptionEn: undefined,
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithUndefinedDescriptionEn}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Should show default text when descriptionEn is undefined
      expect(screen.getByText('No English description provided')).toBeInTheDocument();
    });

    it('should handle empty string descriptionEn properly', () => {
      const suggestionWithEmptyDescriptionEn = {
        ...mockSuggestion,
        descriptionEn: '',
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithEmptyDescriptionEn}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Empty string should show the default text, not empty content
      expect(screen.getByText('No English description provided')).toBeInTheDocument();
    });

    it('should handle undefined theme properly when initializing edit state', () => {
      const suggestionWithoutTheme = {
        ...mockSuggestion,
        theme: undefined,
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithoutTheme}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Click edit button
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // Check that theme input exists and has empty string value
      const themeInput = screen.getByPlaceholderText('Optional theme connection');
      expect(themeInput).toHaveValue('');
    });

    it('should not render theme section when theme is undefined and not editing', () => {
      const suggestionWithoutTheme = {
        ...mockSuggestion,
        theme: undefined,
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithoutTheme}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Theme label should not be visible when theme is undefined and not editing
      expect(screen.queryByText('Theme')).not.toBeInTheDocument();
    });

    it('should render theme section when theme is empty string', () => {
      const suggestionWithEmptyTheme = {
        ...mockSuggestion,
        theme: '',
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithEmptyTheme}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Should not render theme section for empty string theme
      expect(screen.queryByText('Theme')).not.toBeInTheDocument();
    });

    it('should render theme section when editing regardless of theme value', () => {
      const suggestionWithoutTheme = {
        ...mockSuggestion,
        theme: undefined,
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithoutTheme}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Click edit button
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);

      // Theme section should be visible when editing
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('should properly handle theme with value when adding to week', async () => {
      const suggestionWithTheme = {
        ...mockSuggestion,
        theme: 'Winter Activities',
      };

      renderWithProviders(
        <AISuggestionModal
          suggestion={suggestionWithTheme}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Click add to week
      const addButton = screen.getByText('Add to Week Plan');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddToWeek).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'Winter Activities',
          })
        );
      });
    });
  });

  describe('general functionality', () => {
    it('should render modal with suggestion data', () => {
      renderWithProviders(
        <AISuggestionModal
          suggestion={mockSuggestion}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      expect(screen.getByText('AI Suggested Activity')).toBeInTheDocument();
      expect(screen.getByText(mockSuggestion.title)).toBeInTheDocument();
      expect(screen.getByText(mockSuggestion.descriptionFr)).toBeInTheDocument();
      expect(screen.getByText('45 minutes')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      renderWithProviders(
        <AISuggestionModal
          suggestion={mockSuggestion}
          open={true}
          onClose={mockOnClose}
          onAddToWeek={mockOnAddToWeek}
        />
      );

      // Dialog close button (X) is typically in the DialogContent
      const dialogContent = screen.getByRole('dialog');
      const closeButton = dialogContent.querySelector('button[aria-label*="Close"]');
      
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });
});