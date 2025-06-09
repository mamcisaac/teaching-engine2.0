import { screen } from '@testing-library/react';
import PlannerNotificationBanner from '../components/PlannerNotificationBanner';
import { NotificationProvider } from '../contexts/NotificationContext';
import { renderWithRouter } from '../test-utils';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useNotifications: () => ({
      data: [{ id: 1, message: 'Milestone due', read: false, createdAt: '' }],
    }),
    useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  };
});

describe('PlannerNotificationBanner', () => {
  it('shows alert when milestone notification exists', () => {
    renderWithRouter(
      <NotificationProvider>
        <PlannerNotificationBanner />
      </NotificationProvider>,
    );
    expect(screen.getByTestId('planner-alert')).toBeInTheDocument();
  });
});
