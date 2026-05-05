export interface AppProps {
  className?: string;
}

export const App = (_props: AppProps) => (
  <div className="min-h-screen bg-background text-foreground">
    <h1>Task Manager</h1>
  </div>
);
