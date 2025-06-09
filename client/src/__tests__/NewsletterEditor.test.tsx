import { screen, fireEvent } from '@testing-library/react';
import NewsletterEditor from '../pages/NewsletterEditor';
import { renderWithRouter } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useCreateNewsletter: () => ({ mutate: vi.fn() }),
    useGenerateNewsletter: () => ({ mutate: vi.fn() }),
  };
});

it('edits and saves newsletter', () => {
  renderWithRouter(<NewsletterEditor />);
  fireEvent.change(screen.getByPlaceholderText('Title'), {
    target: { value: 'My News' },
  });
  fireEvent.input(screen.getAllByRole('textbox')[1], {
    target: { innerHTML: 'Hello' },
  });
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByDisplayValue('My News')).toBeInTheDocument();
});

it('generates newsletter', () => {
  renderWithRouter(<NewsletterEditor />);
  fireEvent.click(screen.getByText('Generate'));
  expect(screen.getByText('Generate')).toBeInTheDocument();
});
