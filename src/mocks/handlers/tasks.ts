import { delay, http, HttpResponse } from 'msw';
import type { CreateTaskPayload, TaskStatus, UpdateTaskPayload } from '@/types';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  isTokenExpired,
  parseJWT,
  updateTask,
} from '@mocks/data';

const taskStatuses: readonly TaskStatus[] = ['todo', 'in-progress', 'done'];

const isTaskStatus = (value: unknown): value is TaskStatus =>
  typeof value === 'string' && taskStatuses.includes(value as TaskStatus);

const isCreateTaskPayload = (value: unknown): value is CreateTaskPayload => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    isTaskStatus(candidate.status)
  );
};

const toUpdateTaskPayload = (value: unknown): UpdateTaskPayload | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const payload: UpdateTaskPayload = {};

  if (candidate.title !== undefined) {
    if (typeof candidate.title !== 'string') {
      return null;
    }

    payload.title = candidate.title;
  }

  if (candidate.description !== undefined) {
    if (typeof candidate.description !== 'string') {
      return null;
    }

    payload.description = candidate.description;
  }

  if (candidate.status !== undefined) {
    if (!isTaskStatus(candidate.status)) {
      return null;
    }

    payload.status = candidate.status;
  }

  return payload;
};

const unauthorizedResponse = () =>
  HttpResponse.json({ message: 'Authentication required' }, { status: 401 });

export const extractUserIdFromRequest = (request: Request): string | null => {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.replace('Bearer ', '');

  if (isTokenExpired(token)) {
    return null;
  }

  const payload = parseJWT(token);
  const userId = payload?.sub;

  return typeof userId === 'string' ? userId : null;
};

export const taskHandlers = [
  http.get('/api/tasks', async ({ request }) => {
    await delay(500);

    const userId = extractUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const tasks =
      status && isTaskStatus(status)
        ? getAllTasks(userId).filter((task) => task.status === status)
        : getAllTasks(userId);

    return HttpResponse.json({ tasks });
  }),
  http.post('/api/tasks', async ({ request }) => {
    await delay(600);

    const userId = extractUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const body: unknown = await request.json();

    if (!isCreateTaskPayload(body) || body.title.trim().length === 0) {
      return HttpResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    return HttpResponse.json({ task: createTask(userId, body) }, { status: 201 });
  }),
  http.put('/api/tasks/:id', async ({ params, request }) => {
    await delay(500);

    const userId = extractUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const id = String(params.id);
    const task = getTaskById(id);

    if (!task || task.userId !== userId) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const payload = toUpdateTaskPayload(await request.json());

    if (!payload) {
      return HttpResponse.json({ message: 'Invalid task payload' }, { status: 400 });
    }

    return HttpResponse.json({ task: updateTask(id, payload) }, { status: 200 });
  }),
  http.delete('/api/tasks/:id', async ({ params, request }) => {
    await delay(400);

    const userId = extractUserIdFromRequest(request);

    if (!userId) {
      return unauthorizedResponse();
    }

    const id = String(params.id);
    const task = getTaskById(id);

    if (!task || task.userId !== userId) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    deleteTask(id);

    return HttpResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  }),
];
