import React from 'react';
import { useTheme } from '@/shared/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2 font-bold text-lg">
          <h1 className="sr-only" aria-label="Task Manager">Task Manager</h1>
          <span className="hidden sm:inline">TaskFlow</span>
          <span className="sm:hidden">TF</span>
        </div>
        <button
          onClick={toggleTheme}
          className={cn(
            'rounded-full p-2 transition-colors',
            theme === 'dark' ? 'hover:bg-muted' : 'hover:bg-accent'
          )}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600 transition-transform" />
          )}
        </button>
      </nav>
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-4">
        {children}
      </main>
    </div>
  );
};
