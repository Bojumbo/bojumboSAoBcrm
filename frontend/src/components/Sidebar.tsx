'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  GitBranch, 
  ShoppingCart, 
  CheckSquare, 
  Users, 
  Package, 
  Box, 
  Wrench, 
  Settings,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Проекти', href: '/projects', icon: FolderOpen },
  { name: 'Підпроекти', href: '/subprojects', icon: GitBranch },
  { name: 'Продажі', href: '/sales', icon: ShoppingCart },
  { name: 'Завдання', href: '/tasks', icon: CheckSquare },
  { name: 'Контрагенти', href: '/counterparties', icon: Users },
  { name: 'Склад', href: '/warehouse', icon: Package },
  { name: 'Товари', href: '/products', icon: Box },
  { name: 'Послуги', href: '/services', icon: Wrench },
  { name: 'Налаштування', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ className, collapsed: propCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Використовуємо пропи якщо вони передані, інакше внутрішній стан
  const collapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  
  const handleCollapsedChange = (newCollapsed: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className={`fixed top-4 z-50 lg:hidden transition-all duration-300 ${
          collapsed ? 'left-4' : 'left-4'
        }`}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-900">SAoB CRM</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCollapsedChange(!collapsed)}
              className="hidden lg:flex p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            {!collapsed && (
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="ml-3">Вийти</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
