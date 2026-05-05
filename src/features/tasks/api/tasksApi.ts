import { apiClient } from '@/lib/axios';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '@/types';

export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const { data } = await apiClient.get('/tasks', { params: status ? { status } : {} });
  return data.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post('/tasks', payload);
  return data.task;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await apiClient.put(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
