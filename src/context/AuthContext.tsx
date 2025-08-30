import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService } from '../services/AuthService';

type User = {
  manager_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Ctx = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<Ctx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cached = localStorage.getItem('user');
    if (token && cached) {
      try { setUser(JSON.parse(cached)); } catch {}
    }
    (async () => {
      try {
        if (token) {
          const me = await AuthService.me();
          setUser(me);
          try { localStorage.setItem('user', JSON.stringify(me)); } catch {}
        }
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // network or server error: keep cached user and token
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    try { localStorage.setItem('user', JSON.stringify(res.user)); } catch {}
  };

  const logout = async () => {
    try { await AuthService.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Hard redirect to login
    window.location.href = '/login';
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: !!user, login, logout }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
