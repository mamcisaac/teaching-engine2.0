import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { useKeyboardShortcuts, formatShortcut, KeyboardShortcut } from '../contexts/KeyboardShortcutsContext';
import { Switch } from './ui/Switch';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { shortcuts, preferences, updatePreferences } = useKeyboardShortcuts();
  const [activeCategory, setActiveCategory] = useState<KeyboardShortcut['category']>('global');

  // Group shortcuts by category
  const shortcutsByCategory = shortcuts
    .filter(s => s.visible !== false)
    .reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<KeyboardShortcut['category'], KeyboardShortcut[]>);

  const categories: Array<{ id: KeyboardShortcut['category']; label: string; icon: React.ReactNode }> = [
    {
      id: 'global',
      label: 'Global',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'navigation',
      label: 'Navigation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'editing',
      label: 'Editing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'other',
      label: 'Other',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      )
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="lg"
      closeOnEscape={true}
    >
      <div className="flex flex-col h-[500px]">
        {/* Settings */}
        <div className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Enable Keyboard Shortcuts</label>
            <Switch
              checked={preferences.enabled}
              onChange={(enabled) => updatePreferences({ enabled })}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <label className="text-sm font-medium text-gray-700">Show Shortcut Hints</label>
            <Switch
              checked={preferences.showHints}
              onChange={(showHints) => updatePreferences({ showHints })}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-4">
          {categories.map(category => {
            const count = shortcutsByCategory[category.id]?.length || 0;
            if (count === 0) return null;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span className="text-sm font-medium">{category.label}</span>
                <span className="text-xs bg-white bg-opacity-60 rounded-full px-2 py-0.5">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto">
          {shortcutsByCategory[activeCategory]?.map(shortcut => (
            <div
              key={shortcut.id}
              className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{shortcut.description}</p>
              </div>
              <div className="ml-4">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            </div>
          ))}
          
          {!shortcutsByCategory[activeCategory] && (
            <div className="text-center py-8 text-gray-500">
              No shortcuts available in this category
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-500">
            <strong>Tip:</strong> Keyboard shortcuts work throughout the app except when typing in text fields.
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Esc</kbd> to close dialogs
            or <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">?</kbd> to show this help.
          </p>
        </div>
      </div>
    </Modal>
  );
};

// Standalone hook to show keyboard shortcuts help
export const useKeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showHelp = () => setIsOpen(true);
  const hideHelp = () => setIsOpen(false);

  return { isOpen, showHelp, hideHelp };
};