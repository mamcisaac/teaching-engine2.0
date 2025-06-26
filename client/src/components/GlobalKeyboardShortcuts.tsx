import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useNotification } from '../contexts/NotificationContext';

export const GlobalKeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotification();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global: Show keyboard shortcuts help (? or F1)
  useKeyboardShortcut(
    () => setIsHelpOpen(true),
    { key: '?', description: 'Show keyboard shortcuts help', category: 'global' }
  );

  useKeyboardShortcut(
    () => setIsHelpOpen(true),
    { key: 'F1', description: 'Show help', category: 'global' }
  );

  // Global: Create new lesson plan (Ctrl/Cmd + N)
  useKeyboardShortcut(
    () => {
      navigate('/planner/quick-lesson');
      addNotification('info', 'Create a new lesson plan');
    },
    { 
      key: 'n', 
      ctrl: true, 
      cmd: true, 
      description: 'Create new lesson plan', 
      category: 'global' 
    }
  );

  // Global: Save current work (Ctrl/Cmd + S)
  useKeyboardShortcut(
    (e) => {
      // Dispatch a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('global:save'));
      addNotification('success', 'Saved successfully');
    },
    { 
      key: 's', 
      ctrl: true, 
      cmd: true, 
      description: 'Save current work', 
      category: 'global',
      preventDefault: true 
    }
  );

  // Global: Search/Find (Ctrl/Cmd + F)
  const handleSearch = useCallback(() => {
    setIsSearchOpen(true);
    // Dispatch event for components to handle search
    window.dispatchEvent(new CustomEvent('global:search'));
  }, []);

  useKeyboardShortcut(
    handleSearch,
    { 
      key: 'f', 
      ctrl: true, 
      cmd: true, 
      description: 'Search/Find', 
      category: 'global',
      preventDefault: true 
    }
  );

  // Global: Close modals/overlays (Escape)
  useKeyboardShortcut(
    () => {
      // Dispatch event for components to handle escape
      window.dispatchEvent(new CustomEvent('global:escape'));
      setIsSearchOpen(false);
    },
    { 
      key: 'Escape', 
      description: 'Close modals/overlays', 
      category: 'global',
      visible: false // Don't show in help since it's obvious
    }
  );

  // Navigation: Dashboard (Alt + D)
  useKeyboardShortcut(
    () => navigate('/planner/dashboard'),
    { 
      key: 'd', 
      alt: true, 
      description: 'Go to Dashboard', 
      category: 'navigation' 
    }
  );

  // Navigation: Planning (Alt + P)
  useKeyboardShortcut(
    () => navigate('/planner/long-range'),
    { 
      key: 'p', 
      alt: true, 
      description: 'Go to Planning', 
      category: 'navigation' 
    }
  );

  // Navigation: Curriculum (Alt + C)
  useKeyboardShortcut(
    () => navigate('/curriculum'),
    { 
      key: 'c', 
      alt: true, 
      description: 'Go to Curriculum', 
      category: 'navigation' 
    }
  );

  // Navigation: Help (Alt + H)
  useKeyboardShortcut(
    () => navigate('/help'),
    { 
      key: 'h', 
      alt: true, 
      description: 'Go to Help', 
      category: 'navigation' 
    }
  );

  // Navigation: Previous page (Alt + Left Arrow)
  useKeyboardShortcut(
    () => window.history.back(),
    { 
      key: 'ArrowLeft', 
      alt: true, 
      description: 'Go back', 
      category: 'navigation' 
    }
  );

  // Navigation: Next page (Alt + Right Arrow)
  useKeyboardShortcut(
    () => window.history.forward(),
    { 
      key: 'ArrowRight', 
      alt: true, 
      description: 'Go forward', 
      category: 'navigation' 
    }
  );

  return (
    <>
      <KeyboardShortcutsHelp 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
      
      {/* Global Search Modal */}
      {isSearchOpen && (
        <GlobalSearch onClose={() => setIsSearchOpen(false)} />
      )}
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
      navigate(`/curriculum?search=${encodeURIComponent(query)}`);
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Search Teaching Engine
          </h3>
          
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for curriculum, lessons, or resources..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
          
          <p className="mt-2 text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};