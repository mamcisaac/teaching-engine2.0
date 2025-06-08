import { render, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../components/FileUpload';
import { vi } from 'vitest';

const mutate = vi.fn();
vi.mock('../api', async () => {
  const actual = await vi.importActual('../api');
  return { ...actual, useUploadResource: () => ({ mutate }) };
});

describe('FileUpload', () => {
  it('calls upload on click', async () => {
    const { getByText, container } = render(<FileUpload />);
    const input = container.querySelector('input') as HTMLInputElement;
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    fireEvent.click(getByText('Upload'));
    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
  });
});
