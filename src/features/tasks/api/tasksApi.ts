import { apiClient } from '@/lib/axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus } from '@/types';

interface TasksResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}

export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const { data } = await apiClient.get<TasksResponse>('/tasks', {
    params: status ? { status } : {},
  });
  return data.tasks;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<TaskResponse>('/tasks', payload);
  return data.task;
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await apiClient.put<TaskResponse>(`/tasks/${id}`, payload);
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}
