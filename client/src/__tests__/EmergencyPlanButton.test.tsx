import { render, fireEvent, waitFor } from '@testing-library/react';
import EmergencyPlanButton from '../components/EmergencyPlanButton';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockedGet = vi.fn().mockResolvedValue({ data: new ArrayBuffer(10) });
(axios as unknown as { get: typeof mockedGet }).get = mockedGet;

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
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalled();
    });
  });
});
