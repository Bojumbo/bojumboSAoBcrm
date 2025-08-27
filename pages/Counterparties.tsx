import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Counterparty, Manager, CounterpartyType } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, FunnelIcon } from '../components/Icons';

const CounterpartyForm: React.FC<{ counterparty?: Counterparty | null, onSave: () => void; onCancel: () => void; managers: Manager[] }> = ({ counterparty, onSave, onCancel, managers }) => {
    const [formData, setFormData] = useState({
        name: '',
        counterparty_type: CounterpartyType.INDIVIDUAL,
        ...counterparty,
        responsible_manager_id: counterparty?.responsible_manager_id?.toString() || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
        };
        if (counterparty) {
            await api.update('counterparties', counterparty.counterparty_id, dataToSave);
        } else {
            await api.create('counterparties', dataToSave);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-md shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">{counterparty ? 'Редагувати' : 'Додати'} контрагента</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 rounded-md focus:outline-none glass-input"/>
                    <select name="counterparty_type" value={formData.counterparty_type} onChange={handleChange} className="w-full px-3 py-2 rounded-md focus:outline-none glass-input">
                        {Object.values(CounterpartyType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} className="w-full px-3 py-2 rounded-md focus:outline-none glass-input">
                        <option value="">-- Відповідальний менеджер --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Counterparties: React.FC = () => {
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCounterparty, setSelectedCounterparty] = useState<Counterparty | null>(null);
    const [filters, setFilters] = useState({
        name: '',
        responsible_manager_id: '',
        counterparty_type: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [cData, mData] = await Promise.all([
                api.getAll<Counterparty>('counterparties'),
                api.getAll<Manager>('managers')
            ]);
            const counterpartiesWithManagers = cData.map(c => ({
                ...c,
                responsible_manager: mData.find(m => m.manager_id === c.responsible_manager_id)
            }));
            setCounterparties(counterpartiesWithManagers);
            setManagers(mData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredCounterparties = useMemo(() => {
        return counterparties.filter(c => {
            const nameMatch = filters.name ? c.name.toLowerCase().includes(filters.name.toLowerCase()) : true;
            const managerMatch = filters.responsible_manager_id ? c.responsible_manager_id?.toString() === filters.responsible_manager_id : true;
            const typeMatch = filters.counterparty_type ? c.counterparty_type === filters.counterparty_type : true;
            return nameMatch && managerMatch && typeMatch;
        });
    }, [counterparties, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ name: '', responsible_manager_id: '', counterparty_type: '' });
    };
    
    const handleAdd = () => {
        setSelectedCounterparty(null);
        setIsModalOpen(true);
    };

    const handleEdit = (counterparty: Counterparty) => {
        setSelectedCounterparty(counterparty);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього контрагента?')) {
            await api.delete('counterparties', id);
            fetchData();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";

    return (
        <div>
            <PageHeader title="Контрагенти" buttonLabel="Додати контрагента" onButtonClick={handleAdd} />
            
            <div className="mb-6 p-4 rounded-xl glass-pane">
                 <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Фільтри
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="name" placeholder="Пошук за назвою..." value={filters.name} onChange={handleFilterChange} className={baseInputClasses} />
                    <select name="responsible_manager_id" value={filters.responsible_manager_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі менеджери</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <select name="counterparty_type" value={filters.counterparty_type} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі типи</option>
                        {Object.values(CounterpartyType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white/10 border border-transparent rounded-md hover:bg-white/20"
                    >
                        Скинути фільтри
                    </button>
                </div>
            </div>

            <div className="rounded-xl glass-pane overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Тип</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Відповідальний</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filteredCounterparties.map((c) => (
                                <tr key={c.counterparty_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{c.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{c.counterparty_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{c.responsible_manager ? `${c.responsible_manager.first_name} ${c.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(c)} className="text-indigo-400 hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(c.counterparty_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                         {!loading && filteredCounterparties.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-4 text-[var(--text-secondary)]">Немає контрагентів, що відповідають фільтрам.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CounterpartyForm counterparty={selectedCounterparty} onSave={handleSave} onCancel={() => setIsModalOpen(false)} managers={managers} />}
        </div>
    );
};

export default Counterparties;