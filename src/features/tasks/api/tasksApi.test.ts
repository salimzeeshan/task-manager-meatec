import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/lib/axios';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@/types';
import { createTask, deleteTask, fetchTasks, updateTask } from './tasksApi';

vi.mock('@/lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('tasksApi', () => {
  const task: Task = {
    id: '1',
    title: 'Test Task',
    description: 'desc',
    status: 'todo',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    userId: 'u1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks without a status filter', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { tasks: [task] } });

    await expect(fetchTasks()).resolves.toEqual([task]);

    expect(apiClient.get).toHaveBeenCalledWith('/tasks', { params: {} });
  });

  it('fetches tasks with a status filter', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { tasks: [task] } });

    await expect(fetchTasks('todo')).resolves.toEqual([task]);

    expect(apiClient.get).toHaveBeenCalledWith('/tasks', { params: { status: 'todo' } });
  });

  it('creates a task', async () => {
    const payload: CreateTaskPayload = {
      title: 'Test Task',
      description: 'desc',
      status: 'todo',
    };
    apiClient.post.mockResolvedValueOnce({ data: { task } });

    await expect(createTask(payload)).resolves.toEqual(task);

    expect(apiClient.post).toHaveBeenCalledWith('/tasks', payload);
  });

  it('updates a task', async () => {
    const payload: UpdateTaskPayload = { title: 'Updated Task' };
    const updatedTask = { ...task, ...payload };
    apiClient.put.mockResolvedValueOnce({ data: { task: updatedTask } });

    await expect(updateTask(task.id, payload)).resolves.toEqual(updatedTask);

    expect(apiClient.put).toHaveBeenCalledWith('/tasks/1', payload);
  });

  it('deletes a task', async () => {
    apiClient.delete.mockResolvedValueOnce({});

    await expect(deleteTask(task.id)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
  });
});
