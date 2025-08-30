import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const to = loc.state?.from?.pathname || '/dashboard';
      nav(to, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Помилка входу');
    }
  };

  return (
    <div className="page-container flex items-center justify-center p-6">
      <GlassCard className="w-[min(420px,95vw)] p-6">
        <h1 className="text-2xl font-semibold mb-6">Вхід до CRM</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass bg-white/5 border border-white/20 rounded-xl px-3 py-2 focus:outline-none"
              type="email" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Пароль</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass bg-white/5 border border-white/20 rounded-xl px-3 py-2 focus:outline-none"
              type="password" required />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <GlassButton disabled={loading} className="w-full justify-center">
            {loading ? 'Вхід...' : 'Увійти'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
