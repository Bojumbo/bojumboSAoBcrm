import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--sidebar-bg)] focus:ring-indigo-500"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
