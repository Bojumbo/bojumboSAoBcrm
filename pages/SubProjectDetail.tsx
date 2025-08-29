import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SubProject, Task, Manager, SubProjectStatusType, Project, Product, Service } from '../types';
import { SubProjectsService, ManagersService, ProjectsService, ProductsService, ServicesService, TasksService, AuthService, FunnelStagesService } from '../src/services/apiService';
import { HttpClient } from '../src/services/httpClient';
import { API_CONFIG } from '../src/config/api';
import { PencilIcon, TrashIcon, PlusIcon, BanknotesIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon, DocumentArrowDownIcon, ChartBarIcon } from '../components/Icons';

const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";

const AddProductToSubProjectForm: React.FC<{onSave: (data:any) => void, onCancel: () => void, products: Product[]}> = ({ onSave, onCancel, products}) => {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ product_id: parseInt(productId), quantity });
    };

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-md shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">Додати товар до підпроекту</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>Виберіть товар</option>
                        {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                    </select>
                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} required className={baseInputClasses} />
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
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
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-md shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">Додати послугу до підпроекту</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>Виберіть послугу</option>
                        {services.map(s => <option key={s.service_id} value={s.service_id}>{s.name}</option>)}
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

const InfoCard: React.FC<{title: string; value: string | undefined; icon: React.ElementType}> = ({ title, value, icon: Icon }) => (
    <div className="glass-pane rounded-xl p-5">
        <div className="flex items-center">
            <div className="flex-shrink-0 bg-[var(--brand-primary)]/20 rounded-md p-3">
                <Icon className="h-6 w-6 text-[var(--brand-secondary)]" />
            </div>
            <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-[var(--text-secondary)] truncate">{title}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)] truncate">{value || 'Не вказано'}</p>
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
         <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-lg shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">{item?.task_id ? 'Редагувати' : 'Додати'} завдання</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Назва завдання" required className={baseInputClasses}/>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Опис" className={baseInputClasses}></textarea>
                     <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={(e) => setFormData({...formData, responsible_manager_id: e.target.value})} className={baseInputClasses}>
                        <option value="">-- Виконавець --</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className={baseInputClasses}/>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
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
        <div className="mt-8 glass-pane rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Обговорення / Коментарі</h2>
            <div className="flex flex-col space-y-4 h-96">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-4 space-y-4">
                    {subproject.comments && subproject.comments.length > 0 ? (
                        subproject.comments.map(comment => {
                            const isCurrentUser = comment.manager_id === currentUser?.manager_id;
                            return (
                                <div key={comment.comment_id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md lg:max-w-lg p-3 rounded-lg ${isCurrentUser ? 'bg-[var(--brand-primary)] text-white' : 'bg-white/10 text-[var(--text-primary)]'}`}>
                                        {!isCurrentUser && (
                                            <p className="text-xs font-bold mb-1 text-[var(--brand-secondary)]">
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
                                                    <a href={comment.file.url} download={comment.file.name} className={`flex items-center gap-3 p-2 rounded-md ${isCurrentUser ? 'bg-[var(--brand-secondary)] hover:bg-[var(--brand-primary)]' : 'bg-white/20 hover:bg-white/30'}`}>
                                                       <DocumentArrowDownIcon className="h-6 w-6 flex-shrink-0"/>
                                                       <span className="text-sm font-medium truncate">{comment.file.name}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {comment.content && <p className="text-sm break-words">{comment.content}</p>}
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-[var(--text-secondary)]'} text-right`}>
                                            {formatTime(comment.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-[var(--text-secondary)]">Коментарів ще немає. Будьте першим!</p>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 pt-4 border-t border-[var(--glass-border)]">
                     {file && (
                        <div className="mb-2 flex items-center justify-between bg-black/20 p-2 rounded-md text-sm">
                            <span className="text-[var(--text-primary)] truncate">{file.name}</span>
                            <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 text-red-400 hover:text-red-300 rounded-full">
                                <XMarkIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/10 text-[var(--text-secondary)] rounded-md hover:bg-white/20">
                            <PaperClipIcon className="h-5 w-5"/>
                        </button>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишіть коментар..."
                            className="glass-input resize-none w-full px-3 py-2 rounded-md focus:outline-none"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button type="submit" className="p-3 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)] disabled:opacity-50" disabled={!newComment.trim() && !file}>
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
    const [allFunnelStages, setAllFunnelStages] = useState<any[]>([]);
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
            const [subprojectData, managersData, projectsData, stagesResp, productsData, servicesData] = await Promise.all([
                SubProjectsService.getById(subprojectId),
                ManagersService.getAll(),
                ProjectsService.getAll(),
                FunnelStagesService.getAll(),
                ProductsService.getAll(),
                ServicesService.getAll(),
            ]);
            setSubproject(subprojectData as any);
            setManagers((managersData as any).data);
            setProjects((projectsData as any).data);
            setAllFunnelStages(((stagesResp as any).data || []) as any);
            setProducts((productsData as any).data);
            setServices((servicesData as any).data);
            try {
                const me = await AuthService.getCurrentUser();
                setCurrentUser(me as any);
            } catch {}
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
                cost: Number(subproject.cost || 0),
                status: subproject.status || '',
                project_id: subproject.project_id?.toString() || '',
                responsible_manager_id: (subproject as any).responsible_manager_id?.toString() || '',
            });
        }
    }, [subproject]);

    const availableStages = useMemo(() => {
        const selectedProject = projects.find(p => p.project_id.toString() === (formData?.project_id || ''));
        if (!selectedProject) return [] as any[];
        return allFunnelStages
            .filter((s: any) => s.funnel_id === selectedProject.funnel_id)
            .sort((a: any, b: any) => a.order - b.order);
    }, [projects, formData?.project_id, allFunnelStages]);
    
    const handleSave = async () => {
        if (!subproject || !formData) return;
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...formData,
                project_id: parseInt(formData.project_id),
                cost: Number(formData.cost) || 0,
                responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
            };
            await SubProjectsService.update(subproject.subproject_id, dataToSave as any);
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
                await SubProjectsService.delete(subproject.subproject_id);
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
                    await TasksService.update(modalState.item.task_id, data as any);
                } else {
                    await TasksService.create(itemToSave as any);
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
        // Assuming comments are part of a subproject comments endpoint similar to projects
        await HttpClient.post(`${API_CONFIG.BASE_URL}/api/comments/subprojects/${subprojectId}`, newComment);
        fetchSubProjectAndDeps();
    };

    const totalPlannedCosts = useMemo(() => {
        if (!subproject) return 0;
        const productsTotal = subproject.subproject_products?.reduce((sum, p) => sum + Number(p.product?.price || 0) * p.quantity, 0) || 0;
        const servicesTotal = subproject.subproject_services?.reduce((sum, s) => sum + Number(s.service?.price || 0), 0) || 0;
        return productsTotal + servicesTotal;
    }, [subproject]);

    if (loading && !subproject) {
        return <div className="text-center py-10 text-[var(--text-primary)]">Завантаження деталей підпроекту...</div>;
    }

    if (!subproject) {
        return (
            <div className="glass-pane rounded-xl p-6">
                <div className="text-center py-10 text-[var(--text-primary)]">Підпроект не знайдено.</div>
                <div className="mt-6 text-center">
                    <Link to="/subprojects" className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Повернутися до списку підпроектів</Link>
                </div>
            </div>
        );
    }
    
    const getTabClassName = (tabName: string) => {
        const baseClasses = "px-4 py-2 font-medium text-sm rounded-md focus:outline-none transition-colors duration-200";
        if (activeTab === tabName) {
            return `${baseClasses} bg-white/20 text-[var(--text-primary)]`;
        }
        return `${baseClasses} text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10`;
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
                            className="text-3xl font-bold text-[var(--text-primary)] bg-transparent border-0 focus:ring-2 focus:ring-[var(--input-focus-border)] rounded-md p-1 -ml-1 w-full"
                        />
                    ) : (
                         <div className="h-10 bg-white/10 rounded-md animate-pulse w-3/4"></div>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Проект: <Link to={`/projects/${subproject.project_id}`} className="text-[var(--text-brand)] hover:underline">{subproject.project?.name}</Link>
                    </p>
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                     <button
                        onClick={handleSave}
                        disabled={!formData || isSubmitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] border border-transparent rounded-md shadow-sm hover:bg-[var(--brand-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-[var(--brand-secondary)] disabled:opacity-50"
                    >
                        {isSubmitting ? 'Збереження...' : 'Зберегти зміни'}
                    </button>
                    <button
                        onClick={handleDeleteSubProject}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600/50 border border-red-500/50 rounded-md hover:bg-red-600/80 hover:border-red-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-color)] focus:ring-red-500 disabled:opacity-50"
                    >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Видалити
                    </button>
                </div>
            </div>

            <div className="mb-6 bg-black/10 backdrop-blur-sm p-1 rounded-lg inline-flex space-x-1">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={getTabClassName('overview')}>Огляд</button>
                    <button onClick={() => setActiveTab('tasks')} className={getTabClassName('tasks')}>Завдання</button>
                    <button onClick={() => setActiveTab('finance')} className={getTabClassName('finance')}>Фінанси</button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div>
                     {!formData ? (
                        <div className="glass-pane rounded-xl p-6 mt-6 animate-pulse h-64"></div>
                     ) : (
                        <div className="glass-pane rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--glass-border)] pb-3 mb-4">
                                Основна інформація
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)]">Опис підпроекту</label>
                                    <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} rows={4}></textarea>
                                </div>
                                <div>
                                    <label htmlFor="cost" className="block text-sm font-medium text-[var(--text-secondary)]">Вартість</label>
                                    <input type="number" id="cost" name="cost" value={formData.cost} onChange={handleFormChange} className={`${baseInputClasses} mt-1`} />
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-[var(--text-secondary)]">Статус (етап воронки проєкту)</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        {availableStages.map((s: any) => <option key={s.funnel_stage_id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="project_id" className="block text-sm font-medium text-[var(--text-secondary)]">Головний проект</label>
                                    <select id="project_id" name="project_id" value={formData.project_id} disabled className={`${baseInputClasses} mt-1`}>
                                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="responsible_manager_id" className="block text-sm font-medium text-[var(--text-secondary)]">Відповідальний менеджер</label>
                                    <select id="responsible_manager_id" name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleFormChange} className={`${baseInputClasses} mt-1`}>
                                        <option value="">— Не призначено —</option>
                                        {managers.map(m => (
                                            <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    <SubProjectChat subproject={subproject} currentUser={currentUser} onAddComment={handleAddComment} />
                </div>
            )}
            
            {activeTab === 'tasks' && (
                 <div className="glass-pane rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Завдання</h2>
                        <button onClick={() => setModalState({ type: 'task', item: null })} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-bg-hover)]"><PlusIcon className="h-5 w-5 mr-2"/>Додати</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-[var(--table-header-bg)]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Назва</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Виконавець</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Термін</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--table-divide-color)]">
                                {subproject.tasks?.map(t => (
                                    <tr key={t.task_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{t.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{t.responsible_manager?.first_name} {t.responsible_manager?.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                            <button onClick={() => setModalState({ type: 'task', item: t })} className="text-indigo-400 hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleSubItemsDelete('task', t.task_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {!subproject.tasks?.length && (
                                    <tr><td colSpan={4} className="text-center py-4 text-[var(--text-secondary)]">Для цього підпроекту завдань немає.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && (
                <div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InfoCard title="Бюджет підпроекту" value={`${Number(subproject.cost).toFixed(2)} грн`} icon={BanknotesIcon} />
                        <InfoCard title="Витрати (товари/послуги)" value={`${totalPlannedCosts.toFixed(2)} грн`} icon={ChartBarIcon} />
                    </div>
                    <div className="glass-pane rounded-xl p-6">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Заплановані товари/послуги</h2>
                            <div className="space-x-2">
                                <button onClick={() => setModalState({ type: 'subproject_product', item: null })} className="px-3 py-1 text-xs font-medium text-white bg-blue-600/70 rounded-md hover:bg-blue-600">Додати товар</button>
                                <button onClick={() => setModalState({ type: 'subproject_service', item: null })} className="px-3 py-1 text-xs font-medium text-white bg-green-600/70 rounded-md hover:bg-green-600">Додати послугу</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Товари:</h3>
                                {subproject.subproject_products && subproject.subproject_products.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subproject.subproject_products.map(p => (
                                            <li key={p.subproject_product_id} className="flex justify-between items-center bg-black/10 p-2 rounded-md">
                                                <span className="text-sm text-[var(--text-secondary)]">{p.product?.name} x {p.quantity}</span>
                                                <button onClick={() => handleSubItemsDelete('subproject_product', p.subproject_product_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-[var(--text-secondary)]">Немає товарів.</p>}
                            </div>
                             <div>
                                <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Послуги:</h3>
                                {subproject.subproject_services && subproject.subproject_services.length > 0 ? (
                                    <ul className="space-y-2">
                                        {subproject.subproject_services.map(s => (
                                            <li key={s.subproject_service_id} className="flex justify-between items-center bg-black/10 p-2 rounded-md">
                                                <span className="text-sm text-[var(--text-secondary)]">{s.service?.name}</span>
                                                 <button onClick={() => handleSubItemsDelete('subproject_service', s.subproject_service_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-4 w-4"/></button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-[var(--text-secondary)]">Немає послуг.</p>}
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