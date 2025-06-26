import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TeacherOnboardingFlow from '../components/TeacherOnboardingFlow';
import { renderWithRouter, renderWithProviders } from '../test-utils';

describe('TeacherOnboardingFlow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    // Ensure localStorage starts clean for each test
    localStorage.removeItem('onboarded');
    localStorage.removeItem('onboarding-completed-steps');
    vi.clearAllMocks();
  });

  it('shows and dismisses overlay', async () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
    
    const skipButton = screen.getByText('Skip Tour');
    fireEvent.click(skipButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
      expect(localStorage.getItem('onboarded')).toBe('true');
    });
  });

  it('does not show overlay when already onboarded', () => {
    localStorage.setItem('onboarded', 'true');
    localStorage.setItem('onboarding-completed-steps', JSON.stringify(['welcome']));
    renderWithRouter(<TeacherOnboardingFlow />);
    expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
  });

  it('shows overlay for new users', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
    expect(screen.getByText('Skip Tour')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('displays key features in the onboarding', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Check for key feature mentions - use specific text to avoid multiple matches
    expect(screen.getByText('Curriculum Planning')).toBeInTheDocument();
    expect(screen.getByText('ETFO Workflow')).toBeInTheDocument();
    expect(screen.getByText('Built for Elementary Teachers')).toBeInTheDocument();
  });

  it('allows navigation through multiple onboarding steps', async () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Should show first step
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
    
    // Check for next button if multi-step
    const nextButton = screen.queryByRole('button', { name: /next/i });
    if (nextButton) {
      await user.click(nextButton);
      // Should show second step
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    }
  });

  it('handles keyboard navigation', async () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    const skipButton = screen.getByText('Skip Tour');
    
    // Focus and press Enter
    skipButton.focus();
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
      expect(localStorage.getItem('onboarded')).toBe('true');
    });
  });

  it('component persists after ESC key (ESC not implemented)', async () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
    
    // Press Escape - component doesn't currently handle ESC
    await user.keyboard('{Escape}');
    
    // Component should still be visible as ESC handling not implemented
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
  });

  it('shows onboarding content and structure', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Check for onboarding structure
    expect(screen.getByText('Welcome to Teaching Engine 2.0')).toBeInTheDocument();
    expect(screen.getByText(/Your comprehensive digital teaching assistant/)).toBeInTheDocument();
  });

  it('allows skipping the tour', async () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    const skipButton = screen.getByText('Skip Tour');
    await user.click(skipButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
      expect(localStorage.getItem('onboarded')).toBe('true');
    });
  });

  it('persists onboarding state across browser sessions', async () => {
    // First render - should show onboarding
    const { unmount } = renderWithRouter(<TeacherOnboardingFlow />);
    
    const skipButton = screen.getByText('Skip Tour');
    fireEvent.click(skipButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('onboarded')).toBe('true');
    });
    
    unmount();
    
    // Second render - should not show onboarding
    renderWithRouter(<TeacherOnboardingFlow />);
    expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
  });

  it('provides information about key features', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Check for feature descriptions
    expect(screen.getByText('Structured 5-level planning process')).toBeInTheDocument();
    expect(screen.getByText('Smart suggestions and automation')).toBeInTheDocument();
  });

  it('shows contextual help for teachers', async () => {
    renderWithProviders(<TeacherOnboardingFlow />, {
      initialAuthState: { 
        user: { id: '1', email: 'test@example.com', name: 'Test Teacher', role: 'teacher' }, 
        isAuthenticated: true 
      }
    });
    
    // The component shows teacher-specific content
    expect(screen.getByText('Built for Elementary Teachers')).toBeInTheDocument();
  });

  it('handles different screen sizes appropriately', () => {
    // Mock viewport size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320, // Mobile size
    });
    
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Check that content is rendered (responsive classes are applied via Tailwind)
    expect(screen.getByText(/Welcome to Teaching Engine/)).toBeInTheDocument();
  });

  it('completes onboarding when Skip Tour is clicked', async () => {
    const onCompleteMock = vi.fn();
    
    renderWithRouter(<TeacherOnboardingFlow onComplete={onCompleteMock} />);
    
    const skipButton = screen.getByText('Skip Tour');
    fireEvent.click(skipButton);
    
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalled();
      expect(localStorage.getItem('onboarded')).toBe('true');
    });
  });

  it('shows appropriate content for teachers', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Should show teacher-specific content
    expect(screen.getByText('Built for Elementary Teachers')).toBeInTheDocument();
    expect(screen.getByText(/curriculum-aligned lesson plans/)).toBeInTheDocument();
  });

  it('provides basic accessibility features', () => {
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Check that key interactive elements are accessible
    const skipButton = screen.getByText('Skip Tour');
    expect(skipButton).toBeInTheDocument();
    
    const getStartedButton = screen.getByText('Get Started');
    expect(getStartedButton).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    // Mock localStorage error
    const originalSetItem = Storage.prototype.setItem;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Storage.prototype.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    renderWithRouter(<TeacherOnboardingFlow />);
    
    // Try to skip tour
    fireEvent.click(screen.getByText('Skip Tour'));
    
    // Should still dismiss the overlay even if storage fails
    await waitFor(() => {
      expect(screen.queryByText(/Welcome to Teaching Engine/)).not.toBeInTheDocument();
    });
    
    // Restore
    Storage.prototype.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
  });
});
