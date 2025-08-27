import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { Manager } from '../types';

interface AuthContextType {
  currentUser: Manager | null;
  login: (email: string) => Promise<Manager | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    // In a real app with session persistence, you would call checkLoggedIn().
    // For this mock API, we start fresh, so we just set loading to false.
     setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
        const user = await api.login(email);
        setCurrentUser(user);
        return user;
    } catch (error) {
        console.error("Login failed", error);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const value = { currentUser, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
