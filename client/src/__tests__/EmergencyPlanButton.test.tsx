import { render, fireEvent, waitFor } from '@testing-library/react';
import EmergencyPlanButton from '../components/EmergencyPlanButton';
import { vi } from 'vitest';
import * as apiModule from '../api';

const mockedPost = vi.fn().mockResolvedValue({ data: new ArrayBuffer(10) });
(apiModule.api as unknown as { post: typeof mockedPost }).post = mockedPost;

beforeAll(() => {
  // jsdom lacks createObjectURL; provide a stub
  Object.defineProperty(window.URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
  });
  const origCreate = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    const el = origCreate(tag);
    if (tag === 'a') {
      Object.defineProperty(el, 'click', { value: vi.fn() });
    }
    return el;
  });
});

describe('EmergencyPlanButton', () => {
  it('calls API on click', async () => {
    const { getByText } = render(<EmergencyPlanButton />);
    fireEvent.click(getByText('Emergency Plan'));
    fireEvent.click(getByText('Generate'));
    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalled();
    });
  });
});
