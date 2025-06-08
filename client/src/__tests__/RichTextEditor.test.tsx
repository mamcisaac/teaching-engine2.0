import { screen, fireEvent } from '@testing-library/react';
import RichTextEditor from '../components/RichTextEditor';
import { renderWithRouter } from '../test-utils';

it('updates value on change', () => {
  const handle = vi.fn();
  renderWithRouter(<RichTextEditor value="test" onChange={handle} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } });
  expect(handle).toHaveBeenCalledWith('new');
});
