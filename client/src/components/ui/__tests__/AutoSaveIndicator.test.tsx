/**
 * @file AutoSaveIndicator.test.tsx
 * @description Comprehensive tests for AutoSaveIndicator component including all states,
 * visual feedback, animations, and user interactions.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AutoSaveIndicator, FormAutoSaveHeader } from '../AutoSaveIndicator';
import { render, setupTest } from '@/test-utils';

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date: Date) => '2 minutes'),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <div data-testid="check-icon" className={className} />,
  Clock: ({ className }: { className?: string }) => <div data-testid="clock-icon" className={className} />,
  Save: ({ className }: { className?: string }) => <div data-testid="save-icon" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle-icon" className={className} />,
}));

describe('AutoSaveIndicator', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Visual States', () => {
    it('should show saving state when isSaving is true', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      const clockIcon = screen.getByTestId('clock-icon');
      expect(clockIcon).toHaveClass('animate-spin');
    });

    it('should show unsaved changes state when hasUnsavedChanges is true', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should show saved state when lastSaved is provided', () => {
      const lastSaved = new Date('2023-09-15T10:00:00Z');
      
      render(
        <AutoSaveIndicator
          lastSaved={lastSaved}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Saved 2 minutes ago')).toBeInTheDocument();
    });

    it('should show not saved state when no lastSaved and no other states', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
      expect(screen.getByText('Not saved')).toBeInTheDocument();
    });
  });

  describe('Badge Variants', () => {
    it('should use secondary variant for saving state', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={false}
        />
      );

      const badge = screen.getByText('Saving...').closest('[class*="rounded-full"]');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should use destructive variant for unsaved changes', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      const badge = screen.getByText('Unsaved changes').closest('[class*="rounded-full"]');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should use secondary variant for saved state', () => {
      const lastSaved = new Date('2023-09-15T10:00:00Z');
      
      render(
        <AutoSaveIndicator
          lastSaved={lastSaved}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const badge = screen.getByText('Saved 2 minutes ago').closest('[class*="rounded-full"]');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should use outline variant for not saved state', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const badge = screen.getByText('Not saved').closest('[class*="rounded-full"]');
      expect(badge).toHaveClass('border', 'border-gray-300', 'text-gray-700');
    });
  });

  describe('Manual Save Button', () => {
    it('should show manual save button when hasUnsavedChanges and onManualSave provided', () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      expect(screen.getByRole('button', { name: /save now/i })).toBeInTheDocument();
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
    });

    it('should not show manual save button when no unsaved changes', () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={new Date()}
          isSaving={false}
          hasUnsavedChanges={false}
          onManualSave={onManualSave}
        />
      );

      expect(screen.queryByRole('button', { name: /save now/i })).not.toBeInTheDocument();
    });

    it('should not show manual save button when onManualSave not provided', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      expect(screen.queryByRole('button', { name: /save now/i })).not.toBeInTheDocument();
    });

    it('should call onManualSave when button is clicked', async () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      await user.click(saveButton);

      expect(onManualSave).toHaveBeenCalledTimes(1);
    });

    it('should disable manual save button when saving', () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      expect(saveButton).toBeDisabled();
    });

    it('should have correct styling for manual save button', () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      expect(saveButton).toHaveClass(
        'h-6',
        'px-2',
        'text-xs',
        'bg-orange-50',
        'border-orange-200',
        'text-orange-700',
        'hover:bg-orange-100'
      );
    });
  });

  describe('Progress Indicator', () => {
    it('should show progress indicator when hasUnsavedChanges and not saving', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      const progressContainer = document.querySelector('.w-16.h-1.bg-gray-200');
      expect(progressContainer).toBeInTheDocument();
      
      const progressBar = document.querySelector('.h-full.bg-blue-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not show progress indicator when not hasUnsavedChanges', () => {
      render(
        <AutoSaveIndicator
          lastSaved={new Date()}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const progressContainer = document.querySelector('.w-16.h-1.bg-gray-200');
      expect(progressContainer).not.toBeInTheDocument();
    });

    it('should not show progress indicator when saving', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={true}
        />
      );

      const progressContainer = document.querySelector('.w-16.h-1.bg-gray-200');
      expect(progressContainer).not.toBeInTheDocument();
    });

    it('should have correct animation styling for progress bar', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      const progressBar = document.querySelector('.h-full.bg-blue-500');
      expect(progressBar).toHaveStyle({
        width: '100%',
        animation: 'autoSaveCountdown 30s linear infinite'
      });
    });
  });

  describe('Animations', () => {
    it('should add pulse animation for unsaved changes', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      const badge = screen.getByText('Unsaved changes').closest('[class*="rounded-full"]');
      expect(badge).toHaveClass('animate-pulse');
    });

    it('should not add pulse animation when not hasUnsavedChanges', () => {
      render(
        <AutoSaveIndicator
          lastSaved={new Date()}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const badge = screen.getByText('Saved 2 minutes ago').closest('span');
      expect(badge).not.toHaveClass('animate-pulse');
    });

    it('should add spin animation to clock icon when saving', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={false}
        />
      );

      const clockIcon = screen.getByTestId('clock-icon');
      expect(clockIcon).toHaveClass('animate-spin');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as Element;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should maintain base classes with custom className', () => {
      const { container } = render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as Element;
      expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2', 'custom-class');
    });
  });

  describe('State Priority', () => {
    it('should prioritize saving state over unsaved changes', () => {
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={true}
        />
      );

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    });

    it('should prioritize unsaved changes over saved state', () => {
      const lastSaved = new Date('2023-09-15T10:00:00Z');
      
      render(
        <AutoSaveIndicator
          lastSaved={lastSaved}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      expect(screen.queryByText('Saved 2 minutes ago')).not.toBeInTheDocument();
    });

    it('should show saved state when no saving or unsaved changes', () => {
      const lastSaved = new Date('2023-09-15T10:00:00Z');
      
      render(
        <AutoSaveIndicator
          lastSaved={lastSaved}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Saved 2 minutes ago')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button text', () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should be focusable for keyboard navigation', async () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      
      await user.tab();
      expect(saveButton).toHaveFocus();
    });

    it('should be activatable with keyboard', async () => {
      const onManualSave = vi.fn();
      
      render(
        <AutoSaveIndicator
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save now/i });
      saveButton.focus();
      
      await user.keyboard('{Enter}');
      expect(onManualSave).toHaveBeenCalledTimes(1);
    });
  });
});

describe('FormAutoSaveHeader', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    setupTest();
  });

  describe('Rendering', () => {
    it('should render title and auto save indicator', () => {
      render(
        <FormAutoSaveHeader
          title="Lesson Plan"
          lastSaved={new Date()}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByText('Lesson Plan')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should have proper styling for header layout', () => {
      const { container } = render(
        <FormAutoSaveHeader
          title="Unit Plan"
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const header = container.firstChild as Element;
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'pb-4', 'border-b');
    });

    it('should pass all props to AutoSaveIndicator', () => {
      const onManualSave = vi.fn();
      
      render(
        <FormAutoSaveHeader
          title="Test Form"
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
          onManualSave={onManualSave}
        />
      );

      expect(screen.getByRole('button', { name: /save now/i })).toBeInTheDocument();
    });

    it('should have proper heading styling', () => {
      render(
        <FormAutoSaveHeader
          title="Test Title"
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={false}
        />
      );

      const heading = screen.getByText('Test Title');
      expect(heading).toHaveClass('text-lg', 'font-semibold');
    });
  });

  describe('Integration', () => {
    it('should work with all AutoSaveIndicator states', () => {
      const { rerender } = render(
        <FormAutoSaveHeader
          title="Dynamic Form"
          lastSaved={null}
          isSaving={true}
          hasUnsavedChanges={false}
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();

      rerender(
        <FormAutoSaveHeader
          title="Dynamic Form"
          lastSaved={null}
          isSaving={false}
          hasUnsavedChanges={true}
        />
      );

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });
});