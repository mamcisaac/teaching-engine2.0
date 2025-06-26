import React from 'react';
import { clsx } from 'clsx';
import { formatShortcut, KeyboardShortcut } from '../../contexts/KeyboardShortcutsContext';
import { useKeyboardShortcuts } from '../../contexts/KeyboardShortcutsContext';

interface ShortcutHintProps {
  shortcut: Partial<KeyboardShortcut>;
  className?: string;
  position?: 'inline' | 'tooltip' | 'badge';
  size?: 'xs' | 'sm' | 'md';
  showAlways?: boolean;
}

/**
 * Component that displays keyboard shortcut hints for UI elements
 */
export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  shortcut,
  className,
  position = 'inline',
  size = 'sm',
  showAlways = false
}) => {
  const { preferences } = useKeyboardShortcuts();

  // Don't show if hints are disabled (unless showAlways is true)
  if (!showAlways && !preferences.showHints) {
    return null;
  }

  // Don't show if no shortcut key is provided
  if (!shortcut.key) {
    return null;
  }

  const formattedShortcut = formatShortcut(shortcut as KeyboardShortcut);

  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0.5',
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };

  const baseClasses = clsx(
    'font-mono font-semibold rounded',
    sizeClasses[size],
    className
  );

  if (position === 'badge') {
    return (
      <span className={clsx(baseClasses, 'bg-gray-100 text-gray-700 border border-gray-300')}>
        {formattedShortcut}
      </span>
    );
  }

  if (position === 'tooltip') {
    return (
      <span className={clsx(baseClasses, 'text-gray-500 text-opacity-75')}>
        {formattedShortcut}
      </span>
    );
  }

  // Default inline style
  return (
    <kbd className={clsx(baseClasses, 'bg-gray-100 text-gray-700 border border-gray-300 shadow-sm')}>
      {formattedShortcut}
    </kbd>
  );
};

interface ButtonWithShortcutProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcut?: Partial<KeyboardShortcut>;
  children: React.ReactNode;
}

/**
 * Button component that displays a keyboard shortcut hint
 */
export const ButtonWithShortcut: React.FC<ButtonWithShortcutProps> = ({
  shortcut,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx('inline-flex items-center gap-2', className)}
      {...props}
    >
      {children}
      {shortcut && (
        <ShortcutHint 
          shortcut={shortcut} 
          position="inline" 
          size="xs"
          className="ml-auto"
        />
      )}
    </button>
  );
};

interface TooltipWithShortcutProps {
  content: React.ReactNode;
  shortcut?: Partial<KeyboardShortcut>;
  children: React.ReactNode;
}

/**
 * Tooltip component that includes keyboard shortcut information
 */
export const TooltipWithShortcut: React.FC<TooltipWithShortcutProps> = ({
  content,
  shortcut,
  children
}) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-10 w-max max-w-xs px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2">
        <div>{content}</div>
        {shortcut && (
          <div className="mt-1 text-xs text-gray-400">
            Shortcut: <ShortcutHint shortcut={shortcut} position="tooltip" size="xs" />
          </div>
        )}
        <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

/**
 * Menu item component that displays a keyboard shortcut
 */
interface MenuItemWithShortcutProps {
  label: string;
  shortcut?: Partial<KeyboardShortcut>;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const MenuItemWithShortcut: React.FC<MenuItemWithShortcutProps> = ({
  label,
  shortcut,
  onClick,
  icon,
  disabled = false,
  className
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span>{label}</span>
      </div>
      {shortcut && (
        <ShortcutHint 
          shortcut={shortcut} 
          position="badge" 
          size="xs"
          className="ml-8"
        />
      )}
    </button>
  );
};