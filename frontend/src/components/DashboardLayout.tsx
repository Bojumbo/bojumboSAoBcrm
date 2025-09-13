'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed}
      />
      <div 
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-64'
        }`}
      >
        {title && (
          <header className="bg-white shadow-sm border-b px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </header>
        )}
        <main className={`flex-1 ${title ? 'pt-0' : 'pt-16 lg:pt-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
