import { vi } from 'vitest';

// Mock all API hooks to return default values
export const api = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

export const useNotifications = vi.fn(() => ({
  data: [],
  isLoading: false,
  error: null,
}));

export const useMarkNotificationRead = vi.fn(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

export const useCurriculumExpectations = vi.fn(() => ({
  data: [],
  isLoading: false,
  error: null,
}));

export default api;