import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

export class ApiClientError extends Error implements ApiError {
  status: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
  }
}

const getErrorMessage = (data: unknown): string => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const message = (data as Record<string, unknown>).message;

    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Something went wrong';
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const status = error.response?.status ?? 500;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    const apiError = new ApiClientError({
      message: getErrorMessage(error.response?.data),
      status,
    });

    return Promise.reject(apiError);
  }
);
