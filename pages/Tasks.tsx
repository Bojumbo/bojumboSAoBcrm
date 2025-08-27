import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Task, Manager, Project, SubProject } from '../types';
import PageHeader from '../components/PageHeader';
import { PencilIcon, TrashIcon } from '../components/Icons';

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
        // FIX: Removed duplicate ID properties. The versions below handle both create and edit cases correctly.
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

    const baseInputClasses = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{task ? 'Редагувати' : 'Додати'} завдання</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Назва" required className={baseInputClasses}/>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Опис" className={baseInputClasses}></textarea>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select name="project_id" value={formData.project_id} onChange={handleChange} className={baseInputClasses}>
                            <option value="">-- Проект (необов'язково) --</option>
                            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
                        </select>
                         <select name="subproject_id" value={formData.subproject_id} onChange={handleChange} disabled={!formData.project_id} className={`${baseInputClasses} disabled:bg-gray-200 dark:disabled:bg-gray-700`}>
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Термін виконання</label>
                        <input type="date" name="due_date" value={formData.due_date || ''} onChange={handleChange} className={baseInputClasses}/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Скасувати</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Зберегти</button>
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

    return (
        <div>
            <PageHeader title="Завдання" buttonLabel="Додати завдання" onButtonClick={handleAdd} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Назва</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Проект / Підпроект</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Виконавець</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Термін</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Дії</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-4">Завантаження...</td></tr>
                        ) : (
                            tasks.map((task) => (
                                <tr key={task.task_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{task.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <div>{task.project?.name || 'N/A'}</div>
                                        {task.subproject && <div className="text-xs text-gray-400 dark:text-gray-500 pl-2">↳ {task.subproject.name}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.responsible_manager ? `${task.responsible_manager.first_name} ${task.responsible_manager.last_name}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(task)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-5 w-5"/></button>
                                        <button onClick={() => handleDelete(task.task_id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-5 w-5"/></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <TaskForm task={selectedTask} onSave={handleSave} onCancel={() => setIsModalOpen(false)} managers={managers} projects={projects} subprojects={subprojects} />}
        </div>
    );
};

export default Tasks;