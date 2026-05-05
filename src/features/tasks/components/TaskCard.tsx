import type { Task } from '@/types';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getDate();

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatted = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    hour: '2-digit',   // ✅ fix here
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${day}${getOrdinal(day)} ${formatted}`;
};

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
        <span>Created: {formatDate(task.createdAt)}</span>
        <span>Updated: {formatDate(task.updatedAt)}</span>
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