import { screen, fireEvent } from '@testing-library/react';
import UnifiedWeekViewComponent from '../components/UnifiedWeekViewComponent';
import { renderWithRouter } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../components/AutoFillButton', () => {
  return {
    default: ({ onGenerated }: { onGenerated: () => void }) => (
      <button onClick={() => onGenerated()} data-testid="fill">
        Auto Fill
      </button>
    ),
  };
});

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useLessonPlan: () => ({
      data: { id: 1, weekStart: '2025-01-01', schedule: [] },
      refetch: vi.fn(),
    }),
    useSubjects: () => ({ data: [] }),
    useTimetable: () => ({ data: [] }),
    useGenerateNewsletter: () => ({ mutate: vi.fn() }),
  };
});

test('shows prompts after generating plan', () => {
  renderWithRouter(<UnifiedWeekViewComponent />);
  expect(screen.queryByText('Next steps:')).toBeNull();
  fireEvent.click(screen.getByTestId('fill'));
  expect(screen.getByText('Next steps:')).toBeInTheDocument();
});
