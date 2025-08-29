import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { ManagersService, CounterpartiesService, SalesService, ProjectsService } from '../src/services/apiService';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <div className="glass-pane sheen-effect rounded-xl p-6 flex items-center justify-between transform hover:-translate-y-1 transition-transform duration-300">
    <div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
    <div className="bg-[var(--brand-bg-translucent)] rounded-full p-3">
      <Icon className="h-7 w-7 text-[var(--text-brand)]" />
    </div>
  </div>
);

// Simple icon components
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const BuildingOfficeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2m8 0v2a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0v2a2 2 0 00-2 2H8a2 2 0 00-2-2V6" />
  </svg>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ managers: 0, counterparties: 0, sales: 0, projects: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [salesRaw, setSalesRaw] = useState<any[]>([]);
  const [projectsRaw, setProjectsRaw] = useState<any[]>([]);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [m, c, s, p] = await Promise.all([
          ManagersService.getAll(),
          CounterpartiesService.getAll(),
          SalesService.getAll(),
          ProjectsService.getAll(),
        ]);
        setStats({
          managers: (m as any).data?.length ?? 0,
          counterparties: (c as any).data?.length ?? 0,
          sales: (s as any).data?.length ?? 0,
          projects: (p as any).data?.length ?? 0,
        });
        setSalesRaw(((s as any).data) || []);
        setProjectsRaw(((p as any).data) || []);
      } catch (error: any) {
        console.error("Failed to fetch dashboard stats", error);
        setError(error.message || 'Помилка завантаження статистики');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
        Дашборд
      </h1>
      
      {user && (
        <div className="mb-6 glass-pane rounded-lg p-4">
          <p className="text-[var(--text-primary)]">
            <strong>Вітаємо, {user.first_name} {user.last_name}!</strong> 
            Ваша роль: <span className="capitalize">{user.role}</span>
          </p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 glass-pane rounded-lg p-4 border border-red-500/50">
          <p className="text-red-400">
            <strong>Помилка:</strong> {error}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="glass-pane rounded-xl p-6 h-32 animate-pulse"></div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Менеджери" value={stats.managers} icon={UsersIcon} />
          <StatCard title="Контрагенти" value={stats.counterparties} icon={BuildingOfficeIcon} />
          <StatCard title="Продажі" value={stats.sales} icon={ShoppingCartIcon} />
          <StatCard title="Проекти" value={stats.projects} icon={BriefcaseIcon} />
        </div>
      )}

      <SalesChart period={period} setPeriod={setPeriod} sales={salesRaw} />
      <UnfinishedProjects projects={projectsRaw} />
    </div>
  );
};

export default Dashboard;

// --- Sales Chart ---
const SalesChart: React.FC<{ period: 'month' | 'quarter' | 'year'; setPeriod: (p: 'month' | 'quarter' | 'year') => void; sales: any[] }> = ({ period, setPeriod, sales }) => {
  const now = new Date();

  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    const push = (key: string, amount: number) => map.set(key, (map.get(key) || 0) + amount);

    const withinRange = (d: Date) => {
      const msInDay = 86400000;
      if (period === 'month') return now.getTime() - d.getTime() <= 30 * msInDay;
      if (period === 'quarter') return now.getTime() - d.getTime() <= 90 * msInDay;
      return now.getTime() - d.getTime() <= 365 * msInDay;
    };

    for (const s of sales) {
      const d = new Date(s.sale_date);
      if (!withinRange(d)) continue;
      const amount = Number(s.total_price || 0);
      let key: string;
      if (period === 'month') {
        key = d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
      } else if (period === 'quarter') {
        // ISO week key
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil((((d as any) - (oneJan as any)) / 86400000 + oneJan.getDay() + 1) / 7);
        key = `${d.getFullYear()} W${week}`;
      } else {
        key = d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' });
      }
      push(key, amount);
    }

    // Ensure consistent ordering and fixed number of buckets
    let labels: string[] = [];
    if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        labels.push(d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }));
      }
    } else if (period === 'quarter') {
      // last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 7 * 86400000);
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const week = Math.ceil((((d as any) - (oneJan as any)) / 86400000 + oneJan.getDay() + 1) / 7);
        labels.push(`${d.getFullYear()} W${week}`);
      }
    } else {
      // last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' }));
      }
    }

    const values = labels.map(l => Number((map.get(l) || 0).toFixed(2)));
    return { labels, values };
  }, [sales, period]);

  const max = Math.max(1, ...buckets.values);

  return (
    <div className="mt-10 glass-pane rounded-xl p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Продажі</h2>
        <div className="inline-flex bg-white/10 rounded-md overflow-hidden">
          {(['month','quarter','year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 text-sm ${period===p?'bg-white/20 text-[var(--text-primary)]':'text-[var(--text-secondary)] hover:bg-white/10'}`}>{p==='month'?'Місяць':p==='quarter'?'Квартал':'Рік'}</button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* axes */}
          <line x1="5" y1="5" x2="5" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <line x1="5" y1="95" x2="95" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          {buckets.values.map((v, i) => {
            const barW = 90 / buckets.values.length;
            const x = 5 + i * barW + 0.5;
            const h = (v / max) * 85;
            const y = 95 - h;
            return <rect key={i} x={x} y={y} width={barW-1} height={h} fill="rgba(99,102,241,0.7)" />
          })}
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-2 text-[var(--text-secondary)] text-xs">
        {buckets.labels.map((l, i) => (
          <div key={i} className="truncate">{l}</div>
        ))}
      </div>
    </div>
  );
};

// --- Unfinished Projects Sum ---
const UnfinishedProjects: React.FC<{ projects: any[] }> = ({ projects }) => {
  const unfinishedSum = useMemo(() => {
    const isFinished = (p: any) => {
      const name = p?.funnel_stage?.name || '';
      const lowered = (name || '').toLowerCase();
      return ['заверш', 'closed', 'won', 'lost', 'completed', 'done'].some(k => lowered.includes(k));
    };
    return projects.filter(p => !isFinished(p)).reduce((sum: number, p: any) => sum + Number(p.forecast_amount || 0), 0);
  }, [projects]);

  return (
    <div className="mt-6 glass-pane rounded-xl p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Сума в незавершених проєктах (за прогнозом)</p>
        <p className="text-3xl font-bold text-[var(--text-primary)]">{unfinishedSum.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} грн</p>
      </div>
    </div>
  );
};