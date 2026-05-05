import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Done', value: 'done' },
];

export const FilterTabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';

  const handleTabClick = (value: string) => {
    if (value === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.set('status', value);
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            status === filter.value
              ? 'bg-primary text-white shadow'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          )}
          onClick={() => handleTabClick(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
