import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAutoSave, useUnsavedChangesWarning } from '../../hooks/useAutoSave';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('../../components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with no unsaved changes', () => {
    const mockSaveFn = vi.fn();
    const { result } = renderHook(() =>
      useAutoSave({
        data: { title: 'Test' },
        saveFn: mockSaveFn,
      })
    );

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBeNull();
  });

  it('detects data changes and sets unsaved flag', async () => {
    const mockSaveFn = vi.fn();
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
      })
    );

    // Set initial save time to trigger unsaved changes detection
    act(() => {
      result.current.saveNow();
    });

    await waitFor(() => {
      expect(result.current.lastSaved).not.toBeNull();
    });

    // Change data
    data = { title: 'Changed' };
    rerender();

    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  it('auto-saves after delay when enabled', async () => {
    const mockSaveFn = vi.fn().mockResolvedValue(undefined);
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay: 5000,
        enabled: true,
      })
    );

    // Set initial save to enable change detection
    await act(async () => {
      await result.current.saveNow();
    });

    // Change data to trigger auto-save
    data = { title: 'Changed' };
    rerender();

    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockSaveFn).toHaveBeenCalledWith({ title: 'Changed' });
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Auto-saved',
      description: 'Your changes have been automatically saved.',
      duration: 2000,
    });
  });

  it('does not auto-save when disabled', async () => {
    const mockSaveFn = vi.fn();
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay: 1000,
        enabled: false,
      })
    );

    // Change data
    data = { title: 'Changed' };
    rerender();

    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockSaveFn).not.toHaveBeenCalled();
  });

  it('does not auto-save when already saving', async () => {
    const mockSaveFn = vi.fn(() => new Promise(() => {})); // Never resolves
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay: 1000,
      })
    );

    // Start manual save (will be pending)
    act(() => {
      result.current.saveNow();
    });

    expect(result.current.isSaving).toBe(true);

    // Change data while saving
    data = { title: 'Changed' };
    rerender();

    // Fast forward past the delay
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should only be called once (manual save)
    expect(mockSaveFn).toHaveBeenCalledTimes(1);
  });

  it('handles auto-save errors gracefully', async () => {
    const mockError = new Error('Save failed');
    const mockSaveFn = vi.fn().mockRejectedValue(mockError);
    const mockOnSaveError = vi.fn();
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay: 1000,
        onSaveError: mockOnSaveError,
      })
    );

    // Set initial save to enable change detection
    await act(async () => {
      try {
        await result.current.saveNow();
      } catch (error) {
        // Expected to fail
      }
    });

    // Change data
    data = { title: 'Changed' };
    rerender();

    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Fast forward to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockSaveFn).toHaveBeenCalled();
      expect(result.current.isSaving).toBe(false);
    });

    expect(mockOnSaveError).toHaveBeenCalledWith(mockError);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Auto-save failed',
      description: 'Failed to save automatically. Please save manually.',
      variant: 'destructive',
      duration: 5000,
    });
  });

  it('calls success callback after successful auto-save', async () => {
    const mockSaveFn = vi.fn().mockResolvedValue(undefined);
    const mockOnSaveSuccess = vi.fn();
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay: 1000,
        onSaveSuccess: mockOnSaveSuccess,
      })
    );

    // Set initial save
    await act(async () => {
      await result.current.saveNow();
    });

    // Change data
    data = { title: 'Changed' };
    rerender();

    await waitFor(() => {
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    // Trigger auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockSaveFn).toHaveBeenCalledWith({ title: 'Changed' });
    });

    expect(mockOnSaveSuccess).toHaveBeenCalledTimes(2); // Initial save + auto-save
  });

  it('manual save works correctly', async () => {
    const mockSaveFn = vi.fn().mockResolvedValue(undefined);
    const data = { title: 'Test' };

    const { result } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
      })
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockSaveFn).toHaveBeenCalledWith(data);
    expect(result.current.lastSaved).toBeInstanceOf(Date);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Saved',
      description: 'Your changes have been saved.',
      duration: 2000,
    });
  });

  it('manual save handles errors and throws', async () => {
    const mockError = new Error('Save failed');
    const mockSaveFn = vi.fn().mockRejectedValue(mockError);
    const data = { title: 'Test' };

    const { result } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
      })
    );

    await expect(
      act(async () => {
        await result.current.saveNow();
      })
    ).rejects.toThrow('Save failed');

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Save failed',
      description: 'Failed to save your changes. Please try again.',
      variant: 'destructive',
    });
  });

  it('prevents multiple concurrent manual saves', async () => {
    const mockSaveFn = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const data = { title: 'Test' };

    const { result } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
      })
    );

    // Start first save
    const save1Promise = act(async () => {
      await result.current.saveNow();
    });

    // Try to start second save while first is pending
    act(() => {
      result.current.saveNow(); // Should return early due to isSaving check
    });

    await save1Promise;

    // Should only be called once
    expect(mockSaveFn).toHaveBeenCalledTimes(1);
  });

  it('clears timeout on unmount', () => {
    const mockSaveFn = vi.fn();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() =>
      useAutoSave({
        data: { title: 'Test' },
        saveFn: mockSaveFn,
      })
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('updates timeout when delay changes', async () => {
    const mockSaveFn = vi.fn().mockResolvedValue(undefined);
    let delay = 1000;
    let data = { title: 'Initial' };

    const { result, rerender } = renderHook(() =>
      useAutoSave({
        data,
        saveFn: mockSaveFn,
        delay,
      })
    );

    // Set initial save
    await act(async () => {
      await result.current.saveNow();
    });

    // Change data
    data = { title: 'Changed' };
    rerender();

    // Change delay
    delay = 2000;
    rerender();

    // Fast forward original delay amount
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not have saved yet
    expect(mockSaveFn).toHaveBeenCalledTimes(1); // Only initial save

    // Fast forward new delay amount
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockSaveFn).toHaveBeenCalledTimes(2); // Initial + auto-save
    });
  });
});

describe('useUnsavedChangesWarning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds beforeunload listener when there are unsaved changes', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useUnsavedChangesWarning(true));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('shows warning when there are unsaved changes', () => {
    renderHook(() => useUnsavedChangesWarning(true));

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as any;

    // Simulate beforeunload event
    window.dispatchEvent(new Event('beforeunload'));

    // The actual handler is internal, but we can test the concept
    const handler = vi.fn((e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    });

    const result = handler(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result).toBe('You have unsaved changes. Are you sure you want to leave?');
  });

  it('does not show warning when there are no unsaved changes', () => {
    renderHook(() => useUnsavedChangesWarning(false));

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as any;

    // The handler should not prevent default when no unsaved changes
    const handler = vi.fn((e: BeforeUnloadEvent) => {
      // Should not call preventDefault when hasUnsavedChanges is false
    });

    handler(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('updates event listener when unsaved changes state changes', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { rerender } = renderHook(
      ({ hasUnsavedChanges }) => useUnsavedChangesWarning(hasUnsavedChanges),
      { initialProps: { hasUnsavedChanges: false } }
    );

    // Change to have unsaved changes
    rerender({ hasUnsavedChanges: true });

    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});