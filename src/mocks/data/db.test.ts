import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTask,
  db,
  deleteTask,
  getAllTasks,
  getTaskById,
  getUserByUsername,
  updateTask,
} from './db';

const initialUsers = new Map(db.users);
const initialTasks = new Map(db.tasks);

describe('mock db helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-10T12:00:00.000Z'));
    db.users = new Map(initialUsers);
    db.tasks = new Map(initialTasks);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with seeded users and tasks', () => {
    expect(getUserByUsername('test')).toMatchObject({
      id: '1',
      username: 'test',
      email: 'test@example.com',
      password: 'test123',
    });
    expect(getAllTasks('1')).toHaveLength(5);
    expect(getTaskById('1')).toMatchObject({
      id: '1',
      title: 'Design login page wireframes',
      status: 'todo',
      userId: '1',
    });
  });

  it('returns no tasks for an unknown user', () => {
    expect(getAllTasks('missing-user')).toEqual([]);
  });

  it('returns undefined for missing users and tasks', () => {
    expect(getUserByUsername('missing')).toBeUndefined();
    expect(getTaskById('missing-task')).toBeUndefined();
  });

  it('creates a task for a user', () => {
    const mockedId = '123e4567-e89b-12d3-a456-426614174000';

    vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockedId);

    const task = createTask('1', {
      title: 'New task',
      description: 'New description',
      status: 'in-progress',
    });

    expect(task).toEqual({
      id: mockedId,
      title: 'New task',
      description: 'New description',
      status: 'in-progress',
      createdAt: '2024-01-10T12:00:00.000Z',
      updatedAt: '2024-01-10T12:00:00.000Z',
      userId: '1',
    });

    expect(getTaskById(mockedId)).toEqual(task);
  });

  it('updates an existing task', () => {
    const original = getTaskById('1');

    const updated = updateTask('1', {
      title: 'Updated title',
      status: 'done',
    });

    expect(updated).toMatchObject({
      id: '1',
      title: 'Updated title',
      description: original?.description,
      status: 'done',
      userId: '1',
      updatedAt: '2024-01-10T12:00:00.000Z',
    });
    expect(getTaskById('1')).toEqual(updated);
  });

  it('returns undefined when updating a missing task', () => {
    expect(updateTask('missing-task', { title: 'Nope' })).toBeUndefined();
  });

  it('deletes tasks and reports whether a task existed', () => {
    expect(deleteTask('1')).toBe(true);
    expect(getTaskById('1')).toBeUndefined();
    expect(deleteTask('1')).toBe(false);
  });
});
