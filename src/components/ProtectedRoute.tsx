import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'admin' | 'head' | 'manager';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const userFromStorage = userStr && userStr !== 'undefined' && userStr !== 'null' ? safeParse(userStr) : null;
  const isAuthEffective = isAuthenticated || !!token;
  const effectiveUser = user || userFromStorage;

  if (isLoading && !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-pane rounded-xl p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
          <p className="text-[var(--text-secondary)]">Перевірка авторизації...</p>
        </div>
      </div>
    );
  }

  if (!isAuthEffective) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && effectiveUser) {
    const hasRequiredRole = checkUserRole(effectiveUser.role, requiredRole);
    if (!hasRequiredRole) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-pane rounded-xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Недостатньо прав
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Для доступу до цієї сторінки потрібна роль: {getRoleDisplayName(requiredRole)}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              Ваша поточна роль: {getRoleDisplayName(effectiveUser.role)}
            </p>
          </div>
        </div>
      );
    }
  }

  if (!children) {
    return <Outlet />;
  }

  return <>{children}</>;
};

function safeParse(json: string) {
  try { return JSON.parse(json); } catch { return null; }
}

const checkUserRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'admin': 3,
    'head': 2,
    'manager': 1
  } as const;

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};

const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    'admin': 'Адміністратор',
    'head': 'Керівник',
    'manager': 'Менеджер'
  } as const;

  return roleNames[role as keyof typeof roleNames] || role;
};

export default ProtectedRoute;
