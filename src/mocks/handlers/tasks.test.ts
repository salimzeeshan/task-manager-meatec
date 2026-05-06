import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db, generateFakeJWT, getTaskById } from '@mocks/data';
import { extractUserIdFromRequest } from './tasks';

const initialUsers = new Map(db.users);
const initialTasks = new Map(db.tasks);

interface ErrorResponse {
  message: string;
}

interface TasksResponse {
  tasks: unknown[];
}

interface TaskResponse {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    userId: string;
  };
}

const authHeaders = (userId = '1'): HeadersInit => ({
  Authorization: `Bearer ${generateFakeJWT({ sub: userId, username: 'test' })}`,
});

const request = (path: string, init: RequestInit = {}): Promise<Response> =>
  fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

const readJson = async <T>(response: Response): Promise<T> => (await response.json()) as T;

describe('task handlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    db.users = new Map(initialUsers);
    db.tasks = new Map(initialTasks);
  });

  it('extracts a user id from valid bearer tokens only', () => {
    const validRequest = new Request('http://localhost/api/tasks', {
      headers: authHeaders(),
    });
    const missingBearerRequest = new Request('http://localhost/api/tasks', {
      headers: { Authorization: 'token-only' },
    });
    const nonStringSubjectRequest = new Request('http://localhost/api/tasks', {
      headers: { Authorization: `Bearer ${generateFakeJWT({ sub: 123 })}` },
    });

    expect(extractUserIdFromRequest(validRequest)).toBe('1');
    expect(extractUserIdFromRequest(new Request('http://localhost/api/tasks'))).toBeNull();
    expect(extractUserIdFromRequest(missingBearerRequest)).toBeNull();
    expect(extractUserIdFromRequest(nonStringSubjectRequest)).toBeNull();
    expect(
      extractUserIdFromRequest(
        new Request('http://localhost/api/tasks', {
          headers: { Authorization: 'Bearer invalid-token' },
        })
      )
    ).toBeNull();
  });

  it('rejects unauthenticated task requests', async () => {
    const responses = await Promise.all([
      request('/api/tasks'),
      request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Task', description: '', status: 'todo' }),
      }),
      request('/api/tasks/1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Task' }),
      }),
      request('/api/tasks/1', { method: 'DELETE' }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([401, 401, 401, 401]);

    for (const response of responses) {
      await expect(readJson<ErrorResponse>(response)).resolves.toEqual({
        message: 'Authentication required',
      });
    }
  });

  it('returns all tasks and filters by status', async () => {
    const allTasksResponse = await request('/api/tasks', { headers: authHeaders() });
    const todoTasksResponse = await request('/api/tasks?status=todo', { headers: authHeaders() });
    const invalidStatusResponse = await request('/api/tasks?status=blocked', { headers: authHeaders() });

    const allTasks = await readJson<TasksResponse>(allTasksResponse);
    const todoTasks = await readJson<TasksResponse>(todoTasksResponse);
    const invalidStatusTasks = await readJson<TasksResponse>(invalidStatusResponse);

    expect(allTasksResponse.status).toBe(200);
    expect(allTasks.tasks).toHaveLength(5);
    expect(todoTasks.tasks).toHaveLength(2);
    expect(invalidStatusTasks.tasks).toHaveLength(5);
  });

  it('creates a task for an authenticated user', async () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-task-id');

    const response = await request('/api/tasks', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: 'New task',
        description: 'New description',
        status: 'in-progress',
      }),
    });
    const body = await readJson<TaskResponse>(response);

    expect(response.status).toBe(201);
    expect(body.task).toMatchObject({
      id: 'new-task-id',
      title: 'New task',
      description: 'New description',
      status: 'in-progress',
      userId: '1',
    });
    expect(getTaskById('new-task-id')).toMatchObject(body.task);
  });

  it('rejects invalid create payloads', async () => {
    const invalidPayloads = [
      null,
      ['Task'],
      { title: 123, description: '', status: 'todo' },
      { title: 'Task', description: 123, status: 'todo' },
      { title: 'Task', description: '', status: 'blocked' },
      { title: '   ', description: '', status: 'todo' },
    ];

    for (const payload of invalidPayloads) {
      const response = await request('/api/tasks', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      await expect(readJson<ErrorResponse>(response)).resolves.toEqual({
        message: 'Title is required',
      });
    }
  });

  it('updates a task for an authenticated user', async () => {
    const response = await request('/api/tasks/1', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        title: 'Updated task',
        description: 'Updated description',
        status: 'done',
      }),
    });
    const body = await readJson<TaskResponse>(response);

    expect(response.status).toBe(200);
    expect(body.task).toMatchObject({
      id: '1',
      title: 'Updated task',
      description: 'Updated description',
      status: 'done',
      userId: '1',
    });
    expect(getTaskById('1')).toMatchObject(body.task);
  });

  it('rejects missing tasks and invalid update payloads', async () => {
    const missingResponse = await request('/api/tasks/missing', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title: 'Updated task' }),
    });

    expect(missingResponse.status).toBe(404);
    await expect(readJson<ErrorResponse>(missingResponse)).resolves.toEqual({
      message: 'Task not found',
    });

    const invalidPayloads = [
      null,
      ['Task'],
      { title: 123 },
      { description: 123 },
      { status: 'blocked' },
    ];

    for (const payload of invalidPayloads) {
      const response = await request('/api/tasks/1', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
      await expect(readJson<ErrorResponse>(response)).resolves.toEqual({
        message: 'Invalid task payload',
      });
    }
  });

  it('deletes a task for an authenticated user', async () => {
    const response = await request('/api/tasks/1', {
      method: 'DELETE',
      headers: authHeaders(),
    });

    expect(response.status).toBe(200);
    await expect(readJson<ErrorResponse>(response)).resolves.toEqual({
      message: 'Task deleted successfully',
    });
    expect(getTaskById('1')).toBeUndefined();
  });

  it('rejects delete requests for missing tasks', async () => {
    const response = await request('/api/tasks/missing', {
      method: 'DELETE',
      headers: authHeaders(),
    });

    expect(response.status).toBe(404);
    await expect(readJson<ErrorResponse>(response)).resolves.toEqual({
      message: 'Task not found',
    });
  });
});
