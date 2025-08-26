
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Counterparty, Manager, CounterpartyType } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon } from '../components/Icons';

const CounterpartyForm: React.FC<{ counterparty?: Counterparty | null, onSave: () => void; onCancel: () => void; managers: Manager[] }> = ({ counterparty, onSave, onCancel, managers }) => {
    const [formData, setFormData] = useState({
        name: '',
        counterparty_type: CounterpartyType.INDIVIDUAL,
        ...counterparty,
        // FIX: Removed duplicate `responsible_manager_id` property. The version below handles both create and edit cases correctly.
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{counterparty ? 'Редагувати' : 'Додати'} контрагента</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <select name="counterparty_type" value={formData.counterparty_type} onChange={handleChange} className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        {Object.values(CounterpartyType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">-- Відповідальний менеджер --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
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

    return (
        <div>
            <PageHeader title="Контрагенти" buttonLabel="Додати контрагента" onButtonClick={handleAdd} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Тип</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Відповідальний</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            counterparties.map((c) => (
                                <tr key={c.counterparty_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{c.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.counterparty_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.responsible_manager ? `${c.responsible_manager.first_name} ${c.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(c.counterparty_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CounterpartyForm counterparty={selectedCounterparty} onSave={handleSave} onCancel={() => setIsModalOpen(false)} managers={managers} />}
        </div>
    );
};

export default Counterparties;