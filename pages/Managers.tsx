
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Manager } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon } from '../components/Icons';

const ManagerForm: React.FC<{ manager?: Manager | null; onSave: () => void; onCancel: () => void; }> = ({ manager, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        ...manager
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (manager) {
            await api.update('managers', manager.manager_id, formData);
        } else {
            await api.create('managers', formData);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{manager ? 'Редагувати' : 'Додати'} менеджера</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Ім'я" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Прізвище" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Телефон" className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Managers: React.FC = () => {
    const [managers, setManagers] = useState<Manager[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

    const fetchManagers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAll<Manager>('managers');
            setManagers(data);
        } catch (error) {
            console.error("Failed to fetch managers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    const handleAdd = () => {
        setSelectedManager(null);
        setIsModalOpen(true);
    };

    const handleEdit = (manager: Manager) => {
        setSelectedManager(manager);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього менеджера?')) {
            await api.delete('managers', id);
            fetchManagers();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchManagers();
    };

    return (
        <div>
            <PageHeader title="Менеджери" buttonLabel="Додати менеджера" onButtonClick={handleAdd} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ім'я</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Телефон</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            managers.map((manager) => (
                                <tr key={manager.manager_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{manager.first_name} {manager.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{manager.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{manager.phone_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(manager)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(manager.manager_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ManagerForm manager={selectedManager} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Managers;
