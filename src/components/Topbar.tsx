import { useAuth } from '../context/AuthContext';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <div className="p-4">
      <GlassCard className="p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Вітаємо, {user ? `${user.first_name} ${user.last_name}` : 'гість'}</div>
          {user && <GlassButton onClick={logout}>Вийти</GlassButton>}
        </div>
      </GlassCard>
    </div>
  );
}
