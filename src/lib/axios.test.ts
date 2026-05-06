import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AxiosHeaders,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type * as AxiosModule from 'axios';

type RequestFulfilled = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
type ResponseFulfilled = (response: AxiosResponse<unknown>) => AxiosResponse<unknown>;
type ResponseRejected = (error: AxiosError<unknown>) => Promise<never>;

const axiosMock = vi.hoisted(() => ({
  create: vi.fn(),
  requestFulfilled: undefined as RequestFulfilled | undefined,
  responseFulfilled: undefined as ResponseFulfilled | undefined,
  responseRejected: undefined as ResponseRejected | undefined,
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof AxiosModule>();

  return {
    ...actual,
    default: {
      create: axiosMock.create,
    },
  };
});

const requestConfig = (): InternalAxiosRequestConfig => ({ headers: new AxiosHeaders() });

const axiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: requestConfig(),
});

const getRequestFulfilled = (): RequestFulfilled => {
  if (!axiosMock.requestFulfilled) {
    throw new Error('Request interceptor was not registered');
  }

  return axiosMock.requestFulfilled;
};

const getResponseFulfilled = (): ResponseFulfilled => {
  if (!axiosMock.responseFulfilled) {
    throw new Error('Response interceptor was not registered');
  }

  return axiosMock.responseFulfilled;
};

const getResponseRejected = (): ResponseRejected => {
  if (!axiosMock.responseRejected) {
    throw new Error('Response rejection interceptor was not registered');
  }

  return axiosMock.responseRejected;
};

const importAxiosModule = async () => {
  vi.resetModules();
  axiosMock.requestFulfilled = undefined;
  axiosMock.responseFulfilled = undefined;
  axiosMock.responseRejected = undefined;
  axiosMock.create.mockReturnValue({
    interceptors: {
      request: {
        use: vi.fn((fulfilled: RequestFulfilled) => {
          axiosMock.requestFulfilled = fulfilled;
        }),
      },
      response: {
        use: vi.fn((fulfilled: ResponseFulfilled, rejected: ResponseRejected) => {
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

    const config = requestConfig();
    const result = getRequestFulfilled()(config);

    expect(result.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('leaves request headers alone when no token exists', async () => {
    await importAxiosModule();

    const config = requestConfig();
    const result = getRequestFulfilled()(config);

    expect(result.headers.toJSON()).toEqual({});
  });

  it('passes successful responses through', async () => {
    await importAxiosModule();
    const response = axiosResponse({ ok: true });

    expect(getResponseFulfilled()(response)).toBe(response);
  });

  it('rejects API errors with the response message and status', async () => {
    const { ApiClientError } = await importAxiosModule();

    await expect(
      getResponseRejected()({
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      } as AxiosError<unknown>)
    ).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Bad request',
      status: 400,
    });
    await expect(
      getResponseRejected()({
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      } as AxiosError<unknown>)
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it('uses fallback error values when response data is missing or invalid', async () => {
    await importAxiosModule();

    await expect(getResponseRejected()({} as AxiosError<unknown>)).rejects.toMatchObject({
      message: 'Something went wrong',
      status: 500,
    });

    await expect(
      getResponseRejected()({
        response: {
          status: 422,
          data: ['not an object'],
        },
      } as AxiosError<unknown>)
    ).rejects.toMatchObject({
      message: 'Something went wrong',
      status: 422,
    });

    await expect(
      getResponseRejected()({
        response: {
          status: 422,
          data: { message: 123 },
        },
      } as AxiosError<unknown>)
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
      getResponseRejected()({
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      } as AxiosError<unknown>)
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
