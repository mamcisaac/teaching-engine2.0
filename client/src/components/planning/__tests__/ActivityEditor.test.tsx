import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ActivityEditor } from '../../ActivityEditor';

// Mock the toast hook
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn() as typeof fetch;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockActivity = {
  id: 1,
  titleFr: 'Test Activity FR',
  titleEn: 'Test Activity EN',
  descriptionFr: 'Test Description FR',
  descriptionEn: 'Test Description EN',
  domain: 'reading',
  subject: 'francais',
  outcomeIds: ['FR4.1', 'FR4.2'],
  materialsFr: 'Matériel FR',
  materialsEn: 'Materials EN',
  prepTimeMin: 30,
  groupType: 'Small group',
};

const mockThemes = [
  { id: 1, title: 'Winter', titleFr: 'Hiver', titleEn: 'Winter' },
  { id: 2, title: 'Spring', titleFr: 'Printemps', titleEn: 'Spring' },
];

describe.skip('ActivityEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    localStorage.setItem('token', 'test-token');

    // Mock themes fetch with proper response
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string | URL | Request) => {
      const urlString = url.toString();
      if (urlString.includes('/api/themes')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockThemes,
        } as Response);
      }
      if (urlString.includes('/api/activity-templates')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ...mockActivity, id: 1 }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    });
  });

  afterEach(() => {
    localStorage.clear();
    queryClient.clear();
  });

  it('renders the activity editor', () => {
    render(<ActivityEditor onSave={vi.fn()} onCancel={vi.fn()} />, {
      wrapper,
    });

    // Check that the component renders
    expect(screen.getByText('Activity Editor')).toBeInTheDocument();
    expect(screen.getByText('Activity ID: New Activity')).toBeInTheDocument();
  });
});
