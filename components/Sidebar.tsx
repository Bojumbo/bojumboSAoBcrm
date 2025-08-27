import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, BuildingOfficeIcon, CubeIcon, WrenchScrewdriverIcon, ShoppingCartIcon, BriefcaseIcon, ChartBarIcon, Cog6ToothIcon, ClipboardDocumentListIcon, ViewColumnsIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

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
  const linkClasses = 'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors';
  const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800';
  const activeClasses = 'bg-indigo-600 text-white shadow-lg';
  
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
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">CRM System</span>
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

       <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {currentUser && (
            <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleName(currentUser.role)}</p>
            </div>
        )}
        <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            Вийти
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;