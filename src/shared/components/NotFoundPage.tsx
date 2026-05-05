import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
    <h1 className="text-6xl font-bold mb-2">404</h1>
    <p className="text-lg mb-4">Page not found</p>
    <Link to="/dashboard" className="text-primary underline">Back to Dashboard</Link>
  </div>
);
