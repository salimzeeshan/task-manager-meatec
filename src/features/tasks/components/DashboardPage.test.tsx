import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '@/types';
import { toast } from 'sonner';
import { DashboardPage } from './DashboardPage';

const storeMocks = vi.hoisted(() => ({
  state: {
    tasks: [] as Task[],
    isLoading: false,
    error: null as string | null,
    fetchTasks: vi.fn(),
    clearError: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

vi.mock('../store/tasksStore', () => ({
  useTasksStore: () => storeMocks.state,
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('./DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <section data-testid="dashboard-layout">{children}</section>
  ),
}));

vi.mock('./FilterTabs', () => ({
  FilterTabs: () => <div data-testid="filter-tabs">Filters</div>,
}));

vi.mock('./TaskCard', () => ({
  TaskCard: ({
    task,
    onEdit,
    onDelete,
  }: {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
  }) => (
    <article>
      <h3>{task.title}</h3>
      <button type="button" onClick={() => onEdit(task)}>
        Edit {task.title}
      </button>
      <button type="button" onClick={() => onDelete(task)}>
        Delete {task.title}
      </button>
    </article>
  ),
}));

vi.mock('./TaskFormModal', () => ({
  TaskFormModal: ({
    open,
    onClose,
    task,
  }: {
    open: boolean;
    onClose: () => void;
    task?: Task;
  }) => (
    <div data-testid="task-modal" data-open={String(open)} data-task-title={task?.title ?? ''}>
      {open && (
        <button type="button" onClick={onClose}>
          Close modal
        </button>
      )}
    </div>
  ),
}));

const task: Task = {
  id: '1',
  title: 'Write tests',
  description: 'Cover dashboard',
  status: 'todo',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'u1',
};

const renderDashboard = (initialEntry = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    storeMocks.state = {
      tasks: [],
      isLoading: false,
      error: null,
      fetchTasks: vi.fn().mockResolvedValue(undefined),
      clearError: vi.fn(),
      deleteTask: vi.fn().mockResolvedValue(undefined),
    };
    vi.clearAllMocks();
  });

  it('fetches tasks for the status search param', async () => {
    renderDashboard('/dashboard?status=done');

    await waitFor(() => {
      expect(storeMocks.state.fetchTasks).toHaveBeenCalledWith('done');
    });
  });

  it('shows a toast when fetching tasks fails', async () => {
    storeMocks.state.fetchTasks.mockRejectedValueOnce(new Error('failed'));

    renderDashboard();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load tasks. Please try again.');
    });
  });

  it('renders loading state', () => {
    storeMocks.state.isLoading = true;

    renderDashboard();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state and opens create modal from either create button', () => {
    renderDashboard();

    expect(screen.getByText('No tasks found')).toBeInTheDocument();
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-task-title', '');

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Create a task' }));
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-open', 'true');
  });

  it('renders task cards and opens edit modal for a task', () => {
    storeMocks.state.tasks = [task];

    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: `Edit ${task.title}` }));

    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('task-modal')).toHaveAttribute('data-task-title', task.title);
  });

  it('deletes a task and shows a success toast', async () => {
    storeMocks.state.tasks = [task];

    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: `Delete ${task.title}` }));

    await waitFor(() => {
      expect(storeMocks.state.deleteTask).toHaveBeenCalledWith(task.id);
      expect(toast.success).toHaveBeenCalledWith('Task deleted');
    });
  });

  it('shows an error toast when delete fails', async () => {
    storeMocks.state.tasks = [task];
    storeMocks.state.deleteTask.mockRejectedValueOnce(new Error('failed'));

    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: `Delete ${task.title}` }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete task');
    });
  });

  it('shows a non-blocking error toast when tasks are already loaded', async () => {
    storeMocks.state.tasks = [task];
    storeMocks.state.error = 'Could not refresh';

    renderDashboard();

    expect(screen.getByText(task.title)).toBeInTheDocument();
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Could not refresh');
    });
  });

  it('renders network error state and retries fetch', async () => {
    storeMocks.state.error = 'Network failed';

    renderDashboard('/dashboard?status=todo');

    expect(screen.getByText('Network Error')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(storeMocks.state.clearError).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(storeMocks.state.fetchTasks).toHaveBeenLastCalledWith('todo');
    });
  });
});
