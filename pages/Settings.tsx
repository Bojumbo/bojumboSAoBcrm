
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Unit, SaleStatusType, ProjectStatusType, SubProjectStatusType } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';

type Item = { id: number; name: string };
type EntityName = 'units' | 'saleStatuses' | 'projectStatuses' | 'subProjectStatuses';

// --- Reusable Modal Form ---
const SettingForm: React.FC<{
    item: Item | null;
    title: string;
    onSave: (item: { name: string }) => void;
    onCancel: () => void;
}> = ({ item, title, onSave, onCancel }) => {
    const [name, setName] = useState(item?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name });
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Назва"
                        required
                        className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Reusable Settings Section ---
interface SettingsSectionProps<T extends Item> {
    title: string;
    items: T[];
    entityName: EntityName;
    refreshData: () => void;
}

const SettingsSection = <T extends Item>({ title, items, entityName, refreshData }: SettingsSectionProps<T>) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    const handleAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: T) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей запис?')) {
            await api.delete(entityName, id);
            refreshData();
        }
    };

    const handleSave = async (data: { name: string }) => {
        if (selectedItem) {
            await api.update(entityName, selectedItem.id, data);
        } else {
            await api.create(entityName, data);
        }
        setIsModalOpen(false);
        refreshData();
    };

    const idKey = `${entityName.endsWith('es') ? entityName.slice(0, -2) : entityName.slice(0, -1)}_id`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                >
                    <PlusIcon className="h-4 w-4 mr-2" /> Додати
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.length === 0 ? (
                    <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Немає записів</li>
                ) : (
                    items.map((item) => (
                        <li key={(item as any)[idKey]} className="px-6 py-3 flex items-center justify-between">
                            <span className="text-sm text-gray-900 dark:text-gray-200">{item.name}</span>
                            <div className="space-x-4">
                                <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => handleDelete((item as any)[idKey])} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
            {isModalOpen && (
                <SettingForm
                    item={selectedItem as Item | null}
                    title={`${selectedItem ? 'Редагувати' : 'Додати'} запис`}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

// --- Main Settings Page ---
const Settings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState<Unit[]>([]);
    const [saleStatuses, setSaleStatuses] = useState<SaleStatusType[]>([]);
    const [projectStatuses, setProjectStatuses] = useState<ProjectStatusType[]>([]);
    const [subProjectStatuses, setSubProjectStatuses] = useState<SubProjectStatusType[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [u, ss, ps, sps] = await Promise.all([
                api.getAll<Unit>('units'),
                api.getAll<SaleStatusType>('saleStatuses'),
                api.getAll<ProjectStatusType>('projectStatuses'),
                api.getAll<SubProjectStatusType>('subProjectStatuses'),
            ]);
            setUnits(u);
            setSaleStatuses(ss);
            setProjectStatuses(ps);
            setSubProjectStatuses(sps);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div>Завантаження налаштувань...</div>;
    }

    return (
        <div>
            <PageHeader title="Налаштування" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsSection title="Одиниці вимірювання (Товари)" items={units.map(u => ({...u, id: u.unit_id}))} entityName="units" refreshData={fetchData} />
                <SettingsSection title="Статуси продажу" items={saleStatuses.map(s => ({...s, id: s.sale_status_id}))} entityName="saleStatuses" refreshData={fetchData} />
                <SettingsSection title="Статуси проектів" items={projectStatuses.map(p => ({...p, id: p.project_status_id}))} entityName="projectStatuses" refreshData={fetchData} />
                <SettingsSection title="Статуси підпроектів" items={subProjectStatuses.map(s => ({...s, id: s.sub_project_status_id}))} entityName="subProjectStatuses" refreshData={fetchData} />
            </div>
        </div>
    );
};

export default Settings;
