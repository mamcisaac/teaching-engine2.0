import { screen } from '@testing-library/react';
import ActivityList from '../components/ActivityList';
import type { Activity } from '../api';
import { renderWithRouter } from '../test-utils';

describe('ActivityList', () => {
  it('renders activities', () => {
    const activities: Activity[] = [
      { id: 1, title: 'A1', milestoneId: 1, completedAt: null },
      { id: 2, title: 'A2', milestoneId: 1, completedAt: null },
    ];

    renderWithRouter(<ActivityList activities={activities} />);

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
  });
});
