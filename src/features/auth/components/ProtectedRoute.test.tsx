import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute, RequireGuest } from './ProtectedRoute';

const authStoreMock = vi.hoisted(() => ({
  state: {
    isAuthenticated: false,
    isInitializing: false,
    initializeAuth: vi.fn(),
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: () => authStoreMock.state,
}));

vi.mock('@/shared/components/PageLoader', () => ({
  PageLoader: () => <div>Loading auth...</div>,
}));

const renderProtectedRoute = (initialEntry = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );

const renderRequireGuest = (initialEntry = '/login') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireGuest>
              <div>Guest content</div>
            </RequireGuest>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authStoreMock.state = {
      isAuthenticated: false,
      isInitializing: false,
      initializeAuth: vi.fn(),
    };
  });

  it('initializes auth and shows the loader while initializing', () => {
    authStoreMock.state.isInitializing = true;

    renderProtectedRoute();

    expect(authStoreMock.state.initializeAuth).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Loading auth...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument();
  });

  it('renders protected outlet for authenticated users', () => {
    authStoreMock.state.isAuthenticated = true;

    renderProtectedRoute();

    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});

describe('RequireGuest', () => {
  beforeEach(() => {
    authStoreMock.state = {
      isAuthenticated: false,
      isInitializing: false,
      initializeAuth: vi.fn(),
    };
  });

  it('initializes auth and renders children for guests', () => {
    renderRequireGuest();

    expect(authStoreMock.state.initializeAuth).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Guest content')).toBeInTheDocument();
  });

  it('redirects authenticated users to dashboard', () => {
    authStoreMock.state.isAuthenticated = true;

    renderRequireGuest();

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Guest content')).not.toBeInTheDocument();
  });
});
