import { screen } from '@testing-library/react';
import MilestoneList from '../components/MilestoneList';
import type { Milestone } from '../api';
import { renderWithRouter } from '../test-utils';

describe('MilestoneList', () => {
  it('renders milestones with links', () => {
    const milestones: Milestone[] = [
      { id: 1, title: 'M1', subjectId: 1, activities: [] },
      { id: 2, title: 'M2', subjectId: 1, activities: [] },
    ];

    renderWithRouter(<MilestoneList milestones={milestones} />);

    expect(screen.getByText('M1')).toHaveAttribute('href', '/milestones/1');
    expect(screen.getByText('M2')).toHaveAttribute('href', '/milestones/2');
  });
});
