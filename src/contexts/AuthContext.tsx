import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Basic types
export interface Manager {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'head' | 'manager';
  supervisor_ids?: number[];
}

interface AuthContextType {
  user: Manager | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Manager | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
          try {
            const currentUser = JSON.parse(userStr);
            if (currentUser && currentUser.email) {
              setUser(currentUser);
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem('user');
            }
          } catch (e) {
            console.warn('Invalid user JSON in localStorage, clearing.');
            localStorage.removeItem('user');
          }
        } else {
          if (userStr === 'undefined' || userStr === 'null') {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let serverMessage = `HTTP ${response.status}`;
        try {
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            serverMessage = errJson.error || errJson.message || serverMessage;
          } else {
            const errText = await response.text();
            serverMessage = errText || serverMessage;
          }
        } catch {}
        throw new Error(serverMessage);
      }

      const raw = await response.json();
      const wrapped = raw && raw.success && raw.data ? raw.data : raw;
      const token = wrapped?.token as string | undefined;
      const authUser = wrapped?.user as Manager | undefined;

      if (!token || !authUser) {
        throw new Error('Invalid login response');
      }

      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(authUser));

      setUser(authUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => undefined);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const raw = await response.json();
          const currentUser = raw && raw.success && raw.data ? raw.data : raw;
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
