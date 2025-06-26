import { useEffect } from 'react';
import { useKeyboardShortcut } from './useKeyboardShortcut';

interface UseLessonPlanShortcutsProps {
  onSave?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onToggleAI?: () => void;
  onNextField?: () => void;
  onPreviousField?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  enabled?: boolean;
}

/**
 * Hook that registers common keyboard shortcuts for lesson planning
 */
export const useLessonPlanShortcuts = ({
  onSave,
  onDuplicate,
  onDelete,
  onPrint,
  onToggleAI,
  onNextField,
  onPreviousField,
  onUndo,
  onRedo,
  enabled = true
}: UseLessonPlanShortcutsProps) => {
  // Save and continue (Ctrl/Cmd + Enter)
  useKeyboardShortcut(
    () => onSave?.(),
    {
      key: 'Enter',
      ctrl: true,
      cmd: true,
      description: 'Save and continue',
      category: 'planning',
      enabled: enabled && !!onSave
    }
  );

  // Duplicate current item (Ctrl/Cmd + D)
  useKeyboardShortcut(
    () => onDuplicate?.(),
    {
      key: 'd',
      ctrl: true,
      cmd: true,
      description: 'Duplicate current lesson',
      category: 'planning',
      enabled: enabled && !!onDuplicate
    }
  );

  // Delete current item (Ctrl/Cmd + Delete)
  useKeyboardShortcut(
    () => onDelete?.(),
    {
      key: 'Delete',
      ctrl: true,
      cmd: true,
      description: 'Delete current lesson',
      category: 'planning',
      enabled: enabled && !!onDelete
    }
  );

  // Print (Ctrl/Cmd + P)
  useKeyboardShortcut(
    (e) => {
      e.preventDefault(); // Prevent browser print
      onPrint?.();
    },
    {
      key: 'p',
      ctrl: true,
      cmd: true,
      description: 'Print lesson plan',
      category: 'planning',
      enabled: enabled && !!onPrint,
      preventDefault: true
    }
  );

  // Toggle AI Assistant (Ctrl/Cmd + I)
  useKeyboardShortcut(
    () => onToggleAI?.(),
    {
      key: 'i',
      ctrl: true,
      cmd: true,
      description: 'Toggle AI Assistant',
      category: 'planning',
      enabled: enabled && !!onToggleAI
    }
  );

  // Undo (Ctrl/Cmd + Z)
  useKeyboardShortcut(
    () => onUndo?.(),
    {
      key: 'z',
      ctrl: true,
      cmd: true,
      description: 'Undo',
      category: 'editing',
      enabled: enabled && !!onUndo
    }
  );

  // Redo (Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z)
  useKeyboardShortcut(
    () => onRedo?.(),
    {
      key: 'y',
      ctrl: true,
      cmd: true,
      description: 'Redo',
      category: 'editing',
      enabled: enabled && !!onRedo
    }
  );

  useKeyboardShortcut(
    () => onRedo?.(),
    {
      key: 'z',
      ctrl: true,
      cmd: true,
      shift: true,
      description: 'Redo',
      category: 'editing',
      enabled: enabled && !!onRedo,
      visible: false // Hide duplicate
    }
  );

  // Listen for Tab/Shift+Tab for field navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Tab in form contexts
      const target = e.target as HTMLElement;
      const isInForm = target.closest('form') || target.closest('[role="form"]');
      
      if (e.key === 'Tab' && isInForm) {
        if (e.shiftKey && onPreviousField) {
          // Don't prevent default - let browser handle tab navigation
          // Just notify the component
          onPreviousField();
        } else if (!e.shiftKey && onNextField) {
          onNextField();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNextField, onPreviousField]);

  // Listen for global save event
  useEffect(() => {
    if (!enabled || !onSave) return;

    const handleGlobalSave = () => onSave();
    window.addEventListener('global:save', handleGlobalSave);
    return () => window.removeEventListener('global:save', handleGlobalSave);
  }, [enabled, onSave]);
};