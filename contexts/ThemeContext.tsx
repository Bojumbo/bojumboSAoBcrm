import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('crm-theme') as Theme;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || preferredTheme;
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm-theme', theme);
    // Ensure background image switches reliably for light theme
    if (theme === 'light') {
      const primaryUrl = (import.meta as any)?.env?.VITE_LIGHT_BG_URL || '/light-theme-bg.jpg';
      const fallbackUrl = 'https://wallpapers.com/images/high/aesthetic-pastel-background-1920-x-1200-8cjr6e6yuj5gabn9.webp';
      try {
        const tester = new Image();
        tester.onload = () => {
          document.documentElement.style.setProperty('--bg-image', `url('${primaryUrl}')`);
        };
        tester.onerror = () => {
          document.documentElement.style.setProperty('--bg-image', `url('${fallbackUrl}')`);
        };
        tester.src = primaryUrl;
      } catch {
        document.documentElement.style.setProperty('--bg-image', `url('${fallbackUrl}')`);
      }
    } else {
      // Remove inline override to fall back to CSS-defined dark image
      document.documentElement.style.removeProperty('--bg-image');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
