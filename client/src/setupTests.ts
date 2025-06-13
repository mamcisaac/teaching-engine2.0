import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock sonner's toast function
vi.mock('sonner', () => ({
  toast: vi.fn().mockImplementation((message) => {
    console.log('Mock toast called with:', message);
  }),
  __esModule: true,
}));
