/**
 * Test Providers for Real Component Testing
 * Provides real context providers and utilities for TDD-compliant tests
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { vi } from 'vitest';

// Create a test query client with specific settings
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests
        gcTime: 0, // Don't cache in tests
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock user for authenticated tests
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
};

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialAuthState?: {
    user: typeof mockUser | null;
    token: string | null;
    loading: boolean;
  };
  initialRoute?: string;
}

export function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  initialAuthState = {
    user: null,
    token: null,
    loading: false,
  },
  initialRoute = '/',
}: AllProvidersProps) {
  // Mock AuthContext value
  const mockAuthContext = {
    ...initialAuthState,
    login: vi.fn().mockResolvedValue({ user: mockUser, token: 'mock-token' }),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue({ user: mockUser, token: 'mock-token' }),
    updateUser: vi.fn().mockResolvedValue(mockUser),
    checkAuth: vi.fn().mockResolvedValue(true),
  };

  React.useEffect(() => {
    if (initialRoute !== '/') {
      window.history.pushState({}, '', initialRoute);
    }
  }, [initialRoute]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Authenticated wrapper
export function AuthenticatedProviders({
  children,
  user = mockUser,
  ...props
}: Omit<AllProvidersProps, 'initialAuthState'> & {
  user?: typeof mockUser;
}) {
  return (
    <AllProviders
      {...props}
      initialAuthState={{
        user,
        token: 'mock-token',
        loading: false,
      }}
    >
      {children}
    </AllProviders>
  );
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authenticated?: boolean;
  user?: typeof mockUser;
  initialRoute?: string;
  initialAuthState?: AllProvidersProps['initialAuthState'];
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient,
    authenticated = false,
    user = mockUser,
    initialRoute = '/',
    initialAuthState,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (authenticated) {
      return (
        <AuthenticatedProviders
          queryClient={queryClient}
          user={user}
          initialRoute={initialRoute}
        >
          {children}
        </AuthenticatedProviders>
      );
    }

    return (
      <AllProviders
        queryClient={queryClient}
        initialAuthState={initialAuthState}
        initialRoute={initialRoute}
      >
        {children}
      </AllProviders>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test utilities for different scenarios
export const testUtils = {
  // Render with authenticated user
  renderAuthenticated: (ui: React.ReactElement, options?: CustomRenderOptions) =>
    renderWithProviders(ui, { ...options, authenticated: true }),

  // Render with specific user
  renderWithUser: (ui: React.ReactElement, user: typeof mockUser, options?: CustomRenderOptions) =>
    renderWithProviders(ui, { ...options, authenticated: true, user }),

  // Render with loading state
  renderLoading: (ui: React.ReactElement, options?: CustomRenderOptions) =>
    renderWithProviders(ui, {
      ...options,
      initialAuthState: { user: null, token: null, loading: true },
    }),

  // Render with specific route
  renderWithRoute: (ui: React.ReactElement, route: string, options?: CustomRenderOptions) =>
    renderWithProviders(ui, { ...options, initialRoute: route }),

  // Create test query client with specific config
  createQueryClient: (config?: { queries?: unknown; mutations?: any }) =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
          ...config?.queries,
        },
        mutations: {
          retry: false,
          ...config?.mutations,
        },
      },
    }),
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };

// Custom vitest matchers for common assertions
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T;
      toHaveClass(className: string): T;
      toBeVisible(): T;
      toBeDisabled(): T;
      toBeEnabled(): T;
      toHaveValue(value: string | string[] | number): T;
      toHaveTextContent(text: string | RegExp): T;
    }
  }
}

// Mock console errors/warnings in tests to keep output clean
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Helper for waiting for loading states
export async function waitForLoadingToFinish() {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
  });
}

// Helper for waiting for error states
export async function waitForError(errorMessage?: string) {
  const { waitFor, screen } = await import('@testing-library/react');
  await waitFor(() => {
    if (errorMessage) {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    } else {
      expect(document.querySelector('[data-testid="error"]')).toBeInTheDocument();
    }
  });
}

// Helper for filling forms
export function fillForm(form: Record<string, string>) {
  const { screen } = require('@testing-library/react');
  const userEvent = require('@testing-library/user-event');
  
  Object.entries(form).forEach(([fieldName, value]) => {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    userEvent.clear(field);
    userEvent.type(field, value);
  });
}

// Performance testing utilities
export const performanceUtils = {
  // Measure component render time
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  // Test with many items
  createLargeDataSet: (count: number, template: unknown) =>
    Array.from({ length: count }, (_, i) => ({ ...template, id: i })),
};