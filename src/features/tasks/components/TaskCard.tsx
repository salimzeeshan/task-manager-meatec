import type { Task } from '@/types';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg truncate" title={task.title}>
          {task.title}
        </h3>

        <Badge
          variant={
            task.status === 'done'
              ? 'success'
              : task.status === 'in-progress'
              ? 'warning'
              : 'secondary'
          }
        >
          {task.status?.replace('-', ' ').toUpperCase()}
        </Badge>
      </div>

      <p
        className="text-muted-foreground text-sm line-clamp-2"
        title={task.description}
      >
        {task.description}
      </p>

      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
        <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
      </div>

      <div className="flex gap-2 mt-2">
        {onEdit && (
          <button
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
              text-muted-foreground text-primary bg-primary/10 hover:underline
              transition-colors duration-150"
            onClick={() => onEdit(task)}
            type="button"
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
              text-muted-foreground text-destructive bg-destructive/10 hover:underline
              transition-colors duration-150"
            onClick={() => onDelete(task)}
            type="button"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
};