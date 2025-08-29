import React, { useEffect, useMemo, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { ManagersService } from '../src/services/apiService';
import { Manager } from '../types';
import { FunnelIcon } from '../components/Icons';

const Managers: React.FC = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');

    const loadManagers = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await ManagersService.getAll();
            setManagers((resp as any).data);
        } catch (e) {
            console.error('Failed to load managers', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadManagers();
    }, [loadManagers]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return managers.filter(m => {
            const roleMatch = role ? m.role === role : true;
            const text = `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase();
            const searchMatch = term ? text.includes(term) : true;
            return roleMatch && searchMatch;
        });
    }, [managers, search, role]);

    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";

    return (
        <div>
            <PageHeader title="Менеджери" />

            <div className="mb-6 p-4 rounded-xl glass-pane">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Фільтри
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Пошук (ім'я, email)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={baseInputClasses}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={baseInputClasses}>
                        <option value="">Всі ролі</option>
                        <option value="admin">admin</option>
                        <option value="head">head</option>
                        <option value="manager">manager</option>
                    </select>
                    <div className="flex justify-end items-center">
                        <button onClick={() => { setSearch(''); setRole(''); }} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white/10 border border-transparent rounded-md hover:bg-white/20">
                            Скинути
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl glass-pane overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Ім'я</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Роль</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Керівники</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Підлеглі</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filtered.map(m => (
                                <tr key={m.manager_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{m.first_name} {m.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{m.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] capitalize">{m.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{(m as any).supervisors?.length ?? 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{(m as any).subordinates?.length ?? 0}</td>
                                </tr>
                            ))
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-4 text-[var(--text-secondary)]">Немає менеджерів за заданими фільтрами.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Managers;


