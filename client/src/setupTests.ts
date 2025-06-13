import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: vi.fn(),
}));
