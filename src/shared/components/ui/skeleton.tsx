import { cn } from '@shared/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />
);
