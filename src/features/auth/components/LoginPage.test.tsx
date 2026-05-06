import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const navigateMock = vi.hoisted(() => vi.fn());
const authStoreMock = vi.hoisted(() => ({
  state: {
    login: vi.fn(),
    error: null as string | null,
    clearError: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

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

  it('toggles remember me', () => {
    renderLoginPage();
    const checkbox = screen.getByLabelText('Remember me');

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
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
    const { container } = renderLoginPage();

    await user.type(screen.getByLabelText('Username'), 'test');
    await user.type(screen.getByLabelText('Password'), 'test123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(container.querySelector('button[type="submit"]')).toBeDisabled();
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    await act(async () => {
      resolveLogin();
    });
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
