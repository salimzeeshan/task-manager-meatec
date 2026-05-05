import React, { useState } from 'react';
import { useFormik } from 'formik';
import { loginSchema, LoginFormValues } from '../validation/loginSchema';
import { useAuthStore } from '../store/authStore';
import { Button, Input, Label, Card, Avatar, Badge } from '@/shared/components/ui';
import { AlertCircle, CheckSquare, Eye, EyeOff, Loader2, ListTodo, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const featureBullets = [
  { icon: <ListTodo className="w-5 h-5" />, text: 'Organize tasks easily' },
  { icon: <ShieldCheck className="w-5 h-5" />, text: 'Secure & private' },
  { icon: <CheckSquare className="w-5 h-5" />, text: 'Track progress visually' },
];

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, error, clearError } = useAuthStore();

  const formik = useFormik<LoginFormValues>({
    initialValues: { username: '', password: '' },
    validationSchema: loginSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await login(values);
        resetForm();
        navigate('/dashboard');
      } catch {
        // error handled in store
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-primary to-muted text-white p-8 w-1/2 min-h-[500px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-7 h-7" />
              <span className="font-bold text-xl">Task Manager</span>
            </div>
            <div className="mb-2 text-lg font-semibold">Manage your work, your way</div>
            <ul className="mt-6 space-y-4">
              {featureBullets.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-xs opacity-70">&copy; {new Date().getFullYear()} Task Manager</div>
        </div>
        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center p-8 bg-card">
          <form onSubmit={formik.handleSubmit} className="w-full max-w-sm mx-auto animate-fade-in">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="mb-2 bg-primary text-white">
                <CheckSquare className="w-6 h-6" />
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
              <Badge variant="secondary" className="mb-2">Sign in to continue</Badge>
            </div>
            {/* Username */}
            <div className="mb-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                {...formik.getFieldProps('username')}
                className={clsx({ 'border-destructive': formik.touched.username && formik.errors.username })}
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formik.errors.username}
                </div>
              )}
            </div>
            {/* Password */}
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...formik.getFieldProps('password')}
                  className={clsx({ 'border-destructive': formik.touched.password && formik.errors.password })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formik.errors.password}
                </div>
              )}
            </div>
            {/* Remember Me */}
            <div className="mb-4 flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                className="accent-primary"
              />
              <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
            </div>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 bg-destructive/10 border border-destructive text-destructive rounded px-3 py-2 flex items-center justify-between gap-2 animate-fade-in">
                <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</span>
                <button type="button" onClick={clearError} className="ml-2 text-xs underline">Dismiss</button>
              </div>
            )}
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
            </Button>
            <div className="text-xs text-muted-foreground mt-4 text-center">
              Use <span className="font-mono">test</span> / <span className="font-mono">test123</span> to login
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
