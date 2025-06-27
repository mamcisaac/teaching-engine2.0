import { useEffect } from 'react';
import {
  useKeyboardShortcuts as useKeyboardShortcutsContext,
  KeyboardShortcut,
} from '../contexts/KeyboardShortcutsContext';

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

  useEffect(() => {
    const id = `${options.category || 'other'}-${options.key}-${Date.now()}`;

    const shortcut: KeyboardShortcut = {
      id,
      key: options.key,
      ctrl: options.ctrl,
      cmd: options.cmd,
      alt: options.alt,
      shift: options.shift,
      description: options.description,
      category: options.category || 'other',
      handler: (event) => {
        if (options.preventDefault !== false) {
          event.preventDefault();
        }
        handler(event);
      },
      enabled: options.enabled !== false,
      visible: options.visible !== false,
    };

    registerShortcut(shortcut);

    return () => {
      unregisterShortcut(id);
    };
  }, [
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
    ...deps,
  ]);
};

/**
 * Hook to register multiple keyboard shortcuts at once
 * NOTE: This violates Rules of Hooks - use individual useKeyboardShortcut calls instead
 * @deprecated Use individual useKeyboardShortcut calls
 */
export const useMultipleKeyboardShortcuts = (
  shortcuts: Array<{
    handler: (event: KeyboardEvent) => void;
    options: UseKeyboardShortcutOptions;
  }> = [],
  deps: React.DependencyList = [],
) => {
  // This implementation violates Rules of Hooks because the number of hooks
  // called can change between renders. Don't use this.
  console.warn(
    'useMultipleKeyboardShortcuts is deprecated. Use individual useKeyboardShortcut calls instead.',
  );

  // Always call hooks, but with empty array if shortcuts is null/undefined
  const safeShortcuts = shortcuts || [];
  safeShortcuts.forEach(({ handler, options }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut(handler, options, deps);
  });
};
