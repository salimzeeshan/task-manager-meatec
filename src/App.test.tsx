import { render, screen } from '@testing-library/react';
import { App } from './App';
import * as authStore from '@/features/auth/store/authStore';
import { describe, it, beforeEach, afterEach, vi } from 'vitest';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(authStore, 'useAuthStore').mockImplementation(() => ({
      user: { id: '1', username: 'test', email: 'test@test.com' },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      initializeAuth: vi.fn(),
      clearError: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the setup complete screen', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Task Manager' })
    ).toBeInTheDocument();
  });
});