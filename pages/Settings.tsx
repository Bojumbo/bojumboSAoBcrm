
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ManagersService, FunnelsService, FunnelStagesService } from '../src/services/apiService';
import { Manager, Unit, SaleStatusType, SubProjectStatusType, Warehouse, Funnel, FunnelStage } from '../types';
import { HttpClient, PaginatedResponse } from '../src/services/httpClient';
import { API_CONFIG } from '../src/config/api';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';

// --- Manager Form ---
const ManagerForm: React.FC<{ 
    manager?: Manager | null; 
    onSave: () => void; 
    onCancel: () => void; 
    supervisors: Manager[];
}> = ({ manager, onSave, onCancel, supervisors }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'manager',
        ...manager,
        supervisor_ids: manager?.supervisor_ids?.map(String) || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSupervisorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const supervisorId = value;
        
        setFormData(prev => {
            const currentIds = prev.supervisor_ids || [];
            if (checked) {
                return { ...prev, supervisor_ids: [...currentIds, supervisorId] };
            } else {
                return { ...prev, supervisor_ids: currentIds.filter(id => id !== supervisorId) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            supervisor_ids: (formData.supervisor_ids || []).map(id => parseInt(id)),
        };

        if (manager) {
            await api.update('managers', manager.manager_id, dataToSave);
        } else {
            await api.create('managers', dataToSave);
        }
        onSave();
    };
    
    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{manager ? 'Редагувати' : 'Додати'} менеджера</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Ім'я" required className={baseInputClasses}/>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Прізвище" required className={baseInputClasses}/>
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className={baseInputClasses}/>
                    <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Телефон" className={baseInputClasses}/>
                    <select name="role" value={formData.role} onChange={handleChange} className={baseInputClasses}>
                        <option value="manager">Менеджер</option>
                        <option value="head">Керівник</option>
                        <option value="admin">Адміністратор</option>
                    </select>

                    {formData.role !== 'admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Керівники</label>
                            <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 h-32 overflow-y-auto space-y-1">
                                {supervisors.map(s => (
                                    <div key={s.manager_id} className="flex items-center">
                                        <input
                                            id={`supervisor-${s.manager_id}`}
                                            type="checkbox"
                                            value={s.manager_id.toString()}
                                            checked={(formData.supervisor_ids || []).includes(s.manager_id.toString())}
                                            onChange={handleSupervisorChange}
                                            disabled={manager?.manager_id === s.manager_id} // Can't be their own supervisor
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                                        />
                                        <label htmlFor={`supervisor-${s.manager_id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                                            {s.first_name} {s.last_name}
                                        </label>
                                    </div>
                                ))}
                                {supervisors.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Немає доступних керівників.</p>}
                            </div>
                        </div>
                    )}

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
            const data = await ManagersService.getAll();
            setManagers((data as any).data);
        } catch (error) {
            console.error("Failed to fetch managers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    const supervisors = useMemo(() => managers.filter(m => m.role === 'head' || m.role === 'admin'), [managers]);

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
            await ManagersService.delete(id);
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
            {isModalOpen && <ManagerForm manager={selectedManager} onSave={handleSave} onCancel={() => setIsModalOpen(false)} supervisors={supervisors} />}
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
            await HttpClient.put(`${API_CONFIG.ENDPOINTS.WAREHOUSES}/${warehouse.warehouse_id}`, formData);
        } else {
            await HttpClient.post(API_CONFIG.ENDPOINTS.WAREHOUSES, formData);
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
            const data = await HttpClient.get<PaginatedResponse<Warehouse>>(API_CONFIG.ENDPOINTS.WAREHOUSES);
            setWarehouses(data.data);
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
            await HttpClient.delete(`${API_CONFIG.ENDPOINTS.WAREHOUSES}/${id}`);
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


// --- Funnels Management ---
const FunnelsTabContent: React.FC = () => {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
    const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<{ type: 'funnel' | 'stage'; item: Funnel | FunnelStage | null }>({ type: 'funnel', item: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [funnelsResp, stagesResp] = await Promise.all([
                FunnelsService.getAll(),
                FunnelStagesService.getAll(),
            ]);
            const funnelsData = (funnelsResp as any).data;
            const stagesData = (stagesResp as any).data;
            setFunnels(funnelsData);
            setFunnelStages(stagesData);
            if (!selectedFunnel && funnelsData.length > 0) {
                setSelectedFunnel(funnelsData[0]);
            } else if (selectedFunnel) {
                // Reselect the funnel to update its data if it was edited
                setSelectedFunnel(funnelsData.find(f => f.funnel_id === selectedFunnel.funnel_id) || null);
            }
        } catch (error) {
            console.error("Failed to fetch funnels data", error);
        } finally {
            setLoading(false);
        }
    }, [selectedFunnel]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (type: 'funnel' | 'stage', item: Funnel | FunnelStage | null = null) => {
        setModalState({ type, item });
        setName(item ? (item as any).name : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (modalState.type === 'funnel') {
            if (modalState.item) {
                await FunnelsService.update((modalState.item as Funnel).funnel_id, { name } as any);
            } else {
                await FunnelsService.create({ name } as any);
            }
        } else if (modalState.type === 'stage' && selectedFunnel) {
             if (modalState.item) {
                await FunnelStagesService.update((modalState.item as FunnelStage).funnel_stage_id, { name } as any);
            } else {
                const maxOrder = Math.max(0, ...funnelStages.filter(s => s.funnel_id === selectedFunnel.funnel_id).map(s => s.order));
                await FunnelStagesService.create({ name, funnel_id: selectedFunnel.funnel_id, order: maxOrder + 1 } as any);
            }
        }
        handleCloseModal();
        fetchData();
    };

    const handleDelete = async (type: 'funnel' | 'stage', id: number) => {
        const confirmText = type === 'funnel' ? 'воронку (разом з усіма її етапами)?' : 'етап?';
        if (window.confirm(`Ви впевнені, що хочете видалити цю ${confirmText}`)) {
            if (type === 'funnel') {
                await FunnelsService.delete(id);
            } else {
                await FunnelStagesService.delete(id);
            }
            if(type === 'funnel' && selectedFunnel?.funnel_id === id) {
                setSelectedFunnel(null);
            }
            fetchData();
        }
    };
    
    const stagesForSelectedFunnel = selectedFunnel ? funnelStages.filter(s => s.funnel_id === selectedFunnel.funnel_id).sort((a,b)=> a.order - b.order) : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Воронки</h3>
                    <button onClick={() => handleOpenModal('funnel')} className="p-1.5 text-indigo-600 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900">
                        <PlusIcon className="h-5 w-5" />
                    </button>
                 </div>
                 <ul className="space-y-2">
                     {funnels.map(f => (
                         <li key={f.funnel_id}
                             onClick={() => setSelectedFunnel(f)}
                             className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${selectedFunnel?.funnel_id === f.funnel_id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                         >
                            <span className="font-medium text-gray-800 dark:text-gray-200">{f.name}</span>
                             <div className="space-x-2 opacity-0 group-hover:opacity-100" style={{ opacity: selectedFunnel?.funnel_id === f.funnel_id ? 1 : ''}}>
                                 <button onClick={(e) => { e.stopPropagation(); handleOpenModal('funnel', f); }} className="text-blue-500 hover:text-blue-700"><PencilIcon className="h-4 w-4"/></button>
                                 <button onClick={(e) => { e.stopPropagation(); handleDelete('funnel', f.funnel_id); }} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
                             </div>
                         </li>
                     ))}
                 </ul>
            </div>
             <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                {selectedFunnel ? (
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Етапи воронки: <span className="text-indigo-600 dark:text-indigo-400">{selectedFunnel.name}</span></h3>
                            <button onClick={() => handleOpenModal('stage')} className="p-1.5 text-indigo-600 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900">
                                <PlusIcon className="h-5 w-5" />
                            </button>
                         </div>
                         <ul className="space-y-2">
                             {stagesForSelectedFunnel.map(s => (
                                 <li key={s.funnel_stage_id} className="p-2 rounded-md bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center group">
                                     <span className="font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                                     <div className="space-x-2 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => handleOpenModal('stage', s)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="h-4 w-4"/></button>
                                        <button onClick={() => handleDelete('stage', s.funnel_stage_id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                 </li>
                             ))}
                             {stagesForSelectedFunnel.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">Немає етапів. Додайте перший.</p>}
                         </ul>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">Оберіть воронку для перегляду її етапів</p>
                    </div>
                )}
            </div>
            {isModalOpen && (
                 <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{modalState.item ? 'Редагувати' : 'Додати'} {modalState.type === 'funnel' ? 'воронку' : 'етап'}</h3>
                        <form onSubmit={handleSave} className="mt-4 space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Назва"
                                required
                                autoFocus
                                className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
    )
};


// --- Dictionary Management ---
const DictionaryManager: React.FC<{
    title: string;
    entity: 'units' | 'saleStatuses' | 'subProjectStatuses';
}> = ({ title, entity }) => {
    const [items, setItems] = useState<(Unit | SaleStatusType | SubProjectStatusType)[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any | null>(null);
    const [itemName, setItemName] = useState('');

    const idKey = {
        'units': 'unit_id',
        'saleStatuses': 'sale_status_id',
        'subProjectStatuses': 'sub_project_status_id',
    }[entity];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = entity === 'units' ? API_CONFIG.ENDPOINTS.UNITS
                : entity === 'saleStatuses' ? '/api/sale-status-types'
                : '/api/subproject-status-types';
            const data = await HttpClient.get<PaginatedResponse<any>>(endpoint);
            setItems(data.data);
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
        const data = { name: itemName } as any;
        const endpoint = entity === 'units' ? API_CONFIG.ENDPOINTS.UNITS
            : entity === 'saleStatuses' ? '/api/sale-status-types'
            : '/api/subproject-status-types';
        if (currentItem) {
            await HttpClient.put(`${endpoint}/${(currentItem as any)[idKey]}`, data);
        } else {
            await HttpClient.post(endpoint, data);
        }
        handleCloseModal();
        fetchData();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей запис?')) {
            const endpoint = entity === 'units' ? API_CONFIG.ENDPOINTS.UNITS
                : entity === 'saleStatuses' ? '/api/sale-status-types'
                : '/api/subproject-status-types';
            await HttpClient.delete(`${endpoint}/${id}`);
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
    const [funnels, setFunnels] = React.useState<Funnel[]>([]);
    const [selectedFunnelId, setSelectedFunnelId] = React.useState<string>('');
    const [stages, setStages] = React.useState<FunnelStage[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [stageName, setStageName] = React.useState('');
    const [editingStage, setEditingStage] = React.useState<FunnelStage | null>(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [funnelsResp, stagesResp] = await Promise.all([
                FunnelsService.getAll(),
                FunnelStagesService.getAll(),
            ]);
            const f = (funnelsResp as any).data as Funnel[];
            const s = (stagesResp as any).data as FunnelStage[];
            setFunnels(f);
            setStages(s);
            if (!selectedFunnelId && f.length) setSelectedFunnelId(f[0].funnel_id.toString());
        } finally {
            setLoading(false);
        }
    }, [selectedFunnelId]);

    React.useEffect(() => { loadData(); }, [loadData]);

    const filteredStages = React.useMemo(() => {
        return stages
            .filter(s => selectedFunnelId ? s.funnel_id.toString() === selectedFunnelId : true)
            .sort((a, b) => a.order - b.order);
    }, [stages, selectedFunnelId]);

    const saveStage = async (e: React.FormEvent) => {
        e.preventDefault();
        const funnelId = parseInt(selectedFunnelId);
        if (!funnelId) return;
        if (editingStage) {
            await FunnelStagesService.update(editingStage.funnel_stage_id, { name: stageName } as any);
        } else {
            const maxOrder = Math.max(0, ...filteredStages.map(s => s.order));
            await FunnelStagesService.create({ name: stageName, funnel_id: funnelId, order: maxOrder + 1 } as any);
        }
        setStageName('');
        setEditingStage(null);
        await loadData();
    };

    const deleteStage = async (id: number) => {
        if (!window.confirm('Видалити етап?')) return;
        await FunnelStagesService.delete(id);
        await loadData();
    };

    return (
        <div className="space-y-8">
            <DictionaryManager title="Одиниці виміру" entity="units" />
            <DictionaryManager title="Статуси продажів" entity="saleStatuses" />

            <div className="rounded-lg glass-pane p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Статуси підпроєктів (етапи воронок)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select value={selectedFunnelId} onChange={e => setSelectedFunnelId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input">
                        {funnels.map(f => (
                            <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>
                        ))}
                    </select>
                    <form onSubmit={saveStage} className="md:col-span-2 flex gap-2">
                        <input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Назва етапу" required className="w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input" />
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            {editingStage ? 'Оновити' : 'Додати'}
                        </button>
                        {editingStage && (
                            <button type="button" onClick={() => { setEditingStage(null); setStageName(''); }} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        )}
                    </form>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--table-divide-color)]">
                        <thead className="bg-[var(--table-header-bg)]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Етап</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Порядок</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--table-divide-color)]">
                            {loading ? (
                                <tr><td colSpan={3} className="text-center py-4">Завантаження...</td></tr>
                            ) : (
                                filteredStages.map(s => (
                                    <tr key={s.funnel_stage_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.order}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => { setEditingStage(s); setStageName(s.name); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Редагувати</button>
                                            <button onClick={() => deleteStage(s.funnel_stage_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Видалити</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredStages.length === 0 && (
                                <tr><td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">Немає етапів у вибраній воронці.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
                     <button onClick={() => setActiveTab('funnels')} className={getTabClassName('funnels')}>
                        Воронки
                    </button>
                    <button onClick={() => setActiveTab('dictionaries')} className={getTabClassName('dictionaries')}>
                        Довідники
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'managers' && <ManagersTabContent />}
                {activeTab === 'warehouses' && <WarehousesTabContent />}
                {activeTab === 'funnels' && <FunnelsTabContent />}
                {activeTab === 'dictionaries' && <DictionariesTabContent />}
            </div>
        </div>
    );
};

export default Settings;