import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { useKeyboardShortcut, useMultipleKeyboardShortcuts } from '../useKeyboardShortcut';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Create a wrapper with KeyboardShortcutsProvider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(KeyboardShortcutsProvider, { children });
};

describe('useKeyboardShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a keyboard shortcut', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      description: 'Save document',
    };

    const { unmount } = renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      key: 's',
      ctrlKey: true,
    }));

    // Cleanup
    unmount();
  });

  it('should unregister shortcut on unmount', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      description: 'Save document',
    };

    const { unmount } = renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    unmount();

    // Simulate keyboard event after unmount
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    // Handler should not be called after unmount
    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle cmd key on Mac', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      cmd: true,
      description: 'Save document',
    };

    renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Simulate keyboard event with metaKey (cmd on Mac)
    const event = new KeyboardEvent('keydown', {
      key: 's',
      metaKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalled();
  });

  it('should respect enabled option', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      description: 'Save document',
      enabled: false,
    };

    renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    // Handler should not be called when disabled
    expect(handler).not.toHaveBeenCalled();
  });

  it('should preventDefault by default', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      description: 'Save document',
    };

    renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Create event with preventDefault spy
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not preventDefault when option is false', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      description: 'Save document',
      preventDefault: false,
    };

    renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Create event with preventDefault spy
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should use latest handler without re-registering', () => {
    let count = 0;
    const { rerender } = renderHook(
      ({ handler }) => useKeyboardShortcut(handler, {
        key: 's',
        ctrl: true,
        description: 'Save document',
      }),
      {
        wrapper: createWrapper(),
        initialProps: {
          handler: () => { count = 1; }
        }
      }
    );

    // Update handler
    rerender({ handler: () => { count = 2; } });

    // Simulate keyboard event
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    // Should use the latest handler
    expect(count).toBe(2);
  });

  it('should handle complex shortcuts with multiple modifiers', () => {
    const handler = vi.fn();
    const options = {
      key: 's',
      ctrl: true,
      shift: true,
      alt: true,
      description: 'Complex save',
    };

    renderHook(
      () => useKeyboardShortcut(handler, options),
      { wrapper: createWrapper() }
    );

    // Simulate keyboard event with all modifiers
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      altKey: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalled();
  });
});

describe('useMultipleKeyboardShortcuts', () => {
  it('should log deprecation warning', () => {
    const logger = require('../../utils/logger').default;
    
    renderHook(
      () => useMultipleKeyboardShortcuts([]),
      { wrapper: createWrapper() }
    );

    expect(logger.warn).toHaveBeenCalledWith(
      'useMultipleKeyboardShortcuts is deprecated. Use individual useKeyboardShortcut calls instead.'
    );
  });

  it('should handle null shortcuts array', () => {
    const logger = require('../../utils/logger').default;
    
    renderHook(
      () => useMultipleKeyboardShortcuts(null as any),
      { wrapper: createWrapper() }
    );

    expect(logger.warn).toHaveBeenCalled();
    // Should not throw error
  });

  it('should handle undefined shortcuts array', () => {
    const logger = require('../../utils/logger').default;
    
    renderHook(
      () => useMultipleKeyboardShortcuts(undefined as any),
      { wrapper: createWrapper() }
    );

    expect(logger.warn).toHaveBeenCalled();
    // Should not throw error
  });

  it('should register multiple shortcuts', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    const shortcuts = [
      {
        handler: handler1,
        options: {
          key: 'a',
          ctrl: true,
          description: 'Action A',
        }
      },
      {
        handler: handler2,
        options: {
          key: 'b',
          ctrl: true,
          description: 'Action B',
        }
      }
    ];

    renderHook(
      () => useMultipleKeyboardShortcuts(shortcuts),
      { wrapper: createWrapper() }
    );

    // Simulate keyboard event for first shortcut
    const event1 = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event1);
    });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();

    // Reset mocks
    handler1.mockClear();
    handler2.mockClear();

    // Simulate keyboard event for second shortcut
    const event2 = new KeyboardEvent('keydown', {
      key: 'b',
      ctrlKey: true,
    });

    act(() => {
      window.dispatchEvent(event2);
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });
});