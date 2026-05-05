import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasksStore } from '../store/tasksStore';
import { FilterTabs } from './FilterTabs';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') as 'todo' | 'in-progress' | 'done' | undefined;
  const { tasks, isLoading, error, fetchTasks, clearError } = useTasksStore();

  useEffect(() => {
    fetchTasks(status === 'all' ? undefined : status);
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    if (error && tasks.length > 0) {
      toast.error(error);
    }
  }, [error, tasks.length]);

  if (error && tasks.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="text-destructive text-3xl font-bold">Network Error</span>
          <p className="text-muted-foreground">Could not load tasks. Please check your connection and try again.</p>
          <Button onClick={() => { clearError(); fetchTasks(status); }}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FilterTabs />
      {/* ...rest of dashboard content (stats, grid, etc.)... */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>
      ) : (
        <div className="mt-4">{/* Task grid goes here */}</div>
      )}
    </DashboardLayout>
  );
};
