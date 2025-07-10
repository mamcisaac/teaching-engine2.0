import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
// import { useNotification } from '../contexts/NotificationContext';

export const GlobalKeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const _location = useLocation();
  // const { addNotification } = useNotification();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Wrap all handlers in useCallback to prevent infinite re-renders
  const handleShowHelp = useCallback(() => {
 setIsHelpOpen(true); 
}, []);
  const handleCreateNewLesson = useCallback(() => {
    void navigate('/planner/quick-lesson');
    // addNotification('info', 'Create a new lesson plan');
  }, [navigate]);
  const handleSave = useCallback(() => {
    // Dispatch a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('global:save'));
    // addNotification('success', 'Saved successfully');
  }, []);

  // Global: Show keyboard shortcuts help (? or F1)
  useKeyboardShortcut(handleShowHelp, {
    key: '?',
    description: 'Show keyboard shortcuts help',
    category: 'global',
  });

  useKeyboardShortcut(handleShowHelp, {
    key: 'F1',
    description: 'Show help',
    category: 'global',
  });

  // Global: Create new lesson plan (Ctrl/Cmd + N)
  useKeyboardShortcut(
    handleCreateNewLesson,
    {
      key: 'n',
      ctrl: true,
      cmd: true,
      description: 'Create new lesson plan',
      category: 'global',
    },
  );

  // Global: Save current work (Ctrl/Cmd + S)
  useKeyboardShortcut(
    handleSave,
    {
      key: 's',
      ctrl: true,
      cmd: true,
      description: 'Save current work',
      category: 'global',
      preventDefault: true,
    },
  );

  // Global: Search/Find (Ctrl/Cmd + F)
  const handleSearch = useCallback(() => {
    setIsSearchOpen(true);
    // Dispatch event for components to handle search
    window.dispatchEvent(new CustomEvent('global:search'));
  }, []);

  useKeyboardShortcut(handleSearch, {
    key: 'f',
    ctrl: true,
    cmd: true,
    description: 'Search/Find',
    category: 'global',
    preventDefault: true,
  });

  const handleEscape = useCallback(() => {
    // Dispatch event for components to handle escape
    window.dispatchEvent(new CustomEvent('global:escape'));
    setIsSearchOpen(false);
  }, []);

  const handleNavigateDashboard = useCallback(() => {
 navigate('/planner/dashboard'); 
}, [navigate]);
  const handleNavigatePlanning = useCallback(() => {
 navigate('/planner/long-range'); 
}, [navigate]);
  const handleNavigateCurriculum = useCallback(() => {
 navigate('/curriculum'); 
}, [navigate]);
  const handleNavigateHelp = useCallback(() => {
 navigate('/help'); 
}, [navigate]);
  const handleGoBack = useCallback(() => {
 window.history.back(); 
}, []);
  const handleGoForward = useCallback(() => {
 window.history.forward(); 
}, []);

  // Global: Close modals/overlays (Escape)
  useKeyboardShortcut(
    handleEscape,
    {
      key: 'Escape',
      description: 'Close modals/overlays',
      category: 'global',
      visible: false, // Don't show in help since it's obvious
    },
  );

  // Navigation: Dashboard (Alt + D)
  useKeyboardShortcut(handleNavigateDashboard, {
    key: 'd',
    alt: true,
    description: 'Go to Dashboard',
    category: 'navigation',
  });

  // Navigation: Planning (Alt + P)
  useKeyboardShortcut(handleNavigatePlanning, {
    key: 'p',
    alt: true,
    description: 'Go to Planning',
    category: 'navigation',
  });

  // Navigation: Curriculum (Alt + C)
  useKeyboardShortcut(handleNavigateCurriculum, {
    key: 'c',
    alt: true,
    description: 'Go to Curriculum',
    category: 'navigation',
  });

  // Navigation: Help (Alt + H)
  useKeyboardShortcut(handleNavigateHelp, {
    key: 'h',
    alt: true,
    description: 'Go to Help',
    category: 'navigation',
  });

  // Navigation: Previous page (Alt + Left Arrow)
  useKeyboardShortcut(handleGoBack, {
    key: 'ArrowLeft',
    alt: true,
    description: 'Go back',
    category: 'navigation',
  });

  // Navigation: Next page (Alt + Right Arrow)
  useKeyboardShortcut(handleGoForward, {
    key: 'ArrowRight',
    alt: true,
    description: 'Go forward',
    category: 'navigation',
  });

  return (
    <>
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={() => {
 setIsHelpOpen(false); 
}} />

      {/* Global Search Modal */}
      {isSearchOpen && <GlobalSearch onClose={() => {
 setIsSearchOpen(false); 
}} />}
    </>
  );
};

// Simple global search component
const GlobalSearch: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to curriculum page with search query
      void navigate(`/curriculum?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-4 pt-20">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Teaching Engine</h3>

          <form onSubmit={handleSearch}>
            <input
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search for curriculum, lessons, or resources..."
              type="text"
              value={query}
              onChange={(e) => {
 setQuery(e.target.value); 
}}
            />

            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          <p className="mt-2 text-xs text-gray-500">
            Press{' '}
            <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
              Esc
            </kbd>{' '}
            to close
          </p>
        </div>
      </div>
    </div>
  );
};
