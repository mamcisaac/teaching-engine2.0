import { screen } from '@testing-library/react';
import ActivitySuggestionList from '../components/ActivitySuggestionList';
import { renderWithRouter } from '../test-utils';

it('renders suggestions', () => {
  const activities = [
    { id: 1, title: 'A1', milestoneId: 1, completedAt: null },
    { id: 2, title: 'A2', milestoneId: 1, completedAt: null },
  ];
  renderWithRouter(<ActivitySuggestionList activities={activities} />);
  expect(screen.getByText('A1')).toBeInTheDocument();
  expect(screen.getByText('A2')).toBeInTheDocument();
});
