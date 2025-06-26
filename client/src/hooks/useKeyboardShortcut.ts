import { useEffect } from 'react';
import { useKeyboardShortcuts, KeyboardShortcut } from '../contexts/KeyboardShortcutsContext';

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
  deps: React.DependencyList = []
) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  
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
      visible: options.visible !== false
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
    ...deps
  ]);
};

/**
 * Hook to register multiple keyboard shortcuts at once
 */
export const useKeyboardShortcuts = (
  shortcuts: Array<{
    handler: (event: KeyboardEvent) => void;
    options: UseKeyboardShortcutOptions;
  }>,
  deps: React.DependencyList = []
) => {
  shortcuts.forEach(({ handler, options }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut(handler, options, deps);
  });
};