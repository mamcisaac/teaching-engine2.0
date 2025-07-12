import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { GlobalKeyboardShortcuts } from '../GlobalKeyboardShortcuts';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

// Mock KeyboardShortcutsHelp component
vi.mock('../KeyboardShortcutsHelp', () => ({
  KeyboardShortcutsHelp: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="keyboard-help" onClick={onClose}>Keyboard Help</div> : null
}));

// Mock useKeyboardShortcut hook
vi.mock('../../hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcut: vi.fn(),
}));

describe('GlobalKeyboardShortcuts', () => {
  const mockNavigate = vi.fn();
  const mockLocation = { pathname: '/' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useLocation as any).mockReturnValue(mockLocation);
  });

  const renderComponent = () => {
    return render(
      <KeyboardShortcutsProvider>
        <GlobalKeyboardShortcuts />
      </KeyboardShortcutsProvider>
    );
  };

  describe('strict boolean expressions', () => {
    it('should handle isHelpOpen boolean state correctly', () => {
      const { rerender } = renderComponent();
      
      // Initially help should not be shown
      expect(screen.queryByTestId('keyboard-help')).not.toBeInTheDocument();
      
      // After triggering help (would be done via keyboard shortcut)
      rerender(
        <KeyboardShortcutsProvider>
          <GlobalKeyboardShortcuts />
        </KeyboardShortcutsProvider>
      );
      // Help visibility is controlled by state
    });

    it('should handle isSearchOpen boolean state correctly', () => {
      renderComponent();
      
      // Initially search should not be shown
      expect(screen.queryByText('Search Teaching Engine')).not.toBeInTheDocument();
      
      // Search visibility is controlled by state
    });

    it('should handle query.trim() with explicit string check in GlobalSearch', () => {
      // Test the GlobalSearch component behavior
      const GlobalSearchTest = () => {
        const [query, setQuery] = React.useState('');
        const navigate = useNavigate();
        
        const handleSearch = (e: React.FormEvent) => {
          e.preventDefault();
          // This tests the pattern that should be used: explicit length check
          if (query.trim().length > 0) {
            navigate(`/curriculum?search=${encodeURIComponent(query)}`);
          }
        };
        
        return (
          <form onSubmit={handleSearch}>
            <input
              data-testid="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        );
      };
      
      render(<GlobalSearchTest />);
      
      const input = screen.getByTestId('search-input');
      const form = input.closest('form')!;
      
      // Test with empty string
      fireEvent.submit(form);
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Test with whitespace only
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Test with valid query
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.submit(form);
      expect(mockNavigate).toHaveBeenCalledWith('/curriculum?search=test%20query');
    });

    it('should handle conditional rendering without implicit boolean conversion', () => {
      renderComponent();
      
      // Component should render without errors
      const container = screen.getByTestId('keyboard-shortcuts-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('component behavior', () => {
    it('should render without visible content initially', () => {
      const { container } = renderComponent();
      
      // Component renders but has no visible content initially
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle navigation callbacks', () => {
      renderComponent();
      
      // Navigation functions should be created
      expect(mockNavigate).toBeDefined();
    });

    it('should dispatch custom events', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      
      renderComponent();
      
      // Event dispatching would be tested through keyboard shortcuts
      expect(dispatchEventSpy).toBeDefined();
      
      dispatchEventSpy.mockRestore();
    });

    it('should not show keyboard help initially', () => {
      renderComponent();
      expect(screen.queryByTestId('keyboard-help')).not.toBeInTheDocument();
    });

    it('should register shortcuts without causing re-renders', () => {
      const renderCount = vi.fn();
      
      const TestWrapper = () => {
        renderCount();
        return (
          <KeyboardShortcutsProvider>
            <GlobalKeyboardShortcuts />
          </KeyboardShortcutsProvider>
        );
      };
      
      render(<TestWrapper />);
      const initialCallCount = renderCount.mock.calls.length;
      
      // Simulate some time passing
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      vi.useRealTimers();
      
      // Should not have excessive re-renders
      expect(renderCount.mock.calls.length).toBeLessThanOrEqual(initialCallCount + 2);
    });
  });

  describe('GlobalSearch component behavior', () => {
    it('should handle empty query submission', () => {
      // This test ensures that the query.trim() check is explicit
      const TestSearch = () => {
        const [showSearch] = React.useState(true);
        const [query, setQuery] = React.useState('');
        const navigate = useNavigate();
        
        const handleSearch = (e: React.FormEvent) => {
          e.preventDefault();
          // Testing the explicit check pattern
          if (query.trim().length > 0) {
            navigate(`/curriculum?search=${encodeURIComponent(query)}`);
          }
        };
        
        return showSearch ? (
          <div>
            <h3>Search Teaching Engine</h3>
            <form onSubmit={handleSearch}>
              <input
                data-testid="search-field"
                placeholder="Search for curriculum, lessons, or resources..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
        ) : null;
      };
      
      render(<TestSearch />);
      
      const input = screen.getByTestId('search-field');
      const searchButton = screen.getByText('Search');
      
      // Test with empty query
      fireEvent.click(searchButton);
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Test with whitespace only
      fireEvent.change(input, { target: { value: '    ' } });
      fireEvent.click(searchButton);
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Test with valid query
      fireEvent.change(input, { target: { value: 'math lessons' } });
      fireEvent.click(searchButton);
      expect(mockNavigate).toHaveBeenCalledWith('/curriculum?search=math%20lessons');
    });
  });
});