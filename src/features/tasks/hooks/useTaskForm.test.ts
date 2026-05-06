import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '@/types';
import { useTaskForm } from './useTaskForm';

const storeMocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  isSubmitting: false,
}));

vi.mock('../store/tasksStore', () => ({
  useTasksStore: () => storeMocks,
}));

describe('useTaskForm', () => {
  const task: Task = {
    id: '1',
    title: 'Existing Task',
    description: 'Existing description',
    status: 'in-progress',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    userId: 'u1',
  };

  beforeEach(() => {
    storeMocks.createTask.mockReset();
    storeMocks.updateTask.mockReset();
    storeMocks.isSubmitting = false;
  });

  it('initializes create mode with default values', () => {
    const { result } = renderHook(() => useTaskForm({}));

    expect(result.current.isEditMode).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.descriptionLength).toBe(0);
    expect(result.current.formik.values).toEqual({
      title: '',
      description: '',
      status: 'todo',
    });
  });

  it('initializes edit mode with task values', () => {
    storeMocks.isSubmitting = true;

    const { result } = renderHook(() => useTaskForm({ task }));

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.descriptionLength).toBe(task.description.length);
    expect(result.current.formik.values).toEqual({
      title: task.title,
      description: task.description,
      status: task.status,
    });
  });

  it('creates a task and calls onSuccess on submit', async () => {
    const onSuccess = vi.fn();
    storeMocks.createTask.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useTaskForm({ onSuccess }));

    await act(async () => {
      await result.current.formik.setValues({
        title: 'New Task',
        description: 'New description',
        status: 'todo',
      });
    });
    await waitFor(() => expect(result.current.formik.values.title).toBe('New Task'));

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(storeMocks.createTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New description',
      status: 'todo',
    });
    expect(storeMocks.updateTask).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.formik.isSubmitting).toBe(false);
  });

  it('updates a task and calls onSuccess on submit', async () => {
    const onSuccess = vi.fn();
    storeMocks.updateTask.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useTaskForm({ task, onSuccess }));

    await act(async () => {
      await result.current.formik.setValues({
        title: 'Updated Task',
        description: 'Updated description',
        status: 'done',
      });
    });
    await waitFor(() => expect(result.current.formik.values.title).toBe('Updated Task'));

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(storeMocks.updateTask).toHaveBeenCalledWith(task.id, {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'done',
    });
    expect(storeMocks.createTask).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.formik.isSubmitting).toBe(false);
  });

  it('does not call onSuccess when submit fails', async () => {
    const onSuccess = vi.fn();
    storeMocks.createTask.mockRejectedValueOnce(new Error('failed'));
    const { result } = renderHook(() => useTaskForm({ onSuccess }));

    await act(async () => {
      await result.current.formik.setValues({
        title: 'New Task',
        description: 'New description',
        status: 'todo',
      });
    });
    await waitFor(() => expect(result.current.formik.values.title).toBe('New Task'));

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.formik.isSubmitting).toBe(false);
  });

  it('allows submit success without an onSuccess callback', async () => {
    storeMocks.createTask.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useTaskForm({}));

    await act(async () => {
      await result.current.formik.setValues({
        title: 'New Task',
        description: '',
        status: 'todo',
      });
    });
    await waitFor(() => expect(result.current.formik.values.title).toBe('New Task'));

    await act(async () => {
      await result.current.formik.submitForm();
    });

    expect(storeMocks.createTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: '',
      status: 'todo',
    });
    expect(result.current.formik.isSubmitting).toBe(false);
  });

  it('uses zero description length when description is undefined', async () => {
    const { result } = renderHook(() => useTaskForm({}));

    await act(async () => {
      await result.current.formik.setFieldValue('description', undefined);
    });

    expect(result.current.descriptionLength).toBe(0);
  });
});
