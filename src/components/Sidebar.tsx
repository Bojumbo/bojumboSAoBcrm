import { Link, useLocation } from 'react-router-dom';
import GlassCard from './GlassCard';

function Sidebar() {
  const { pathname } = useLocation();
  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link to={to} className={`block px-3 py-2 rounded-lg hover:bg-white/10 transition ${pathname===to? 'bg-white/10' : ''}`}>{label}</Link>
  );
  return (
    <div className="hidden md:block w-[260px] p-4">
      <GlassCard className="p-4">
        <div className="glass-content">
          <div className="text-lg font-semibold mb-4">CRM</div>
          <nav className="space-y-1 text-sm">
            <NavLink to="/dashboard" label="Дашборд" />
            <NavLink to="/projects" label="Проєкти" />
            <NavLink to="/subprojects" label="Підпроєкти" />
            <NavLink to="/counterparties" label="Контрагенти" />
            <NavLink to="/products" label="Товари" />
            <NavLink to="/services" label="Послуги" />
            <NavLink to="/tasks" label="Завдання" />
            <NavLink to="/settings" label="Налаштування" />
          </nav>
        </div>
      </GlassCard>
    </div>
  );
}

export default Sidebar;
