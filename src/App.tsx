import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage, ProtectedRoute, RequireGuest } from '@/features/auth';

const DashboardPage: React.FC = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
    <h1 className="text-2xl font-bold">Dashboard (Protected)</h1>
  </div>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
