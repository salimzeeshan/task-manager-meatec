import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { Outlet, Navigate } from 'react-router-dom';
import { PageLoader } from '@/shared/components/PageLoader';

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

interface RequireGuestProps {
  children: ReactNode;
}

export const RequireGuest = ({ children }: RequireGuestProps) => {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
