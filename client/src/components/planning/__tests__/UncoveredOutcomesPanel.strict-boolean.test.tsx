import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { apiClient } from '@/api/core/client';

import { UncoveredOutcomesPanel } from '../UncoveredOutcomesPanel';

vi.mock('@/api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('UncoveredOutcomesPanel - Strict Boolean Expressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('query parameter handling', () => {
    it('should handle undefined startDate, endDate, and theme', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: [] });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/ai-suggestions/uncovered?');
      });
    });

    it('should append parameters only when they are defined', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: [] });
      
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const theme = 'Winter Activities';

      render(
        <UncoveredOutcomesPanel
          startDate={startDate}
          endDate={endDate}
          theme={theme}
          onSelectSuggestion={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const call = (apiClient.get as Mock).mock.calls[0];
        const url = call[0];
        expect(url).toContain('startDate=');
        expect(url).toContain('endDate=');
        expect(url).toContain('theme=Winter%20Activities');
      });
    });

    it('should handle partial parameters correctly', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: [] });
      
      const startDate = new Date('2024-01-01');

      render(
        <UncoveredOutcomesPanel
          startDate={startDate}
          onSelectSuggestion={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const call = (apiClient.get as Mock).mock.calls[0];
        const url = call[0];
        expect(url).toContain('startDate=');
        expect(url).not.toContain('endDate=');
        expect(url).not.toContain('theme=');
      });
    });
  });

  describe('uncoveredOutcomes data handling', () => {
    it('should handle undefined data from API', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: undefined });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Tous les résultats couverts!')).toBeInTheDocument();
      });
    });

    it('should handle null data from API', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: null });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Tous les résultats couverts!')).toBeInTheDocument();
      });
    });

    it('should handle empty array', async () => {
      (apiClient.get as Mock).mockResolvedValue({ data: [] });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Tous les résultats couverts!')).toBeInTheDocument();
      });
    });

    it('should render outcomes when data is present', async () => {
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: null,
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('A1.1')).toBeInTheDocument();
        expect(screen.getByText('Understanding numbers')).toBeInTheDocument();
      });
    });
  });

  describe('suggestion rendering', () => {
    it('should render suggestion when present', async () => {
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: {
            id: 1,
            expectationId: '1',
            userId: 1,
            title: 'Number Line Activity',
            descriptionFr: 'Activité de ligne numérique',
            materials: ['number cards', 'string'],
            duration: 30,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Number Line Activity')).toBeInTheDocument();
        expect(screen.getByText('30 min')).toBeInTheDocument();
        expect(screen.getByText('Use this activity')).toBeInTheDocument();
      });
    });

    it('should not render suggestion section when suggestion is null', async () => {
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: null,
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByText('Use this activity')).not.toBeInTheDocument();
        expect(screen.getByText('Suggest Activity')).toBeInTheDocument();
      });
    });

    it('should show suggest button only when suggestion is null', async () => {
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: null,
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        const suggestButton = screen.getByRole('button', { name: /suggest activity/i });
        expect(suggestButton).toBeInTheDocument();
      });
    });

    it('should not show suggest button when suggestion exists', async () => {
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: {
            id: 1,
            expectationId: '1',
            userId: 1,
            title: 'Number Line Activity',
            descriptionFr: 'Activité de ligne numérique',
            materials: ['number cards', 'string'],
            duration: 30,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /suggest activity/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onSelectSuggestion when Use this activity is clicked', async () => {
      const user = userEvent.setup();
      const onSelectSuggestion = vi.fn();
      
      const mockSuggestion = {
        id: 1,
        expectationId: '1',
        userId: 1,
        title: 'Number Line Activity',
        descriptionFr: 'Activité de ligne numérique',
        materials: ['number cards', 'string'],
        duration: 30,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: mockSuggestion,
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={onSelectSuggestion} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Use this activity')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Use this activity'));
      expect(onSelectSuggestion).toHaveBeenCalledWith(mockSuggestion);
    });

    it('should generate suggestion when Suggest Activity is clicked', async () => {
      const user = userEvent.setup();
      
      const mockData = [
        {
          expectation: {
            id: '1',
            code: 'A1.1',
            subject: 'Math',
            grade: 4,
            description: 'Understanding numbers',
            strand: 'Number Sense',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
          suggestion: null,
        },
      ];

      (apiClient.get as Mock).mockResolvedValue({ data: mockData });
      (apiClient.post as Mock).mockResolvedValue({ 
        data: {
          id: 2,
          expectationId: '1',
          userId: 1,
          title: 'Generated Activity',
          descriptionFr: 'Activité générée',
          materials: [],
          duration: 45,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }
      });

      render(
        <UncoveredOutcomesPanel onSelectSuggestion={vi.fn()} theme="Math Focus" />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Suggest Activity')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Suggest Activity'));

      expect(apiClient.post).toHaveBeenCalledWith('/ai-suggestions/generate', {
        outcomeId: '1',
        theme: 'Math Focus',
      });
    });
  });
});