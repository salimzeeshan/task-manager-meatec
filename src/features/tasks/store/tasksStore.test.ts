import { describe, it, beforeEach, vi, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useTasksStore } from './tasksStore';
import { apiClient } from '@/lib/axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';

vi.mock('@/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useTasksStore', () => {
  const task: Task = {
    id: '1',
    title: 'Test Task',
    description: 'desc',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'u1',
  };

  beforeEach(() => {
    useTasksStore.setState({
      tasks: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const state = useTasksStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.isSubmitting).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchTasks sets tasks on success (no status)', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { tasks: [task] } });
    await act(async () => {
      await useTasksStore.getState().fetchTasks();
    });
    expect(apiClient.get).toHaveBeenCalledWith('/tasks', { params: {} });
    expect(useTasksStore.getState().tasks).toEqual([task]);
    expect(useTasksStore.getState().isLoading).toBe(false);
    expect(useTasksStore.getState().error).toBeNull();
  });

  it('fetchTasks sets tasks on success (with status)', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { tasks: [task] } });
    await act(async () => {
      await useTasksStore.getState().fetchTasks('todo');
    });
    expect(apiClient.get).toHaveBeenCalledWith('/tasks', { params: { status: 'todo' } });
    expect(useTasksStore.getState().tasks).toEqual([task]);
    expect(useTasksStore.getState().isLoading).toBe(false);
    expect(useTasksStore.getState().error).toBeNull();
  });

  it('fetchTasks sets error on failure', async () => {
    apiClient.get.mockRejectedValueOnce({ message: 'fail' });
    await act(async () => {
      await useTasksStore.getState().fetchTasks();
    });
    expect(useTasksStore.getState().error).toBe('fail');
    expect(useTasksStore.getState().isLoading).toBe(false);
  });

  it('createTask adds new task on success', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { task } });
    await act(async () => {
      await useTasksStore.getState().createTask({ title: 'Test Task', description: 'desc', status: 'todo' });
    });
    expect(useTasksStore.getState().tasks[0]).toEqual(task);
    expect(useTasksStore.getState().isSubmitting).toBe(false);
    expect(useTasksStore.getState().error).toBeNull();
  });

  it('createTask sets error on failure and throws', async () => {
    apiClient.post.mockRejectedValueOnce({ message: 'fail' });
    let thrown = false;
    try {
      await useTasksStore.getState().createTask({ title: 'fail', description: '', status: 'todo' });
    } catch (e) {
      thrown = true;
      expect(e).toBeDefined();
    }
    expect(thrown).toBe(true);
    expect(useTasksStore.getState().error).toBe('fail');
    expect(useTasksStore.getState().isSubmitting).toBe(false);
  });

  it('updateTask updates task on success', async () => {
    useTasksStore.setState({ tasks: [task] });
    const updated = { ...task, title: 'Updated' };
    apiClient.put.mockResolvedValueOnce({ data: { task: updated } });
    await act(async () => {
      await useTasksStore.getState().updateTask(task.id, { title: 'Updated' });
    });
    expect(useTasksStore.getState().tasks[0].title).toBe('Updated');
    expect(useTasksStore.getState().isSubmitting).toBe(false);
    expect(useTasksStore.getState().error).toBeNull();
  });

  it('updateTask sets error on failure and throws', async () => {
    useTasksStore.setState({ tasks: [task] });
    apiClient.put.mockRejectedValueOnce({ message: 'fail' });
    let thrown = false;
    try {
      await useTasksStore.getState().updateTask(task.id, { title: 'fail' });
    } catch (e) {
      thrown = true;
      expect(e).toBeDefined();
    }
    expect(thrown).toBe(true);
    expect(useTasksStore.getState().error).toBe('fail');
    expect(useTasksStore.getState().isSubmitting).toBe(false);
  });

  it('deleteTask removes task on success', async () => {
    useTasksStore.setState({ tasks: [task] });
    apiClient.delete.mockResolvedValueOnce({});
    await act(async () => {
      await useTasksStore.getState().deleteTask(task.id);
    });
    expect(useTasksStore.getState().tasks).toEqual([]);
    expect(useTasksStore.getState().isSubmitting).toBe(false);
    expect(useTasksStore.getState().error).toBeNull();
  });

  it('deleteTask sets error on failure and throws', async () => {
    useTasksStore.setState({ tasks: [task] });
    apiClient.delete.mockRejectedValueOnce({ message: 'fail' });
    let thrown = false;
    try {
      await useTasksStore.getState().deleteTask(task.id);
    } catch (e) {
      thrown = true;
      expect(e).toBeDefined();
    }
    expect(thrown).toBe(true);
    expect(useTasksStore.getState().error).toBe('fail');
    expect(useTasksStore.getState().isSubmitting).toBe(false);
  });

  it('clearError resets error', () => {
    useTasksStore.setState({ error: 'err' });
    useTasksStore.getState().clearError();
    expect(useTasksStore.getState().error).toBeNull();
  });
});
