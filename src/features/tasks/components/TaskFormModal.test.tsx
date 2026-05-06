import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task, TaskStatus } from '@/types';
import { TaskFormModal } from './TaskFormModal';
import { toast } from 'sonner';

interface UseTaskFormOptions {
  task?: Task;
  onSuccess?: () => void;
}

interface MockFormik {
  values: {
    title: string;
    description: string;
    status: TaskStatus;
  };
  touched: Partial<Record<'title' | 'description' | 'status', boolean>>;
  errors: Partial<Record<'title' | 'description' | 'status', string>>;
  isSubmitting: boolean;
  handleSubmit: (event: Pick<React.FormEvent<HTMLFormElement>, 'preventDefault'>) => void;
  resetForm: ReturnType<typeof vi.fn>;
  getFieldProps: ReturnType<typeof vi.fn>;
  setFieldValue: ReturnType<typeof vi.fn>;
  setFieldTouched: ReturnType<typeof vi.fn>;
}

const hookMocks = vi.hoisted(() => ({
  useTaskForm: vi.fn(),
}));

vi.mock('../hooks/useTaskForm', () => ({
  useTaskForm: hookMocks.useTaskForm,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock('@/shared/components/ui/dialog', () => {
  return {
    Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div>{children}</div> : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  };
});

vi.mock('@/shared/components/ui/select', async () => {
  const React = await import('react');
  const SelectContext = React.createContext<{
    disabled?: boolean;
    onValueChange?: (value: string) => void;
  }>({});

  return {
    Select: ({
      children,
      disabled,
      onValueChange,
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      onValueChange?: (value: string) => void;
    }) => (
      <SelectContext.Provider value={{ disabled, onValueChange }}>
        <div>{children}</div>
      </SelectContext.Provider>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
      <button type="button">{children}</button>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => {
      const { disabled, onValueChange } = React.useContext(SelectContext);

      return (
        <button type="button" disabled={disabled} onClick={() => onValueChange?.(value)}>
          {children}
        </button>
      );
    },
  };
});

const createFormik = (overrides: Partial<MockFormik> = {}): MockFormik => ({
  values: {
    title: '',
    description: '',
    status: 'todo',
  },
  touched: {},
  errors: {},
  isSubmitting: false,
  handleSubmit: vi.fn((event: Pick<React.FormEvent<HTMLFormElement>, 'preventDefault'>) =>
    event.preventDefault()
  ),
  resetForm: vi.fn(),
  getFieldProps: vi.fn((name: string) => ({
    name,
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
  })),
  setFieldValue: vi.fn(),
  setFieldTouched: vi.fn(),
  ...overrides,
});

describe('TaskFormModal', () => {
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
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('renders create mode fields and submits the form', () => {
    const formik = createFormik();
    hookMocks.useTaskForm.mockReturnValue({
      formik,
      isEditMode: false,
      descriptionLength: 0,
    });

    render(<TaskFormModal open onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Design the landing page')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add more detail... (optional)')).toBeInTheDocument();
    expect(screen.getByText('0/500')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));

    expect(formik.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('focuses the title input after opening', () => {
    vi.useFakeTimers();
    const formik = createFormik();
    hookMocks.useTaskForm.mockReturnValue({
      formik,
      isEditMode: false,
      descriptionLength: 0,
    });

    render(<TaskFormModal open onClose={vi.fn()} />);

    vi.advanceTimersByTime(50);

    expect(screen.getByPlaceholderText('e.g. Design the landing page')).toHaveFocus();
  });

  it('renders edit mode copy and existing status label', () => {
    hookMocks.useTaskForm.mockReturnValue({
      formik: createFormik({
        values: {
          title: task.title,
          description: task.description,
          status: task.status,
        },
      }),
      isEditMode: true,
      descriptionLength: task.description.length,
    });

    render(<TaskFormModal open onClose={vi.fn()} task={task} />);

    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeInTheDocument();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('renders validation errors and warning description count', () => {
    hookMocks.useTaskForm.mockReturnValue({
      formik: createFormik({
        values: {
          title: '',
          description: 'x'.repeat(501),
          status: 'todo',
        },
        touched: {
          title: true,
          description: true,
          status: true,
        },
        errors: {
          title: 'Title is required',
          description: 'Description must be 500 characters or less',
          status: 'Invalid status',
        },
      }),
      isEditMode: false,
      descriptionLength: 501,
    });

    render(<TaskFormModal open onClose={vi.fn()} />);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description must be 500 characters or less')).toBeInTheDocument();
    expect(screen.getByText('Invalid status')).toBeInTheDocument();
    expect(screen.getByText('501/500')).toHaveClass('text-destructive');
  });

  it('updates formik status when selecting a status option', () => {
    const formik = createFormik();
    hookMocks.useTaskForm.mockReturnValue({
      formik,
      isEditMode: false,
      descriptionLength: 0,
    });

    render(<TaskFormModal open onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Done/ }));

    expect(formik.setFieldValue).toHaveBeenCalledWith('status', 'done');
    expect(formik.setFieldTouched).toHaveBeenCalledWith('status', true);
  });

  it('renders loading state and disables actions while submitting', () => {
    hookMocks.useTaskForm.mockReturnValue({
      formik: createFormik({ isSubmitting: true }),
      isEditMode: false,
      descriptionLength: 0,
    });

    render(<TaskFormModal open onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
    expect(screen.getAllByText(/Saving/)[0]).toBeInTheDocument();
  });

  it('calls onClose from cancel and resets form when closed', () => {
    const onClose = vi.fn();
    const formik = createFormik();
    hookMocks.useTaskForm.mockReturnValue({
      formik,
      isEditMode: false,
      descriptionLength: 0,
    });

    const { rerender } = render(<TaskFormModal open onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    rerender(<TaskFormModal open={false} onClose={onClose} />);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(formik.resetForm).toHaveBeenCalled();
  });

  it('runs create success side effects from useTaskForm', () => {
    const onClose = vi.fn();
    let onSuccess: (() => void) | undefined;
    hookMocks.useTaskForm.mockImplementation((options: UseTaskFormOptions) => {
      onSuccess = options.onSuccess;

      return {
        formik: createFormik(),
        isEditMode: false,
        descriptionLength: 0,
      };
    });

    render(<TaskFormModal open onClose={onClose} />);
    onSuccess?.();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Task created!');
  });

  it('runs edit success side effects from useTaskForm', () => {
    const onClose = vi.fn();
    let onSuccess: (() => void) | undefined;
    hookMocks.useTaskForm.mockImplementation((options: UseTaskFormOptions) => {
      onSuccess = options.onSuccess;

      return {
        formik: createFormik(),
        isEditMode: true,
        descriptionLength: 0,
      };
    });

    render(<TaskFormModal open onClose={onClose} task={task} />);
    onSuccess?.();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Task updated!');
  });
});
