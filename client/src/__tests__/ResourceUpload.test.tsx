import { screen } from '@testing-library/react';
import ResourceUpload from '../components/ResourceUpload';
import { vi } from 'vitest';
import { renderWithRouter } from '../test-utils';

vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return {
    ...actual,
    useUploadResource: () => ({ mutate: vi.fn() }),
  };
});

describe('ResourceUpload', () => {
  it('renders file input', () => {
    renderWithRouter(<ResourceUpload />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });
});
