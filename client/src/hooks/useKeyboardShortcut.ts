import { useEffect, useRef } from 'react';

import type {
  KeyboardShortcut} from '../contexts/KeyboardShortcutsContext';
import {
  useKeyboardShortcuts as useKeyboardShortcutsContext
} from '../contexts/KeyboardShortcutsContext';
import logger from '../utils/logger';

export interface UseKeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  category?: KeyboardShortcut['category'];
  enabled?: boolean;
  visible?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook to register a keyboard shortcut that automatically unregisters on unmount
 *
 * @example
 * useKeyboardShortcut({
 *   key: 's',
 *   ctrl: true,
 *   description: 'Save document',
 *   handler: () => saveDocument()
 * });
 */
export const useKeyboardShortcut = (
  handler: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions,
  deps: React.DependencyList = [],
) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext();
  
  // Use a ref to always have access to the latest handler without triggering re-registration
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const id = `${options.category ?? 'other'}-${options.key}-${Date.now()}`;

    const shortcut: KeyboardShortcut = {
      id,
      key: options.key,
      ctrl: options.ctrl,
      cmd: options.cmd,
      alt: options.alt,
      shift: options.shift,
      description: options.description,
      category: options.category ?? 'other',
      handler: (event) => {
        if (options.preventDefault !== false) {
          event.preventDefault();
        }
        // Use the ref to always call the latest handler
        handlerRef.current(event);
      },
      enabled: options.enabled !== false,
      visible: options.visible !== false,
    };

    registerShortcut(shortcut);

    return () => {
      unregisterShortcut(id);
    };
  }, [
    // Don't include handler in dependencies - we use handlerRef instead
    registerShortcut,
    unregisterShortcut,
    options.key,
    options.ctrl,
    options.cmd,
    options.alt,
    options.shift,
    options.description,
    options.category,
    options.enabled,
    options.visible,
    options.preventDefault,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]);
};

/**
 * Hook to register multiple keyboard shortcuts at once
 * NOTE: This violates Rules of Hooks - use individual useKeyboardShortcut calls instead
 * @deprecated Use individual useKeyboardShortcut calls
 */
export const useMultipleKeyboardShortcuts = (
  shortcuts: {
    handler: (event: KeyboardEvent) => void;
    options: UseKeyboardShortcutOptions;
  }[] = [],
  deps: React.DependencyList = [],
) => {
  // This implementation violates Rules of Hooks because the number of hooks
  // called can change between renders. Don't use this.
  logger.warn(
    'useMultipleKeyboardShortcuts is deprecated. Use individual useKeyboardShortcut calls instead.',
  );

  // Always call hooks, but with empty array if shortcuts is null/undefined
  const safeShortcuts = shortcuts ?? [];
  safeShortcuts.forEach(({ handler, options }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut(handler, options, deps);
  });
};
