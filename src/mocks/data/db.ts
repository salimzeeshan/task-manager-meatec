import type { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload, User } from '@/types';

export type UserWithPassword = User & { password: string };

const now = Date.now();
const dayInMs = 24 * 60 * 60 * 1000;

const toIsoDate = (daysAgo: number): string => new Date(now - daysAgo * dayInMs).toISOString();

const seededUser: UserWithPassword = {
  id: '1',
  username: 'test',
  email: 'test@example.com',
  password: 'test123',
};

const createSeedTask = (
  id: string,
  title: string,
  description: string,
  status: TaskStatus,
  daysAgo: number
): Task => ({
  id,
  title,
  description,
  status,
  createdAt: toIsoDate(daysAgo),
  updatedAt: toIsoDate(Math.max(daysAgo - 1, 0)),
  userId: seededUser.id,
});

export const db = {
  users: new Map<string, UserWithPassword>([[seededUser.id, seededUser]]),
  tasks: new Map<string, Task>([
    [
      '1',
      createSeedTask(
        '1',
        'Design login page wireframes',
        'Create responsive wireframes for the upcoming authentication flow.',
        'todo',
        7
      ),
    ],
    [
      '2',
      createSeedTask(
        '2',
        'Set up CI/CD pipeline',
        'Configure automated lint, test, and build checks for pull requests.',
        'in-progress',
        5
      ),
    ],
    [
      '3',
      createSeedTask(
        '3',
        'Write unit tests for auth module',
        'Cover login validation, token persistence, and logout behavior.',
        'done',
        4
      ),
    ],
    [
      '4',
      createSeedTask(
        '4',
        'Draft task filtering requirements',
        'Define status filtering behavior and empty states for the task list.',
        'todo',
        2
      ),
    ],
    [
      '5',
      createSeedTask(
        '5',
        'Review accessibility checklist',
        'Audit keyboard navigation and semantic structure for core screens.',
        'done',
        1
      ),
    ],
  ]),
};

export const getAllTasks = (userId: string): Task[] =>
  Array.from(db.tasks.values()).filter((task) => task.userId === userId);

export const getTaskById = (id: string): Task | undefined => db.tasks.get(id);

export const createTask = (userId: string, payload: CreateTaskPayload): Task => {
  const timestamp = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: payload.title,
    description: payload.description,
    status: payload.status,
    createdAt: timestamp,
    updatedAt: timestamp,
    userId,
  };

  db.tasks.set(task.id, task);

  return task;
};

export const updateTask = (id: string, payload: UpdateTaskPayload): Task | undefined => {
  const task = db.tasks.get(id);

  if (!task) {
    return undefined;
  }

  const updatedTask: Task = {
    ...task,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  db.tasks.set(id, updatedTask);

  return updatedTask;
};

export const deleteTask = (id: string): boolean => db.tasks.delete(id);

export const getUserByUsername = (username: string): UserWithPassword | undefined =>
  Array.from(db.users.values()).find((user) => user.username === username);
