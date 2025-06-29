import React from 'react';
import { Button, ButtonProps } from './Button';
import { ShortcutHint } from './ShortcutHint';
import { KeyboardShortcut } from '../../contexts/KeyboardShortcutsContext';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

export interface ButtonWithShortcutProps extends ButtonProps {
  shortcut?: Partial<KeyboardShortcut>;
  shortcutDescription?: string;
  showShortcutHint?: boolean;
  onShortcutTrigger?: () => void;
}

/**
 * Enhanced Button component that supports keyboard shortcuts
 *
 * @example
 * <ButtonWithShortcut
 *   shortcut={{ key: 's', ctrl: true }}
 *   shortcutDescription="Save document"
 *   onClick={handleSave}
 * >
 *   Save
 * </ButtonWithShortcut>
 */
export const ButtonWithShortcut = React.forwardRef<HTMLButtonElement, ButtonWithShortcutProps>(
  (
    {
      shortcut,
      shortcutDescription,
      showShortcutHint = true,
      onShortcutTrigger,
      onClick,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Register keyboard shortcut if provided
    if (shortcut?.key) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useKeyboardShortcut(
        (_e) => {
          if (!disabled) {
            // Call the shortcut handler or the regular onClick
            if (onShortcutTrigger) {
              onShortcutTrigger();
            } else if (onClick) {
              const syntheticEvent = new MouseEvent(
                'click',
              ) as unknown as React.MouseEvent<HTMLButtonElement>;
              onClick(syntheticEvent);
            }
          }
        },
        {
          key: shortcut.key,
          ctrl: shortcut.ctrl,
          cmd: shortcut.cmd,
          alt: shortcut.alt,
          shift: shortcut.shift,
          description: shortcutDescription || shortcut.description || 'Button action',
          category: shortcut.category || 'other',
          enabled: !disabled,
        },
      );
    }

    return (
      <Button ref={ref} onClick={onClick} disabled={disabled} {...props}>
        <span className="flex items-center gap-2">
          {children}
          {shortcut && showShortcutHint && (
            <ShortcutHint shortcut={shortcut} position="inline" size="xs" className="ml-1" />
          )}
        </span>
      </Button>
    );
  },
);

ButtonWithShortcut.displayName = 'ButtonWithShortcut';
