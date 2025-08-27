import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, BuildingOfficeIcon, CubeIcon, WrenchScrewdriverIcon, ShoppingCartIcon, BriefcaseIcon, ChartBarIcon, Cog6ToothIcon, ClipboardDocumentListIcon, ViewColumnsIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const navigationItems = [
  { name: 'Дашборд', href: '/', icon: HomeIcon },
  { name: 'Контрагенти', href: '/counterparties', icon: BuildingOfficeIcon },
  { name: 'Товари', href: '/products', icon: CubeIcon },
  { name: 'Послуги', href: '/services', icon: WrenchScrewdriverIcon },
  { name: 'Продажі', href: '/sales', icon: ShoppingCartIcon },
  { name: 'Проекти', href: '/projects', icon: BriefcaseIcon },
  { name: 'Підпроекти', href: '/subprojects', icon: ViewColumnsIcon },
  { name: 'Завдання', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Налаштування', href: '/settings', icon: Cog6ToothIcon, adminOnly: true },
];

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const linkClasses = 'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300';
  const inactiveClasses = 'nav-link-inactive';
  const activeClasses = 'nav-link-active';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
        case 'admin': return 'Адміністратор';
        case 'head': return 'Керівник';
        case 'manager': return 'Менеджер';
        default: return 'Користувач';
    }
  }

  const visibleNavigation = navigationItems.filter(item => {
    if (item.adminOnly) {
      return currentUser?.role === 'admin';
    }
    return true;
  });

  return (
    <aside className="sidebar-container w-64 flex-shrink-0 flex flex-col m-4 rounded-2xl shadow-2xl">
      <div className="h-20 flex items-center justify-center px-4">
        <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-[var(--brand-secondary)]" />
            <span className="text-xl font-bold text-[var(--text-primary)] tracking-wider">Glass CRM</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : inactiveClasses}`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

       <div className="p-4 border-t border-[var(--glass-border)]">
        <div className="flex justify-between items-center mb-4">
            {currentUser && (
                <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{currentUser.first_name} {currentUser.last_name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{getRoleName(currentUser.role)}</p>
                </div>
            )}
            <ThemeToggle />
        </div>
        <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600/50 rounded-md border border-red-500/50 hover:bg-red-600/80 hover:border-red-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] focus:ring-red-500"
        >
            Вийти
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;