import { setupServer } from 'msw/node';

// Setup MSW server for testing
export const server = setupServer();

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());