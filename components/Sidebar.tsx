
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, BuildingOfficeIcon, CubeIcon, WrenchScrewdriverIcon, ShoppingCartIcon, BriefcaseIcon, ChartBarIcon, Cog6ToothIcon } from './Icons';

const navigation = [
  { name: 'Дашборд', href: '/', icon: HomeIcon },
  { name: 'Менеджери', href: '/managers', icon: UsersIcon },
  { name: 'Контрагенти', href: '/counterparties', icon: BuildingOfficeIcon },
  { name: 'Товари', href: '/products', icon: CubeIcon },
  { name: 'Послуги', href: '/services', icon: WrenchScrewdriverIcon },
  { name: 'Продажі', href: '/sales', icon: ShoppingCartIcon },
  { name: 'Проекти', href: '/projects', icon: BriefcaseIcon },
  { name: 'Налаштування', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  const linkClasses = 'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors';
  const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800';
  const activeClasses = 'bg-indigo-600 text-white shadow-lg';

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">CRM System</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
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
    </aside>
  );
};

export default Sidebar;
