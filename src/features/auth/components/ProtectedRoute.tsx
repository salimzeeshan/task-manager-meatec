import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Outlet, Navigate } from 'react-router-dom';
import { PageLoader } from '@/shared/components/PageLoader';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line
  }, []);

  if (isInitializing) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const RequireGuest: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
