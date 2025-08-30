import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { DashboardService, DashboardMetrics } from '../services/DashboardService';

function Widget({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <GlassCard className="p-5">
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
    </GlassCard>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const m = await DashboardService.getMetrics();
        setMetrics(m);
      } catch (e: any) {
        setError(e?.message || 'Не вдалося завантажити дані');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <GlassCard className="p-5 animate-pulse h-24" />
        <GlassCard className="p-5 animate-pulse h-24" />
        <GlassCard className="p-5 animate-pulse h-24" />
        <GlassCard className="p-5 animate-pulse h-40 md:col-span-2" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <Widget title="Проєкти" value={metrics?.projectsCount ?? 0} hint={`Прогноз: ${new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(metrics?.projectsForecastTotal || 0)}`} />
      <Widget title="Завдання" value={metrics?.tasksCount ?? 0} hint={`На сьогодні: ${metrics?.tasksDueToday ?? 0}`} />
      <Widget title="Угоди" value={metrics?.salesCount ?? 0} hint={`Сума: ${new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(metrics?.salesTotal || 0)}`} />

      <GlassCard className="p-5 md:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">Активність</div>
            <div className="text-xl font-semibold mt-1">Короткий огляд</div>
          </div>
        </div>
        <div className="mt-4 text-sm opacity-80">
          За останні 30 днів загальна сума угод: <span className="font-semibold">{new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' }).format(metrics?.salesLast30Total || 0)}</span>.
        </div>
      </GlassCard>
    </div>
  );
}
