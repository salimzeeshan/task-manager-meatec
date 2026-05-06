import { describe, it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types';
import userEvent from '@testing-library/user-event';

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

  it('renders in-progress status', () => {
    render(<TaskCard task={{ ...task, status: 'in-progress' }} />);
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });

  it('renders done status', () => {
    render(<TaskCard task={{ ...task, status: 'done' }} />);
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('renders UNKNOWN when task status is undefined', () => {
    render(<TaskCard task={{ ...task, status: undefined }} />);

    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('renders created and updated dates', () => {
    render(<TaskCard task={task} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it.each([
    ['2024-01-02T00:00:00.000Z', /2nd/],
    ['2024-01-03T00:00:00.000Z', /3rd/],
    ['2024-01-04T00:00:00.000Z', /4th/],
    ['2024-01-11T00:00:00.000Z', /11th/],
    ['2024-01-30T00:00:00.000Z', /30th/],
  ])('renders ordinal suffix for %s', (createdAt, expectedDate) => {
    render(<TaskCard task={{ ...task, createdAt }} />);
    expect(screen.getAllByText(expectedDate).length).toBeGreaterThan(0);
  });

  it('calls onEdit when Edit button clicked', () => {
    const onEdit = vi.fn();
    render(<TaskCard task={task} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when confirmed in modal', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TaskCard task={task} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    const confirmButton = await screen.findByRole('button', { name: /^confirm$/i });
    await user.click(confirmButton);

    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it('does not render Edit/Delete buttons if not provided', () => {
    render(<TaskCard task={task} />);
    expect(screen.queryByText('Edit')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
  });
});

it('renders ordinal suffix "st" for days ending in 1 (e.g. 21st)', () => {
  render(<TaskCard task={{ ...task, createdAt: '2024-01-21T00:00:00.000Z' }} />);
  expect(screen.getAllByText(/21st/).length).toBeGreaterThan(0);
});

it('closes confirm dialog without calling onDelete when Cancel is clicked', async () => {
  const user = userEvent.setup();
  const onDelete = vi.fn();

  render(<TaskCard task={task} onDelete={onDelete} />);

  await user.click(screen.getByRole('button', { name: /delete/i }));
  expect(await screen.findByText('Are you sure you want to delete this task?')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^cancel$/i }));

  expect(screen.queryByText('Are you sure you want to delete this task?')).not.toBeInTheDocument();
  expect(onDelete).not.toHaveBeenCalled();
});
