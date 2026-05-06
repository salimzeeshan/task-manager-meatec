import type React from 'react';
import { useEffect, useRef } from 'react';
import { useTaskForm } from '../hooks/useTaskForm';
import type { Task } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/shared/components/ui/select';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { toast } from 'sonner';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const statusOptions = [
  { value: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ open, onClose, task }) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { formik, isEditMode, descriptionLength } = useTaskForm({
    task,
    onSuccess: () => {
      onClose();
      toast.success(isEditMode ? 'Task updated!' : 'Task created!');
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 relative">
          {formik.isSubmitting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          )}
          {/* Title */}
          <div>
            <Input
              ref={titleInputRef}
              id="title"
              {...formik.getFieldProps('title')}
              disabled={formik.isSubmitting}
              placeholder="e.g. Design the landing page"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-destructive mt-1">{formik.errors.title}</p>
            )}
          </div>
          {/* Description */}
          <div>
            <Textarea
              id="description"
              {...formik.getFieldProps('description')}
              disabled={formik.isSubmitting}
              rows={4}
              placeholder="Add more detail... (optional)"
            />
            <div className="flex justify-between items-center mt-1">
              {formik.touched.description && formik.errors.description ? (
                <p className="text-sm text-destructive">{formik.errors.description}</p>
              ) : (
                <span />
              )}
              <span className={cn(
                'text-xs text-muted-foreground',
                descriptionLength > 500 && 'text-destructive'
              )}>
                {descriptionLength}/500
              </span>
            </div>
          </div>
          {/* Status */}
          <div>
            <Select
              value={formik.values.status}
              onValueChange={(value) => {
                formik.setFieldValue('status', value);
                formik.setFieldTouched('status', true);
              }}
              disabled={formik.isSubmitting}
            >
              <SelectTrigger>
                <span>
                  {statusOptions.find((s) => s.value === formik.values.status)?.label || 'Select status'}
                </span>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', option.color)} />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <p className="text-sm text-destructive mt-1">{formik.errors.status}</p>
            )}
          </div>
          {/* Footer */}
          <DialogFooter className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...
                </>
              ) : isEditMode ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
