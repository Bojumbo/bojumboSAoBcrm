
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Project, SubProject, Task, Manager, SubProjectStatusType, SaleStatusType, Product, Service, Sale } from '../types';
import { BriefcaseIcon, UsersIcon, BuildingOfficeIcon, PencilIcon, TrashIcon, PlusIcon, ChartBarIcon, BanknotesIcon, ShoppingCartIcon } from '../components/Icons';

const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

// --- Reusable Forms for Modals ---

const SubProjectForm: React.FC<{
    item: Partial<SubProject> | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    statuses: SubProjectStatusType[];
}> = ({ item, onSave, onCancel, statuses }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        status: item?.status || statuses[0]?.name || '',
        cost: item?.cost || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            cost: Number(formData.cost) || 0,
        });
    };

    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{item?.subproject_id ? 'Редагувати' : 'Додати'} підпроект</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Назва підпроекту" required className={baseInputClasses}/>
                    <input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})} placeholder="Вартість" required min="0" step="0.01" className={baseInputClasses}/>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required className={baseInputClasses}>
                        {statuses.map(s => <option key={s.sub_project_status_id} value={s.name}>{s.name}</option>)}
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

const TaskForm: React.FC<{
    item: Partial<Task> | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    managers: Manager[];
    subprojects: SubProject[];
}> = ({ item, onSave, onCancel, managers, subprojects }) => {
    const [formData, setFormData] = useState({
        title: item?.title || '',
        description: item?.description || '',
        responsible_manager_id: item?.responsible_manager_id?.toString() || '',
        creator_manager_id: item?.creator_manager_id?.toString() || '',
        subproject_id: item?.subproject_id?.toString() || '',
        due_date: item?.due_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
            creator_manager_id: formData.creator_manager_id ? parseInt(formData.creator_manager_id) : null,
            subproject_id: formData.subproject_id ? parseInt(formData.subproject_id) : null,
        };
        onSave(dataToSave);
    };

    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{item?.task_id ? 'Редагувати' : 'Додати'} завдання</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Назва завдання" required className={baseInputClasses}/>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Опис" className={baseInputClasses}></textarea>
                    <select name="subproject_id" value={formData.subproject_id} onChange={(e) => setFormData({...formData, subproject_id: e.target.value})} className={baseInputClasses}>
                        <option value="">-- Підпроект (необов'язково) --</option>
                        {subprojects.map(sp => <option key={sp.subproject_id} value={sp.subproject_id}>{sp.name}</option>)}
                    </select>
                     <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={(e) => setFormData({...formData, responsible_manager_id: e.target.value})} className={baseInputClasses}>
                        <option value="">-- Виконавець --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className={baseInputClasses}/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectSaleForm: React.FC<{
    project: Project;
    onSave: (data: any) => void;
    onCancel: () => void;
    products: Product[];
    services: Service[];
    saleStatuses: SaleStatusType[];
}> = ({ onSave, onCancel, project, products, services, saleStatuses }) => {
     const [formData, setFormData] = useState<{
        products: { product_id: string; quantity: number }[];
        services: { service_id: string }[];
        status: string;
    }>({
        products: [],
        services: [],
        status: saleStatuses[0]?.name || '',
    });
    
    const totalPrice = useMemo(() => {
        const productsTotal = formData.products.reduce((sum, p) => {
            if (!p.product_id) return sum;
            const product = products.find(prod => prod.product_id.toString() === p.product_id);
            return sum + (product ? product.price * p.quantity : 0);
        }, 0);
        const servicesTotal = formData.services.reduce((sum, s) => {
            if (!s.service_id) return sum;
            const service = services.find(serv => serv.service_id.toString() === s.service_id);
            return sum + (service ? service.price : 0);
        }, 0);
        return productsTotal + servicesTotal;
    }, [formData.products, formData.services, products, services]);

    const handleAddProduct = () => setFormData(prev => ({ ...prev, products: [...prev.products, { product_id: '', quantity: 1 }] }));
    const handleProductChange = (index: number, field: 'product_id' | 'quantity', value: string) => {
        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value };
        setFormData({ ...formData, products: newProducts });
    };
    const handleRemoveProduct = (index: number) => setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== index) }));
    const handleAddService = () => setFormData(prev => ({ ...prev, services: [...prev.services, { service_id: '' }] }));
    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = { service_id: value };
        setFormData({ ...formData, services: newServices });
    };
    const handleRemoveService = (index: number) => setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            counterparty_id: project.counterparty_id,
            responsible_manager_id: project.responsible_manager_id,
            sale_date: new Date().toISOString(),
            status: formData.status,
            products: formData.products.filter(p => p.product_id).map(p => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
            services: formData.services.filter(s => s.service_id).map(s => ({ service_id: parseInt(s.service_id) })),
        };
        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-6">Додавання продажу до проекту</h3>
                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 flex-grow">
                     <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required className={baseInputClasses}>
                        {saleStatuses.map(s => <option key={s.sale_status_id} value={s.name}>{s.name}</option>)}
                    </select>
                    
                    <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-gray-900 dark:text-white">Товари</legend>
                        <div className="space-y-3">
                            {formData.products.map((p, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={p.product_id} onChange={(e) => handleProductChange(index, 'product_id', e.target.value)} className={`${baseInputClasses} flex-grow`} required>
                                        <option value="" disabled>Виберіть товар</option>
                                        {products.map(prod => <option key={prod.product_id} value={prod.product_id}>{prod.name} ({prod.price.toFixed(2)} грн)</option>)}
                                    </select>
                                    <input type="number" min="1" value={p.quantity} onChange={(e) => handleProductChange(index, 'quantity', e.target.value)} className={`${baseInputClasses} w-24 text-center`} placeholder="К-сть"/>
                                    <button type="button" onClick={() => handleRemoveProduct(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={handleAddProduct} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати товар
                         </button>
                    </fieldset>
                    
                    <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                        <legend className="px-2 text-base font-medium text-gray-900 dark:text-white">Послуги</legend>
                         <div className="space-y-3">
                            {formData.services.map((s, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <select value={s.service_id} onChange={(e) => handleServiceChange(index, e.target.value)} className={`${baseInputClasses} flex-grow`} required>
                                        <option value="" disabled>Виберіть послугу</option>
                                        {services.map(serv => <option key={serv.service_id} value={serv.service_id}>{serv.name} ({serv.price.toFixed(2)} грн)</option>)}
                                    </select>
                                    <button type="button" onClick={() => handleRemoveService(index)} className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddService} className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">
                           <PlusIcon className="h-4 w-4 mr-2"/>Додати послугу
                        </button>
                    </fieldset>
                </form>
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <div>
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">До оплати:</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white ml-3">{totalPrice.toFixed(2)} грн</span>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddProductToProjectForm: React.FC<{onSave: (data:any) => void, onCancel: () => void, products: Product[]}> = ({ onSave, onCancel, products}) => {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ product_id: parseInt(productId), quantity });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Додати товар до проекту</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>Виберіть товар</option>
                        {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} required className={baseInputClasses} />
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddServiceToProjectForm: React.FC<{onSave: (data:any) => void, onCancel: () => void, services: Service[]}> = ({ onSave, onCancel, services}) => {
    const [serviceId, setServiceId] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ service_id: parseInt(serviceId) });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Додати послугу до проекту</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>Виберіть послугу</option>
                        {services.map(s => <option key={s.service_id} value={s.service_id}>{s.name}</option>)}
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

// --- Main Detail Component ---

const InfoCard: React.FC<{title: string; value: string | undefined; icon: React.ElementType}> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-md p-3">
                <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{value || 'Не вказано'}</p>
            </div>
        </div>
    </div>
);

type ModalState = {
    type: 'task' | 'subproject' | 'sale' | 'project_product' | 'project_service' | null;
    item: any | null;
};

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = parseInt(id || '0');
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [subProjectStatuses, setSubProjectStatuses] = useState<SubProjectStatusType[]>([]);
    const [saleStatuses, setSaleStatuses] = useState<SaleStatusType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: null, item: null });

    const fetchProjectAndDeps = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, managersData, spsData, productsData, servicesData, saleStatusesData] = await Promise.all([
                api.getById<Project>('projects', projectId),
                api.getAll<Manager>('managers'),
                api.getAll<SubProjectStatusType>('subProjectStatuses'),
                api.getAll<Product>('products'),
                api.getAll<Service>('services'),
                api.getAll<SaleStatusType>('saleStatuses'),
            ]);
            setProject(projectData);
            setManagers(managersData);
            setSubProjectStatuses(spsData);
            setProducts(productsData);
            setServices(servicesData);
            setSaleStatuses(saleStatusesData);
        } catch (error) {
            console.error("Failed to fetch project details", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectAndDeps();
    }, [fetchProjectAndDeps]);
    
    const handleModalClose = () => setModalState({ type: null, item: null });

    const handleSave = async (data: any) => {
        if (!modalState.type) return;
        
        let entity: 'tasks' | 'subprojects' | 'sales' | 'project_products' | 'project_services';
        let itemToSave: any;

        switch(modalState.type) {
            case 'task':
            case 'subproject':
                entity = modalState.type === 'task' ? 'tasks' : 'subprojects';
                itemToSave = { ...data, project_id: projectId };
                if (modalState.item) {
                    const itemId = (modalState.item as any)[`${modalState.type}_id`];
                    await api.update(entity, itemId, itemToSave);
                } else {
                    await api.create(entity, itemToSave);
                }
                break;
            case 'sale':
                await api.create('sales', {...data, project_id: projectId});
                break;
            case 'project_product':
                 await api.create('project_products', {...data, project_id: projectId});
                 break;
            case 'project_service':
                 await api.create('project_services', {...data, project_id: projectId});
                 break;
        }
        
        handleModalClose();
        fetchProjectAndDeps(); // Refresh data
    };

    const handleDelete = async (type: 'task' | 'subproject' | 'sale' | 'project_product' | 'project_service', itemId: number) => {
        // FIX: Added 'as const' to ensure entityMap values are treated as string literals,
        // which resolves the type error when calling `api.delete`.
        const entityMap = {
            task: 'tasks',
            subproject: 'subprojects',
            sale: 'sales',
            project_product: 'project_products',
            project_service: 'project_services',
        } as const;
        const entity = entityMap[type];
        const confirmTextMap = {
            task: 'завдання',
            subproject: 'підпроект',
            sale: 'продаж',
            project_product: 'товар',
            project_service: 'послугу',
        };
        const confirmText = confirmTextMap[type];
        
        if (window.confirm(`Ви впевнені, що хочете видалити це(ю) ${confirmText}?`)) {
            await api.delete(entity, itemId);
            fetchProjectAndDeps();
        }
    };

    const { salesTotal, directCostsTotal, subprojectsTotal, totalProjectCost } = useMemo(() => {
        if (!project) return { salesTotal: 0, directCostsTotal: 0, subprojectsTotal: 0, totalProjectCost: 0 };

        const salesTotal = project.sales?.reduce((sum, sale) => sum + (sale.total_price || 0), 0) || 0;
        
        const directProductsTotal = project.project_products?.reduce((sum, pp) => {
            const price = pp.product?.price || 0;
            return sum + (price * pp.quantity);
        }, 0) || 0;

        const directServicesTotal = project.project_services?.reduce((sum, ps) => sum + (ps.service?.price || 0), 0) || 0;
        
        const directCostsTotal = directProductsTotal + directServicesTotal;
        
        const subprojectsTotal = project.subprojects?.reduce((sum, sp) => sum + (sp.cost || 0), 0) || 0;
        
        const totalProjectCost = salesTotal + directCostsTotal + subprojectsTotal;
        
        return { salesTotal, directCostsTotal, subprojectsTotal, totalProjectCost };
    }, [project]);


    if (loading) return <div className="text-center py-10">Завантаження деталей проекту...</div>;
    if (!project) return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Проект не знайдено</h2>
            <Link to="/projects" className="text-indigo-600 hover:underline">Повернутися до списку проектів</Link>
        </div>
    );
    
    const renderModal = () => {
        if (!modalState.type) return null;
        switch(modalState.type) {
            case 'subproject':
                return <SubProjectForm item={modalState.item as SubProject} onSave={handleSave} onCancel={handleModalClose} statuses={subProjectStatuses}/>
            case 'task':
                return <TaskForm item={modalState.item as Task} onSave={handleSave} onCancel={handleModalClose} managers={managers} subprojects={project.subprojects || []}/>
            case 'sale':
                return <ProjectSaleForm project={project} onSave={handleSave} onCancel={handleModalClose} products={products} services={services} saleStatuses={saleStatuses}/>
            case 'project_product':
                return <AddProductToProjectForm onSave={handleSave} onCancel={handleModalClose} products={products}/>
            case 'project_service':
                return <AddServiceToProjectForm onSave={handleSave} onCancel={handleModalClose} services={services}/>
            default:
                 return null;
        }
    };

    return (
        <div>
            {renderModal()}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{project.name}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                    {project.counterparty?.name || 'Без контрагента'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <InfoCard title="Прогнозована сума" value={`${(project.forecast_amount || 0).toFixed(2)} грн`} icon={ChartBarIcon}/>
                 <InfoCard title="Загальна вартість" value={`${totalProjectCost.toFixed(2)} грн`} icon={BanknotesIcon}/>
                 <InfoCard title="Сума по продажах" value={`${salesTotal.toFixed(2)} грн`} icon={ShoppingCartIcon}/>
                 <InfoCard title="Витрати (товари, послуги, підпроекти)" value={`${(directCostsTotal + subprojectsTotal).toFixed(2)} грн`} icon={BriefcaseIcon}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SUBPROJECTS */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Підпроекти</h2>
                         <button onClick={() => setModalState({ type: 'subproject', item: null })} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"><PlusIcon className="h-4 w-4 mr-2"/>Додати</button>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {project.subprojects && project.subprojects.length > 0 ? (
                            project.subprojects.map(sp => (
                                <li key={sp.subproject_id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-800 dark:text-gray-200">{sp.name}</span>
                                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{sp.status}</span>
                                        </div>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">{(sp.cost || 0).toFixed(2)} грн</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => setModalState({ type: 'subproject', item: sp })} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete('subproject', sp.subproject_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-3 text-gray-500 dark:text-gray-400">Немає підпроектів.</li>
                        )}
                    </ul>
                </div>

                {/* TASKS */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Завдання</h2>
                        <button onClick={() => setModalState({ type: 'task', item: null })} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"><PlusIcon className="h-4 w-4 mr-2"/>Додати</button>
                    </div>
                     <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {project.tasks && project.tasks.length > 0 ? (
                            project.tasks.map(task => (
                                <li key={task.task_id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                        </div>
                                         <div className="space-x-2 flex-shrink-0 ml-4">
                                            <button onClick={() => setModalState({ type: 'task', item: task })} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete('task', task.task_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex flex-wrap gap-x-3">
                                        <span>До: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
                                        <span>|</span>
                                        <span>Виконавець: {task.responsible_manager ? `${task.responsible_manager.first_name} ${task.responsible_manager.last_name}` : 'N/A'}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-3 text-gray-500 dark:text-gray-400">Немає завдань.</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* SALES */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Продажі</h2>
                        <button onClick={() => setModalState({ type: 'sale', item: null })} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"><PlusIcon className="h-4 w-4 mr-2"/>Додати продаж</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Дата</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Сума</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Статус</th>
                                    <th className="relative px-4 py-2"><span className="sr-only">Дії</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {project.sales && project.sales.length > 0 ? project.sales.map(sale => (
                                    <tr key={sale.sale_id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Date(sale.sale_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{(sale.total_price || 0).toFixed(2)} грн</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{sale.status}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <button onClick={() => handleDelete('sale', sale.sale_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="py-3 text-center text-gray-500 dark:text-gray-400">Немає продажів.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* PROJECT PRODUCTS & SERVICES */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Товари та Послуги</h2>
                        <div className="space-x-2">
                            <button onClick={() => setModalState({ type: 'project_product', item: null })} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"><PlusIcon className="h-4 w-4 mr-1"/>Товар</button>
                            <button onClick={() => setModalState({ type: 'project_service', item: null })} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"><PlusIcon className="h-4 w-4 mr-1"/>Послугу</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Назва</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">К-сть/Ціна</th>
                                    <th className="relative px-4 py-2"><span className="sr-only">Дії</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {(project.project_products?.length || 0) === 0 && (project.project_services?.length || 0) === 0 && (
                                    <tr><td colSpan={3} className="py-3 text-center text-gray-500 dark:text-gray-400">Немає товарів чи послуг.</td></tr>
                                )}

                                {project.project_products?.map(pp => (
                                    <tr key={`prod-${pp.project_product_id}`}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{pp.product?.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{pp.quantity} x {(pp.product?.price || 0).toFixed(2)} грн</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <button onClick={() => handleDelete('project_product', pp.project_product_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {project.project_services?.map(ps => (
                                     <tr key={`serv-${ps.project_service_id}`}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ps.service?.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{(ps.service?.price || 0).toFixed(2)} грн</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <button onClick={() => handleDelete('project_service', ps.project_service_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProjectDetail;
