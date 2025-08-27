import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Manager, Counterparty, Sale, Project } from '../types';
import { UsersIcon, BuildingOfficeIcon, ShoppingCartIcon, BriefcaseIcon } from '../components/Icons';

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
    <div className="bg-indigo-500/20 rounded-full p-3">
      <Icon className="h-7 w-7 text-[var(--text-brand)]" />
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ managers: 0, counterparties: 0, sales: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [managers, counterparties, sales, projects] = await Promise.all([
          api.getAll<Manager>('managers'),
          api.getAll<Counterparty>('counterparties'),
          api.getAll<Sale>('sales'),
          api.getAll<Project>('projects'),
        ]);
        setStats({
          managers: managers.length,
          counterparties: counterparties.length,
          sales: sales.length,
          projects: projects.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Дашборд</h1>
      
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

      <div className="mt-10 glass-pane rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Ласкаво просимо до CRM System</h2>
        <p className="text-[var(--text-secondary)]">
          Використовуйте навігацію зліва для управління різними аспектами вашого бізнесу.
          Ви можете додавати, редагувати та видаляти записи для менеджерів, контрагентів, товарів, послуг, продажів та проектів.
        </p>
      </div>

    </div>
  );
};

export default Dashboard;