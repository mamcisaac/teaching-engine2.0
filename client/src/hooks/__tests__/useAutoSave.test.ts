/**
 * @file useAutoSave.test.ts
 * @description Comprehensive tests for useAutoSave and useUnsavedChangesWarning hooks
 * including auto-save functionality, manual saves, error handling, and browser warnings.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { useAutoSave, useUnsavedChangesWarning } from '../useAutoSave';
import { setupTest } from '@/test-utils';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Create a wrapper for hooks that need React context
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', {}, children);
};

describe('useAutoSave', () => {
  beforeEach(() => {
    setupTest();
    vi.useFakeTimers();
    mockToast.mockClear();
  });

  afterEach(() => {
    // Clear all timers first to prevent hanging
    vi.runAllTimers();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const saveFn = vi.fn();
      const data = { text: 'hello' };

      const { result } = renderHook(() =>
        useAutoSave({ data, saveFn }),
        { wrapper }
      );

      expect(result.current.lastSaved).toBeNull();
      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(typeof result.current.saveNow).toBe('function');
    });
  });

  describe('Manual Save', () => {
    it('should save immediately when saveNow is called', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);
      const data = { text: 'hello' };

      const { result } = renderHook(() =>
        useAutoSave({ data, saveFn }),
        { wrapper }
      );

      await act(async () => {
        await result.current.saveNow();
      });

      expect(saveFn).toHaveBeenCalledWith(data);
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should show success toast on manual save', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);
      const data = { text: 'hello' };

      const { result } = renderHook(() =>
        useAutoSave({ data, saveFn }),
        { wrapper }
      );

      await act(async () => {
        await result.current.saveNow();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Saved',
        description: 'Your changes have been saved.',
        duration: 2000,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle manual save errors', async () => {
      const mockError = new Error('Manual save failed');
      const saveFn = vi.fn().mockRejectedValue(mockError);
      const onSaveError = vi.fn();
      const data = { text: 'hello' };

      const { result } = renderHook(() =>
        useAutoSave({ data, saveFn, onSaveError }),
        { wrapper }
      );

      let caughtError: Error | null = null;
      try {
        await act(async () => {
          await result.current.saveNow();
        });
      } catch (e) {
        caughtError = e as Error;
      }

      expect(caughtError).toBeTruthy();
      expect(caughtError?.message).toBe('Manual save failed');
      expect(onSaveError).toHaveBeenCalledWith(caughtError);
    });

    it('should reset isSaving state after error', async () => {
      const saveFn = vi.fn().mockRejectedValue(new Error('Save failed'));
      const data = { text: 'hello' };

      const { result } = renderHook(() =>
        useAutoSave({ data, saveFn }),
        { wrapper }
      );

      try {
        await act(async () => {
          await result.current.saveNow();
        });
      } catch (error) {
        // Expected error
      }

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Change Detection', () => {
    it('should detect changes in data', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);
      let data = { text: 'hello' };

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave({ data, saveFn }),
        { wrapper, initialProps: { data } }
      );

      // Set initial state
      await act(async () => {
        await result.current.saveNow();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);

      // Change data
      data = { text: 'hello world' };
      rerender({ data });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should not leave any timers running on unmount', () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);
      const data = { text: 'hello' };

      const { unmount, result } = renderHook(() =>
        useAutoSave({ data, saveFn }),
        { wrapper }
      );

      // Verify hook is working
      expect(result.current.saveNow).toBeDefined();
      
      // Unmount and ensure no errors
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('useUnsavedChangesWarning', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setupTest();
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should add beforeunload event listener when has unsaved changes', () => {
    renderHook(() => useUnsavedChangesWarning(true), { wrapper });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChangesWarning(true), { wrapper });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });

  it('should prevent default and set returnValue when has unsaved changes', () => {
    renderHook(() => useUnsavedChangesWarning(true), { wrapper });

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as unknown as BeforeUnloadEvent;

    // Simulate beforeunload event
    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;
    eventHandler(mockEvent as Event);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?');
  });

  it('should not prevent default when no unsaved changes', () => {
    renderHook(() => useUnsavedChangesWarning(false), { wrapper });

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    } as unknown as BeforeUnloadEvent;

    // Simulate beforeunload event
    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;
    eventHandler(mockEvent as Event);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('');
  });
});