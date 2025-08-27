
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SubProject, Task, Manager, SubProjectStatusType, Project, Product, Service } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, BanknotesIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon, DocumentArrowDownIcon, ChartBarIcon } from '../components/Icons';

const baseInputClasses = "w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";

const AddProductToSubProjectForm: React.FC<{onSave: (data:any) => void, onCancel: () => void, products: Product[]}> = ({ onSave, onCancel, products}) => {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ product_id: parseInt(productId), quantity });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Додати товар до підпроекту</h3>
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

const AddServiceToSubProjectForm: React.FC<{onSave: (data:any) => void, onCancel: () => void, services: Service[]}> = ({ onSave, onCancel, services}) => {
    const [serviceId, setServiceId] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ service_id: parseInt(serviceId) });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Додати послугу до підпроекту</h3>
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


const TaskForm: React.FC<{
    item: Partial<Task> | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    managers: Manager[];
}> = ({ item, onSave, onCancel, managers }) => {
    const [formData, setFormData] = useState({
        title: item?.title || '',
        description: item?.description || '',
        responsible_manager_id: item?.responsible_manager_id?.toString() || '',
        due_date: item?.due_date || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
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

const SubProjectChat: React.FC<{ 
    subproject: SubProject; 
    currentUser: Manager | null; 
    onAddComment: (content: string, file: File | null) => void;
}> = ({ subproject, currentUser, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [subproject.comments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 5 * 1024 * 1024) { // 5MB limit
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
                    {subproject.comments && subproject.comments.length > 0 ? (
                        subproject.comments.map(comment => {
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


type ModalState = {
    type: 'task' | 'subproject_product' | 'subproject_service' | null;
    item: any | null;
};

const SubProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const subprojectId = parseInt(id || '0');
    const [subproject, setSubproject] = useState<SubProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [statuses, setStatuses] = useState<SubProjectStatusType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: null, item: null });
    const [currentUser, setCurrentUser] = useState<Manager | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [formData, setFormData] = useState<any | null>(null);

    const fetchSubProjectAndDeps = useCallback(async () => {
        if (!subprojectId) return;
        setLoading(true);
        try {
            const [subprojectData, managersData, projectsData, statusesData, productsData, servicesData] = await Promise.all([
                api.getById<SubProject>('subprojects', subprojectId),
                api.getAll<Manager>('managers'),
                api.getAll<Project>('projects'),
                api.getAll<SubProjectStatusType>('subProjectStatuses'),
                api.getAll<Product>('products'),
                api.getAll<Service>('services'),
            ]);
            setSubproject(subprojectData);
            setManagers(managersData);
            setProjects(projectsData);
            setStatuses(statusesData);
            setProducts(productsData);
            setServices(servicesData);
            
            if (managersData.length > 0) {
                setCurrentUser(managersData[0]); // Mock current user
            }

        } catch (error) {
            console.error("Failed to fetch subproject details", error);
        } finally {
            setLoading(false);
        }
    }, [subprojectId]);

    useEffect(() => {
        fetchSubProjectAndDeps();
    }, [fetchSubProjectAndDeps]);
    
    useEffect(() => {
        if (subproject) {
            setFormData({
                name: subproject.name || '',
                description: subproject.description || '',
                cost: subproject.cost || 0,
                status: subproject.status || '',
                project_id: subproject.project_id?.toString() || '',
            });
        }
    }, [subproject]);
    
    const handleSave = async () => {
        if (!subproject || !formData) return;
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...formData,
                project_id: parseInt(formData.project_id),
                cost: Number(formData.cost) || 0,
            };
            await api.update('subprojects', subproject.subproject_id, dataToSave);
            await fetchSubProjectAndDeps();
        } catch (error) {
            console.error("Failed to save subproject", error);
            alert("Не вдалося зберегти зміни.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubProject = async () => {
        if (!subproject) return;
        if (window.confirm('Ви впевнені, що хочете видалити цей підпроект? Ця дія незворотна.')) {
            setIsSubmitting(true);
            try {
                await api.delete('subprojects', subproject.subproject_id);
                alert('Підпроект успішно видалено.');
                navigate('/subprojects');
            } catch (error) {
                console.error("Failed to delete subproject", error);
                alert('Не вдалося видалити підпроект.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleModalClose = () => setModalState({ type: null, item: null });

    const handleSubItemsSave = async (data: any) => {
        if (!modalState.type || !subproject) return;
        
        let entity: 'tasks' | 'subproject_products' | 'subproject_services';
        let itemToSave: any;

        switch(modalState.type) {
            case 'task':
                entity = 'tasks';
                itemToSave = { 
                    ...data, 
                    project_id: subproject.project_id,
                    subproject_id: subproject.subproject_id 
                };
                if (modalState.item) {
                    await api.update(entity, modalState.item.task_id, data);
                } else {
                    await api.create(entity, itemToSave);
                }
                break;
            case 'subproject_product':
            case 'subproject_service':
                entity = `${modalState.type}s` as 'subproject_products' | 'subproject_services';
                itemToSave = { ...data, subproject_id: subprojectId };
                await api.create(entity, itemToSave);
                break;
        }

        handleModalClose();
        fetchSubProjectAndDeps();
    };
    
    const handleSubItemsDelete = async (type: 'task' | 'subproject_product' | 'subproject_service', id: number) => {
        const entity = `${type}s` as 'tasks' | 'subproject_products' | 'subproject_services';
        if (window.confirm('Ви впевнені, що хочете видалити цей елемент?')) {
            await api.delete(entity, id);
            fetchSubProjectAndDeps();
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
            subproject_id: subprojectId,
            manager_id: currentUser.manager_id,
            content: content,
            created_at: new Date().toISOString(),
            file: fileData,
        };
        await api.create('subproject_comments', newComment);
        fetchSubProjectAndDeps();
    };

    const totalPlannedCosts = useMemo(() => {
        if (!subproject) return 0;
        const productsTotal = subproject.subproject_products?.reduce((sum, p) => sum + (p.product?.price || 0) * p.quantity, 0) || 0;
        const servicesTotal = subproject.subproject_services?.reduce((sum, s) => sum + (s.service?.price || 0), 0) || 0;
        return productsTotal + servicesTotal;
    }, [subproject]);

    if (loading && !subproject) {
        return <div className="text-center py-10">Завантаження деталей підпроекту...</div>;
    }

    if (!subproject) {
        return <div className="text-center py-10">Підпроект не знайдено.</div>;
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
            <div className="flex items-start justify-between mb-4">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Проект: <Link to={`/projects/${subproject.project_id}`} className="text-indigo-600 hover:underline">{subproject.project?.name}</Link>
                    </p>
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
                        onClick={handleDeleteSubProject}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 dark:disabled:bg-red-800"
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Видалити
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={getTabClassName('overview')}>Огляд</button>
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
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Опис підпроекту</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} rows={4}></textarea>
                                </div>
                                <div>
                                    <label htmlFor="cost" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Вартість</label>
                                    <input type="number" id="cost" name="cost" value={formData.cost} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Статус</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        {statuses.map(s => <option key={s.sub_project_status_id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="project_id" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Головний проект</label>
                                    <select id="project_id" name="project_id" value={formData.project_id} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <p className="block text-sm font-medium text-gray-500 dark:text-gray-400">Відповідальний менеджер</p>
                                    <p className="mt-2 text-gray-900 dark:text-white">{subproject.project?.main_responsible_manager?.first_name} {subproject.project?.main_responsible_manager?.last_name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <SubProjectChat subproject={subproject} currentUser={currentUser} onAddComment={handleAddComment} />
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
                                {subproject.tasks?.map(t => (
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
                                {!subproject.tasks?.length && (
                                    <tr><td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">Для цього підпроекту завдань немає.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InfoCard title="Бюджет підпроекту" value={`${subproject.cost.toFixed(2)} грн`} icon={BanknotesIcon} />
                        <InfoCard title="Витрати (товари/послуги)" value={`${totalPlannedCosts.toFixed(2)} грн`} icon={ChartBarIcon} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Заплановані товари/послуги</h2>
                            <div>
                                <button onClick={() => setModalState({ type: 'subproject_product', item: null })} className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 mr-2">Додати товар</button>
                                <button onClick={() => setModalState({ type: 'subproject_service', item: null })} className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Додати послугу</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Товари:</h3>
                                {subproject.subproject_products && subproject.subproject_products.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subproject.subproject_products.map(p => (
                                            <li key={p.subproject_product_id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{p.product?.name} x {p.quantity}</span>
                                                <button onClick={() => handleSubItemsDelete('subproject_product', p.subproject_product_id)} className="text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500 dark:text-gray-400">Немає товарів.</p>}
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Послуги:</h3>
                                {subproject.subproject_services && subproject.subproject_services.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subproject.subproject_services.map(s => (
                                            <li key={s.subproject_service_id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{s.service?.name}</span>
                                                 <button onClick={() => handleSubItemsDelete('subproject_service', s.subproject_service_id)} className="text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500 dark:text-gray-400">Немає послуг.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {modalState.type === 'task' && <TaskForm item={modalState.item} onSave={handleSubItemsSave} onCancel={handleModalClose} managers={managers} />}
            {modalState.type === 'subproject_product' && <AddProductToSubProjectForm onSave={handleSubItemsSave} onCancel={handleModalClose} products={products} />}
            {modalState.type === 'subproject_service' && <AddServiceToSubProjectForm onSave={handleSubItemsSave} onCancel={handleModalClose} services={services} />}
        </div>
    );
};

export default SubProjectDetail;