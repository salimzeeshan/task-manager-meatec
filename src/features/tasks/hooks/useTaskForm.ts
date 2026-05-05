import { useFormik } from 'formik';
import { useTasksStore } from '../store/tasksStore';
import { taskSchema, TaskFormValues } from '../validation/taskSchema';
import { Task } from '@/types';

interface UseTaskFormOptions {
  task?: Task;
  onSuccess?: () => void;
}

export function useTaskForm({ task, onSuccess }: UseTaskFormOptions) {
  const { createTask, updateTask, isSubmitting } = useTasksStore();

  const formik = useFormik<TaskFormValues>({
    initialValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'todo',
    },
    validationSchema: taskSchema,
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (task) {
          await updateTask(task.id, values);
        } else {
          await createTask(values);
        }
        resetForm();
        onSuccess?.();
      } catch {
        // errors handled by store
      } finally {
        setSubmitting(false);
      }
    },
  });

  const isEditMode = Boolean(task);
  const descriptionLength = formik.values.description?.length ?? 0;

  return { formik, isEditMode, isSubmitting, descriptionLength };
}
