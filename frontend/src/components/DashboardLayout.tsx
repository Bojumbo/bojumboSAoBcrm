'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed}
      />
      <div 
        className={`h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed 
            ? 'lg:ml-16' 
            : 'lg:ml-64'
        }`}
      >
        <main className="flex-1 overflow-hidden pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
