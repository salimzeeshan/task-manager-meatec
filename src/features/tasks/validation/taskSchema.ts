import * as yup from 'yup';
import { TaskStatus } from '@/types';

export const taskSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  description: yup
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .default(''),
  status: yup
    .mixed<TaskStatus>()
    .oneOf(['todo', 'in-progress', 'done'], 'Invalid status')
    .required('Status is required'),
});

export type TaskFormValues = yup.InferType<typeof taskSchema>;
