import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FilterTabs } from './FilterTabs';

const renderFilterTabs = (initialEntry = '/tasks') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FilterTabs />
    </MemoryRouter>
  );

describe('FilterTabs', () => {
  it('renders all filter options', () => {
    renderFilterTabs();

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('selects all when there is no status search param', () => {
    renderFilterTabs();

    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'To Do' })).toHaveClass('bg-muted');
  });

  it('selects the tab that matches the status search param', () => {
    renderFilterTabs('/tasks?status=in-progress');

    expect(screen.getByRole('button', { name: 'In Progress' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-muted');
  });

  it('sets a status search param when clicking a status tab', () => {
    renderFilterTabs();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-muted');
  });

  it('removes the status search param when clicking all', () => {
    renderFilterTabs('/tasks?status=todo');

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'To Do' })).toHaveClass('bg-muted');
  });
});
