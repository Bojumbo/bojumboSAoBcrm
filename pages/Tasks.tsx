
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Task, Manager, Project, SubProject } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon, FunnelIcon } from '../components/Icons';

const TaskForm: React.FC<{
    task?: Task | null;
    onSave: () => void;
    onCancel: () => void;
    managers: Manager[];
    projects: Project[];
    subprojects: SubProject[];
}> = ({ task, onSave, onCancel, managers, projects, subprojects }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        ...task,
        responsible_manager_id: task?.responsible_manager_id?.toString() || '',
        creator_manager_id: task?.creator_manager_id?.toString() || '',
        project_id: task?.project_id?.toString() || '',
        subproject_id: task?.subproject_id?.toString() || '',
    });
    
    const [availableSubprojects, setAvailableSubprojects] = useState<SubProject[]>([]);

    useEffect(() => {
        if (formData.project_id) {
            setAvailableSubprojects(subprojects.filter(sp => sp.project_id.toString() === formData.project_id));
        } else {
            setAvailableSubprojects([]);
        }
    }, [formData.project_id, subprojects]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        // Reset subproject if project changes
        if (name === 'project_id') {
            newFormData.subproject_id = '';
        }
        
        setFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            responsible_manager_id: formData.responsible_manager_id ? parseInt(formData.responsible_manager_id) : null,
            creator_manager_id: formData.creator_manager_id ? parseInt(formData.creator_manager_id) : null,
            project_id: formData.project_id ? parseInt(formData.project_id) : null,
            subproject_id: formData.subproject_id ? parseInt(formData.subproject_id) : null,
        };
        if (task) {
            await api.update('tasks', task.task_id, dataToSave);
        } else {
            await api.create('tasks', dataToSave);
        }
        onSave();
    };

    const baseInputClasses = "w-full px-3 py-2 rounded-md focus:outline-none glass-input";

    return (
        <div className="fixed inset-0 bg-[var(--modal-backdrop-bg)] backdrop-blur-md overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="modal-animate relative p-6 border w-full max-w-2xl shadow-lg rounded-2xl glass-pane">
                <h3 className="text-lg font-medium leading-6 text-[var(--text-primary)]">{task ? 'Редагувати' : 'Додати'} завдання</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Назва" required className={baseInputClasses}/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className={baseInputClasses}></textarea>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select name="project_id" value={formData.project_id} onChange={handleChange} className={baseInputClasses}>
                            <option value="">-- Проект (необов'язково) --</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                        </select>
                         <select name="subproject_id" value={formData.subproject_id} onChange={handleChange} disabled={!formData.project_id} className={`${baseInputClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <option value="">-- Підпроект (необов'язково) --</option>
                            {availableSubprojects.map(sp => <option key={sp.subproject_id} value={sp.subproject_id}>{sp.name}</option>)}
                        </select>
                         <select name="responsible_manager_id" value={formData.responsible_manager_id} onChange={handleChange} className={baseInputClasses}>
                            <option value="">-- Виконавець --</option>
                            {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                        </select>
                         <select name="creator_manager_id" value={formData.creator_manager_id} onChange={handleChange} className={baseInputClasses}>
                            <option value="">-- Автор --</option>
                            {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-[var(--text-secondary)]">Термін виконання</label>
                        <input type="date" name="due_date" value={formData.due_date || ''} onChange={handleChange} className={baseInputClasses}/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 text-[var(--text-primary)] rounded-md hover:bg-white/20">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-md hover:bg-[var(--brand-bg-hover)]">Зберегти</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [subprojects, setSubprojects] = useState<SubProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filters, setFilters] = useState({
        project_id: '',
        subproject_id: '',
        responsible_manager_id: '',
    });
    const [availableSubprojectsForFilter, setAvailableSubprojectsForFilter] = useState<SubProject[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tData, mData, pData, spData] = await Promise.all([
                api.getAll<Task>('tasks'),
                api.getAll<Manager>('managers'),
                api.getAll<Project>('projects'),
                api.getAll<SubProject>('subprojects')
            ]);
            setTasks(tData);
            setManagers(mData);
            setProjects(pData);
            setSubprojects(spData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (filters.project_id) {
            setAvailableSubprojectsForFilter(subprojects.filter(sp => sp.project_id.toString() === filters.project_id));
        } else {
            setAvailableSubprojectsForFilter([]);
        }
    }, [filters.project_id, subprojects]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const projectMatch = filters.project_id ? t.project_id?.toString() === filters.project_id : true;
            const subprojectMatch = filters.subproject_id ? t.subproject_id?.toString() === filters.subproject_id : true;
            const managerMatch = filters.responsible_manager_id ? t.responsible_manager_id?.toString() === filters.responsible_manager_id : true;
            return projectMatch && subprojectMatch && managerMatch;
        });
    }, [tasks, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        if (name === 'project_id') {
            newFilters.subproject_id = '';
        }
        setFilters(newFilters);
    };

    const resetFilters = () => {
        setFilters({ project_id: '', subproject_id: '', responsible_manager_id: '' });
    };

    const handleAdd = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
            await api.delete('tasks', id);
            fetchData();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };
    
    const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md focus:outline-none glass-input";

    return (
        <div>
            <PageHeader title="Завдання" buttonLabel="Додати завдання" onButtonClick={handleAdd} />
            
             <div className="mb-6 p-4 rounded-xl glass-pane">
                 <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center mb-4">
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Фільтри
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="project_id" value={filters.project_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі проекти</option>
                        {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                    </select>
                    <select name="subproject_id" value={filters.subproject_id} onChange={handleFilterChange} disabled={!filters.project_id} className={`${baseInputClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <option value="">Всі підпроекти</option>
                        {availableSubprojectsForFilter.map(sp => <option key={sp.subproject_id} value={sp.subproject_id}>{sp.name}</option>)}
                    </select>
                    <select name="responsible_manager_id" value={filters.responsible_manager_id} onChange={handleFilterChange} className={baseInputClasses}>
                        <option value="">Всі виконавці</option>
                        {managers.map(m => <option key={m.manager_id} value={m.manager_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white/10 border border-transparent rounded-md hover:bg-white/20"
                    >
                        Скинути фільтри
                    </button>
                </div>
            </div>

            <div className="rounded-xl glass-pane overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Проект / Підпроект</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Виконавець</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Термін</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--table-divide-color)]">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4 text-[var(--text-secondary)]">Завантаження...</td></tr>
                        ) : (
                            filteredTasks.map((task) => (
                                <tr key={task.task_id} className="hover:bg-[var(--table-row-hover-bg)] transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{task.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                                        <div>{task.project?.name || 'N/A'}</div>
                                        {task.subproject && <div className="text-xs text-[var(--text-muted)] pl-2">↳ {task.subproject.name}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{task.responsible_manager ? `${task.responsible_manager.first_name} ${task.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(task)} className="text-indigo-400 hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(task.task_id)} className="text-red-400 hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!loading && filteredTasks.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-4 text-[var(--text-secondary)]">Немає завдань, що відповідають фільтрам.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <TaskForm task={selectedTask} onSave={handleSave} onCancel={() => setIsModalOpen(false)} managers={managers} projects={projects} subprojects={subprojects} />}
        </div>
    );
};

export default Tasks;
