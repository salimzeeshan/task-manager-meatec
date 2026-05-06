import { create } from 'zustand';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '@/types';
import { apiClient } from '@/lib/axios';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchTasks: (status?: TaskStatus) => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearError: () => void;
}

interface TasksResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}

const getErrorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  async fetchTasks(status) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.get<TasksResponse>('/tasks', {
        params: status ? { status } : {},
      });
      set({ tasks: data.tasks });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to fetch tasks') });
    } finally {
      set({ isLoading: false });
    }
  },

  async createTask(payload) {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await apiClient.post<TaskResponse>('/tasks', payload);
      set({ tasks: [data.task, ...get().tasks] });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to create task') });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  async updateTask(id, payload) {
    set({ isSubmitting: true, error: null });
    try {
      const { data } = await apiClient.put<TaskResponse>(`/tasks/${id}`, payload);
      set({
        tasks: get().tasks.map((t) => (t.id === id ? data.task : t)),
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to update task') });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  async deleteTask(id) {
    set({ isSubmitting: true, error: null });
    try {
      await apiClient.delete(`/tasks/${id}`);
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Failed to delete task') });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
