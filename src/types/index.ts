export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done' | undefined;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskStatus;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface ApiError {
  message: string;
  status: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}
