import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardLayout } from './DashboardLayout';

const themeMock = vi.hoisted(() => ({
  value: {
    theme: 'light' as 'light' | 'dark',
    toggleTheme: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => themeMock.value,
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    themeMock.value = {
      theme: 'light',
      toggleTheme: vi.fn(),
    };
  });

  it('renders children and light theme toggle state', () => {
    render(
      <DashboardLayout>
        <div>Dashboard child</div>
      </DashboardLayout>
    );

    expect(screen.getByRole('heading', { name: 'Task Manager' })).toBeInTheDocument();
    expect(screen.getByText('Dashboard child')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toHaveClass('hover:bg-accent');
    expect(document.querySelector('.text-blue-600')).toBeInTheDocument();
  });

  it('renders dark theme toggle state and calls toggleTheme', () => {
    themeMock.value = {
      theme: 'dark',
      toggleTheme: vi.fn(),
    };

    render(
      <DashboardLayout>
        <div>Dashboard child</div>
      </DashboardLayout>
    );

    const toggleButton = screen.getByRole('button', { name: 'Toggle dark mode' });
    expect(toggleButton).toHaveClass('hover:bg-muted');
    expect(document.querySelector('.text-yellow-400')).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(themeMock.value.toggleTheme).toHaveBeenCalledTimes(1);
  });
});
