import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.hoisted(() => ({
  create: vi.fn(),
  requestFulfilled: undefined as ((config: any) => any) | undefined,
  responseFulfilled: undefined as ((response: any) => any) | undefined,
  responseRejected: undefined as ((error: any) => Promise<never>) | undefined,
}));

vi.mock('axios', () => ({
  default: {
    create: axiosMock.create,
  },
}));

const importAxiosModule = async () => {
  vi.resetModules();
  axiosMock.requestFulfilled = undefined;
  axiosMock.responseFulfilled = undefined;
  axiosMock.responseRejected = undefined;
  axiosMock.create.mockReturnValue({
    interceptors: {
      request: {
        use: vi.fn((fulfilled) => {
          axiosMock.requestFulfilled = fulfilled;
        }),
      },
      response: {
        use: vi.fn((fulfilled, rejected) => {
          axiosMock.responseFulfilled = fulfilled;
          axiosMock.responseRejected = rejected;
        }),
      },
    },
  });

  return import('./axios');
};

describe('axios api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('creates an axios client with the API base URL', async () => {
    await importAxiosModule();

    expect(axiosMock.create).toHaveBeenCalledWith({ baseURL: '/api' });
  });

  it('adds an authorization header when a token exists', async () => {
    await importAxiosModule();
    localStorage.setItem('auth_token', 'token-123');

    const config = { headers: {} };
    const result = axiosMock.requestFulfilled?.(config);

    expect(result.headers.Authorization).toBe('Bearer token-123');
  });

  it('leaves request headers alone when no token exists', async () => {
    await importAxiosModule();

    const config = { headers: {} };
    const result = axiosMock.requestFulfilled?.(config);

    expect(result.headers).toEqual({});
  });

  it('passes successful responses through', async () => {
    await importAxiosModule();
    const response = { data: { ok: true } };

    expect(axiosMock.responseFulfilled?.(response)).toBe(response);
  });

  it('rejects API errors with the response message and status', async () => {
    const { ApiClientError } = await importAxiosModule();

    await expect(
      axiosMock.responseRejected?.({
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      })
    ).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Bad request',
      status: 400,
    });
    await expect(
      axiosMock.responseRejected?.({
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      })
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it('uses fallback error values when response data is missing or invalid', async () => {
    await importAxiosModule();

    await expect(axiosMock.responseRejected?.({})).rejects.toMatchObject({
      message: 'Something went wrong',
      status: 500,
    });

    await expect(
      axiosMock.responseRejected?.({
        response: {
          status: 422,
          data: ['not an object'],
        },
      })
    ).rejects.toMatchObject({
      message: 'Something went wrong',
      status: 422,
    });

    await expect(
      axiosMock.responseRejected?.({
        response: {
          status: 422,
          data: { message: 123 },
        },
      })
    ).rejects.toMatchObject({
      message: 'Something went wrong',
      status: 422,
    });
  });

  it('clears auth state and dispatches logout event on 401', async () => {
    await importAxiosModule();
    const logoutListener = vi.fn();
    window.addEventListener('auth:logout', logoutListener);
    localStorage.setItem('auth_token', 'token-123');

    await expect(
      axiosMock.responseRejected?.({
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      })
    ).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
    });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(logoutListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth:logout', logoutListener);
  });

  it('exposes ApiClientError with message and status', async () => {
    const { ApiClientError } = await importAxiosModule();

    const error = new ApiClientError({ message: 'Nope', status: 418 });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiClientError');
    expect(error.message).toBe('Nope');
    expect(error.status).toBe(418);
  });
});
