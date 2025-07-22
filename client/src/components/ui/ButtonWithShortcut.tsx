import React, { forwardRef } from 'react';

import type { KeyboardShortcut } from '../../contexts/KeyboardShortcutsContext';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

import { Button } from './Button';
import type { ButtonProps } from './Button';
import { ShortcutHint } from './ShortcutHint';

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
export const ButtonWithShortcut = forwardRef<HTMLButtonElement, ButtonWithShortcutProps>(
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
  ): React.ReactElement => {
    // Register keyboard shortcut if provided
    if (shortcut?.key != null && shortcut.key !== '') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useKeyboardShortcut(
        (_e): void => {
          if (disabled !== true) {
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
          description: shortcutDescription ?? shortcut.description ?? 'Button action',
          category: shortcut.category ?? 'other',
          enabled: disabled !== true,
        },
      );
    }

    return (
      <Button ref={ref} aria-label="Click button" onClick={onClick} {...props}>
        <span className="flex items-center gap-2">
          {children}
          {shortcut && showShortcutHint && (
            <ShortcutHint className="ml-1" position="inline" shortcut={shortcut} size="xs" />
          )}
        </span>
      </Button>
    );
  },
);

ButtonWithShortcut.displayName = 'ButtonWithShortcut';
