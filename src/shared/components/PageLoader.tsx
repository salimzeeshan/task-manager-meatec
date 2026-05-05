import React from 'react';

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-2">
      <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      <span className="text-muted-foreground">Loading...</span>
    </div>
  </div>
);
