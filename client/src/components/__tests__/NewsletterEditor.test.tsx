import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterEditor from '../NewsletterEditor';
import type { NewsletterDraft, NewsletterSection } from '../../types/newsletter';

describe('NewsletterEditor', () => {
  const mockSection: NewsletterSection = {
    id: 'section-1',
    title: 'Test Section',
    titleFr: 'Section Test',
    content: '<p>Test content</p>',
    contentFr: '<p>Contenu test</p>',
    isEditable: true,
    order: 0,
  };

  const mockDraft: NewsletterDraft = {
    id: 'draft-1',
    title: 'Test Newsletter',
    titleFr: 'Bulletin Test',
    sections: [mockSection],
    dateFrom: new Date('2024-01-01'),
    dateTo: new Date('2024-01-07'),
    tone: 'friendly',
    isDraft: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnSave = jest.fn();
  const mockOnSend = jest.fn();
  const mockOnRegenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('strict boolean expressions', () => {
    it('should handle updatedAt with explicit null check', () => {
      const draftWithoutUpdatedAt = {
        ...mockDraft,
        updatedAt: undefined,
      };

      render(
        <NewsletterEditor 
          draft={draftWithoutUpdatedAt} 
          onSave={mockOnSave}
        />
      );

      // Check footer renders with "Never" when updatedAt is undefined
      expect(screen.getByText(/Never/)).toBeInTheDocument();
    });

    it('should handle updatedAt when present', () => {
      const now = new Date();
      const draftWithUpdatedAt = {
        ...mockDraft,
        updatedAt: now,
      };

      render(
        <NewsletterEditor 
          draft={draftWithUpdatedAt} 
          onSave={mockOnSave}
        />
      );

      // Check footer renders with date string when updatedAt is present
      expect(screen.getByText(new RegExp(now.toLocaleString()))).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      const { rerender } = render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          className="custom-class"
        />
      );

      const container = screen.getByText('Newsletter Editor').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');

      // Test with undefined className
      rerender(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          className={undefined}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('should handle isGenerating boolean prop', () => {
      const { rerender } = render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          isGenerating={true}
        />
      );

      expect(screen.getByText('Generating newsletter content...')).toBeInTheDocument();

      rerender(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          isGenerating={false}
        />
      );

      expect(screen.queryByText('Generating newsletter content...')).not.toBeInTheDocument();
    });

    it('should handle unsavedChanges state correctly', async () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      // Initially no unsaved changes
      expect(screen.queryByText('Unsaved changes...')).not.toBeInTheDocument();

      // Make a change
      const titleInput = screen.getByPlaceholderText('Newsletter title...');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      // Should show unsaved changes
      await waitFor(() => {
        expect(screen.getByText('Unsaved changes...')).toBeInTheDocument();
      });
    });

    it('should handle previewMode boolean state', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const previewButton = screen.getByText('Preview').closest('button')!;
      
      // Initially in edit mode
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Newsletter title...')).toBeInTheDocument();

      // Switch to preview mode
      fireEvent.click(previewButton);
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Newsletter title...')).not.toBeInTheDocument();
    });

    it('should handle optional onSend callback', () => {
      const { rerender } = render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      // Without onSend
      expect(screen.queryByText('Send')).not.toBeInTheDocument();

      // With onSend
      rerender(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          onSend={mockOnSend}
        />
      );

      expect(screen.getByText('Send')).toBeInTheDocument();
    });

    it('should handle optional onRegenerate callback', () => {
      const { rerender } = render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      // Without onRegenerate
      expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();

      // With onRegenerate
      rerender(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
          onRegenerate={mockOnRegenerate}
        />
      );

      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });
  });

  describe('component behavior', () => {
    it('should render newsletter editor with title and sections', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      expect(screen.getByDisplayValue('Test Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('should handle language toggle', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const langButton = screen.getByText('English').closest('button')!;
      
      // Initially in English
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Newsletter')).toBeInTheDocument();

      // Switch to French
      fireEvent.click(langButton);
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bulletin Test')).toBeInTheDocument();
    });

    it('should handle save action', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save').closest('button')!;
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(mockDraft);
    });

    it('should handle auto-save after changes', async () => {
      jest.useFakeTimers();
      
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      // Make a change
      const titleInput = screen.getByPlaceholderText('Newsletter title...');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      // Fast-forward time to trigger auto-save
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('should handle section editing', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const editButton = screen.getAllByTitle('Edit section')[0];
      fireEvent.click(editButton);

      // Should show editing toolbar
      expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should handle adding new section', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const addButton = screen.getByText('Add New Section').closest('button')!;
      fireEvent.click(addButton);

      // Should add a new section
      expect(screen.getByText('New Section')).toBeInTheDocument();
    });

    it('should handle removing section', () => {
      render(
        <NewsletterEditor 
          draft={mockDraft} 
          onSave={mockOnSave}
        />
      );

      const removeButton = screen.getByTitle('Remove section');
      fireEvent.click(removeButton);

      // Section should be removed
      expect(screen.queryByText('Test Section')).not.toBeInTheDocument();
    });
  });
});