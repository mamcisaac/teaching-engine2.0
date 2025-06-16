import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SubPlanGenerator from '../src/components/SubPlanGenerator';

// Mock the API module
vi.mock('../src/api', () => ({
  generateSubPlan: vi.fn().mockResolvedValue({
    data: new ArrayBuffer(1024), // Mock PDF data
  }),
}));

describe('SubPlanGenerator', () => {
  let queryClient: QueryClient;
  let mockOnClose: () => void;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    mockOnClose = vi.fn();

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Suppress React 18 console errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SubPlanGenerator onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders with default values', () => {
    renderComponent();

    expect(screen.getByText('Generate Sub Plan')).toBeInTheDocument();
    expect(screen.getByText('1 day')).toBeInTheDocument(); // Default days option
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('allows selecting different number of days', () => {
    renderComponent();

    const daysSelect = screen.getByRole('combobox');
    fireEvent.change(daysSelect, { target: { value: '3' } });

    expect(daysSelect).toHaveValue('3');
  });

  it('calls generateSubPlan API when Generate button is clicked', async () => {
    const { generateSubPlan } = await import('../src/api');
    renderComponent();

    const generateButton = screen.getByText('Generate');
    const daysSelect = screen.getByRole('combobox');

    // Set 3 days
    fireEvent.change(daysSelect, { target: { value: '3' } });

    // Click generate
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(generateSubPlan).toHaveBeenCalledWith(
        expect.any(String), // date
        3, // days
      );
    });
  });

  it('handles API call when Generate button is clicked', async () => {
    const { generateSubPlan } = await import('../src/api');
    renderComponent();

    const generateButton = screen.getByText('Generate');
    fireEvent.click(generateButton);

    // Verify API was called
    await waitFor(() => {
      expect(generateSubPlan).toHaveBeenCalled();
    });
  });
});
