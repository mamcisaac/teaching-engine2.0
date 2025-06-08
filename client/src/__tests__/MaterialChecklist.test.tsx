import { render, fireEvent } from '@testing-library/react';
import MaterialChecklist from '../components/MaterialChecklist';

it('toggles checkbox state', () => {
  const list = { id: 1, weekStart: '', items: ['a','b'], prepared: false };
  const { getAllByRole } = render(<MaterialChecklist list={list} />);
  const boxes = getAllByRole('checkbox');
  fireEvent.click(boxes[0]);
  expect((boxes[0] as HTMLInputElement).checked).toBe(true);
});
