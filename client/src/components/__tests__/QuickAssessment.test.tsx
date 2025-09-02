import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickAssessment } from '../QuickAssessment';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to wrap component with QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('QuickAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders three assessment buttons', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      expect(screen.getByRole('button', { name: /Rate lesson as Good/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rate lesson as Okay/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Rate lesson as Needs Work/i })).toBeInTheDocument();
    });

    it('renders with initial values', () => {
      renderWithQueryClient(
        <QuickAssessment 
          lessonId="test-123" 
          value="good" 
          notes="Great lesson!" 
        />
      );
      
      const goodButton = screen.getByRole('button', { name: /Rate lesson as Good/i });
      expect(goodButton).toHaveAttribute('aria-pressed', 'true');
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      expect(textarea).toHaveValue('Great lesson!');
    });

    it('validates invalid assessment values', () => {
      renderWithQueryClient(
        <QuickAssessment 
          lessonId="test-123" 
          value="excellent" // Invalid value
          notes="Test notes" 
        />
      );
      
      // Should not select any button for invalid value
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('shows loading skeleton when lessonId is empty', () => {
      const { container } = renderWithQueryClient(<QuickAssessment lessonId="" />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows loading skeleton when lessonId is whitespace only', () => {
      const { container } = renderWithQueryClient(<QuickAssessment lessonId="   " />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('selects assessment when button is clicked', async () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      const goodButton = screen.getByRole('button', { name: /Rate lesson as Good/i });
      fireEvent.click(goodButton);
      
      expect(goodButton).toHaveAttribute('aria-pressed', 'true');
      
      // Should show textarea after selection
      expect(screen.getByRole('textbox', { name: /Assessment notes/i })).toBeInTheDocument();
    });

    it('allows typing notes up to max length', async () => {
      vi.useRealTimers(); // Use real timers for userEvent
      const user = userEvent.setup();
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" />);
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      const longText = 'a'.repeat(1000);
      
      await user.clear(textarea);
      await user.type(textarea, longText);
      
      expect(textarea).toHaveValue(longText);
      expect(screen.getByText('1000/1000')).toBeInTheDocument();
    });

    it('prevents typing beyond max length', async () => {
      vi.useRealTimers(); // Use real timers for userEvent
      const user = userEvent.setup();
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" />);
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      const longText = 'a'.repeat(1001);
      
      await user.clear(textarea);
      await user.type(textarea, longText);
      
      // Should be truncated to 1000 characters
      expect(textarea).toHaveValue('a'.repeat(1000));
    });

    it('shows orange warning at 90% capacity', async () => {
      vi.useRealTimers(); // Use real timers for userEvent
      const user = userEvent.setup();
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" />);
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      const text = 'a'.repeat(901); // Over 90%
      
      await user.clear(textarea);
      await user.type(textarea, text);
      
      const counter = screen.getByText('901/1000');
      expect(counter).toHaveClass('text-orange-500');
    });

    it('hides character counter when notes are empty', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" notes="" />);
      
      expect(screen.queryByText(/\/1000/)).not.toBeInTheDocument();
    });
  });

  describe('API Interactions', () => {
    it('debounces save requests by 500ms', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      const goodButton = screen.getByRole('button', { name: /Rate lesson as Good/i });
      fireEvent.click(goodButton);
      
      // Should not call immediately
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Fast-forward 499ms
      act(() => {
        vi.advanceTimersByTime(499);
      });
      expect(mockFetch).not.toHaveBeenCalled();
      
      // Fast-forward 1ms more to trigger the save
      await act(async () => {
        vi.advanceTimersByTime(1);
        // Process microtasks to let the promise resolve
        await Promise.resolve();
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/etfo-lesson-plans/test-123',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quickAssessment: 'good',
            quickAssessmentNotes: ''
          })
        })
      );
    });

    it('debounces rapid assessment changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      // Click good
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      // Click okay quickly before debounce
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Okay/i }));
      
      // Click needs work quickly
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Needs Work/i }));
      
      // Advance past debounce
      await act(async () => {
        vi.advanceTimersByTime(500);
        await Promise.resolve();
        await Promise.resolve();
      });
      
      // Should only have made one call with the last value
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/etfo-lesson-plans/test-123',
        expect.objectContaining({
          body: JSON.stringify({
            quickAssessment: 'needs_work',
            quickAssessmentNotes: ''
          })
        })
      );
    });

    it('shows saving state during request', async () => {
      vi.useRealTimers(); // Use real timers to avoid timing issues
      
      // Create a promise we can control
      let resolveRequest: any;
      mockFetch.mockImplementation(() => 
        new Promise(resolve => {
          resolveRequest = resolve;
        })
      );

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      // Wait for debounce (real time)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });
      
      // Should show saving state while request is pending
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      
      // Complete the request
      await act(async () => {
        resolveRequest({
          ok: true,
          json: async () => ({ success: true })
        });
      });
      
      vi.useFakeTimers(); // Switch back for other tests
    });

    it('shows saved state after successful save', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      // Fast-forward past debounce and wait for mutation to complete
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let the promise resolve
        await Promise.resolve();
        await Promise.resolve();
      });
      
      // Should show saved state
      expect(screen.getByText('✓ Saved')).toBeInTheDocument();
      
      // Should hide after 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      expect(screen.queryByText('✓ Saved')).not.toBeInTheDocument();
    });

    it('shows error for 401 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      const goodButton = screen.getByRole('button', { name: /Rate lesson as Good/i });
      fireEvent.click(goodButton);
      
      // Verify selection happened
      expect(goodButton).toHaveAttribute('aria-pressed', 'true');
      
      // Wait for debounce and mutation to complete
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Session expired - please refresh')).toBeInTheDocument();
    });

    it('shows error for 404 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Lesson not found')).toBeInTheDocument();
    });

    it('shows error for 500 response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' })
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Server error - will retry')).toBeInTheDocument();
    });

    it('shows generic error for other failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('Prop Synchronization', () => {
    it('updates when props change and no local changes', () => {
      const { rerender } = renderWithQueryClient(
        <QuickAssessment lessonId="test-123" value="good" notes="Initial" />
      );
      
      expect(screen.getByRole('button', { name: /Rate lesson as Good/i }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox')).toHaveValue('Initial');
      
      // Update props
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <QuickAssessment lessonId="test-123" value="okay" notes="Updated" />
        </QueryClientProvider>
      );
      
      expect(screen.getByRole('button', { name: /Rate lesson as Okay/i }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('textbox')).toHaveValue('Updated');
    });

    it('ignores prop changes while save is pending', async () => {
      // Mock a slow response to keep mutation pending
      let resolveRequest: any;
      mockFetch.mockImplementation(() => new Promise(resolve => {
        resolveRequest = resolve;
      }));
      
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      });
      
      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <QuickAssessment lessonId="test-123" value="good" notes="Initial" />
        </QueryClientProvider>
      );
      
      // Make local change that triggers save
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Okay/i }));
      
      // Start the save (will be pending)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // While save is pending, prop changes should be ignored
      rerender(
        <QueryClientProvider client={queryClient}>
          <QuickAssessment lessonId="test-123" value="needs_work" notes="Updated" />
        </QueryClientProvider>
      );
      
      // Should keep local change while pending
      expect(screen.getByRole('button', { name: /Rate lesson as Okay/i }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /Rate lesson as Needs Work/i }))
        .toHaveAttribute('aria-pressed', 'false');
      
      // Complete the save
      resolveRequest({ ok: true, json: async () => ({ success: true }) });
    });

    it('does not sync props while error and unsaved changes exist', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      });

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <QuickAssessment lessonId="test-123" value="good" notes="Initial" />
        </QueryClientProvider>
      );
      
      // Make local change that will fail
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Okay/i }));
      
      // Trigger save and wait for error
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Server error - will retry')).toBeInTheDocument();
      
      // Update props - should NOT sync because there's an error and unsaved changes
      rerender(
        <QueryClientProvider client={queryClient}>
          <QuickAssessment lessonId="test-123" value="needs_work" notes="Updated" />
        </QueryClientProvider>
      );
      
      // Should still show the local state (Okay), not the prop value (Needs Work)
      expect(screen.getByRole('button', { name: /Rate lesson as Okay/i }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /Rate lesson as Needs Work/i }))
        .toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" />);
      
      const group = screen.getByRole('group', { name: /Lesson assessment/i });
      expect(group).toBeInTheDocument();
      
      const goodButton = screen.getByRole('button', { name: /Rate lesson as Good/i });
      expect(goodButton).toHaveAttribute('aria-pressed', 'true');
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('marks textarea as invalid when there is an error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      renderWithQueryClient(<QuickAssessment lessonId="test-123" value="good" />);
      
      const textarea = screen.getByRole('textbox', { name: /Assessment notes/i });
      
      // Change notes to trigger save
      fireEvent.change(textarea, { target: { value: 'test' } });
      
      // Trigger save and let mutation complete
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      // Now check for the error state
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'assessment-error');
    });

    it('has live region for status updates', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      // Find element by aria-live attribute since it doesn't have role="status"
      const liveRegions = document.querySelectorAll('[aria-live="polite"]');
      expect(liveRegions).toHaveLength(1);
      const liveRegion = liveRegions[0];
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('has alert role for errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Network error');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid assessment changes correctly', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      // Rapidly click all buttons
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Okay/i }));
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Needs Work/i }));
      
      // Only the last one should be selected
      expect(screen.getByRole('button', { name: /Rate lesson as Needs Work/i }))
        .toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: /Rate lesson as Good/i }))
        .toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: /Rate lesson as Okay/i }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('clears error when user makes new selection', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      // First attempt fails
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      await act(async () => {
        vi.advanceTimersByTime(500);
        // Let mutation complete
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
      
      // Make new selection - should clear error
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Okay/i }));
      
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });

    it('prevents layout shift with min-height status container', () => {
      renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      // Find element by aria-live attribute since it doesn't have role="status"
      const statusContainer = document.querySelector('[aria-live="polite"]');
      expect(statusContainer).toHaveClass('min-h-[24px]');
    });

    it('cleans up timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      
      const { unmount } = renderWithQueryClient(<QuickAssessment lessonId="test-123" />);
      
      fireEvent.click(screen.getByRole('button', { name: /Rate lesson as Good/i }));
      
      unmount();
      
      // Should clear timeouts
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});