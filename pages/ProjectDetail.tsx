
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Project, SubProject, Task, Manager, SubProjectStatusType } from '../types';
import { BriefcaseIcon, UsersIcon, BuildingOfficeIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/Icons';

// --- Reusable Forms for Modals ---

const SubProjectForm: React.FC<{
    item: Partial<SubProject> | null;
    onSave: (data: any) => void;
    onCancel: () => void;
    statuses: SubProjectStatusType[];
}> = ({ item, onSave, onCancel, statuses }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        status: item?.status || statuses[0]?.name || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
    
    return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{item?.subproject_id ? 'Редагувати' : 'Додати'} підпроект</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Назва підпроекту" required className={baseInputClasses}/>
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
    
    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

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
    type: 'task' | 'subproject' | null;
    item: Task | SubProject | null;
};

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const projectId = parseInt(id || '0');
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [subProjectStatuses, setSubProjectStatuses] = useState<SubProjectStatusType[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: null, item: null });

    const fetchProjectAndDeps = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const [projectData, managersData, spsData] = await Promise.all([
                api.getById<Project>('projects', projectId),
                api.getAll<Manager>('managers'),
                api.getAll<SubProjectStatusType>('subProjectStatuses')
            ]);
            setProject(projectData);
            setManagers(managersData);
            setSubProjectStatuses(spsData);
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

        const entity = modalState.type === 'task' ? 'tasks' : 'subprojects';
        const itemToSave = { ...data, project_id: projectId };

        if (modalState.item) { // Editing existing
            const itemId = (modalState.item as any)[`${modalState.type}_id`];
            await api.update(entity, itemId, itemToSave);
        } else { // Creating new
            await api.create(entity, itemToSave);
        }
        
        handleModalClose();
        fetchProjectAndDeps(); // Refresh data
    };

    const handleDelete = async (type: 'task' | 'subproject', itemId: number) => {
        const entity = type === 'task' ? 'tasks' : 'subprojects';
        const confirmText = type === 'task' ? 'завдання' : 'підпроект';
        if (window.confirm(`Ви впевнені, що хочете видалити цей ${confirmText}?`)) {
            await api.delete(entity, itemId);
            fetchProjectAndDeps();
        }
    };


    if (loading) return <div className="text-center py-10">Завантаження деталей проекту...</div>;
    if (!project) return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Проект не знайдено</h2>
            <Link to="/projects" className="text-indigo-600 hover:underline">Повернутися до списку проектів</Link>
        </div>
    );
    
    const renderModal = () => {
        if (!modalState.type) return null;
        if (modalState.type === 'subproject') {
            return <SubProjectForm item={modalState.item as SubProject} onSave={handleSave} onCancel={handleModalClose} statuses={subProjectStatuses}/>
        }
        if (modalState.type === 'task') {
            return <TaskForm item={modalState.item as Task} onSave={handleSave} onCancel={handleModalClose} managers={managers} subprojects={project.subprojects || []}/>
        }
    };

    return (
        <div>
            {renderModal()}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{project.name}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <InfoCard title="Статус" value={project.status} icon={BriefcaseIcon}/>
                <InfoCard title="Контрагент" value={project.counterparty?.name} icon={BuildingOfficeIcon}/>
                <InfoCard title="Відповідальний" value={project.responsible_manager ? `${project.responsible_manager.first_name} ${project.responsible_manager.last_name}` : undefined} icon={UsersIcon}/>
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
                                        <span className="text-gray-800 dark:text-gray-200">{sp.name}</span>
                                        <span className="ml-3 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{sp.status}</span>
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
        </div>
    );
};

export default ProjectDetail;