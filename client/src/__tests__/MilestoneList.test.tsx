import { screen } from '@testing-library/react';
import MilestoneList from '../components/MilestoneList';
import type { Milestone } from '../types';
import { renderWithRouter } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useCreateMilestone: () => ({ mutate: vi.fn() }),
    useUpdateMilestone: () => ({ mutate: vi.fn() }),
    useDeleteMilestone: () => ({ mutate: vi.fn() }),
  };
});

describe('MilestoneList', () => {
  it('renders milestones with links', () => {
    const milestones: Milestone[] = [
      { id: 1, title: 'M1', subjectId: 1, activities: [], description: 'd1', standardCodes: ['A'] },
      { id: 2, title: 'M2', subjectId: 1, activities: [], description: 'd2', standardCodes: ['B'] },
    ];

    renderWithRouter(<MilestoneList milestones={milestones} subjectId={1} />);

    expect(screen.getByText('M1')).toHaveAttribute('href', '/milestones/1');
    expect(screen.getByText('M2')).toHaveAttribute('href', '/milestones/2');
  });
});
