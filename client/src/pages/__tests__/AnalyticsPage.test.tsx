import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import AnalyticsPage from '../AnalyticsPage';

// Mock the AnalyticsWidget component
vi.mock('@/components/analytics/AnalyticsWidget', () => ({
  AnalyticsWidget: ({ type, title }: { type: string; title?: string }) => (
    <div data-testid={`analytics-widget-${type}`}>
      {title && <h3>{title}</h3>}
      Analytics Widget: {type}
    </div>
  ),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the export service
vi.mock('@/services/analytics/exportService', () => ({
  exportService: {
    exportData: vi.fn().mockResolvedValue(undefined),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    </BrowserRouter>,
  );
};

describe('AnalyticsPage', () => {
  it('renders the analytics dashboard with all tabs', () => {
    renderWithProviders(<AnalyticsPage />);

    // Check page title
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Track student progress, curriculum coverage, and teaching insights'),
    ).toBeInTheDocument();

    // Check all tabs are present
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Curriculum/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Students/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Themes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Vocabulary/i })).toBeInTheDocument();
  });

  it('displays overview widgets by default', () => {
    renderWithProviders(<AnalyticsPage />);

    // Check quick stats cards
    expect(screen.getByText('Curriculum Coverage')).toBeInTheDocument();
    expect(screen.getByText('Active Themes')).toBeInTheDocument();
    expect(screen.getByText('Vocabulary Growth')).toBeInTheDocument();
    expect(screen.getByText('Student Progress')).toBeInTheDocument();

    // Check main overview widgets
    expect(screen.getByTestId('analytics-widget-curriculum-heatmap')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-widget-theme-analytics')).toBeInTheDocument();
  });

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnalyticsPage />);

    // Click on Curriculum tab
    await user.click(screen.getByRole('tab', { name: /Curriculum/i }));

    await waitFor(() => {
      expect(screen.getByText('Curriculum Coverage Analysis')).toBeInTheDocument();
      expect(
        screen.getByText('Detailed view of outcome coverage across time periods'),
      ).toBeInTheDocument();
    });
  });

  it('displays filter controls', () => {
    renderWithProviders(<AnalyticsPage />);

    // Check that filter controls are present
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('All Subjects')).toBeInTheDocument();

    // Verify the select buttons exist
    const termButton = screen.getByText('Current').closest('button');
    const subjectButton = screen.getByText('All Subjects').closest('button');

    expect(termButton).toBeInTheDocument();
    expect(subjectButton).toBeInTheDocument();
    expect(termButton).toHaveAttribute('role', 'combobox');
    expect(subjectButton).toHaveAttribute('role', 'combobox');
  });

  it('displays help section', () => {
    renderWithProviders(<AnalyticsPage />);

    expect(screen.getByText('Analytics Tips')).toBeInTheDocument();
    expect(
      screen.getByText(/Use filters to focus on specific terms or subjects/i),
    ).toBeInTheDocument();
  });

  it('renders student progress in students tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnalyticsPage />);

    // Switch to students tab
    await user.click(screen.getByRole('tab', { name: /Students/i }));

    await waitFor(() => {
      // Should show domain radar charts for students
      const studentWidgets = screen.getAllByTestId(/analytics-widget-domain-radar/);
      expect(studentWidgets).toHaveLength(4); // Shows 4 student cards
    });
  });

  it('renders vocabulary tracking in vocabulary tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnalyticsPage />);

    // Switch to vocabulary tab
    await user.click(screen.getByRole('tab', { name: /Vocabulary/i }));

    await waitFor(() => {
      expect(screen.getByText('Vocabulary Growth Tracking')).toBeInTheDocument();
      expect(
        screen.getByText('Monitor vocabulary acquisition and bilingual development'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('analytics-widget-vocabulary-growth')).toBeInTheDocument();
    });
  });
});
