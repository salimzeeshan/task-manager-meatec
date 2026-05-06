import { describe, it, beforeEach, vi, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from './authStore';
import { apiClient } from '@/lib/axios';
import * as jwtUtils from '@/mocks/data/jwt';

vi.mock('@/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  const user = { id: '1', username: 'test', email: 'test@test.com' };
  const token = 'mock-token';

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
      error: null,
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login sets user, token, isAuthenticated on success', async () => {
    useAuthStore.setState({ error: 'previous error' });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { user, token },
    });

    await act(async () => {
        await useAuthStore.getState().login({ username: 'test', password: 'pw' });
    });

    const state = useAuthStore.getState();

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
    });

  describe('initializeAuth', () => {
    it('logs out if no token or user in localStorage', () => {
      const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
      useAuthStore.getState().initializeAuth();
      expect(useAuthStore.getState().isInitializing).toBe(false);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('logs out if token is expired', () => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      vi.spyOn(jwtUtils, 'isTokenExpired').mockReturnValue(true);
      const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
      useAuthStore.getState().initializeAuth();
      expect(useAuthStore.getState().isInitializing).toBe(false);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('sets user, token, isAuthenticated if token is valid', () => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      vi.spyOn(jwtUtils, 'isTokenExpired').mockReturnValue(false);
      useAuthStore.getState().initializeAuth();
      const state = useAuthStore.getState();
      expect(state.token).toBe(token);
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isInitializing).toBe(false);
    });

    it('logs out if the stored user is invalid', () => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(null));
      vi.spyOn(jwtUtils, 'isTokenExpired').mockReturnValue(false);
      const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');

      useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().isInitializing).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(logoutSpy).toHaveBeenCalled();
    });
  });

    it('login sets error on failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'fail' } },
    });

    await expect(
        useAuthStore.getState().login({ username: 'bad', password: 'bad' })
    ).rejects.toBeDefined();

    expect(useAuthStore.getState().error).toBe('Login failed');
    });

    it('login uses fallback error when failure has no response message', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({});

    await expect(
        useAuthStore.getState().login({ username: 'bad', password: 'bad' })
    ).rejects.toEqual({});

    expect(useAuthStore.getState().error).toBe('Login failed');
    expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('login stores Error messages on failure', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network down'));

    await expect(
        useAuthStore.getState().login({ username: 'bad', password: 'bad' })
    ).rejects.toThrow('Network down');

    expect(useAuthStore.getState().error).toBe('Network down');
    });

  it('logout clears user, token, isAuthenticated', () => {
    useAuthStore.setState({ user: { id: '1', username: 't', email: 'e' }, token: 't', isAuthenticated: true });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('clearError resets error', () => {
    useAuthStore.setState({ error: 'err' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('responds to auth:logout event by calling logout', () => {
    const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
    const event = new Event('auth:logout');
    window.dispatchEvent(event);
    expect(logoutSpy).toHaveBeenCalled();
  });
});
