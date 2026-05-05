import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/mocks/server';

// Start MSW before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any runtime handlers we add during tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up once tests are done
afterAll(() => {
  server.close();
});