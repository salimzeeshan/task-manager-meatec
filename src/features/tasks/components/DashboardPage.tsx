import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasksStore } from '../store/tasksStore';
import { FilterTabs } from './FilterTabs';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types';
import { TaskFormModal } from './TaskFormModal';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') as 'todo' | 'in-progress' | 'done';
  const { tasks, isLoading, error, fetchTasks, clearError, deleteTask } = useTasksStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function handleFetchTasks(status?: TaskStatus) {
    try {
      await fetchTasks(status);
    } catch {
      toast.error('Failed to load tasks. Please try again.');
    }
  }

  useEffect(() => {
    void handleFetchTasks(status);
    // eslint-disable-next-line
  }, [status]);

  useEffect(() => {
    if (error && tasks?.length > 0) {
      toast.error(error);
    }
  }, [error, tasks?.length]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    void (async () => {
      try {
        await deleteTask(task.id);
        toast.success('Task deleted');
      } catch {
        toast.error('Failed to delete task');
      }
    })();
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  if (error && tasks.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="text-destructive text-3xl font-bold">Network Error</span>
          <p className="text-muted-foreground">
            Could not load tasks. Please check your connection and try again.
          </p>
          <Button
            onClick={() => {
              clearError();
              void handleFetchTasks(status);
            }}
          >
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-2">
        <FilterTabs />
        <Button onClick={handleCreateTask} className="ml-2">
          Create Task
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>
      ) : tasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2 text-muted-foreground">
          <span className="text-2xl font-semibold mb-3">No tasks found</span>
          <Button onClick={handleCreateTask} className="ml-2">
            Create a task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
      <TaskFormModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        task={editingTask || undefined}
      />
    </DashboardLayout>
  );
};
