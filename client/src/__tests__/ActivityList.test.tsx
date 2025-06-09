import { screen } from '@testing-library/react';
import ActivityList from '../components/ActivityList';
import type { Activity } from '../api';
import { renderWithRouter } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useCreateActivity: () => ({ mutate: vi.fn() }),
    useUpdateActivity: () => ({ mutate: vi.fn() }),
    useDeleteActivity: () => ({ mutate: vi.fn() }),
  };
});

describe('ActivityList', () => {
  it('renders activities', () => {
    const activities: Activity[] = [
      { id: 1, title: 'A1', milestoneId: 1, completedAt: null },
      { id: 2, title: 'A2', milestoneId: 1, completedAt: null },
    ];

    renderWithRouter(<ActivityList activities={activities} milestoneId={1} />);

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });

  it('associates each checkbox with a label', () => {
    const activities: Activity[] = [
      { id: 1, title: 'A1', milestoneId: 1, completedAt: null },
      { id: 2, title: 'A2', milestoneId: 1, completedAt: null },
    ];

    renderWithRouter(<ActivityList activities={activities} milestoneId={1} />);

    activities.forEach((a) => {
      const labelText = `Mark ${a.title} complete`;
      const checkbox = screen.getByLabelText(labelText) as HTMLInputElement;
      expect(checkbox).toBeInTheDocument();
      expect(checkbox.type).toBe('checkbox');
    });
  });
});
