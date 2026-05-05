import { create } from 'zustand';
import { User, LoginPayload } from '@/types';
import { isTokenExpired } from '@/mocks/data/jwt';
import { apiClient } from '@/lib/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: false,
  error: null,

  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post('/login', payload);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout() {
    set({ user: null, token: null, isAuthenticated: false, error: null });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  initializeAuth() {
    set({ isInitializing: true });
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (!token || !userStr) {
      get().logout();
      set({ isInitializing: false });
      return;
    }
    if (isTokenExpired(token)) {
      get().logout();
      set({ isInitializing: false });
      return;
    }
    set({
      token,
      user: JSON.parse(userStr),
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  clearError() {
    set({ error: null });
  },
}));

window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout();
});
