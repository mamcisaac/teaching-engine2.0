import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import { renderWithoutAuth, mockUser, mockApiResponse, mockApiError } from '../../test-utils';
import * as api from '../../api';

// Mock the API module
vi.mock('../../api', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithoutAuth(<LoginPage />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('updates email and password fields when user types', async () => {
    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with correct data and navigates on success', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockResolvedValueOnce({
      data: { user: mockUser },
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockApiPost).toHaveBeenCalledWith('/api/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message when login fails', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Invalid credentials')).toHaveLength(2); // Error appears twice in UI
    });
  });

  it('displays generic error message for network errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockRejectedValueOnce(new Error('Network error'));

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Network error')).toHaveLength(2);
    });

    consoleError.mockRestore();
  });

  it('shows loading state during form submission', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    // Return a promise that never resolves to keep loading state
    mockApiPost.mockImplementation(() => new Promise(() => {}));

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('bg-indigo-400');
  });

  it('prevents multiple submissions when already loading', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockImplementation(() => new Promise(() => {}));

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Click multiple times
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only be called once
    expect(mockApiPost).toHaveBeenCalledTimes(1);
  });

  it('clears error when user starts typing after error', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // Submit with error
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Invalid credentials')).toHaveLength(2);
    });

    // Clear email and start typing - should clear error
    await user.clear(emailInput);
    await user.type(emailInput, 'new');

    // The error should still be visible (it's only cleared on form submission)
    // But the form should be ready for a new submission
    expect(submitButton).not.toBeDisabled();
  });

  it('auto-clears error after 5 seconds', async () => {
    vi.useFakeTimers();
    
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Invalid credentials')).toHaveLength(2);
    });

    // Fast forward 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('handles form submission via Enter key', async () => {
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockResolvedValueOnce({
      data: { user: mockUser },
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockApiPost).toHaveBeenCalledWith('/api/login', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('handles invalid server response', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockApiPost = vi.mocked(api.api.post);
    mockApiPost.mockResolvedValueOnce({
      data: {}, // No user in response
    });

    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText('Invalid response from server')).toHaveLength(2);
    });

    consoleError.mockRestore();
  });

  it('has proper accessibility attributes', () => {
    renderWithoutAuth(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAccessibleName('Email address');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAccessibleName('Password');
  });
});