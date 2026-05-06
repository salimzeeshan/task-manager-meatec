import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import type * as ReactRouterDom from 'react-router-dom';

const navigateMock = vi.hoisted(() => vi.fn());
const authStoreMock = vi.hoisted(() => ({
  state: {
    login: vi.fn(),
    error: null as string | null,
    clearError: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../store/authStore', () => ({
  useAuthStore: () => authStoreMock.state,
}));

const renderLoginPage = () => render(<LoginPage />);

describe('LoginPage', () => {
  beforeEach(() => {
    authStoreMock.state = {
      login: vi.fn().mockResolvedValue(undefined),
      error: null,
      clearError: vi.fn(),
    };
    navigateMock.mockReset();
  });

  it('renders login content and feature bullets', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByText('Organize tasks easily')).toBeInTheDocument();
    expect(screen.getByText('Secure & private')).toBeInTheDocument();
    expect(screen.getByText('Track progress visually')).toBeInTheDocument();
    expect(screen.getByText(/test123/)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLoginPage();
    const passwordInput = screen.getByLabelText('Password');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows validation errors when submitting empty fields', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveClass('border-destructive');
    expect(screen.getByLabelText('Password')).toHaveClass('border-destructive');
    expect(authStoreMock.state.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates to the dashboard on submit', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Username'), 'test');
    await user.type(screen.getByLabelText('Password'), 'test123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(authStoreMock.state.login).toHaveBeenCalledWith({
        username: 'test',
        password: 'test123',
      });
      expect(navigateMock).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows submitting state while login is pending', async () => {
    const user = userEvent.setup();

    let resolveLogin: () => void = () => {};
    authStoreMock.state.login.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveLogin = resolve;
      })
    );

    renderLoginPage();

    await user.type(screen.getByLabelText(/username/i), 'test');
    await user.type(screen.getByLabelText(/^password$/i), 'test123');

    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    resolveLogin();
  });

  it('does not navigate when login fails', async () => {
    const user = userEvent.setup();
    authStoreMock.state.login.mockRejectedValueOnce(new Error('bad credentials'));
    renderLoginPage();

    await user.type(screen.getByLabelText('Username'), 'test');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(authStoreMock.state.login).toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('renders and dismisses store error', () => {
    authStoreMock.state.error = 'Invalid credentials';

    renderLoginPage();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(authStoreMock.state.clearError).toHaveBeenCalledTimes(1);
  });
});
