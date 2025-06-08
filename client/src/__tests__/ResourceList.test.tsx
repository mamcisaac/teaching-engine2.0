import { render, fireEvent } from '@testing-library/react';
import ResourceList from '../components/ResourceList';
import { vi } from 'vitest';

const mutate = vi.fn();
vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return { ...actual, useDeleteResource: () => ({ mutate }) };
});

it('calls delete on button click', () => {
  const res = [{ id: 1, filename: 'f.txt', url: '/f.txt', type: 'text/plain', size: 1, activityId: null, createdAt: '' }];
  const { getByText } = render(<ResourceList resources={res} />);
  fireEvent.click(getByText('Delete'));
  expect(mutate).toHaveBeenCalledWith(1);
});
