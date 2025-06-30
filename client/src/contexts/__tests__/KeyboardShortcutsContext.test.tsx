/**
 * @file KeyboardShortcutsContext.test.tsx
 * @description Comprehensive tests for KeyboardShortcutsContext including shortcut registration,
 * keyboard event handling, preferences management, and cross-platform compatibility.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  formatShortcut,
} from '../KeyboardShortcutsContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.platform
const mockNavigator = {
  platform: 'MacIntel',
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Test wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
  );
};

// Mock keyboard events
const createKeyboardEvent = (options: Partial<KeyboardEvent> = {}) => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...options,
  });

  // Override properties that can't be set in constructor
  Object.defineProperties(event, {
    key: { value: options.key || 'a', writable: true },
    ctrlKey: { value: options.ctrlKey || false, writable: true },
    metaKey: { value: options.metaKey || false, writable: true },
    altKey: { value: options.altKey || false, writable: true },
    shiftKey: { value: options.shiftKey || false, writable: true },
    target: { value: options.target || document.body, writable: true },
  });

  return event;
};

describe('KeyboardShortcutsContext', () => {
  const mockHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockNavigator.platform = 'MacIntel';
    mockHandler.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider initialization', () => {
    it('should provide keyboard shortcuts context', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('shortcuts');
      expect(result.current).toHaveProperty('registerShortcut');
      expect(result.current).toHaveProperty('unregisterShortcut');
      expect(result.current).toHaveProperty('enableShortcut');
      expect(result.current).toHaveProperty('disableShortcut');
      expect(result.current).toHaveProperty('isEnabled');
      expect(result.current).toHaveProperty('setIsEnabled');
      expect(result.current).toHaveProperty('preferences');
      expect(result.current).toHaveProperty('updatePreferences');
    });

    it('should initialize with default state', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.shortcuts).toEqual([]);
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.preferences.enabled).toBe(true);
      expect(result.current.preferences.showHints).toBe(true);
      expect(result.current.preferences.customShortcuts).toEqual({});
    });

    it('should load saved preferences from localStorage', () => {
      const savedPrefs = {
        enabled: false,
        showHints: false,
        customShortcuts: {
          'test-shortcut': { key: 'b' },
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPrefs));

      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.preferences.enabled).toBe(false);
      expect(result.current.preferences.showHints).toBe(false);
      expect(result.current.preferences.customShortcuts).toEqual({
        'test-shortcut': { key: 'b' },
      });
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        renderHook(() => useKeyboardShortcuts(), {
          wrapper: createWrapper(),
        });
      }).not.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      expect(() => {
        renderHook(() => useKeyboardShortcuts(), {
          wrapper: createWrapper(),
        });
      }).not.toThrow();
    });
  });

  describe('Shortcut registration', () => {
    it('should register a new shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'test-shortcut',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      expect(result.current.shortcuts).toHaveLength(1);
      expect(result.current.shortcuts[0]).toEqual(shortcut);
    });

    it('should update existing shortcut on re-registration', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut1 = {
        id: 'test-shortcut',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      const shortcut2 = {
        id: 'test-shortcut',
        key: 's',
        cmd: true,
        description: 'Save (Updated)',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut1);
        result.current.registerShortcut(shortcut2);
      });

      expect(result.current.shortcuts).toHaveLength(1);
      expect(result.current.shortcuts[0]).toEqual(shortcut2);
    });

    it('should register multiple shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcuts = [
        {
          id: 'save',
          key: 's',
          ctrl: true,
          description: 'Save',
          category: 'global' as const,
          handler: mockHandler,
        },
        {
          id: 'copy',
          key: 'c',
          ctrl: true,
          description: 'Copy',
          category: 'editing' as const,
          handler: mockHandler,
        },
      ];

      act(() => {
        shortcuts.forEach((shortcut) => result.current.registerShortcut(shortcut));
      });

      expect(result.current.shortcuts).toHaveLength(2);
    });

    it('should unregister shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'test-shortcut',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
        result.current.unregisterShortcut('test-shortcut');
      });

      expect(result.current.shortcuts).toHaveLength(0);
    });

    it('should handle unregistering non-existent shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.unregisterShortcut('non-existent');
        });
      }).not.toThrow();
    });
  });

  describe('Shortcut enable/disable', () => {
    it('should enable shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'test-shortcut',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
        enabled: false,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
        result.current.enableShortcut('test-shortcut');
      });

      expect(result.current.shortcuts[0].enabled).toBe(true);
    });

    it('should disable shortcut', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'test-shortcut',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
        result.current.disableShortcut('test-shortcut');
      });

      expect(result.current.shortcuts[0].enabled).toBe(false);
    });
  });

  describe('Keyboard event handling', () => {
    it('should trigger shortcut handler on correct key combination', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should not trigger disabled shortcuts', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
        enabled: false,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should not trigger when shortcuts are globally disabled', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
        result.current.setIsEnabled(false);
      });

      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle cmd key on Mac', () => {
      mockNavigator.platform = 'MacIntel';

      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        cmd: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const event = createKeyboardEvent({
        key: 's',
        metaKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should handle ctrl key on Windows', () => {
      mockNavigator.platform = 'Win32';

      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should not trigger in input fields', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
        target: input,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should allow specific keys in input fields', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'help',
        key: 'F1',
        description: 'Help',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = createKeyboardEvent({
        key: 'F1',
        target: input,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledWith(event);

      document.body.removeChild(input);
    });

    it('should handle complex key combinations', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'complex',
        key: 'z',
        ctrl: true,
        shift: true,
        alt: true,
        description: 'Complex shortcut',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      const event = createKeyboardEvent({
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should not trigger with partial modifier matches', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        shift: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
      });

      // Missing shift key
      const event = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Preferences management', () => {
    it('should update preferences', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updatePreferences({
          enabled: false,
          showHints: false,
        });
      });

      expect(result.current.preferences.enabled).toBe(false);
      expect(result.current.preferences.showHints).toBe(false);
      expect(result.current.isEnabled).toBe(false);
    });

    it('should save preferences to localStorage', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updatePreferences({
          enabled: false,
          customShortcuts: { test: { key: 'x' } },
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'keyboard-shortcuts-preferences',
        expect.stringContaining('false'),
      );
    });

    it('should apply custom shortcuts from preferences', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const shortcut = {
        id: 'save',
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'global' as const,
        handler: mockHandler,
      };

      act(() => {
        result.current.registerShortcut(shortcut);
        result.current.updatePreferences({
          customShortcuts: {
            save: { key: 'x' },
          },
        });
      });

      // Original key should not work
      const originalEvent = createKeyboardEvent({
        key: 's',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(originalEvent);
      });

      expect(mockHandler).not.toHaveBeenCalled();

      // Custom key should work
      const customEvent = createKeyboardEvent({
        key: 'x',
        ctrlKey: true,
      });

      act(() => {
        window.dispatchEvent(customEvent);
      });

      expect(mockHandler).toHaveBeenCalledWith(customEvent);
    });
  });

  describe('formatShortcut utility', () => {
    it('should format Mac shortcuts correctly', () => {
      mockNavigator.platform = 'MacIntel';

      const shortcut = {
        id: 'test',
        key: 's',
        cmd: true,
        alt: true,
        shift: true,
        description: 'Test',
        category: 'global' as const,
        handler: mockHandler,
      };

      const formatted = formatShortcut(shortcut);
      expect(formatted).toBe('⌘⌥⇧S');
    });

    it('should format Windows shortcuts correctly', () => {
      mockNavigator.platform = 'Win32';

      const shortcut = {
        id: 'test',
        key: 's',
        ctrl: true,
        alt: true,
        shift: true,
        description: 'Test',
        category: 'global' as const,
        handler: mockHandler,
      };

      const formatted = formatShortcut(shortcut);
      expect(formatted).toBe('Ctrl+Alt+Shift+S');
    });

    it('should handle simple shortcuts', () => {
      const shortcut = {
        id: 'test',
        key: 'F1',
        description: 'Test',
        category: 'global' as const,
        handler: mockHandler,
      };

      const formatted = formatShortcut(shortcut);
      expect(formatted).toBe('F1');
    });
  });

  describe('Hook error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useKeyboardShortcuts());
      }).toThrow('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
    });
  });

  describe('Edge cases and cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should handle rapid registration and unregistration', () => {
      const { result } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.registerShortcut({
            id: `shortcut-${i}`,
            key: 'a',
            description: 'Test',
            category: 'global',
            handler: mockHandler,
          });
          result.current.unregisterShortcut(`shortcut-${i}`);
        }
      });

      expect(result.current.shortcuts).toHaveLength(0);
    });

    it('should maintain referential stability of functions', () => {
      const { result, rerender } = renderHook(() => useKeyboardShortcuts(), {
        wrapper: createWrapper(),
      });

      const registerRef = result.current.registerShortcut;
      const unregisterRef = result.current.unregisterShortcut;

      rerender();

      expect(result.current.registerShortcut).toBe(registerRef);
      expect(result.current.unregisterShortcut).toBe(unregisterRef);
    });
  });
});
