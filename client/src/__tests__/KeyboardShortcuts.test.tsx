import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcutsProvider, useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { KeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';
import { ShortcutHint } from '../components/ui/ShortcutHint';

// Test component that uses keyboard shortcuts
const TestComponent: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [saved, setSaved] = React.useState(false);

  useKeyboardShortcut(
    () => setCount(c => c + 1),
    { key: 'i', ctrl: true, description: 'Increment counter', category: 'global' }
  );

  useKeyboardShortcut(
    () => setSaved(true),
    { key: 's', ctrl: true, cmd: true, description: 'Save', category: 'global' }
  );

  return (
    <div>
      <div data-testid="count">Count: {count}</div>
      <div data-testid="saved">{saved ? 'Saved!' : 'Not saved'}</div>
      <input type="text" data-testid="text-input" placeholder="Type here" />
    </div>
  );
};

// Test component for preferences
const PreferencesTestComponent: React.FC = () => {
  const { preferences, updatePreferences } = useKeyboardShortcuts();
  
  return (
    <div>
      <div data-testid="enabled">{preferences.enabled ? 'Enabled' : 'Disabled'}</div>
      <div data-testid="show-hints">{preferences.showHints ? 'Show hints' : 'Hide hints'}</div>
      <button onClick={() => updatePreferences({ enabled: !preferences.enabled })}>
        Toggle Enabled
      </button>
      <button onClick={() => updatePreferences({ showHints: !preferences.showHints })}>
        Toggle Hints
      </button>
    </div>
  );
};

describe('KeyboardShortcuts', () => {
  describe('KeyboardShortcutsProvider', () => {
    it('provides keyboard shortcuts context', () => {
      render(
        <KeyboardShortcutsProvider>
          <TestComponent />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    });

    it('handles keyboard shortcuts when triggered', async () => {
      render(
        <KeyboardShortcutsProvider>
          <TestComponent />
        </KeyboardShortcutsProvider>
      );

      // Trigger Ctrl+I
      fireEvent.keyDown(window, { key: 'i', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('Count: 1');
      });
    });

    it('ignores shortcuts when typing in input fields', async () => {
      render(
        <KeyboardShortcutsProvider>
          <TestComponent />
        </KeyboardShortcutsProvider>
      );

      const input = screen.getByTestId('text-input');
      input.focus();

      // Trigger Ctrl+I while focused on input
      fireEvent.keyDown(input, { key: 'i', ctrlKey: true });

      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    });

    it('allows Escape key in input fields', async () => {
      const handleEscape = jest.fn();
      
      const EscapeTestComponent = () => {
        useKeyboardShortcut(
          handleEscape,
          { key: 'Escape', description: 'Close', category: 'global' }
        );
        
        return <input type="text" data-testid="input" />;
      };

      render(
        <KeyboardShortcutsProvider>
          <EscapeTestComponent />
        </KeyboardShortcutsProvider>
      );

      const input = screen.getByTestId('input');
      input.focus();

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(handleEscape).toHaveBeenCalled();
    });
  });

  describe('Preferences', () => {
    it('loads and saves preferences', async () => {
      render(
        <KeyboardShortcutsProvider>
          <PreferencesTestComponent />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByTestId('enabled')).toHaveTextContent('Enabled');
      expect(screen.getByTestId('show-hints')).toHaveTextContent('Show hints');

      // Toggle enabled
      fireEvent.click(screen.getByText('Toggle Enabled'));

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('Disabled');
      });

      // Check localStorage
      const saved = JSON.parse(localStorage.getItem('keyboard-shortcuts-preferences') || '{}');
      expect(saved.enabled).toBe(false);
    });

    it('disables shortcuts when preferences.enabled is false', async () => {
      render(
        <KeyboardShortcutsProvider>
          <PreferencesTestComponent />
          <TestComponent />
        </KeyboardShortcutsProvider>
      );

      // Disable shortcuts
      fireEvent.click(screen.getByText('Toggle Enabled'));

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('Disabled');
      });

      // Try to trigger shortcut
      fireEvent.keyDown(window, { key: 'i', ctrlKey: true });

      expect(screen.getByTestId('count')).toHaveTextContent('Count: 0');
    });
  });

  describe('ShortcutHint', () => {
    it('displays shortcut hint when preferences.showHints is true', () => {
      render(
        <KeyboardShortcutsProvider>
          <ShortcutHint shortcut={{ key: 's', ctrl: true }} />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByText(/Ctrl\+S/i)).toBeInTheDocument();
    });

    it('hides shortcut hint when preferences.showHints is false', async () => {
      render(
        <KeyboardShortcutsProvider>
          <PreferencesTestComponent />
          <ShortcutHint shortcut={{ key: 's', ctrl: true }} />
        </KeyboardShortcutsProvider>
      );

      // Toggle hints off
      fireEvent.click(screen.getByText('Toggle Hints'));

      await waitFor(() => {
        expect(screen.queryByText(/Ctrl\+S/i)).not.toBeInTheDocument();
      });
    });

    it('always shows hint when showAlways is true', async () => {
      render(
        <KeyboardShortcutsProvider>
          <PreferencesTestComponent />
          <ShortcutHint shortcut={{ key: 's', ctrl: true }} showAlways={true} />
        </KeyboardShortcutsProvider>
      );

      // Toggle hints off
      fireEvent.click(screen.getByText('Toggle Hints'));

      await waitFor(() => {
        expect(screen.getByTestId('show-hints')).toHaveTextContent('Hide hints');
      });

      // Hint should still be visible
      expect(screen.getByText(/Ctrl\+S/i)).toBeInTheDocument();
    });
  });

  describe('KeyboardShortcutsHelp', () => {
    it('displays help modal with all shortcuts', () => {
      const TestWithHelp = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        
        useKeyboardShortcut(
          () => {},
          { key: 'n', ctrl: true, description: 'New file', category: 'global' }
        );
        
        useKeyboardShortcut(
          () => {},
          { key: 'd', alt: true, description: 'Dashboard', category: 'navigation' }
        );
        
        return <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />;
      };

      render(
        <KeyboardShortcutsProvider>
          <TestWithHelp />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('New file')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('groups shortcuts by category', () => {
      const TestWithHelp = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        
        useKeyboardShortcut(
          () => {},
          { key: 'n', ctrl: true, description: 'New file', category: 'global' }
        );
        
        useKeyboardShortcut(
          () => {},
          { key: 'd', alt: true, description: 'Dashboard', category: 'navigation' }
        );
        
        return <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />;
      };

      render(
        <KeyboardShortcutsProvider>
          <TestWithHelp />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByText('Global')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });
  });

  describe('Platform-specific shortcuts', () => {
    it('uses Cmd key on Mac', () => {
      // Mock Mac platform
      const originalPlatform = navigator.platform;
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true
      });

      render(
        <KeyboardShortcutsProvider>
          <ShortcutHint shortcut={{ key: 's', cmd: true }} />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByText(/⌘S/)).toBeInTheDocument();

      // Restore original platform
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true
      });
    });

    it('uses Ctrl key on Windows/Linux', () => {
      // Mock Windows platform
      const originalPlatform = navigator.platform;
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
        configurable: true
      });

      render(
        <KeyboardShortcutsProvider>
          <ShortcutHint shortcut={{ key: 's', ctrl: true }} />
        </KeyboardShortcutsProvider>
      );

      expect(screen.getByText(/Ctrl\+S/)).toBeInTheDocument();

      // Restore original platform
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true
      });
    });
  });
});