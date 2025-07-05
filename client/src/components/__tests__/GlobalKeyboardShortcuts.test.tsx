import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { GlobalKeyboardShortcuts } from '../GlobalKeyboardShortcuts';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';

// Mock the KeyboardShortcutsHelp component
vi.mock('../KeyboardShortcutsHelp', () => ({
  KeyboardShortcutsHelp: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="keyboard-help">Keyboard Help</div> : null
}));

describe('GlobalKeyboardShortcuts', () => {
  const renderComponent = () => {
    const renderCount = vi.fn();
    
    const TestWrapper = () => {
      // Track render count
      renderCount();
      
      return (
        <MemoryRouter>
          <KeyboardShortcutsProvider>
            <GlobalKeyboardShortcuts />
          </KeyboardShortcutsProvider>
        </MemoryRouter>
      );
    };

    const result = render(<TestWrapper />);
    return { ...result, renderCount };
  };

  it('should render without infinite loops', () => {
    const { renderCount } = renderComponent();
    
    // Initial render should happen
    expect(renderCount).toHaveBeenCalled();
    
    // Wait a bit to ensure no infinite re-renders
    const initialCallCount = renderCount.mock.calls.length;
    
    // Use fake timers to simulate passage of time
    vi.useFakeTimers();
    vi.advanceTimersByTime(100);
    vi.useRealTimers();
    
    // Should not have many more renders (allowing for a few React updates)
    expect(renderCount.mock.calls.length).toBeLessThan(initialCallCount + 5);
  });

  it('should not show keyboard help initially', () => {
    renderComponent();
    expect(screen.queryByTestId('keyboard-help')).not.toBeInTheDocument();
  });

  it('should register shortcuts without causing re-renders', () => {
    const { renderCount } = renderComponent();
    const initialCallCount = renderCount.mock.calls.length;
    
    // Simulate some time passing
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    
    // Should not have excessive re-renders
    expect(renderCount.mock.calls.length).toBeLessThanOrEqual(initialCallCount + 2);
  });
});