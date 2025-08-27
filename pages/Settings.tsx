
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Manager, Unit, SaleStatusType, ProjectStatusType, SubProjectStatusType, Warehouse } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';

// --- Manager Form (from former Managers.tsx) ---
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

const ManagersTabContent: React.FC = () => {
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
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Додати менеджера
                </button>
            </div>
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

// --- Warehouse Management ---
const WarehouseForm: React.FC<{ warehouse?: Warehouse | null; onSave: () => void; onCancel: () => void; }> = ({ warehouse, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        ...warehouse
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (warehouse) {
            await api.update('warehouses', warehouse.warehouse_id, formData);
        } else {
            await api.create('warehouses', formData);
        }
        onSave();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{warehouse ? 'Редагувати' : 'Додати'} склад</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Назва складу" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Адреса" required className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const WarehousesTabContent: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAll<Warehouse>('warehouses');
            setWarehouses(data);
        } catch (error) {
            console.error("Failed to fetch warehouses", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const handleAdd = () => {
        setSelectedWarehouse(null);
        setIsModalOpen(true);
    };

    const handleEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей склад?')) {
            await api.delete('warehouses', id);
            fetchWarehouses();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchWarehouses();
    };
    
     return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Склади</h3>
                <button onClick={handleAdd} className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Додати склад
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Адреса</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            warehouses.map((item) => (
                                <tr key={item.warehouse_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(item.warehouse_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && warehouses.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">Немає записів.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <WarehouseForm warehouse={selectedWarehouse} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};


// --- Dictionary Management ---
const DictionaryManager: React.FC<{
    title: string;
    entity: 'units' | 'saleStatuses' | 'projectStatuses' | 'subProjectStatuses';
}> = ({ title, entity }) => {
    const [items, setItems] = useState<(Unit | SaleStatusType | ProjectStatusType | SubProjectStatusType)[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any | null>(null);
    const [itemName, setItemName] = useState('');

    const idKey = {
        'units': 'unit_id',
        'saleStatuses': 'sale_status_id',
        'projectStatuses': 'project_status_id',
        'subProjectStatuses': 'sub_project_status_id',
    }[entity];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAll<any>(entity);
            setItems(data);
        } catch (error) {
            console.error(`Failed to fetch ${entity}`, error);
        } finally {
            setLoading(false);
        }
    }, [entity]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (item: any | null = null) => {
        setCurrentItem(item);
        setItemName(item ? item.name : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setItemName('');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name: itemName };
        if (currentItem) {
            await api.update(entity, currentItem[idKey], data);
        } else {
            await api.create(entity, data);
        }
        handleCloseModal();
        fetchData();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей запис?')) {
            await api.delete(entity, id);
            fetchData();
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={() => handleOpenModal(null)} className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Додати
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={2} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item[idKey]}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(item[idKey])} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && items.length === 0 && (
                            <tr><td colSpan={2} className="text-center py-4 text-gray-500 dark:text-gray-400">Немає записів.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{currentItem ? 'Редагувати' : 'Додати'} запис</h3>
                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <input 
                                type="text" 
                                name="name" 
                                value={itemName} 
                                onChange={(e) => setItemName(e.target.value)} 
                                placeholder="Назва" 
                                required 
                                className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-2 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const DictionariesTabContent: React.FC = () => {
    return (
        <div className="space-y-8">
            <DictionaryManager title="Одиниці виміру" entity="units" />
            <DictionaryManager title="Статуси продажів" entity="saleStatuses" />
            <DictionaryManager title="Статуси проектів" entity="projectStatuses" />
            <DictionaryManager title="Статуси підпроектів" entity="subProjectStatuses" />
        </div>
    );
};


const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('managers');

    const getTabClassName = (tabName: string) => {
        const baseClasses = "px-3 py-2 font-medium text-sm rounded-t-lg focus:outline-none";
        if (activeTab === tabName) {
            return `${baseClasses} text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400`;
        }
        return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200`;
    };

    return (
        <div>
            <PageHeader title="Налаштування" />
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('managers')} className={getTabClassName('managers')}>
                        Менеджери
                    </button>
                     <button onClick={() => setActiveTab('warehouses')} className={getTabClassName('warehouses')}>
                        Склади
                    </button>
                    <button onClick={() => setActiveTab('dictionaries')} className={getTabClassName('dictionaries')}>
                        Довідники
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'managers' && <ManagersTabContent />}
                {activeTab === 'warehouses' && <WarehousesTabContent />}
                {activeTab === 'dictionaries' && <DictionariesTabContent />}
            </div>
        </div>
    );
};

export default Settings;
