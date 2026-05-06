import { describe, it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';

const task: Task = {
  id: '1',
  title: 'Test Task',
  description: 'desc',
  status: 'todo',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  userId: 'u1',
};

describe('TaskCard', () => {
  it('renders task title, description, and status', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
  });

  it('renders created and updated dates', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = vi.fn();
    render(<TaskCard task={task} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when Delete button clicked', () => {
    const onDelete = vi.fn();
    render(<TaskCard task={task} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it('does not render Edit/Delete buttons if not provided', () => {
    render(<TaskCard task={task} />);
    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
  });
});
