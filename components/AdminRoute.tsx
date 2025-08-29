import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-pane rounded-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Недостатньо прав
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Для доступу до цієї сторінки потрібна роль адміністратора.
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Ваша поточна роль: {user?.role || 'Не авторизовано'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-bg-hover)] text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Повернутися на головну
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
