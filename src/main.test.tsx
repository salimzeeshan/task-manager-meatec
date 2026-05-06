import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mainMocks = vi.hoisted(() => ({
  render: vi.fn(),
  createRoot: vi.fn(),
  workerStart: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: mainMocks.createRoot,
  },
}));

vi.mock('./App', () => ({
  App: () => React.createElement('div', null, 'Mock App'),
}));

vi.mock('./mocks/browser', () => ({
  worker: {
    start: mainMocks.workerStart,
  },
}));

describe('main bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    document.body.innerHTML = '<div id="root"></div>';
    mainMocks.createRoot.mockReturnValue({ render: mainMocks.render });
    mainMocks.workerStart.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('starts development mocking before rendering the app', async () => {
    await import('./main');
    await vi.waitFor(() => expect(mainMocks.render).toHaveBeenCalledTimes(1));

    expect(mainMocks.workerStart).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
    expect(mainMocks.createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  });

  it('renders and starts mocking outside dev mode', async () => {
    vi.stubEnv('DEV', false);

    await import('./main');

    await vi.waitFor(() => {
      expect(mainMocks.render).toHaveBeenCalledTimes(1);
    });

    expect(mainMocks.workerStart).toHaveBeenCalledWith({
      onUnhandledRequest: 'bypass',
    });

    expect(mainMocks.createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  });
});
