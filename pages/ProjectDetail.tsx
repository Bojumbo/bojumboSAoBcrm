import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Project, SubProject, Task, Manager, SubProjectStatusType, SaleStatusType, Product, Service, Sale, Funnel, FunnelStage, Counterparty } from '../types';
import { BriefcaseIcon, PencilIcon, TrashIcon, PlusIcon, ChartBarIcon, BanknotesIcon, ShoppingCartIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon, DocumentArrowDownIcon } from '../components/Icons';

const baseInputClasses = "w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";
const readOnlyFieldClasses = "mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 break-words";
const fieldTitleClasses = "text-sm font-medium text-gray-500 dark:text-gray-400";


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
            responsible_manager_id: project.main_responsible_manager_id,
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

const ProjectChat: React.FC<{ 
    project: Project; 
    currentUser: Manager | null; 
    onAddComment: (content: string, file: File | null) => void;
}> = ({ project, currentUser, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [project.comments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 5 * 1024 * 1024) {
                alert("Файл занадто великий. Максимальний розмір: 5MB.");
                return;
            }
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() || file) {
            onAddComment(newComment, file);
            setNewComment('');
            setFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Обговорення / Коментарі</h2>
            <div className="flex flex-col space-y-4 h-96">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {project.comments && project.comments.length > 0 ? (
                        project.comments.map(comment => {
                            const isCurrentUser = comment.manager_id === currentUser?.manager_id;
                            return (
                                <div key={comment.comment_id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md lg:max-w-lg p-3 rounded-lg ${isCurrentUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                        {!isCurrentUser && (
                                            <p className="text-xs font-bold mb-1 text-indigo-600 dark:text-indigo-400">
                                                {comment.manager?.first_name || '...'}
                                            </p>
                                        )}
                                        {comment.file && (
                                            <div className="mb-2">
                                                {comment.file.type.startsWith('image/') ? (
                                                    <a href={comment.file.url} target="_blank" rel="noopener noreferrer">
                                                        <img src={comment.file.url} alt={comment.file.name} className="max-w-xs max-h-48 rounded-md object-cover cursor-pointer" />
                                                    </a>
                                                ) : (
                                                    <a href={comment.file.url} download={comment.file.name} className={`flex items-center gap-3 p-2 rounded-md ${isCurrentUser ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}>
                                                       <DocumentArrowDownIcon className="h-6 w-6 flex-shrink-0"/>
                                                       <span className="text-sm font-medium truncate">{comment.file.name}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {comment.content && <p className="text-sm break-words">{comment.content}</p>}
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                                            {formatTime(comment.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">Коментарів ще немає. Будьте першим!</p>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
                     {file && (
                        <div className="mb-2 flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md text-sm">
                            <span className="text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                            <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 text-red-500 hover:text-red-400 rounded-full">
                                <XMarkIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
                            <PaperClipIcon className="h-5 w-5"/>
                        </button>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишіть коментар..."
                            className={`${baseInputClasses} resize-none`}
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button type="submit" className="p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!newComment.trim() && !file}>
                            <PaperAirplaneIcon className="h-5 w-5"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const projectId = parseInt(id || '0');
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
    const [subProjectStatuses, setSubProjectStatuses] = useState<SubProjectStatusType[]>([]);
    const [saleStatuses, setSaleStatuses] = useState<SaleStatusType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: null, item: null });
    const [currentUser, setCurrentUser] = useState<Manager | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [formData, setFormData] = useState<any | null>(null);

    const fetchProjectAndDeps = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, managersData, counterpartiesData, funnelsData, funnelStagesData, spsData, productsData, servicesData, saleStatusesData] = await Promise.all([
                api.getById<Project>('projects', projectId),
                api.getAll<Manager>('managers'),
                api.getAll<Counterparty>('counterparties'),
                api.getAll<Funnel>('funnels'),
                api.getAll<FunnelStage>('funnelStages'),
                api.getAll<SubProjectStatusType>('subProjectStatuses'),
                api.getAll<Product>('products'),
                api.getAll<Service>('services'),
                api.getAll<SaleStatusType>('saleStatuses'),
            ]);
            setProject(projectData);
            setManagers(managersData);
            setCounterparties(counterpartiesData);
            setFunnels(funnelsData);
            setFunnelStages(funnelStagesData);
            setSubProjectStatuses(spsData);
            setProducts(productsData);
            setServices(servicesData);
            setSaleStatuses(saleStatusesData);
            
            if (managersData.length > 0) {
                setCurrentUser(managersData[0]);
            }

        } catch (error) {
            console.error("Failed to fetch project details", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectAndDeps();
    }, [fetchProjectAndDeps]);
    
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                forecast_amount: project.forecast_amount || 0,
                main_responsible_manager_id: project.main_responsible_manager_id?.toString() || '',
                secondary_responsible_manager_ids: project.secondary_responsible_managers?.map(m => m.manager_id.toString()) || [],
                counterparty_id: project.counterparty_id?.toString() || '',
                funnel_id: project.funnel_id?.toString() || '',
                funnel_stage_id: project.funnel_stage_id?.toString() || '',
            });
        }
    }, [project]);
    
    const availableStages = useMemo(() => {
        if (!formData?.funnel_id) return [];
        return funnelStages.filter(s => s.funnel_id.toString() === formData.funnel_id).sort((a, b) => a.order - b.order);
    }, [formData?.funnel_id, funnelStages]);
    
    useEffect(() => {
        if (formData) {
            const currentStageIsValid = availableStages.some(s => s.funnel_stage_id.toString() === formData.funnel_stage_id);
            if (!currentStageIsValid) {
                 setFormData((prev: any) => ({
                    ...prev,
                    funnel_stage_id: availableStages[0]?.funnel_stage_id.toString() || ''
                }));
            }
        }
    }, [formData?.funnel_id, availableStages]);
    
    const handleSave = async () => {
        if (!project || !formData) return;
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...formData,
                main_responsible_manager_id: formData.main_responsible_manager_id ? parseInt(formData.main_responsible_manager_id) : null,
                secondary_responsible_manager_ids: (formData.secondary_responsible_manager_ids || []).map((id: string) => parseInt(id)),
                counterparty_id: formData.counterparty_id ? parseInt(formData.counterparty_id) : null,
                funnel_id: formData.funnel_id ? parseInt(formData.funnel_id) : null,
                funnel_stage_id: formData.funnel_stage_id ? parseInt(formData.funnel_stage_id) : null,
                forecast_amount: Number(formData.forecast_amount) || 0,
            };
            await api.update('projects', project.project_id, dataToSave);
            await fetchProjectAndDeps();
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Не вдалося зберегти зміни.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!project) return;
        if (window.confirm('Ви впевнені, що хочете видалити цей проект? Ця дія незворотна.')) {
            setIsSubmitting(true);
            try {
                await api.delete('projects', project.project_id);
                alert('Проект успішно видалено.');
                navigate('/projects');
            } catch (error) {
                console.error("Failed to delete project", error);
                alert('Не вдалося видалити проект.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'main_responsible_manager_id') {
             // Remove the new main manager from the secondary list if they are there
            const newSecondaryIds = (formData.secondary_responsible_manager_ids || []).filter((id: string) => id !== value);
            setFormData((prev: any) => ({ ...prev, main_responsible_manager_id: value, secondary_responsible_manager_ids: newSecondaryIds }));
            return;
        }

        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const currentIds = formData.secondary_responsible_manager_ids || [];
        let newIds;
        if (checked) {
            newIds = [...currentIds, value];
        } else {
            newIds = currentIds.filter((id: string) => id !== value);
        }
        setFormData((prev: any) => ({ ...prev, secondary_responsible_manager_ids: newIds }));
    };

    const availableSecondaryManagers = useMemo(() => {
        return managers.filter(m => m.manager_id.toString() !== formData?.main_responsible_manager_id);
    }, [managers, formData?.main_responsible_manager_id]);

    const handleModalClose = () => setModalState({ type: null, item: null });

    const handleSubItemsSave = async (data: any) => {
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
                    await api.update(entity, itemId, data);
                } else {
                    await api.create(entity, itemToSave);
                }
                break;
            
            case 'sale':
                itemToSave = { ...data, project_id: projectId };
                await api.create('sales', itemToSave);
                break;

            case 'project_product':
            case 'project_service':
                // FIX: Pluralize entity name to match API definition (e.g., 'project_product' to 'project_products').
                entity = `${modalState.type}s` as 'project_products' | 'project_services';
                itemToSave = { ...data, project_id: projectId };
                await api.create(entity, itemToSave);
                break;
        }

        handleModalClose();
        fetchProjectAndDeps();
    };
    
    const handleSubItemsDelete = async (type: 'task' | 'subproject' | 'sale' | 'project_product' | 'project_service', id: number) => {
        // FIX: Pluralize entity name to match API definition and resolve type error.
        const entity = `${type}s` as 'tasks' | 'subprojects' | 'sales' | 'project_products' | 'project_services';
        if (window.confirm('Ви впевнені, що хочете видалити цей елемент?')) {
            await api.delete(entity, id);
            fetchProjectAndDeps();
        }
    };
    
    const handleAddComment = async (content: string, file: File | null) => {
        if (!currentUser) return;
        
        let fileData = null;
        if (file) {
            fileData = {
                name: file.name,
                type: file.type,
                url: await new Promise<string>(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                })
            };
        }

        const newComment = {
            project_id: projectId,
            manager_id: currentUser.manager_id,
            content: content,
            created_at: new Date().toISOString(),
            file: fileData,
        };
        await api.create('project_comments', newComment);
        fetchProjectAndDeps();
    };

    const totalCost = useMemo(() => (project?.subprojects?.reduce((sum, sp) => sum + sp.cost, 0) || 0), [project]);
    const totalSales = useMemo(() => (project?.sales?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0), [project]);
    const totalProducts = useMemo(() => (project?.project_products?.reduce((sum, p) => sum + (p.product?.price || 0) * p.quantity, 0) || 0), [project]);
    const totalServices = useMemo(() => (project?.project_services?.reduce((sum, s) => sum + (s.service?.price || 0), 0) || 0), [project]);
    
    const totalPlannedCosts = totalProducts + totalServices;

    if (loading && !project) {
        return <div className="text-center py-10">Завантаження деталей проекту...</div>;
    }

    if (!project) {
        return <div className="text-center py-10">Проект не знайдено.</div>;
    }
    
    const getTabClassName = (tabName: string) => {
        const baseClasses = "px-4 py-2 font-medium text-sm rounded-md focus:outline-none transition-colors duration-200";
        if (activeTab === tabName) {
            return `${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300`;
        }
        return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex-grow min-w-0">
                    {formData ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-0 focus:ring-2 focus:ring-indigo-500 rounded-md p-1 -ml-1 w-full"
                        />
                    ) : (
                         <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"></div>
                    )}
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                     <button
                        onClick={handleSave}
                        disabled={!formData || isSubmitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
                    >
                        {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                    <button
                        onClick={handleDeleteProject}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:disabled:bg-red-800"
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Видалити
                    </button>
                </div>
            </div>

            <div className="mb-6 flex items-center space-x-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Статус:</span>
                 {formData ? (
                    <>
                        <select name="funnel_id" value={formData.funnel_id} onChange={handleFormChange} className={`${baseInputClasses} !w-auto`}>
                            {funnels.map(f => <option key={f.funnel_id} value={f.funnel_id}>{f.name}</option>)}
                        </select>
                        <span className="text-gray-400">/</span>
                         <select name="funnel_stage_id" value={formData.funnel_stage_id} onChange={handleFormChange} className={`${baseInputClasses} !w-auto`} disabled={availableStages.length === 0}>
                            {availableStages.map(s => <option key={s.funnel_stage_id} value={s.funnel_stage_id}>{s.name}</option>)}
                        </select>
                    </>
                 ) : (
                    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-64"></div>
                 )}
            </div>

            <div className="mb-6">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={getTabClassName('overview')}>Огляд</button>
                    <button onClick={() => setActiveTab('subprojects')} className={getTabClassName('subprojects')}>Підпроекти</button>
                    <button onClick={() => setActiveTab('tasks')} className={getTabClassName('tasks')}>Завдання</button>
                    <button onClick={() => setActiveTab('finance')} className={getTabClassName('finance')}>Фінанси</button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div>
                     {!formData ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 animate-pulse h-64"></div>
                     ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                                Основна інформація
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Опис проекту</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} rows={4}></textarea>
                                </div>
                                <div>
                                    <label htmlFor="forecast_amount" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Прогнозована вартість</label>
                                    <input type="number" id="forecast_amount" name="forecast_amount" value={formData.forecast_amount} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} />
                                </div>
                                <div>
                                    <label htmlFor="counterparty_id" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Контрагент</label>
                                    <select id="counterparty_id" name="counterparty_id" value={formData.counterparty_id} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        <option value="">-- Не вибрано --</option>
                                        {counterparties.map(c => <option key={c.counterparty_id} value={c.counterparty_id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="main_responsible_manager_id" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Головний відповідальний</label>
                                     <select id="main_responsible_manager_id" name="main_responsible_manager_id" value={formData.main_responsible_manager_id} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        <option value="">-- Не вибрано --</option>
                                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Другорядні відповідальні</label>
                                    <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 h-28 overflow-y-auto space-y-1">
                                        {availableSecondaryManagers.map(m => (
                                            <div key={m.manager_id} className="flex items-center">
                                                <input
                                                    id={`sec-manager-detail-${m.manager_id}`}
                                                    name="secondary_responsible_manager_ids"
                                                    type="checkbox"
                                                    value={m.manager_id.toString()}
                                                    checked={(formData.secondary_responsible_manager_ids || []).includes(m.manager_id.toString())}
                                                    onChange={handleCheckboxChange}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded focus:ring-indigo-500"
                                                />
                                                <label htmlFor={`sec-manager-detail-${m.manager_id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                                                    {m.first_name} {m.last_name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <ProjectChat project={project} currentUser={currentUser} onAddComment={handleAddComment} />
                </div>
            )}
            
             {activeTab === 'subprojects' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Підпроекти</h2>
                        <button onClick={() => setModalState({ type: 'subproject', item: null })} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"><PlusIcon className="h-5 w-5 mr-2"/>Додати</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Вартість</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Статус</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {project.subprojects?.map(sp => (
                                    <tr key={sp.subproject_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sp.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sp.cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sp.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => setModalState({ type: 'subproject', item: sp })} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleSubItemsDelete('subproject', sp.subproject_id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'tasks' && (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Завдання</h2>
                        <button onClick={() => setModalState({ type: 'task', item: null })} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"><PlusIcon className="h-5 w-5 mr-2"/>Додати</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Виконавець</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Термін</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {project.tasks?.map(t => (
                                    <tr key={t.task_id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.responsible_manager?.first_name} {t.responsible_manager?.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => setModalState({ type: 'task', item: t })} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleSubItemsDelete('task', t.task_id)} className="text-red-600 hover:text-red-900 dark:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <InfoCard title="Прогнозована сума" value={`${project.forecast_amount.toFixed(2)} грн`} icon={BanknotesIcon} />
                        <InfoCard title="Фактичні продажі" value={`${totalSales.toFixed(2)} грн`} icon={ShoppingCartIcon} />
                        <InfoCard title="Заплановані витрати" value={`${totalPlannedCosts.toFixed(2)} грн`} icon={ChartBarIcon} />
                        <InfoCard title="Фактичні витрати" value={`${totalCost.toFixed(2)} грн`} icon={BriefcaseIcon} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Продажі по проекту</h2>
                                <button onClick={() => setModalState({ type: 'sale', item: null })} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"><PlusIcon className="h-5 w-5 mr-2"/>Додати продаж</button>
                            </div>
                            {project.sales?.map(s => (
                                <div key={s.sale_id} className="border-b border-gray-200 dark:border-gray-700 py-3">
                                    <p>Продаж №{s.sale_id} від {new Date(s.sale_date).toLocaleDateString()}</p>
                                    <p>Сума: {s.total_price?.toFixed(2)} грн, Статус: {s.status}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Заплановані товари/послуги</h2>
                                <div>
                                    <button onClick={() => setModalState({ type: 'project_product', item: null })} className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 mr-2">Додати товар</button>
                                    <button onClick={() => setModalState({ type: 'project_service', item: null })} className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Додати послугу</button>
                                </div>
                            </div>
                            <h3 className="font-semibold mt-4">Товари:</h3>
                            {project.project_products?.map(p => <p key={p.project_product_id}>{p.product?.name} x {p.quantity}</p>)}
                            <h3 className="font-semibold mt-4">Послуги:</h3>
                            {project.project_services?.map(s => <p key={s.project_service_id}>{s.service?.name}</p>)}
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- Modals for Sub-Items --- */}
            {modalState.type === 'subproject' && <SubProjectForm item={modalState.item} onSave={handleSubItemsSave} onCancel={handleModalClose} statuses={subProjectStatuses} />}
            {modalState.type === 'task' && <TaskForm item={modalState.item} onSave={handleSubItemsSave} onCancel={handleModalClose} managers={managers} subprojects={project.subprojects || []} />}
            {modalState.type === 'sale' && <ProjectSaleForm project={project} onSave={handleSubItemsSave} onCancel={handleModalClose} products={products} services={services} saleStatuses={saleStatuses} />}
            {modalState.type === 'project_product' && <AddProductToProjectForm onSave={handleSubItemsSave} onCancel={handleModalClose} products={products} />}
            {modalState.type === 'project_service' && <AddServiceToProjectForm onSave={handleSubItemsSave} onCancel={handleModalClose} services={services} />}
        </div>
    );
};

export default ProjectDetail;